"""Run privately: python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000."""
from __future__ import annotations

import base64
import binascii
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path
from time import perf_counter
from typing import Annotated, Literal

import numpy as np
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, ConfigDict, Field

from ai.deployment.runtime import INPUT_SIZE, ModelRegistry, ModelUnavailable, Script, Specialist, load_shared_config

CLASSIFICATION_ACCEPTANCE_THRESHOLD: float = float(load_shared_config()["acceptanceThreshold"])
from ai.preprocess import preprocess_image

PNG_PREFIX = "data:image/png;base64,"
MAX_IMAGE_BYTES = 4 * 1024 * 1024
MAX_IMAGE_STRING = len(PNG_PREFIX) + 4 * ((MAX_IMAGE_BYTES + 2) // 3)
MAX_DIMENSION = 2048
MAX_PIXELS = 1024 * 1024
CanvasDimension = Annotated[float, Field(gt=0, le=MAX_DIMENSION, allow_inf_nan=False)]


class PredictRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    aksaraId: Script
    karakterSlug: str = Field(min_length=1, max_length=128)
    image: str = Field(min_length=1, max_length=MAX_IMAGE_STRING)
    strokes: object = None  # Accepted for compatibility; never participates in classification.
    canvasWidth: CanvasDimension | None = None
    canvasHeight: CanvasDimension | None = None


class ClassProbability(BaseModel):
    labelId: str
    sourceLabel: str
    probability: float = Field(ge=0, le=1, allow_inf_nan=False)


class PredictResponse(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    score: float = Field(ge=0, le=100, allow_inf_nan=False)
    status: Literal["benar", "perlu_review"]
    predictedSymbol: str
    confidence: float = Field(ge=0, le=1, allow_inf_nan=False)
    latencyMs: float = Field(ge=0, allow_inf_nan=False)
    ringkasan: str
    kriteria: list[object] = Field(default_factory=list, max_length=0)
    modelSource: Literal["onnx_backend"] = "onnx_backend"
    targetSupported: bool
    probabilitiesCalibrated: Literal[False] = False
    mappingVerified: Literal[False] = False
    modelId: str
    top3: list[ClassProbability] = Field(min_length=3, max_length=3)


class InvalidImage(ValueError):
    """Malformed, oversized, or empty canvas input."""


def decode_png(data_url: str) -> Image.Image:
    if not data_url.startswith(PNG_PREFIX) or len(data_url) > MAX_IMAGE_STRING:
        raise InvalidImage("Gambar harus berupa PNG data URL berukuran maksimal 4 MiB.")
    try:
        raw = base64.b64decode(data_url[len(PNG_PREFIX):], validate=True)
        if not raw or len(raw) > MAX_IMAGE_BYTES:
            raise InvalidImage("Ukuran PNG kosong atau melebihi batas 4 MiB.")
        with Image.open(BytesIO(raw)) as source:
            if source.format != "PNG" or getattr(source, "n_frames", 1) != 1:
                raise InvalidImage("Gambar harus PNG statis yang valid.")
            if max(source.size) > MAX_DIMENSION or source.width * source.height > MAX_PIXELS:
                raise InvalidImage("Dimensi PNG melebihi batas 2048 sisi / 1.048.576 piksel.")
            source.verify()
        image = Image.open(BytesIO(raw))
        image.load()
        return image
    except InvalidImage:
        raise
    except (binascii.Error, ValueError, OSError, SyntaxError, UnidentifiedImageError, Image.DecompressionBombError) as error:
        raise InvalidImage("PNG tidak valid atau tidak dapat dibaca.") from error


def canvas_tensor(data_url: str) -> np.ndarray:
    with decode_png(data_url) as image:
        result = preprocess_image(image, INPUT_SIZE)
    if result["status"] == "empty" or result["tensor"] is None:
        raise InvalidImage("Kanvas kosong. Gambar aksara sebelum meminta klasifikasi.")
    return result["tensor"]


def classification_summary(
    display_name: str,
    confidence: float,
    supported: bool,
    status: Literal["benar", "perlu_review"],
    top_is_target: bool,
) -> str:
    prob = f"{confidence * 100:.1f}".replace(".", ",")
    if not supported:
        return "Karakter ini belum didukung evaluasi AI."
    if status == "benar":
        return f"Tulisan {display_name} terdeteksi dengan keyakinan {prob}%."
    # perlu_review + supported
    if not top_is_target:
        return (
            f"Model mengenali sebagai {display_name} ({prob}%), bukan target saat ini. "
            "Coba perbaiki bentuknya."
        )
    return f"Kemiripan dengan {display_name} masih {prob}%, belum cukup yakin. Perkuat bentuknya."


def prediction_response(
    model: Specialist,
    request: PredictRequest,
    probabilities: np.ndarray,
    start: float,
) -> PredictResponse:
    ranked = np.argsort(-probabilities, kind="stable")[:3]
    top_index = int(ranked[0])
    top_label = model.labels[top_index].source_label
    confidence = float(probabilities[top_index])
    target_index = model.target_index(request.karakterSlug)
    supported = target_index is not None

    target_prob = float(probabilities[target_index]) if supported else confidence
    is_benar = supported and (top_index == target_index) and (target_prob >= CLASSIFICATION_ACCEPTANCE_THRESHOLD)
    status: Literal["benar", "perlu_review"] = "benar" if is_benar else "perlu_review"
    score = 100.0 * target_prob if supported else 100.0 * confidence

    display_name = model.display_names.get(top_label, "Kelas belum dipetakan")
    summary = classification_summary(
        display_name=display_name,
        confidence=confidence,
        supported=supported,
        status=status,
        top_is_target=(top_index == target_index),
    )

    top3 = [
        ClassProbability(
            labelId=model.labels[int(index)].id,
            sourceLabel=model.labels[int(index)].source_label,
            probability=float(probabilities[index]),
        )
        for index in ranked
    ]

    return PredictResponse(
        score=score,
        status=status,
        predictedSymbol=top_label,
        confidence=confidence,
        latencyMs=(perf_counter() - start) * 1000,
        ringkasan=summary,
        kriteria=[],
        modelSource="onnx_backend",
        targetSupported=supported,
        probabilitiesCalibrated=False,
        mappingVerified=False,
        modelId=model.manifest.model_sha256,
        top3=top3,
    )


def create_app(model_root: Path | None = None) -> FastAPI:
    registry = ModelRegistry() if model_root is None else ModelRegistry(model_root)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        registry.load()
        yield
        registry.models.clear()

    application = FastAPI(title="Aksantara private experimental classifier", lifespan=lifespan)
    application.state.registry = registry

    @application.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, error: RequestValidationError) -> JSONResponse:
        return JSONResponse(status_code=422, content={"error": "Permintaan klasifikasi tidak valid: periksa aksaraId, target, dan batas input."})

    @application.get("/health")
    def health() -> JSONResponse:
        state = registry.health()
        return JSONResponse(status_code=200 if state["ready"] else 503, content=state)

    @application.post("/predict", response_model=PredictResponse)
    def predict(payload: PredictRequest) -> PredictResponse | JSONResponse:
        start = perf_counter()
        try:
            tensor = canvas_tensor(payload.image)
            model = registry.get(payload.aksaraId)
            probabilities = model.probabilities(tensor)
            return prediction_response(model, payload, probabilities, start)
        except InvalidImage as error:
            return JSONResponse(status_code=400, content={"error": str(error)})
        except ModelUnavailable as error:
            return JSONResponse(status_code=503, content={"error": str(error)})

    return application


app = create_app()

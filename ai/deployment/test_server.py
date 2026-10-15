"""Behavior tests using the tracked specialists; run from the repository root."""
from __future__ import annotations

import base64
import hashlib
import json
import shutil
import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from time import perf_counter
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

from ai.deployment.runtime import (
    CLASS_COUNTS, MODEL_ROOT, Manifest, ModelUnavailable,
    stable_softmax, validate_metadata, validate_model_file,
)
from ai.deployment.server import (
    MAX_IMAGE_BYTES, PNG_PREFIX, PredictRequest, create_app, prediction_response,
)
from ai.preprocess import preprocess_image


def image_url(image: Image.Image, image_format: str = "PNG") -> str:
    buffer = BytesIO()
    image.save(buffer, format=image_format)
    return PNG_PREFIX + base64.b64encode(buffer.getvalue()).decode("ascii")


def drawn_image() -> Image.Image:
    image = Image.new("RGBA", (47, 43), "white")
    draw = ImageDraw.Draw(image)
    draw.line([(9, 34), (22, 17), (36, 34)], fill="black", width=3)
    draw.ellipse((20, 5, 23, 8), fill="black")
    return image


def payload(image: str, script: str = "sunda", slug: str = "a") -> dict[str, object]:
    return {"aksaraId": script, "karakterSlug": slug, "image": image}


class SpecialistServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.application = create_app()
        cls.client = TestClient(cls.application)
        cls.client.__enter__()
        cls.image = drawn_image()
        cls.data_url = image_url(cls.image)

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)
        cls.image.close()

    def test_health_reports_all_actual_models(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200, response.text)
        health = response.json()
        self.assertTrue(health["ready"])
        for script, count in CLASS_COUNTS.items():
            self.assertTrue(health["scripts"][script]["ready"])
            self.assertEqual(health["scripts"][script]["classes"], count)
            self.assertEqual(len(health["scripts"][script]["modelId"]), 64)

    def test_actual_png_uses_canonical_tensor_and_cached_cpu_specialists(self):
        registry = self.application.state.registry
        tensor = preprocess_image(self.image, 128)["tensor"]
        for script in CLASS_COUNTS:
            model = registry.get(script)
            self.assertEqual(model.session.get_providers(), ["CPUExecutionProvider"])
            logits = model.session.run(["logits"], {"input": tensor[None]})[0]
            values = logits[0].astype(np.float64)
            expected = np.exp(values - values.max())
            expected /= expected.sum()
            with patch("ai.deployment.runtime.load_specialist", side_effect=AssertionError("Per-request reload")):
                response = self.client.post("/predict", json=payload(self.data_url, script))
            self.assertEqual(response.status_code, 200, response.text)
            result = response.json()
            order = np.argsort(-expected, kind="stable")[:3]
            self.assertEqual([item["labelId"] for item in result["top3"]], [model.labels[int(i)].id for i in order])
            np.testing.assert_allclose([item["probability"] for item in result["top3"]], expected[order], rtol=1e-12)
            self.assertEqual(result["predictedSymbol"], model.labels[int(order[0])].source_label)
            self.assertAlmostEqual(result["confidence"], float(expected[order[0]]))
            self.assertEqual(result["status"], "perlu_review")
            self.assertEqual(result["kriteria"], [])
            self.assertFalse(result["probabilitiesCalibrated"])
            self.assertFalse(result["mappingVerified"])
            self.assertEqual(result["modelSource"], "onnx_backend")
            self.assertIs(model.session, registry.get(script).session)

    def test_source_targets_preserve_casefold_and_underscore_distinction(self):
        model = self.application.state.registry.get("lontara")
        self.assertEqual(model.target_index("kE"), 34)
        self.assertEqual(model.target_index("ke_"), 35)
        probabilities = np.zeros(114, dtype=np.float64)
        probabilities[34], probabilities[35], probabilities[0] = 0.2, 0.7, 0.1
        for slug, score, supported in (("kE", 20, True), ("ke_", 70, True), ("unicode-guess", 70, False)):
            request = PredictRequest(**payload(self.data_url, "lontara", slug))
            result = prediction_response(model, request, probabilities, perf_counter())
            self.assertAlmostEqual(result.score, score)
            self.assertEqual(result.targetSupported, supported)
            self.assertEqual(result.predictedSymbol, "Ke_")
            self.assertAlmostEqual(result.confidence, 0.7)

    def test_strokes_are_ignored_and_unsupported_target_still_classifies(self):
        request = payload(self.data_url, slug="not-a-source-label")
        first = self.client.post("/predict", json={**request, "strokes": [[{"x": 1}], [{"x": 2}]]})
        second = self.client.post("/predict", json={**request, "strokes": {"malformed": "ignored"}})
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(second.status_code, 200, second.text)
        result = first.json()
        self.assertFalse(result["targetSupported"])
        self.assertAlmostEqual(result["score"], result["confidence"] * 100)
        comparison = second.json()
        result.pop("latencyMs")
        comparison.pop("latencyMs")
        self.assertEqual(result, comparison)

    def test_inference_failure_returns_unavailable_without_fallback(self):
        with patch("ai.deployment.runtime.stable_softmax", side_effect=ModelUnavailable("Logits tidak valid.")):
            response = self.client.post("/predict", json=payload(self.data_url))
        self.assertEqual(response.status_code, 503, response.text)
        self.assertEqual(response.json(), {"error": "Logits tidak valid."})

    def test_schema_errors_use_error_json(self):
        cases = [payload(self.data_url, "jawa"), {**payload(self.data_url), "image": 123},
                 {**payload(self.data_url), "canvasWidth": "47"},
                 {**payload(self.data_url), "canvasHeight": False},
                 {**payload(self.data_url), "canvasWidth": 2049},
                 {**payload(self.data_url), "karakterSlug": ""},
                 {**payload(self.data_url), "extra": "forbidden"}]
        for request in cases:
            response = self.client.post("/predict", json=request)
            self.assertEqual(response.status_code, 422, response.text)
            self.assertEqual(set(response.json()), {"error"})

    def test_malformed_wrong_format_and_oversized_images_are_rejected(self):
        jpeg = Image.new("RGB", (8, 8), "white")
        urls = ["data:image/jpeg;base64,eA==", PNG_PREFIX + "%%%", PNG_PREFIX + "eA==",
                image_url(jpeg, "JPEG"), image_url(Image.new("L", (2049, 1), 255)),
                image_url(Image.new("L", (1025, 1024), 255))]
        for data_url in urls:
            response = self.client.post("/predict", json=payload(data_url))
            self.assertEqual(response.status_code, 400, response.text)
            self.assertEqual(set(response.json()), {"error"})
        oversized = PNG_PREFIX + base64.b64encode(b"x" * (MAX_IMAGE_BYTES + 1)).decode("ascii")
        response = self.client.post("/predict", json=payload(oversized))
        self.assertEqual(response.status_code, 400, response.text)

    def test_uniform_and_fully_transparent_canvas_are_empty(self):
        for color in ((255, 255, 255, 255), (0, 0, 0, 255), (12, 91, 244, 0)):
            response = self.client.post("/predict", json=payload(image_url(Image.new("RGBA", (17, 13), color))))
            self.assertEqual(response.status_code, 400, response.text)
            self.assertIn("kosong", response.json()["error"])


class DeploymentValidationTests(unittest.TestCase):
    def metadata_directory(self, root: Path) -> Path:
        directory = root / "sunda"
        directory.mkdir()
        for filename in ("manifest.json", "labels.json", "evaluation.json"):
            shutil.copyfile(MODEL_ROOT / "sunda" / filename, directory / filename)
        return directory

    def test_missing_assets_return_unavailable_not_healthy(self):
        with tempfile.TemporaryDirectory() as temporary:
            with TestClient(create_app(Path(temporary))) as client:
                health = client.get("/health")
                self.assertEqual(health.status_code, 503)
                self.assertFalse(health.json()["ready"])
                self.assertTrue(all(not script["ready"] for script in health.json()["scripts"].values()))
                response = client.post("/predict", json=payload(image_url(drawn_image())))
                self.assertEqual(response.status_code, 503)
                self.assertEqual(set(response.json()), {"error"})

    def test_incorrect_normalization_is_not_ready(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = self.metadata_directory(Path(temporary))
            path = directory / "manifest.json"
            manifest = json.loads(path.read_text(encoding="utf-8"))
            manifest["preprocessing"]["mean"][0] = 0.5
            path.write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "normalization"):
                validate_metadata(directory, "sunda")
            with TestClient(create_app(Path(temporary))) as client:
                response = client.get("/health")
                self.assertEqual(response.status_code, 503)
                self.assertFalse(response.json()["scripts"]["sunda"]["ready"])

    def test_labels_follow_class_ids_and_duplicate_ids_fail(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = self.metadata_directory(Path(temporary))
            path = directory / "labels.json"
            labels = json.loads(path.read_text(encoding="utf-8"))
            path.write_text(json.dumps(list(reversed(labels))), encoding="utf-8")
            _, ordered = validate_metadata(directory, "sunda")
            self.assertEqual([label.class_id for label in ordered], list(range(30)))
            labels[1]["class_id"] = labels[0]["class_id"]
            path.write_text(json.dumps(labels), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "exactly once"):
                validate_metadata(directory, "sunda")

    def test_model_hash_mismatch_fails_before_session_loading(self):
        original = Manifest.model_validate(json.loads((MODEL_ROOT / "sunda" / "manifest.json").read_text(encoding="utf-8")))
        raw = b"not a model, used only to exercise integrity checking"
        manifest = original.model_copy(update={"model_bytes": len(raw), "model_sha256": hashlib.sha256(raw).hexdigest()})
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "model.onnx"
            path.write_bytes(raw)
            validate_model_file(path, manifest)
            path.write_bytes(b"X" + raw[1:])
            with self.assertRaisesRegex(ValueError, "SHA256"):
                validate_model_file(path, manifest)

    def test_softmax_stable_and_nonfinite_wrong_shape_logits_rejected(self):
        logits = np.array([[10000, 10001, -10000]], dtype=np.float32)
        probabilities = stable_softmax(logits, 3)
        self.assertAlmostEqual(float(probabilities.sum()), 1)
        self.assertEqual(int(probabilities.argmax()), 1)
        self.assertTrue(np.isfinite(probabilities).all())
        for invalid in (np.array([[np.nan, 0, 1]], dtype=np.float32),
                        np.array([[np.inf, 0, 1]], dtype=np.float32),
                        np.zeros((2, 3), dtype=np.float32)):
            with self.assertRaises(ModelUnavailable):
                stable_softmax(invalid, 3)


if __name__ == "__main__":
    unittest.main()

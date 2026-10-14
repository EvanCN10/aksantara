"""Stroke-order invariant grayscale preprocessing shared with the browser harness."""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

VERSION = "canvas-gray-v1"
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)
SIZES = (128, 224)


def preprocessing_contract(size: int = 128) -> dict:
    if size not in SIZES:
        raise ValueError(f"Input size must be one of {SIZES}, got {size}")
    return {
        "preprocessing_version": VERSION, "size": size, "layout": "NCHW",
        "channels": 3, "dtype": "float32", "mean": list(MEAN), "std": list(STD),
        "alpha": "white-composite", "luminance": "integer-299-587-114-round-half-up",
        "polarity": "invert-if-perimeter-median-less-than-127.5",
        "foreground": "otsu-less-or-equal-first-maximum", "padding_factor": 1.4,
        "bbox": "inclusive-all-components", "square_side": "ceil(1.4*max(bbox_width,bbox_height))",
        "square_origin": "(min+max+1-side)/2", "outside": "white",
        "resize": "bilinear-half-pixel-square-clamp-white-source-neighbors",
        "network_input": "grayscale-not-binarized", "uniform": "empty",
    }


def _rgba_gray(image: Image.Image) -> np.ndarray:
    rgba = np.asarray(ImageOps.exif_transpose(image).convert("RGBA"), dtype=np.int64)
    alpha = rgba[:, :, 3]
    luminance = 299 * rgba[:, :, 0] + 587 * rgba[:, :, 1] + 114 * rgba[:, :, 2]
    numerator = luminance * alpha + 255000 * (255 - alpha)
    return ((numerator + 127500) // 255000).astype(np.uint8)


def _perimeter(gray: np.ndarray) -> np.ndarray:
    if gray.shape[0] == 1:
        return gray[0]
    if gray.shape[1] == 1:
        return gray[:, 0]
    return np.concatenate((gray[0], gray[-1], gray[1:-1, 0], gray[1:-1, -1]))


def canonical_gray(image: Image.Image) -> np.ndarray:
    gray = _rgba_gray(image)
    return 255 - gray if float(np.median(_perimeter(gray))) < 127.5 else gray


def _otsu(gray: np.ndarray) -> int:
    histogram = np.bincount(gray.ravel(), minlength=256)
    total = int(gray.size)
    weighted_total = sum(index * int(count) for index, count in enumerate(histogram))
    background_count, background_sum, best_score, threshold = 0, 0, -1.0, 0
    for index, count in enumerate(histogram):
        background_count += int(count)
        background_sum += index * int(count)
        foreground_count = total - background_count
        if not background_count or not foreground_count:
            continue
        delta = background_sum / background_count - (weighted_total - background_sum) / foreground_count
        score = background_count * foreground_count * delta * delta
        if score > best_score:
            best_score, threshold = score, index
    return threshold


def _geometry(gray: np.ndarray) -> tuple[dict, np.ndarray | None]:
    metadata = {"preprocessing_version": VERSION, "width": gray.shape[1], "height": gray.shape[0]}
    if int(gray.min()) == int(gray.max()):
        return {**metadata, "empty_reason": "uniform", "bbox": None, "occupancy": 0.0}, None
    threshold = _otsu(gray)
    mask = gray <= threshold
    ys, xs = np.nonzero(mask)
    if not xs.size:
        return {**metadata, "empty_reason": "no-foreground", "bbox": None, "occupancy": 0.0}, None
    bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    side = math.ceil(1.4 * max(bbox[2] - bbox[0] + 1, bbox[3] - bbox[1] + 1))
    origin = [(bbox[0] + bbox[2] + 1 - side) / 2, (bbox[1] + bbox[3] + 1 - side) / 2]
    contact = bool(mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any())
    return {**metadata, "otsu_threshold": threshold, "bbox": bbox, "square_side": side,
            "crop_origin": origin, "occupancy": float(mask.mean()), "border_contact": contact}, mask


def _sample(gray: np.ndarray, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    valid = (x >= 0) & (y >= 0) & (x < gray.shape[1]) & (y < gray.shape[0])
    values = gray[np.clip(y, 0, gray.shape[0] - 1), np.clip(x, 0, gray.shape[1] - 1)]
    return np.where(valid, values, 255).astype(np.float64)


def _resize(gray: np.ndarray, metadata: dict, size: int) -> np.ndarray:
    side = metadata["square_side"]
    offsets = np.clip((np.arange(size, dtype=np.float64) + 0.5) * side / size - 0.5, 0, side - 1)
    x, y = np.meshgrid(offsets + metadata["crop_origin"][0], offsets + metadata["crop_origin"][1])
    x0, y0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    wx, wy = x - x0, y - y0
    top = _sample(gray, x0, y0) * (1 - wx) + _sample(gray, x0 + 1, y0) * wx
    bottom = _sample(gray, x0, y0 + 1) * (1 - wx) + _sample(gray, x0 + 1, y0 + 1) * wx
    return (top * (1 - wy) + bottom * wy) / 255.0


def preprocess_image(image: Image.Image, size: int = 128) -> dict:
    preprocessing_contract(size)
    original = _rgba_gray(image)
    median = float(np.median(_perimeter(original)))
    inverted = median < 127.5
    gray = 255 - original if inverted else original
    metadata, mask = _geometry(gray)
    metadata.update(size=size, inverted=inverted, perimeter_median=median,
                    perimeter_ambiguous=112 <= median <= 143)
    if mask is None:
        return {"status": "empty", "tensor": None, "gray": gray, "metadata": metadata}
    resized = _resize(gray, metadata, size)
    tensor = np.stack([(resized - mean) / std for mean, std in zip(MEAN, STD)]).astype(np.float32)
    return {"status": "ok", "tensor": tensor, "gray": resized, "metadata": metadata}


def _write_fixture(image: Image.Image, name: str, out: Path, provenance: dict, size: int) -> dict:
    image = ImageOps.exif_transpose(image).convert("RGBA")
    name = f"{name}-{size}"
    result = preprocess_image(image, size)
    image_path = out / f"{name}.png"
    image.save(image_path)
    rgba = np.asarray(image, dtype=np.uint8)
    rgba_path = out / f"{name}.rgba"
    rgba_path.write_bytes(rgba.tobytes())
    tensor_path = out / f"{name}.f32"
    if result["tensor"] is not None:
        tensor_path.write_bytes(result["tensor"].astype("<f4").tobytes())
    return {"name": name, "image": image_path.name, "rgba": rgba_path.name,
            "width": image.width, "height": image.height, "size": size,
            "status": result["status"], "tensor": tensor_path.name if result["tensor"] is not None else None,
            "metadata": result["metadata"], "provenance": provenance,
            "image_sha256": hashlib.sha256(image_path.read_bytes()).hexdigest()}


def _component_count(mask: np.ndarray) -> int:
    remaining = set(zip(*np.nonzero(mask)))
    count = 0
    while remaining:
        count += 1
        pending = [remaining.pop()]
        while pending:
            y, x = pending.pop()
            neighbors = {(y + dy, x + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1)} & remaining
            remaining.difference_update(neighbors)
            pending.extend(neighbors)
    return count


def _real_fixtures(fixtures: Path) -> list[tuple[str, Path, dict]]:
    manifest = json.loads((fixtures / "manifest.json").read_text(encoding="utf-8"))
    samples = json.loads((fixtures / "samples.json").read_text(encoding="utf-8"))["samples"]
    root = Path(manifest["data_root"])
    selected: dict[str, tuple[str, Path, dict]] = {}
    for record in sorted(samples, key=lambda item: item["path"]):
        if record["status"] != "valid" or record["script"] not in ("bali", "lontara"):
            continue
        path = root / record["path"]
        with Image.open(path) as image:
            gray = _rgba_gray(image)
            key = "bali-dark" if float(np.median(_perimeter(gray))) < 127.5 else "bali-light"
            if record["script"] == "lontara":
                if "lontara-detached" in selected:
                    continue
                canonical = canonical_gray(image)
                _, mask = _geometry(canonical)
                if mask is None or _component_count(mask) < 2:
                    continue
                key = "lontara-detached"
            if key not in selected:
                source_hash = hashlib.sha256(path.read_bytes()).hexdigest()
                if source_hash != record.get("byte_sha256"):
                    raise ValueError(f"Parity fixture source differs from audited hash: {path}")
                selected[key] = (key, path, {"kind": "real-source", "sample_id": record["sample_id"],
                                             "script": record["script"], "source_label": record["source_label"],
                                             "source_path": str(path), "source_sha256": source_hash})
        if len(selected) == 3:
            break
    missing = {"bali-dark", "bali-light", "lontara-detached"} - selected.keys()
    if missing:
        raise ValueError(f"Audit {fixtures} lacks real parity fixtures: {sorted(missing)}")
    return list(selected.values())


def generate_checks(fixtures: Path, out: Path) -> dict:
    real = _real_fixtures(fixtures)
    out.mkdir(parents=True, exist_ok=True)
    entries = []
    for name, path, provenance in real:
        with Image.open(path) as image:
            for size in SIZES:
                entries.append(_write_fixture(image, name, out, provenance, size))
    for name in ("blank", "one-dot", "edge", "alpha", "detached-mark"):
        image = Image.new("RGBA", (41, 37), (255, 255, 255, 255))
        draw = ImageDraw.Draw(image)
        if name == "one-dot":
            draw.point((20, 18), fill=(0, 0, 0, 255))
        elif name == "edge":
            draw.line([(0, 0), (0, 30), (29, 30)], fill="black", width=3)
        elif name == "alpha":
            image = Image.new("RGBA", (41, 37), (19, 203, 71, 0))
            draw = ImageDraw.Draw(image)
            draw.line([(5, 27), (18, 5), (31, 27)], fill=(17, 33, 49, 173), width=3)
        elif name == "detached-mark":
            draw.line([(8, 27), (18, 13), (28, 27)], fill="black", width=3)
            draw.ellipse((17, 3, 19, 5), fill="black")
        for size in SIZES:
            entries.append(_write_fixture(image, name, out, {"kind": "synthetic-edge-case-not-handwriting"}, size))
    report = {"preprocessing": preprocessing_contract(), "tolerance": 1e-5, "fixtures": entries,
              "status": "generated-browser-parity-pending", "audit": str(fixtures),
              "dataset_hash": json.loads((fixtures / "manifest.json").read_text(encoding="utf-8"))["dataset_hash"]}
    (out / "manifest.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report

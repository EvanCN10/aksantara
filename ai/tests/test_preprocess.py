"""Run explicitly with python -m unittest ai.harness.test_preprocess."""
import json
import math
import unittest

import numpy as np
from PIL import Image, ImageDraw

from ai.preprocess import canonical_gray, preprocess_image, preprocessing_contract


class PreprocessTests(unittest.TestCase):
    def test_uniform_and_transparent_images_are_empty(self):
        for color in ((255, 255, 255, 255), (0, 0, 0, 255), (12, 91, 244, 0)):
            result = preprocess_image(Image.new("RGBA", (17, 13), color))
            self.assertEqual(result["status"], "empty")
            self.assertIsNone(result["tensor"])
            json.dumps(result["metadata"])

    def test_one_pixel_dot_inclusive_box_and_center(self):
        image = Image.new("RGB", (11, 11), "white")
        image.putpixel((5, 5), (0, 0, 0))
        result = preprocess_image(image)
        self.assertEqual(result["metadata"]["bbox"], [5, 5, 5, 5])
        self.assertEqual(result["metadata"]["square_side"], 2)
        self.assertEqual(result["metadata"]["crop_origin"], [4.5, 4.5])
        self.assertEqual(result["tensor"].shape, (3, 128, 128))
        self.assertEqual(result["tensor"].dtype, np.float32)
        self.assertTrue(np.isfinite(result["tensor"]).all())

    def test_detached_mark_is_included_and_edge_padding_not_shifted(self):
        image = Image.new("L", (31, 29), 255)
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, 15, 10, 25), fill=0)
        draw.point((5, 2), fill=0)
        metadata = preprocess_image(image)["metadata"]
        self.assertEqual(metadata["bbox"], [0, 2, 10, 25])
        self.assertEqual(metadata["square_side"], math.ceil(1.4 * 24))
        self.assertLess(metadata["crop_origin"][0], 0)
        self.assertTrue(metadata["border_contact"])

    def test_polarity_and_rgba_composite(self):
        light = Image.new("L", (23, 19), 255)
        ImageDraw.Draw(light).line([(5, 15), (12, 3), (17, 15)], fill=0, width=2)
        dark = Image.fromarray(255 - np.asarray(light))
        np.testing.assert_array_equal(canonical_gray(light), canonical_gray(dark))
        np.testing.assert_array_equal(preprocess_image(light)["tensor"], preprocess_image(dark)["tensor"])
        alpha = Image.new("RGBA", (3, 3), (11, 203, 47, 0))
        alpha.putpixel((1, 1), (17, 33, 49, 173))
        value = ((299 * 17 + 587 * 33 + 114 * 49) * 173 + 255000 * (255 - 173) + 127500) // 255000
        gray = canonical_gray(alpha)
        self.assertEqual(int(gray[0, 0]), 255)
        self.assertEqual(int(gray[1, 1]), value)

    def test_half_pixel_oracle_and_nonbinary_network_input(self):
        image = Image.new("L", (9, 7), 255)
        image.putpixel((0, 2), 0)
        image.putpixel((3, 4), 97)
        result = preprocess_image(image)
        source, metadata = canonical_gray(image), result["metadata"]
        size, side = 128, metadata["square_side"]
        x_origin, y_origin = metadata["crop_origin"]
        sample = lambda x, y: float(source[y, x]) if 0 <= x < image.width and 0 <= y < image.height else 255.0
        for y, x in ((0, 0), (43, 21), (64, 64), (97, 110), (127, 127)):
            sx = min(side - 1, max(0, (x + 0.5) * side / size - 0.5)) + x_origin
            sy = min(side - 1, max(0, (y + 0.5) * side / size - 0.5)) + y_origin
            x0, y0 = math.floor(sx), math.floor(sy)
            wx, wy = sx - x0, sy - y0
            top = sample(x0, y0) * (1 - wx) + sample(x0 + 1, y0) * wx
            bottom = sample(x0, y0 + 1) * (1 - wx) + sample(x0 + 1, y0 + 1) * wx
            self.assertEqual(result["gray"][y, x], (top * (1 - wy) + bottom * wy) / 255)
        self.assertTrue(((result["gray"] > 0) & (result["gray"] < 1)).any())

    def test_size_and_exif_orientation(self):
        image = Image.new("L", (9, 7), 255)
        image.putpixel((2, 3), 0)
        image.getexif()[274] = 6
        result = preprocess_image(image, 224)
        self.assertEqual(result["tensor"].shape, (3, 224, 224))
        self.assertEqual(result["metadata"]["width"], 7)
        self.assertEqual(result["metadata"]["height"], 9)
        self.assertEqual(result["metadata"]["bbox"], [3, 2, 3, 2])
        with self.assertRaises(ValueError):
            preprocessing_contract(64)


if __name__ == "__main__":
    unittest.main()

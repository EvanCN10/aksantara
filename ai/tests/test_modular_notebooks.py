import ast
import json
import unittest
from pathlib import Path

from ai.build_modular_notebooks import build_all_notebooks, NOTEBOOKS_DIR


class TestModularNotebooks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        build_all_notebooks()

    def test_notebooks_exist_and_valid_json(self):
        expected_files = [
            "01_sunda_classifier.ipynb",
            "02_lontara_classifier.ipynb",
            "03_bali_classifier.ipynb",
            "04_combined_174_classifier.ipynb",
        ]
        for name in expected_files:
            nb_path = NOTEBOOKS_DIR / name
            self.assertTrue(nb_path.is_file(), f"Notebook {name} should exist")

            content = json.loads(nb_path.read_text(encoding="utf-8"))
            self.assertEqual(content.get("nbformat"), 4)
            self.assertIn("cells", content)
            self.assertGreater(len(content["cells"]), 10)

    def test_notebook_stages_and_python_syntax(self):
        expected_files = [
            "01_sunda_classifier.ipynb",
            "02_lontara_classifier.ipynb",
            "03_bali_classifier.ipynb",
            "04_combined_174_classifier.ipynb",
        ]
        for name in expected_files:
            with self.subTest(notebook=name):
                nb_path = NOTEBOOKS_DIR / name
                data = json.loads(nb_path.read_text(encoding="utf-8"))
                cells = data["cells"]

                # Check 7 stages represented
                markdown_text = "\n".join("".join(c["source"]) for c in cells if c["cell_type"] == "markdown")
                for stage_num in range(1, 8):
                    self.assertIn(f"Stage {stage_num}", markdown_text, f"Missing Stage {stage_num} in {name}")

                # Compile each code cell with ast.parse
                for idx, cell in enumerate(cells):
                    if cell["cell_type"] == "code":
                        self.assertIsNone(cell["execution_count"])
                        self.assertEqual(cell["outputs"], [])
                        code_str = "".join(cell["source"])
                        try:
                            ast.parse(code_str, filename=f"{name}-cell-{idx}")
                        except SyntaxError as e:
                            self.fail(f"Syntax error in {name} cell {idx} ({cell.get('id')}): {e}\n{code_str}")


if __name__ == "__main__":
    unittest.main()

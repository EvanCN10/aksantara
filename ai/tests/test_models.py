import unittest
import torch
from ai.models import (
    MODEL_NAMES,
    PRETRAINED,
    build_model,
    parameter_groups,
    freeze_backbone_statistics,
)


class TestModels(unittest.TestCase):
    def test_model_names_and_pretrained_registry(self):
        self.assertIn("resnet18", MODEL_NAMES)
        self.assertIn("resnet18-scratch", MODEL_NAMES)
        self.assertIn("resnet18", PRETRAINED)
        self.assertNotIn("resnet18-scratch", PRETRAINED)

    def test_build_model_invalid_classes(self):
        with self.assertRaises(ValueError):
            build_model("mobile", 1)
        with self.assertRaises(ValueError):
            build_model("unknown_arch", 30)

    def test_forward_pass_all_architectures(self):
        dummy_input = torch.randn(2, 3, 128, 128)
        test_architectures = [
            ("cnn", 30, False),
            ("mobile-scratch", 30, False),
            ("hybrid", 30, False),
            ("resnet18-scratch", 30, False),
            ("resnet18-scratch", 174, False),
        ]
        for name, num_classes, pretrained in test_architectures:
            with self.subTest(name=name, num_classes=num_classes):
                model = build_model(name, num_classes=num_classes, pretrained=pretrained)
                model.eval()
                with torch.no_grad():
                    logits = model(dummy_input)
                self.assertEqual(logits.shape, (2, num_classes))
                self.assertFalse(torch.isnan(logits).any())
                self.assertFalse(torch.isinf(logits).any())

    def test_resnet18_parameter_groups_and_freeze(self):
        model = build_model("resnet18-scratch", num_classes=30, pretrained=False)
        groups = parameter_groups(model, "resnet18-scratch", backbone_lr=1e-4, head_lr=1e-3, frozen=True)
        # When frozen=True, only head (fc) should require grad
        for name, p in model.named_parameters():
            if name.startswith("fc"):
                self.assertTrue(p.requires_grad, f"fc parameter {name} should require grad")
            else:
                self.assertFalse(p.requires_grad, f"backbone parameter {name} should NOT require grad when frozen")
        self.assertEqual(len(groups), 1)  # Only head group since backbone is frozen

        # When unfrozen
        groups_unfrozen = parameter_groups(model, "resnet18-scratch", backbone_lr=1e-4, head_lr=1e-3, frozen=False)
        self.assertEqual(len(groups_unfrozen), 2)

        # Freeze statistics test
        model.train()
        freeze_backbone_statistics(model, "resnet18-scratch")
        # Ensure batchnorms in backbone are in eval mode
        for m in model.modules():
            if isinstance(m, (torch.nn.BatchNorm2d, torch.nn.BatchNorm1d)):
                self.assertFalse(m.training)


if __name__ == "__main__":
    unittest.main()

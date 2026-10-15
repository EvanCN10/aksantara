"""Image-only classifiers; all heads return uncalibrated logits."""
from __future__ import annotations

import torch
from torch import nn
from torchvision import models

MODEL_NAMES = ("cnn", "mobile", "efficient", "hybrid", "mobile-scratch", "resnet18", "resnet18-scratch")
PRETRAINED = ("mobile", "efficient", "hybrid", "resnet18")


class AttentionBlock(nn.Module):
    def __init__(self, dimension: int = 128, heads: int = 4) -> None:
        super().__init__()
        self.heads, self.head_dim = heads, dimension // heads
        self.norm1 = nn.LayerNorm(dimension)
        self.qkv = nn.Linear(dimension, dimension * 3)
        self.projection = nn.Linear(dimension, dimension)
        self.dropout = nn.Dropout(0.1)
        self.norm2 = nn.LayerNorm(dimension)
        self.ffn = nn.Sequential(nn.Linear(dimension, 256), nn.GELU(),
                                 nn.Dropout(0.1), nn.Linear(256, dimension), nn.Dropout(0.1))

    def forward(self, tokens: torch.Tensor) -> torch.Tensor:
        batch, count, dimension = tokens.shape
        qkv = self.qkv(self.norm1(tokens)).reshape(batch, count, 3, self.heads, self.head_dim)
        query, key, value = qkv.permute(2, 0, 3, 1, 4).unbind(0)
        weights = torch.softmax(torch.matmul(query, key.transpose(-2, -1)) * self.head_dim ** -0.5, -1)
        attended = torch.matmul(self.dropout(weights), value).transpose(1, 2).reshape(batch, count, dimension)
        tokens = tokens + self.dropout(self.projection(attended))
        return tokens + self.ffn(self.norm2(tokens))


class Hybrid(nn.Module):
    def __init__(self, num_classes: int, pretrained: bool) -> None:
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained else None
        mobile = models.mobilenet_v3_small(weights=weights)
        self.features = mobile.features
        channels = mobile.classifier[0].in_features
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.spatial_pool = nn.AdaptiveAvgPool2d((4, 4))
        self.projection = nn.Conv2d(channels, 128, 1)
        self.position = nn.Parameter(torch.zeros(1, 16, 128))
        nn.init.trunc_normal_(self.position, std=0.02)
        self.attention = nn.Sequential(AttentionBlock(), AttentionBlock(), nn.LayerNorm(128))
        self.classifier = nn.Sequential(nn.Dropout(0.2), nn.Linear(channels + 128, num_classes))

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        features = self.features(image)
        global_vector = self.pool(features).flatten(1)
        tokens = self.projection(self.spatial_pool(features)).flatten(2).transpose(1, 2)
        spatial_vector = self.attention(tokens + self.position).mean(1)
        return self.classifier(torch.cat((global_vector, spatial_vector), 1))


def build_model(model_name: str, num_classes: int, pretrained: bool = True) -> nn.Module:
    if num_classes < 2:
        raise ValueError("At least two frozen classes are required")
    if model_name == "cnn":
        blocks: list[nn.Module] = []
        channels = 3
        for output in (32, 64, 128):
            blocks.extend((nn.Conv2d(channels, output, 3, padding=1), nn.BatchNorm2d(output),
                           nn.ReLU(), nn.MaxPool2d(2)))
            channels = output
        return nn.Sequential(*blocks, nn.AdaptiveAvgPool2d(1), nn.Flatten(),
                             nn.Dropout(0.2), nn.Linear(128, num_classes))
    if model_name == "hybrid":
        return Hybrid(num_classes, pretrained)
    if model_name in ("mobile", "mobile-scratch"):
        weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained and model_name == "mobile" else None
        model = models.mobilenet_v3_small(weights=weights)
    elif model_name == "efficient":
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
        model = models.efficientnet_b0(weights=weights)
    elif model_name in ("resnet18", "resnet18-scratch"):
        weights = models.ResNet18_Weights.IMAGENET1K_V1 if pretrained and model_name == "resnet18" else None
        model = models.resnet18(weights=weights)
        model.fc = nn.Linear(model.fc.in_features, num_classes)
        return model
    else:
        raise ValueError(f"Unknown model {model_name!r}; expected {MODEL_NAMES}")
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, num_classes)
    return model


def parameter_groups(model: nn.Module, name: str, backbone_lr: float, head_lr: float,
                     frozen: bool = False) -> list[dict]:
    if name.startswith("resnet18"):
        head_ids = {id(parameter) for parameter in model.fc.parameters()}
        backbone_ids = {id(parameter) for parameter in model.parameters() if id(parameter) not in head_ids}
    elif name == "cnn":
        backbone = model
        backbone_ids = {id(parameter) for parameter in backbone.parameters()}
    else:
        backbone = model.features
        backbone_ids = {id(parameter) for parameter in backbone.parameters()}
    for parameter in model.parameters():
        parameter.requires_grad_(not frozen or id(parameter) not in backbone_ids)
    groups = []
    for is_backbone, learning_rate in ((True, backbone_lr), (False, head_lr)):
        parameters = [p for p in model.parameters() if p.requires_grad and (id(p) in backbone_ids) == is_backbone]
        if parameters:
            groups.append({"params": parameters, "lr": learning_rate})
    return groups


def freeze_backbone_statistics(model: nn.Module, name: str) -> None:
    # model.train() must be followed by this during head-only transfer.
    if name.startswith("resnet18"):
        for module in model.modules():
            if isinstance(module, (nn.BatchNorm2d, nn.BatchNorm1d)):
                module.eval()
    elif name != "cnn":
        model.features.eval()


class SoftVote(nn.Module):
    def __init__(self, members: list[nn.Module], weights: list[float], temperature: float = 1.0) -> None:
        super().__init__()
        if not members or len(members) != len(weights) or min(weights) < 0 or abs(sum(weights) - 1) > 1e-6:
            raise ValueError("Ensemble weights must lie on the simplex")
        if temperature <= 0:
            raise ValueError("Temperature must be positive")
        self.members = nn.ModuleList(members)
        self.register_buffer("weights", torch.tensor(weights))
        self.temperature = temperature

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        probabilities = torch.stack([torch.softmax(member(image), -1) for member in self.members])
        mixed = (probabilities * self.weights[:, None, None]).sum(0)
        return mixed.clamp_min(1e-12).log() / self.temperature


class Calibrated(nn.Module):
    def __init__(self, model: nn.Module, temperature: float) -> None:
        super().__init__()
        if temperature <= 0:
            raise ValueError("Temperature must be positive")
        self.model, self.temperature = model, temperature

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        return self.model(image) / self.temperature

"""Protect reduction semantics when modern torch graphs are lowered for ORT Web."""
import unittest

import numpy as np
import onnx
from onnx import helper, numpy_helper
import onnxruntime as ort

from ai.export import _opset17


class ExportReductionTest(unittest.TestCase):
    def test_constant_axes_lowering_preserves_spatial_mean(self):
        axes = numpy_helper.from_array(np.array([-1, -2], dtype=np.int32), name='axes32')
        nodes = [helper.make_node('Cast', ['axes32'], ['axes'], to=onnx.TensorProto.INT64),
                 helper.make_node('ReduceMean', ['image', 'axes'], ['logits'], keepdims=0, noop_with_empty_axes=0)]
        graph = helper.make_graph(nodes, 'spatial-mean',
                                  [helper.make_tensor_value_info('image', onnx.TensorProto.FLOAT, [1, 3, 4, 4])],
                                  [helper.make_tensor_value_info('logits', onnx.TensorProto.FLOAT, [1, 3])], [axes])
        model = helper.make_model(graph, opset_imports=[helper.make_opsetid('', 18)], ir_version=9)
        converted = _opset17(model)
        onnx.checker.check_model(converted)
        image = np.arange(48, dtype=np.float32).reshape(1, 3, 4, 4)
        actual = ort.InferenceSession(converted.SerializeToString(), providers=['CPUExecutionProvider']).run(
            ['logits'], {'image': image})[0]
        np.testing.assert_allclose(actual, image.mean(axis=(-1, -2)), rtol=0, atol=0)
        self.assertEqual(next(op.version for op in converted.opset_import if op.domain == ''), 17)


if __name__ == '__main__':
    unittest.main()

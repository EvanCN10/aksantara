import asyncio
import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch


class Text:
    type = 'text'

    def __init__(self, text):
        self.text = text


class Result:
    def __init__(self, structured=None, content=(), is_error=False):
        self.structured_content = structured
        self.content = [Text(text) for text in content]
        self.is_error = is_error


class Client:
    def __init__(self, results):
        self.results = iter(results)
        self.calls = []

    async def list_tools(self):
        return [types.SimpleNamespace(name=name) for name in ('add_code_cell', 'add_text_cell')]

    async def call_tool(self, tool, args):
        self.calls.append((tool, args))
        return next(self.results)


def load_bridge():
    root = Path(__file__).resolve().parents[1] / 'harness/run_colab_bridge.py'
    server = types.ModuleType('colab_mcp.websocket_server')
    server.ColabWebSocketServer = type('ColabWebSocketServer', (), {})
    session = types.ModuleType('colab_mcp.session')
    session.ColabProxyClient = type('ColabProxyClient', (), {})
    with patch.dict(sys.modules, {
        'colab_mcp': types.ModuleType('colab_mcp'),
        'colab_mcp.websocket_server': server,
        'colab_mcp.session': session,
        'websockets': types.ModuleType('websockets'),
    }):
        spec = importlib.util.spec_from_file_location('testable_colab_bridge', root)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    return module


class BridgeTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.bridge = load_bridge()

    async def test_source_prevalidation_prevents_any_insertion(self):
        with tempfile.TemporaryDirectory() as directory:
            notebook = Path(directory) / 'notebook.ipynb'
            notebook.write_text(json.dumps({'cells': [
                {'cell_type': 'code', 'source': 'ok'},
                {'cell_type': 'code', 'source': '🙂' * 4097},
            ]}), encoding='utf-8')
            client = Client([])
            with self.assertRaisesRegex(ValueError, '16388 UTF-8 bytes.*16384'):
                await self.bridge.push_notebook_cells(client, notebook, 0)
            self.assertEqual(client.calls, [])

    async def test_failed_second_insertion_stops_and_preserves_actual_first_id(self):
        with tempfile.TemporaryDirectory() as directory:
            notebook = Path(directory) / 'notebook.ipynb'
            notebook.write_text(json.dumps({'cells': [
                {'cell_type': 'code', 'source': str(index)} for index in range(3)
            ]}), encoding='utf-8')
            client = Client([Result({'cellId': 'actual-7'}), Result({'message': 'denied'}, is_error=True)])
            with self.assertRaises(self.bridge.ToolFailure) as caught:
                await self.bridge.push_notebook_cells(client, notebook, 7)
            self.assertEqual(caught.exception.inserted, 1)
            self.assertEqual([args['cellIndex'] for _, args in client.calls], [7, 8])

    async def test_created_ids_are_frontend_ids(self):
        with tempfile.TemporaryDirectory() as directory:
            notebook = Path(directory) / 'notebook.ipynb'
            notebook.write_text(json.dumps({'cells': [{'cell_type': 'code', 'source': 'ok'}]}), encoding='utf-8')
            client = Client([Result({'cell': {'id': 'frontend-id'}})])
            result = await self.bridge.push_notebook_cells(client, notebook, 2)
            self.assertEqual(result['created_ids'], ['frontend-id'])

    async def test_deduplication_warning_and_bounded_error(self):
        canonical = {'outputs': [{'output_type': 'error', 'ename': 'ValueError',
                                  'evalue': 'mount failed', 'traceback': ['line', 'raise']} ]}
        result = self.bridge.serialize_result(Result(canonical, [json.dumps(canonical), 'warning: retry']))
        self.assertEqual(result['content'], [{'type': 'text', 'text': 'warning: retry'}])
        self.assertEqual(result['notebook_errors'][0]['ename'], 'ValueError')
        with self.assertRaisesRegex(ValueError, '65536'):
            self.bridge.serialize_result(Result(content=['source secret ' * 6000]))

    async def test_single_cell_reads_and_oversize_source_rejected_before_rpc(self):
        client = Client([])
        for args in ({}, {'cellIndexStart': 1, 'cellIndexEnd': 2},
                     {'cellIndexStart': -1, 'cellIndexEnd': -1}):
            with self.assertRaises(ValueError):
                await self.bridge.execute_command(client, {'action': 'call_tool', 'tool': 'get_cells', 'args': args})
        with self.assertRaises(ValueError):
            await self.bridge.execute_command(client, {'action': 'call_tool', 'tool': 'update_cell',
                                                       'args': {'code': 'a' * 16385}})
        self.assertFalse(client.calls)
        client = Client([Result({'cells': []})])
        result = await self.bridge.execute_command(
            client, {'action': 'call_tool', 'tool': 'get_cells',
                     'args': {'cellIndexStart': 1, 'cellIndexEnd': 1}})
        self.assertEqual(result['structured_content'], {'cells': []})
        self.assertIs(client.calls[0][1]['includeOutputs'], False)

    async def test_error_and_timeout_envelopes_retain_exact_request_id(self):
        with tempfile.TemporaryDirectory() as directory:
            command = Path(directory) / 'command.json'
            output = Path(directory) / 'result.json'
            with patch.object(self.bridge, 'COMMAND_FILE', command), patch.object(self.bridge, 'COMMAND_RESULT_FILE', output):
                command.write_text(json.dumps({'id': 'error-007', 'action': 'call_tool',
                                               'tool': 'run_cell', 'args': {}}), encoding='utf-8')
                await self.bridge.process_command(Client([Result(
                    {'outputs': [{'output_type': 'error', 'ename': 'RuntimeError', 'evalue': 'oops'}]})]))
                envelope = json.loads(output.read_text(encoding='utf-8'))
                self.assertEqual((envelope['id'], envelope['status']), ('error-007', 'error'))
                self.assertEqual(envelope['result']['notebook_errors'][0]['evalue'], 'oops')
                command.write_text(json.dumps({'id': 'timeout-008', 'action': 'call_tool',
                                               'tool': 'run_cell', 'args': {}}), encoding='utf-8')
                async def timeout(*_args):
                    raise asyncio.TimeoutError()
                with patch.object(self.bridge, 'execute_command', timeout):
                    await self.bridge.process_command(Client([]))
                envelope = json.loads(output.read_text(encoding='utf-8'))
                self.assertEqual((envelope['id'], envelope['status']), ('timeout-008', 'error'))
                self.assertIn('remote execution state unknown', envelope['error'])

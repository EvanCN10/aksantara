"""Connect the user's Aksantara Colab notebook to local MCP commands.

The browser authenticates to a loopback WebSocket using the generated URL.
ColabProxyClient performs the MCP handshake and exposes notebook tools.
Commands/results use request IDs so an old response cannot imply success.
Notebook insertion is explicit; connecting never overwrites existing work.
"""

import argparse
import asyncio
import json
import os
import re
import sys
import webbrowser
from pathlib import Path

from colab_mcp.websocket_server import ColabWebSocketServer
from colab_mcp.session import ColabProxyClient
import websockets

MAX_MCP_MESSAGE_BYTES = 32 * 1024 * 1024
MAX_CELL_SOURCE_BYTES = 16 * 1024
MAX_RESULT_BYTES = 64 * 1024

class ToolFailure(Exception):
    def __init__(self, message: str, result: dict, inserted: int | None = None):
        super().__init__(message)
        self.result = result
        self.inserted = inserted


def encoded_size(value) -> int:
    return len(json.dumps(value, ensure_ascii=False, default=str).encode("utf-8"))


def validate_source(source: str) -> None:
    if not isinstance(source, str):
        raise ValueError("Cell source must be a string")
    size = len(source.encode("utf-8"))
    if size > MAX_CELL_SOURCE_BYTES:
        raise ValueError(
            f"Cell source is {size} UTF-8 bytes (limit {MAX_CELL_SOURCE_BYTES}); "
            "rebuild the lightweight notebook"
        )


def notebook_errors(payload) -> list[dict]:
    errors = []

    def visit(value):
        if isinstance(value, dict):
            if value.get("output_type") == "error":
                traceback = value.get("traceback", [])
                if isinstance(traceback, list):
                    traceback = "\n".join(str(line) for line in traceback[-4:])
                errors.append({
                    "ename": str(value.get("ename", ""))[:256],
                    "evalue": str(value.get("evalue", ""))[:512],
                    "traceback": str(traceback)[-2048:],
                })
            for key, child in value.items():
                if isinstance(child, (dict, list)):
                    visit(child)
                elif key == "text" and isinstance(child, str) and child.lstrip().startswith(("{", "[")):
                    try:
                        visit(json.loads(child))
                    except ValueError:
                        pass
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(payload)
    return errors


def created_cell_id(result: dict) -> str:
    candidates = [result.get("structured_content")]
    for block in result["content"]:
        if block.get("type") == "text":
            try:
                candidates.append(json.loads(block["text"]))
            except (ValueError, TypeError):
                continue

    def find_id(value):
        if isinstance(value, dict):
            for key in ("cellId", "cell_id", "id"):
                if isinstance(value.get(key), str) and value[key]:
                    return value[key]
            for child in value.values():
                found = find_id(child)
                if found:
                    return found
        elif isinstance(value, list):
            for child in value:
                found = find_id(child)
                if found:
                    return found
        return None

    for candidate in candidates:
        found = find_id(candidate)
        if found:
            return found
    raise ValueError("Colab insertion response did not contain an actual cell ID")


class NotebookWebSocketServer(ColabWebSocketServer):
    async def __aenter__(self):
        # Embedded audit metadata makes get_cells responses exceed upstream's 1 MiB.
        self._server = await websockets.serve(
            self._connection_handler, host=self.host, port=0,
            subprotocols=["mcp"], origins=self.allowed_origins,
            process_request=self._validate_authorization,
            max_size=MAX_MCP_MESSAGE_BYTES,
        )
        self.port = self._server.sockets[0].getsockname()[1]
        return self


DEFAULT_NOTEBOOK_ID = "scratch"
TARGETS_FILE = Path(__file__).resolve().parents[1] / "configs/colab_targets.json"
STATE_FILE = Path(__file__).resolve().parent / "colab_bridge_state.json"
NOTEBOOK_PATH = Path(__file__).resolve().parents[1] / "notebooks/01_sunda_classifier.ipynb"
COMMAND_FILE = Path(__file__).resolve().parent / "colab_command.json"
COMMAND_RESULT_FILE = Path(__file__).resolve().parent / "colab_command_result.json"


def load_colab_targets() -> dict:
    if TARGETS_FILE.is_file():
        try:
            return json.loads(TARGETS_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def write_json(path: Path, payload: dict) -> None:
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    for _ in range(10):
        try:
            temporary.replace(path)
            return
        except PermissionError:
            time.sleep(0.05)
    temporary.replace(path)


def sanitize_structured(value):
    if isinstance(value, dict):
        new_d = {}
        for k, val in value.items():
            if isinstance(val, str) and len(val) > 1024 and ("image/" in k or k in ("image/png", "image/jpeg")):
                new_d[k] = f"<{k} {len(val)} chars>"
            else:
                new_d[k] = sanitize_structured(val)
        return new_d
    elif isinstance(value, list):
        return [sanitize_structured(x) for x in value]
    return value


def serialize_result(result) -> dict:
    structured = getattr(result, "structured_content", None)
    if structured is not None:
        structured = sanitize_structured(structured)
    if encoded_size(structured) > MAX_RESULT_BYTES:
        raise ValueError(f"MCP result exceeds {MAX_RESULT_BYTES} UTF-8 bytes; inspect a single small cell")
    content = []
    parsed_content = []
    for item in result.content:
        if item.type != "text":
            data = getattr(item, "data", None)
            content.append({"type": item.type, "size": len(data) if data is not None else 0})
            continue
        text = item.text
        if len(text.encode("utf-8")) > MAX_RESULT_BYTES:
            raise ValueError(f"MCP result exceeds {MAX_RESULT_BYTES} UTF-8 bytes; inspect a single small cell")
        try:
            parsed = json.loads(text)
        except ValueError:
            parsed = None
        if structured is not None and parsed == structured:
            continue
        if parsed is not None:
            parsed_content.append(parsed)
        content.append({"type": "text", "text": text})
    payload = {
        "content": content,
        "structured_content": structured,
        "is_error": bool(getattr(result, "is_error", False)),
        "notebook_errors": notebook_errors(structured) + notebook_errors(parsed_content),
    }
    if encoded_size(payload) > MAX_RESULT_BYTES:
        raise ValueError(f"MCP result exceeds {MAX_RESULT_BYTES} UTF-8 bytes; inspect a single small cell")
    return payload


async def push_notebook_cells(client, notebook_path: Path, start_index: int) -> dict:
    """Prevalidate all sources, then insert in order without rollback or retry."""
    cells = json.loads(notebook_path.read_text(encoding="utf-8"))["cells"]
    prepared = []
    for cell in cells:
        source = cell["source"]
        source = "".join(source) if isinstance(source, list) else source
        validate_source(source)
        tool = {"code": "add_code_cell", "markdown": "add_text_cell"}.get(cell["cell_type"])
        if tool is None:
            raise ValueError(f"Unsupported cell type: {cell['cell_type']}")
        prepared.append((tool, source))
    tools = {tool.name for tool in await client.list_tools()}
    if any(tool not in tools for tool, _ in prepared):
        raise ValueError("Notebook insertion tool unavailable")
    created_ids = []
    for tool, source in prepared:
        args = {"cellIndex": start_index + len(created_ids)}
        if tool == "add_text_cell":
            args["content"] = source
        else:
            args.update(language="python", code=source)
        try:
            result = serialize_result(await client.call_tool(tool, args))
        except Exception:
            raise ToolFailure("Colab insertion failed; remote insertion state unknown",
                              {"inserted": len(created_ids), "created_ids": created_ids},
                              len(created_ids)) from None
        if result["is_error"] or result["notebook_errors"]:
            raise ToolFailure("Colab insertion returned an error; do not retry blindly",
                              result, len(created_ids))
        try:
            created_ids.append(created_cell_id(result))
        except ValueError:
            raise ToolFailure("Insertion response lacks cell ID; remote insertion state unknown",
                              result, len(created_ids)) from None
    return {"inserted": len(created_ids), "start_index": start_index,
            "created_ids": created_ids}


def validate_tool_args(tool: str, args: dict) -> dict:
    if not isinstance(args, dict):
        raise ValueError("Tool arguments must be an object")
    args = dict(args)
    if tool == "get_cells":
        start, end = args.get("cellIndexStart"), args.get("cellIndexEnd")
        if type(start) is not int or start < 0 or type(end) is not int or end != start:
            raise ValueError("get_cells requires one nonnegative cellIndexStart == cellIndexEnd")
        args.setdefault("includeOutputs", False)
    if tool in ("add_code_cell", "add_text_cell", "update_cell"):
        keys = ("content",) if tool == "add_text_cell" else (
            ("code", "content", "source") if tool == "update_cell" else ("code",))
        sources = [args[key] for key in keys if key in args]
        if not sources:
            raise ValueError(f"{tool} requires source")
        for source in sources:
            validate_source(source)
    return args


async def execute_command(client, command: dict) -> dict:
    action = command.get("action")
    if action == "list_tools":
        return {"tools": [tool.model_dump(mode="json", by_alias=True)
                          for tool in await client.list_tools()]}
    if action == "push_notebook":
        start_index = command["start_index"]
        if type(start_index) is not int or start_index < 0:
            raise ValueError("start_index must be a nonnegative integer")
        return await push_notebook_cells(client, Path(command.get("path", NOTEBOOK_PATH)), start_index)
    if action == "call_tool":
        tool = command["tool"]
        args = validate_tool_args(tool, command.get("args", {}))
        try:
            raw_result = await client.call_tool(tool, args)
        except Exception:
            raise RuntimeError("Colab tool call failed; remote execution state unknown") from None
        result = serialize_result(raw_result)
        if result["is_error"] or result["notebook_errors"]:
            raise ToolFailure("Colab tool or Python execution error", result)
        return result
    raise ValueError(f"Unknown bridge action: {action}")


async def process_command(client) -> None:
    command = {}
    try:
        payload = json.loads(COMMAND_FILE.read_text(encoding="utf-8"))
        COMMAND_FILE.unlink()
        if not isinstance(payload, dict):
            raise ValueError("Command must be a JSON object")
        command = payload
        if not isinstance(command.get("id"), str) or not command["id"]:
            raise ValueError("Command requires a unique nonempty string id")
        timeout = float(command.get("timeout", 120))
        if not 0 < timeout <= 3600:
            raise ValueError("Command timeout must be between 0 and 3600 seconds")
        result = await asyncio.wait_for(execute_command(client, command), timeout)
        if encoded_size(result) > MAX_RESULT_BYTES:
            raise ValueError(f"MCP result exceeds {MAX_RESULT_BYTES} UTF-8 bytes; inspect a single small cell")
        response = {"id": command["id"], "status": "ok", "result": result}
    except ToolFailure as error:
        response = {"id": command.get("id"), "status": "error",
                    "error": str(error), "result": error.result}
        if error.inserted is not None:
            response["inserted"] = error.inserted
    except asyncio.TimeoutError:
        response = {"id": command.get("id"), "status": "error",
                    "error": "Command timed out; remote execution state unknown; local cancellation does not stop training"}
    except Exception as error:
        response = {"id": command.get("id"), "status": "error",
                    "error": f"{type(error).__name__}: {str(error)[:512]}"}
    if encoded_size(response) > MAX_RESULT_BYTES:
        response = {"id": command.get("id"), "status": "error",
                    "error": f"MCP response exceeds {MAX_RESULT_BYTES} UTF-8 bytes; inspect a single small cell"}
    write_json(COMMAND_RESULT_FILE, response)


def parse_notebook_id(target: str) -> str:
    """Extract drive notebook ID if user passed a full Colab URL."""
    if not target or target == "scratch":
        return "scratch"
    # Match /drive/<ID>
    match = re.search(r"/drive/([a-zA-Z0-9_-]+)", target)
    if match:
        return match.group(1)
    # Strip any trailing query or hash
    target = target.split("?")[0].split("#")[0].strip()
    return target


async def run_bridge(
    notebook_target: str,
    notebook_path: Path | None = None,
    auto_open: bool = True,
    timeout: float = 180.0,
):
    global NOTEBOOK_PATH
    if notebook_path is not None:
        NOTEBOOK_PATH = notebook_path
    notebook_id = parse_notebook_id(notebook_target)

    # 2. Start WebSocket Server
    server = NotebookWebSocketServer()
    async with server:
        # 3. Attach ColabProxyClient (implements bidirectional MCP ClientSession)
        async with ColabProxyClient(server) as proxy:
            port = server.port
            token = server.token

            if notebook_id == "scratch":
                target_url = f"https://colab.research.google.com/notebooks/empty.ipynb#mcpProxyToken={token}&mcpProxyPort={port}"
            else:
                target_url = f"https://colab.research.google.com/drive/{notebook_id}#mcpProxyToken={token}&mcpProxyPort={port}"

            print("=" * 72)
            print("        AKSANTARA GOOGLE COLAB MCP BRIDGE")
            print("=" * 72)
            print(f"  * Local Port : {port}")
            print(f"  * Token      : {token}")
            print(f"  * Notebook   : {notebook_id}")
            print("-" * 72)
            print("  TARGET HANDSHAKE URL:")
            print(f"  {target_url}")
            print("=" * 72)

            # Record state
            state_data = {
                "port": port,
                "token": token,
                "notebook_id": notebook_id,
                "url": target_url,
                "status": "waiting_handshake",
                "pid": os.getpid(),
            }
            write_json(STATE_FILE, state_data)

            if auto_open:
                print("\n>>> Launching notebook in default browser...")
                webbrowser.open_new(target_url)

            print(f"\n>>> Waiting for Colab to connect (timeout {int(timeout)}s)...")
            print(">>> In your browser Colab tab, click 'Connect' / 'Allow local connection'.")

            # Wait for handshake
            start_time = asyncio.get_event_loop().time()
            connected = False
            while (asyncio.get_event_loop().time() - start_time) < timeout:
                if proxy.is_connected():
                    connected = True
                    break
                await asyncio.sleep(0.5)

            if not connected:
                print(f"\n[!] TIMEOUT: Colab tab did not connect within {int(timeout)}s.")
                print("    Troubleshooting steps:")
                print("    1. Verify browser opened the exact URL above (including #mcpProxyToken and #mcpProxyPort).")
                print("    2. Check if another Colab tab is open or conflicting.")
                print("    3. Click the target URL manually.")
                state_data["status"] = "timeout"
                write_json(STATE_FILE, state_data)
                raise TimeoutError("Colab browser did not authorize the MCP connection")

            print("\n" + "=" * 72)
            print("  [SUCCESS] GOOGLE COLAB CONNECTED VIA MCP WEBSOCKET!")
            print("=" * 72)

            state_data["status"] = "connected"
            write_json(STATE_FILE, state_data)

            tools = await proxy.proxy_mcp_client.list_tools()
            state_data["tools"] = [tool.model_dump(mode="json", by_alias=True) for tool in tools]
            write_json(STATE_FILE, state_data)
            print(f"  * Registered Notebook Tools ({len(tools)})")
            for tool in tools:
                print(f"    - {tool.name}")

            print("-" * 72)
            print("  * Session is LIVE and bidirectional.")
            print("  * Press Ctrl+C in this terminal to safely disconnect.")
            print("=" * 72)

            try:
                # Keep session alive with heartbeat check and command watcher
                while proxy.is_connected():
                    if COMMAND_FILE.exists():
                        await process_command(proxy.proxy_mcp_client)
                    await asyncio.sleep(0.5)
                print("\n[!] Colab browser session was closed or disconnected.")
            except asyncio.CancelledError:
                pass
            finally:
                state_data["status"] = "disconnected"
                write_json(STATE_FILE, state_data)
                print("\n[*] Colab bridge closed cleanly.")


def main():
    parser = argparse.ArgumentParser(description="Aksantara Google Colab MCP Bridge")
    parser.add_argument(
        "--script",
        "-s",
        choices=["sunda", "lontara", "bali", "combined"],
        help="Target Aksantara script (resolves notebook file and Colab ID from configs/colab_targets.json)",
    )
    parser.add_argument(
        "--notebook",
        "-n",
        nargs="?",
        const="scratch",
        default=None,
        help=f"Google Colab Drive Notebook ID or URL (default: from colab_targets.json or {DEFAULT_NOTEBOOK_ID})",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically launch the browser",
    )
    parser.add_argument(
        "--timeout",
        "-t",
        type=float,
        default=180.0,
        help="Connection timeout in seconds (default: 180)",
    )

    args = parser.parse_args()

    target_nb = args.notebook or DEFAULT_NOTEBOOK_ID
    target_path = NOTEBOOK_PATH

    if args.script:
        targets = load_colab_targets()
        info = targets.get(args.script, {})
        configured_id = info.get("colab_url_or_id", "").strip()
        if configured_id and not args.notebook:
            target_nb = configured_id
        elif not configured_id and not args.notebook:
            print(f"[*] Info: colab_url_or_id untuk '{args.script}' belum diisi di ai/configs/colab_targets.json.")
            print(f"[*] Membuka Colab scratch. Anda dapat mengupload {info.get('notebook_file')} ke Drive.")
        if info.get("notebook_file"):
            resolved = Path(__file__).resolve().parents[2] / info["notebook_file"]
            if resolved.is_file():
                target_path = resolved

    try:
        asyncio.run(
            run_bridge(
                notebook_target=target_nb,
                notebook_path=target_path,
                auto_open=not args.no_browser,
                timeout=args.timeout,
            )
        )
    except KeyboardInterrupt:
        print("\n[*] Interrupted by user. Exiting...")
    except Exception as error:
        print(f"[ERROR] {type(error).__name__}: {error}", file=sys.stderr)
        if STATE_FILE.exists():
            state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            if state.get("pid") == os.getpid():
                state.update(status="error", error=f"{type(error).__name__}: {error}")
                write_json(STATE_FILE, state)
        raise SystemExit(1)


if __name__ == "__main__":
    main()

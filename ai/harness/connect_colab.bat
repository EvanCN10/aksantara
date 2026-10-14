@echo off
REM Aksantara Colab MCP Connection Launcher
uv run --with git+https://github.com/googlecolab/colab-mcp python "%~dp0run_colab_bridge.py" %*

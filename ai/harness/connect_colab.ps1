param(
    [string]$Notebook = "1JVcqD9t1u0M8CfQFjHgSBf4as56hCcTk",
    [switch]$NoBrowser,
    [double]$Timeout = 180.0
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bridgeScript = Join-Path $scriptDir "run_colab_bridge.py"

$uvArgs = @(
    "run",
    "--with", "git+https://github.com/googlecolab/colab-mcp",
    "python", $bridgeScript,
    "--notebook", $Notebook,
    "--timeout", $Timeout
)

if ($NoBrowser) {
    $uvArgs += "--no-browser"
}

& uv @uvArgs
exit $LASTEXITCODE

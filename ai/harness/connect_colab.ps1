[CmdletBinding(PositionalBinding=$false)]
param(
    [string]$Script = "",
    [string]$Notebook = "",
    [switch]$NoBrowser,
    [double]$Timeout = 180.0,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$ExtraArgs
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bridgeScript = Join-Path $scriptDir "run_colab_bridge.py"

$uvArgs = @(
    "run",
    "--with", "git+https://github.com/googlecolab/colab-mcp",
    "python", $bridgeScript,
    "--timeout", $Timeout
)

if ($Script) {
    $uvArgs += @("--script", $Script)
}

if ($Notebook -and -not $Notebook.StartsWith("-")) {
    $uvArgs += @("--notebook", $Notebook)
}

if ($ExtraArgs) {
    $uvArgs += $ExtraArgs
}
if ($NoBrowser) {
    $uvArgs += "--no-browser"
}

& uv @uvArgs
exit $LASTEXITCODE

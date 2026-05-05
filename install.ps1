param(
  [ValidateSet("install", "update", "check")]
  [string]$Action = "install",
  [string]$InstallDir = "$HOME/.config/opencode/plugin",
  [string]$RawBase = "https://raw.githubusercontent.com/IceMasterT/Opencode-Tri-Agent-Router/main"
)

$ErrorActionPreference = "Stop"

# Global install directory for OpenCode
$GlobalDir = "$HOME/.opencode/plugin"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $GlobalDir | Out-Null

$tempManifest = Join-Path ([System.IO.Path]::GetTempPath()) "tri-agent-router-manifest.json"
Invoke-WebRequest -UseBasicParsing -Uri $manifestUrl -OutFile $tempManifest

$remoteManifest = Get-Content $tempManifest -Raw | ConvertFrom-Json
$remoteVersion = $remoteManifest.version

$localManifestPath = Join-Path $InstallDir $manifestName
$localVersion = $null
if (Test-Path $localManifestPath) {
  $localVersion = (Get-Content $localManifestPath -Raw | ConvertFrom-Json).version
}

if ($Action -eq "check") {
  if ($localVersion -and $localVersion -eq $remoteVersion) {
    Write-Host "Tri-Agent Router is up to date ($localVersion)."
  } elseif (-not $localVersion) {
    Write-Host "Tri-Agent Router is not installed. Latest available version: $remoteVersion"
  } else {
    Write-Host "Update available: installed $localVersion, latest $remoteVersion"
  }
  exit 0
}

if ($Action -eq "update" -and $localVersion -and $localVersion -eq $remoteVersion) {
  Write-Host "Tri-Agent Router is already up to date ($localVersion)."
  exit 0
}

  foreach ($file in $remoteManifest.files) {
    $fileName = [System.IO.Path]::GetFileName($file)
    $target = Join-Path $InstallDir $fileName
    Invoke-WebRequest -UseBasicParsing -Uri "$RawBase/$file" -OutFile $target
    # Global copy
    $globalTarget = Join-Path $GlobalDir $fileName
    Copy-Item -Path $target -Destination $globalTarget -Force
  }

$remoteManifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $localManifestPath

  Write-Host "Tri-Agent Router $remoteVersion installed to $InstallDir"
  Write-Host "Tri-Agent Router $remoteVersion also installed globally to $GlobalDir"

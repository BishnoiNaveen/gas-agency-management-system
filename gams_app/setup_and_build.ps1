# GAMS Flutter App - Setup, Build Windows EXE, and Android APK
param(
    [switch]$WindowsOnly,
    [switch]$ApkOnly,
    [switch]$SkipFlutterDownload
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ProjectRoot
$FlutterDir = Join-Path $RepoRoot "tools\flutter"
$FlutterBin = Join-Path $FlutterDir "bin\flutter.bat"

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-Flutter {
    if (Get-Command flutter -ErrorAction SilentlyContinue) {
        $script:FlutterCmd = "flutter"
        Write-Step "Using system Flutter"
        flutter --version
        return
    }

    if (Test-Path $FlutterBin) {
        $script:FlutterCmd = $FlutterBin
        Write-Step "Using local Flutter at tools\flutter"
        & $FlutterBin --version
        return
    }

    if ($SkipFlutterDownload) {
        throw "Flutter not found. Install Flutter SDK or run without -SkipFlutterDownload"
    }

    Write-Step "Cloning Flutter SDK via Git (faster than zip download)..."
    $toolsDir = Join-Path $RepoRoot "tools"
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

    $flutterClone = Join-Path $toolsDir "flutter"
    if (-not (Test-Path (Join-Path $flutterClone ".git"))) {
        git clone https://github.com/flutter/flutter.git -b stable --depth 1 $flutterClone
    }

    $script:FlutterCmd = $FlutterBin
    & $FlutterBin --version
}

function Invoke-Flutter {
    param([string[]]$Args)
    & $FlutterCmd @Args
    if ($LASTEXITCODE -ne 0) { throw "Flutter command failed: flutter $($Args -join ' ')" }
}

Write-Step "GAMS App Setup - $ProjectRoot"
Set-Location $ProjectRoot

Ensure-Flutter

Write-Step "Configuring Flutter..."
Invoke-Flutter @("config", "--enable-windows-desktop")
Invoke-Flutter @("doctor")

if (-not (Test-Path "windows")) {
    Write-Step "Creating platform projects..."
    Invoke-Flutter @("create", ".", "--project-name=gams_app", "--org=com.naveenbishnoi.gams")
}

Write-Step "Getting dependencies..."
Invoke-Flutter @("pub", "get")

$releaseDir = Join-Path $RepoRoot "release\GAMS"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

if (-not $ApkOnly) {
    Write-Step "Building Windows desktop app..."
    Invoke-Flutter @("build", "windows", "--release")

  $winExe = Join-Path $ProjectRoot "build\windows\x64\runner\Release"
    if (Test-Path $winExe) {
        Copy-Item -Path (Join-Path $winExe "*") -Destination $releaseDir -Recurse -Force
        Write-Host "`nWindows app ready: $releaseDir\gams_app.exe" -ForegroundColor Green

        # Desktop shortcut
        $shortcutPath = Join-Path $RepoRoot "GAMS Desktop App.lnk"
        $wsh = New-Object -ComObject WScript.Shell
        $sc = $wsh.CreateShortcut($shortcutPath)
        $sc.TargetPath = Join-Path $releaseDir "gams_app.exe"
        $sc.WorkingDirectory = $releaseDir
        $sc.Description = "Bishnoi Gas Services"
        $sc.Save()
        Write-Host "Shortcut created: $shortcutPath" -ForegroundColor Green
    }
}

if (-not $WindowsOnly) {
    Write-Step "Building Android APK..."
    try {
        Invoke-Flutter @("build", "apk", "--release")
        $apkSrc = Join-Path $ProjectRoot "build\app\outputs\flutter-apk\app-release.apk"
        if (Test-Path $apkSrc) {
            $apkDest = Join-Path $RepoRoot "release\GAMS-GasAgency-v2.apk"
            Copy-Item $apkSrc $apkDest -Force
            Write-Host "`nAPK ready: $apkDest" -ForegroundColor Green
            Write-Host "Copy this file to your Android phone and install it." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "`nAPK build failed (Android SDK may be missing)." -ForegroundColor Yellow
        Write-Host "Install Android Studio, then run: flutter doctor --android-licenses" -ForegroundColor Yellow
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Step "Done!"
Write-Host @"

NEXT STEPS:
-----------
PC:  Double-click RUN_GAMS_APP.bat  or  release\GAMS\gams_app.exe
APK: Copy release\GAMS-GasAgency-v2.apk to your phone

Login:
  Username: Naveen Bishnoi
  Password: Bhambu2006

"@ -ForegroundColor White

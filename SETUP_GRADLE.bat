@echo off
title Download Gradle Wrapper JAR
cd /d "%~dp0gams_android"

if exist gradle\wrapper\gradle-wrapper.jar (
  echo gradle-wrapper.jar already exists.
  exit /b 0
)

echo Downloading gradle-wrapper.jar...
powershell -NoProfile -Command ^
  "$url='https://github.com/gradle/gradle/raw/v8.2.0/gradle/wrapper/gradle-wrapper.jar';" ^
  "$out='gradle\wrapper\gradle-wrapper.jar';" ^
  "New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null;" ^
  "Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing"

if exist gradle\wrapper\gradle-wrapper.jar (
  echo Download complete. Run: gradlew.bat assembleDebug
) else (
  echo Download failed. Open project in Android Studio to generate wrapper.
)
pause

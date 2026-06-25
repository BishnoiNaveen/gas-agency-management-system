@echo off
title GAMS App - Setup and Build
cd /d "%~dp0gams_app"
powershell -ExecutionPolicy Bypass -File "%~dp0gams_app\setup_and_build.ps1" %*
pause

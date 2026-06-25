@echo off
title Bishnoi Gas Services
cd /d "%~dp0"

if not exist bin\gas_agency.exe (
    echo First-time setup: Building application...
    call build.bat
    if errorlevel 1 (
        echo.
        echo Setup failed. See docs\INSTALLATION.txt for help.
        pause
        exit /b 1
    )
)

bin\gas_agency.exe
pause

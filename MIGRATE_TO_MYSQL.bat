@echo off
title GAMS - Migrate to MySQL (XAMPP)
cd /d "%~dp0"

echo.
echo ========================================
echo   Migrate data to MySQL (XAMPP)
echo   Database: bishnoi_gas_service
echo ========================================
echo.
echo Before running:
echo   1. Start XAMPP Control Panel
echo   2. Start Apache + MySQL
echo   3. Create database "bishnoi_gas_service" in phpMyAdmin (if not done)
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org
  pause
  exit /b 1
)

cd gams_server
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Running migration (SQLite / C .dat / gams_export.json)...
call npm run migrate
if errorlevel 1 (
  echo.
  echo Migration failed. Check XAMPP MySQL is running and gams_server\.env settings.
  pause
  exit /b 1
)

echo.
echo To re-import and overwrite existing MySQL data, run:
echo   cd gams_server ^&^& npm run migrate:force
echo.
pause

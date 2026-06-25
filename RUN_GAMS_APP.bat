@echo off
title GAMS - Bishnoi Gas Services
cd /d "%~dp0"

echo.
echo ========================================
echo   Bishnoi Gas Services - Starting...
echo ========================================
echo.
echo Requires: Node.js + XAMPP MySQL running
echo Database: bishnoi_gas_service (auto-sync on start)
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org
  pause
  exit /b 1
)

cd gams_server
if not exist node_modules (
  echo Installing server dependencies...
  call npm install --omit=dev
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

cd ..\gams_web
if exist package.json (
  if not exist assets\vendor\fontawesome (
    echo Installing local fonts and icons...
    call npm install
    call npm run vendor
  )
)

cd ..\gams_server
echo Syncing data to MySQL...
call npm run sync
if errorlevel 1 (
  echo.
  echo MySQL sync failed. Start XAMPP MySQL and check gams_server\.env
  pause
  exit /b 1
)

echo Starting API server at http://localhost:3000
start "GAMS Server" cmd /k "cd /d "%~dp0gams_server" && npm start"

timeout /t 3 /nobreak >nul
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else (
  start "" "http://localhost:3000"
)

echo.
echo App opened in browser.
echo Login: Naveen Bishnoi / Bhambu2006
echo Customer: customer / Bhambu2006
echo.
echo Keep the "GAMS Server" window open while using the app.
echo.
pause

@echo off
setlocal

if not exist bin mkdir bin

set "GCC=C:\Program Files\CodeBlocks\MinGW\bin\gcc.exe"
if not exist "%GCC%" (
    set "GCC=gcc"
)

echo Building Bishnoi Gas Services...
"%GCC%" -Wall -Wextra -std=c99 -Iinclude -o bin\gas_agency.exe ^
    src\main.c src\utils.c src\auth.c src\dashboard.c src\delivery.c src\customer.c src\cylinder.c src\booking.c src\billing.c

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed. Make sure GCC is installed.
    echo Install MinGW-w64 or CodeBlocks with MinGW.
    exit /b 1
)

echo.
echo Build successful! Run: bin\gas_agency.exe
echo.

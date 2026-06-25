@echo off

title GAMS - Build Android APK

echo.

echo ============================================

echo   GAMS Android APK Builder

echo ============================================

echo.



set "ASSETS_SRC=%~dp0gams_web"

set "ASSETS_DST=%~dp0gams_android\app\src\main\assets\www"



echo Copying web app to Android project...

if not exist "%ASSETS_DST%" mkdir "%ASSETS_DST%"

xcopy /E /Y /I "%ASSETS_SRC%\*" "%ASSETS_DST%\" >nul



echo.

echo CLI build (after Java + Android SDK installed):

echo   cd gams_android

echo   SETUP_GRADLE.bat   ^(first time - downloads wrapper JAR^)

echo   gradlew.bat assembleDebug

echo   APK: app\build\outputs\apk\debug\app-debug.apk

echo.

echo Android Studio:

echo   1. Install from https://developer.android.com/studio

echo   2. Open folder: gams_android

echo   3. Build ^> Build APK(s)

echo.

echo Primary app: RUN_GAMS_APP.bat ^(Node.js server + browser^)

echo See PLATFORM.md for stack details.

echo.

pause


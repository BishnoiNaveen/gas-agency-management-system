# GAMS Mobile App (Flutter)

Modern UI for **Bishnoi Gas Services** — Windows PC and Android (APK).

## Quick Start (Windows PC)

1. Double-click **`INSTALL_GAMS_APP.bat`** in the project root (first time only — downloads Flutter and builds the app).
2. Run **`release\GAMS\gams_app.exe`** (or the APK on Android) after the build completes.

For the **browser web app** (no Flutter install), use **`RUN_GAMS_APP.bat`** instead.

## Login Credentials

| Field    | Value           |
|----------|-----------------|
| Username | `Naveen Bishnoi` |
| Password | `Bhambu2006`     |

## Install on Android (APK)

After running the installer, copy this file to your phone:

```
release/GAMS-GasAgency-v2.apk
```

Enable **Install from unknown sources**, open the APK, and install.

## Features

- Material Design 3 UI with dashboard, cards, and bottom navigation
- All modules from the C console app: Customers, Inventory, Bookings, Billing, Delivery
- JSON file persistence (data saved in app documents folder)
- CSV export and delivery slip generation

## Manual Build

```powershell
cd gams_app
powershell -ExecutionPolicy Bypass -File setup_and_build.ps1
```

Windows only: add `-WindowsOnly`  
APK only: add `-ApkOnly`

## Requirements

- Windows 10/11
- Internet (first-time Flutter download ~1 GB)
- For APK: Android Studio with SDK (optional; Windows build works without it)

# Bishnoi Gas Services — Platform Guide

## Primary stack (use this)

| Layer | Path | Role |
|-------|------|------|
| **API + Web** | `gams_server/` + `gams_web/` | Node.js, **MySQL (XAMPP)**, bcrypt, JWT — **single source of truth** |
| **Launch** | `RUN_GAMS_APP.bat` | Starts server + opens http://localhost:3000 |

All customer portal, payments, GST bills, and admin features run here.

## Legacy / reference stacks

| Stack | Status | Notes |
|-------|--------|-------|
| **C console** (`src/`, `RUN.bat`) | Legacy academic | Original BCA project; separate `data/*.dat` files |
| **Android WebView** (`gams_android/`) | Wrapper | Loads `gams_web` assets; use server URL in future builds |
| **Flutter** (`gams_app/`) | Deprecated | Admin-only subset; not synced with web features |

Do **not** demo multiple stacks in the same interview — use **RUN_GAMS_APP.bat** only.

## Data storage

- **Production path:** MySQL database **`bishnoi_gas_service`** on XAMPP (tables in `gams_server/sql/schema.sql`)
- First-time import: **`MIGRATE_TO_MYSQL.bat`** or `npm run migrate` in `gams_server`
- Passwords: **bcrypt hashes** in `admin_auth` and `customer_auth` tables
- JWT session token in browser `localStorage` (`gams_token`)
- Legacy C app still uses `data/*.dat` (separate; migrated via migrate script)

## Tests

```bash
cd gams_server
npm test
```

Business logic tests live in `gams_shared/logic.js`.

## Android APK

```bash
BUILD_APK.bat
cd gams_android
gradlew.bat assembleDebug
```

Gradle wrapper included for CLI builds.

# Deprecated — use Web + Server stack

The **Flutter app** (`gams_app/`) is no longer maintained alongside the web portal.

## Use instead

1. Run **`RUN_GAMS_APP.bat`** in the project root
2. Open http://localhost:3000

This gives you the full admin + customer portal, payments, GST bills, and MySQL (XAMPP) backend.

## Why deprecated

- Flutter version is admin-only (no customer portal, payments, or GST)
- Data does not sync with `gams_server` MySQL database
- `gams_web` + Node API is the single source of truth (see `PLATFORM.md`)

The C console app (`RUN.bat`) remains available as the original academic reference.

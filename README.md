# Gas Agency Management System (GAMS)

> Console-based LPG agency software in C — customers, inventory, bookings, delivery, billing, and admin dashboard with file-based persistence.

A **complete console-based Gas Agency Management System** built in **C** for managing customers, LPG cylinder inventory, bookings, billing, and admin operations. Designed as an academic / resume project for **BCA** freshers.

[![Language](https://img.shields.io/badge/Language-C99-blue.svg)](https://en.wikipedia.org/wiki/C_(programming_language))
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)](#requirements)
[![License](https://img.shields.io/badge/License-Academic-green.svg)](#license)
## Project Highlights (for Resume)

- Menu-driven console application with modular C architecture
- **Admin login panel** with masked password and attempt limiting
- **Admin dashboard** with live business statistics
- Customer CRUD with soft delete and phone validation
- LPG cylinder inventory tracking (5 KG, 14 KG, 19 KG)
- Booking workflow with stock reservation and empty-cylinder tracking
- Automatic bill generation on delivery
- Revenue reports and **CSV export**
- Persistent data storage using binary file I/O

## Tech Stack

| Technology | Usage |
|------------|-------|
| C (C99) | Core language |
| File I/O | `fopen`, `fread`, `fwrite` for data persistence |
| Structures & Enums | Data modeling |
| Functions & Modules | Separation of concerns |

## Features

### 0. Admin Login
- Secure login screen before system access
- Masked password entry (Windows)
- Maximum 3 login attempts
- Session shows logged-in admin name

**Default credentials:**
| Field | Value |
|-------|-------|
| Username | `Naveen Bishnoi` |
| Password | `Bhambu2006` |

### 1. Customer Management
- Add new customers (10-digit phone validation)
- View all active customers
- Search customer by ID
- Update customer details
- Delete customer (soft delete; blocked if pending bookings exist)

### 2. Cylinder Inventory
- View stock of filled and empty cylinders
- Update stock quantity and refill price
- Supports 5 KG, 14 KG, and 19 KG cylinders

### 3. Booking Management
- Create cylinder booking for registered customers
- Auto-reserve stock from inventory
- View all bookings with status
- Mark booking as **Delivered** or **Cancelled**
- Auto-generate bill when delivered
- Empty cylinders tracked on delivery

### 4. Billing Management
- View all bills
- Mark bills as paid (with duplicate-payment check)
- Revenue report (paid vs pending amount)
- Export bills to CSV (`data/reports/bills_report.csv`)

### 5. Delivery Management
- View **pending deliveries** with customer address and phone
- **Deliver cylinder to customer** with confirmation screen
- Auto-generate bill on delivery
- **Delivery slip** saved to `data/reports/delivery_slip_[ID].txt`
- Empty cylinders tracked in inventory after delivery

### 6. Admin Dashboard
- Active customer count
- Inventory summary (filled / empty cylinders)
- Booking status breakdown
- Revenue and pending collection totals

## Project Structure

```
gas-agency-project/
├── include/
│   ├── common.h      # Shared constants and utility declarations
│   ├── auth.h        # Admin login module
│   ├── dashboard.h   # Admin dashboard module
│   ├── delivery.h    # Customer delivery module
│   ├── customer.h    # Customer module
│   ├── cylinder.h    # Cylinder inventory module
│   ├── booking.h     # Booking module
│   └── billing.h     # Billing module
├── src/
│   ├── main.c        # Entry point and main menu
│   ├── utils.c       # Input validation and helpers
│   ├── auth.c        # Login screen and authentication
│   ├── dashboard.c   # Business statistics dashboard
│   ├── delivery.c    # Cylinder delivery to customers
│   ├── customer.c    # Customer operations
│   ├── cylinder.c    # Inventory operations
│   ├── booking.c     # Booking operations
│   └── billing.c     # Billing operations
├── data/             # Created at runtime (binary data + CSV reports)
├── docs/             # User manual and installation guide
├── RUN.bat           # Double-click to start (customer delivery)
├── START_HERE.txt    # Quick start for end users
├── build.bat         # Windows build script
├── Makefile          # Linux/Mac build
└── README.md
```

## Requirements

- **GCC** compiler (MinGW-w64 on Windows, GCC on Linux/Mac)
- Windows / Linux / macOS terminal

### Install GCC on Windows

```bash
winget install -e --id mingw-w64
```

Or use **CodeBlocks with MinGW** (already detected on many systems).

## How to Build & Run

### Windows (for end users)

```bash
RUN.bat
```

### Windows (developers)

```bash
build.bat
bin\gas_agency.exe
```

### Linux / Mac

```bash
make
make run
```

### Manual compile

```bash
gcc -Wall -Wextra -std=c99 -Iinclude -o gas_agency \
    src/main.c src/utils.c src/auth.c src/dashboard.c src/delivery.c \
    src/customer.c src/cylinder.c src/booking.c src/billing.c
./gas_agency
```

## Sample Workflow

1. **Login** with admin credentials
2. **Add Customer** → Customer Management → Add Customer
3. **Check Inventory** → Cylinder Inventory → View Inventory
4. **Create Booking** → Booking Management → Create Booking
5. **Deliver to Customer** → Delivery Management → Deliver Cylinder
6. **Collect Payment** → Billing Management → Mark Bill as Paid
7. **View Dashboard** → Admin Dashboard (menu 6)
8. **Export Report** → Billing Management → Export Bills to CSV

## Data Storage

All records are stored in the `data/` folder:

| File | Contents |
|------|----------|
| `customers.dat` | Customer records |
| `cylinders.dat` | Cylinder stock |
| `bookings.dat` | Booking records |
| `bills.dat` | Bill records |
| `reports/delivery_slip_*.txt` | Delivery slip per order |
| `reports/bills_report.csv` | Exported billing report |

## Concepts Demonstrated

- Structures and enums
- File handling (binary mode)
- Modular programming
- Input validation
- Menu-driven UI
- Authentication flow
- Business logic workflow
- Report generation (CSV)

## Modules Overview

```
Login (auth) → Main Menu → Customer / Inventory / Booking / Billing / Delivery / Dashboard
                                ↓
                         Binary files in data/
```

## Author

**Naveen Bishnoi** — BCA Fresher Project

## License

Free to use for learning and academic purposes.

# Server setup



## Requirements



- [Node.js](https://nodejs.org/) LTS (v18 or newer)

- [XAMPP](https://www.apachefriends.org/) with **MySQL** running

- Database **`bishnoi_gas_service`** created in phpMyAdmin



## Install



```bash

cd gams_server

npm install

copy .env.example .env    # edit MySQL password if needed

npm run migrate           # import existing data (first time)

npm test

npm start

```



Or double-click **`MIGRATE_TO_MYSQL.bat`** then **`RUN_GAMS_APP.bat`** in the project root.



App runs at http://localhost:3000



## MySQL configuration



Edit `gams_server/.env`:



```

GAMS_MYSQL_HOST=127.0.0.1

GAMS_MYSQL_PORT=3306

GAMS_MYSQL_USER=root

GAMS_MYSQL_PASSWORD=

GAMS_MYSQL_DATABASE=bishnoi_gas_service

```



Tables are created automatically on first start. Schema file: `sql/schema.sql`



## Migrate existing data



Imports from (first match wins):



1. `gams_server/data/gams.db` (old SQLite)

2. `gams_export.json` (browser localStorage export)

3. `data/*.dat` (C console app)



```bash

npm run migrate          # skip if MySQL already has data

npm run migrate:force    # overwrite MySQL data

```



**Export browser localStorage** (F12 → Console):



```javascript

copy(localStorage.getItem('gams_data_v3'))

```



Paste into `gams_export.json` in the project root, then run migrate.



## Default credentials



| Role | Username | Password |

|------|----------|----------|

| Admin | Naveen Bishnoi | Bhambu2006 |

| Customer | customer | Bhambu2006 |



Admin recovery code (forgot password): **BGS2006**



Passwords are stored as **bcrypt hashes** in MySQL tables `admin_auth` and `customer_auth`.



## Web vendor assets (offline icons/fonts)



```bash

cd gams_web

npm install

npm run vendor

```



If npm is not run, Font Awesome falls back to CDN when online.


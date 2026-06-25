-- Bishnoi Gas Services — MySQL schema for XAMPP/phpMyAdmin
-- Database: bishnoi_gas_service (create in phpMyAdmin first, then import this file)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS customers (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  username VARCHAR(50) DEFAULT NULL,
  UNIQUE KEY uk_customers_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cylinders (
  id INT NOT NULL PRIMARY KEY,
  type INT NOT NULL,
  filled INT NOT NULL DEFAULT 0,
  empty_qty INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_cylinders_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id INT NOT NULL PRIMARY KEY,
  customer_id INT NOT NULL,
  type INT NOT NULL,
  quantity INT NOT NULL,
  booking_date VARCHAR(20) DEFAULT NULL,
  status INT NOT NULL DEFAULT 0,
  tracking_status VARCHAR(30) DEFAULT NULL,
  source VARCHAR(30) DEFAULT NULL,
  payment_method VARCHAR(30) DEFAULT NULL,
  payment_status VARCHAR(30) DEFAULT NULL,
  transaction_id VARCHAR(100) DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  KEY idx_bookings_customer (customer_id),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bills (
  id INT NOT NULL PRIMARY KEY,
  booking_id INT DEFAULT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  bill_date VARCHAR(20) DEFAULT NULL,
  paid TINYINT(1) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) DEFAULT NULL,
  payment_status VARCHAR(30) DEFAULT NULL,
  transaction_id VARCHAR(100) DEFAULT NULL,
  paid_date VARCHAR(20) DEFAULT NULL,
  KEY idx_bills_customer (customer_id),
  CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS complaints (
  id INT NOT NULL PRIMARY KEY,
  customer_id INT NOT NULL,
  customer_name VARCHAR(100) DEFAULT NULL,
  subject VARCHAR(100) DEFAULT NULL,
  message TEXT,
  complaint_date VARCHAR(20) DEFAULT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  KEY idx_complaints_customer (customer_id),
  CONSTRAINT fk_complaints_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL PRIMARY KEY,
  customer_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  method VARCHAR(30) DEFAULT NULL,
  transaction_id VARCHAR(100) DEFAULT NULL,
  payment_date VARCHAR(20) DEFAULT NULL,
  type VARCHAR(30) DEFAULT NULL,
  bill_id INT DEFAULT NULL,
  KEY idx_payments_customer (customer_id),
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_auth (
  id INT NOT NULL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  recovery_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customer_auth (
  username VARCHAR(50) NOT NULL PRIMARY KEY,
  customer_id INT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  CONSTRAINT fk_customer_auth_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(50) NOT NULL PRIMARY KEY,
  setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS next_ids (
  entity VARCHAR(30) NOT NULL PRIMARY KEY,
  next_id INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

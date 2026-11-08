-- ==============================================================================
-- Schema Migration: Student Survival Mode
-- Tables: allowance_cycles, allowance_events
-- Database: expense_tracker (MySQL)
-- Note: Spring Boot JPA Hibernate (ddl-auto=update) auto-creates/updates these tables,
--       this script is provided for explicit database migrations and documentation.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS allowance_cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    allowance_amount DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_balance DECIMAL(12, 2) DEFAULT 0.00,
    emergency_reserve DECIMAL(12, 2) DEFAULT 0.00,
    fixed_expenses DECIMAL(12, 2) DEFAULT 0.00,
    notes VARCHAR(500) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_allowance_active (active),
    INDEX idx_allowance_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allowance_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cycle_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allowance_event_cycle FOREIGN KEY (cycle_id)
        REFERENCES allowance_cycles(id) ON DELETE CASCADE,
    INDEX idx_event_cycle_date (cycle_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- MineralTax Swiss - MySQL/MariaDB Schema
-- Compatible Infomaniak MySQL
-- Date: 2026-01-17
-- ============================================

-- Configuration
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Table utilisateurs
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE,
    `first_name` VARCHAR(255),
    `last_name` VARCHAR(255),
    `profile_image_url` VARCHAR(512),
    `password_hash` VARCHAR(255),
    `auth_provider` ENUM('replit', 'local') DEFAULT 'local',
    `password_set` TINYINT(1) DEFAULT 0,
    `password_reset_token` VARCHAR(255),
    `password_reset_expires` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table sessions (pour express-session)
-- ============================================
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
    `sid` VARCHAR(255) NOT NULL,
    `sess` JSON NOT NULL,
    `expire` DATETIME NOT NULL,
    PRIMARY KEY (`sid`),
    INDEX `idx_session_expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table tokens authentification
-- ============================================
DROP TABLE IF EXISTS `auth_tokens`;
CREATE TABLE `auth_tokens` (
    `token` VARCHAR(255) NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`token`),
    INDEX `idx_auth_token_expires` (`expires_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table abonnements
-- ============================================
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `status` ENUM('trial', 'trial_expired', 'active', 'cancelled', 'inactive') NOT NULL DEFAULT 'trial',
    `trial_start_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `trial_ends_at` DATETIME,
    `trial_reminder_sent` TINYINT(1) DEFAULT 0,
    `current_period_start` DATETIME,
    `current_period_end` DATETIME,
    `quarterly_reminder_last_sent` DATETIME,
    `stripe_customer_id` TEXT,
    `stripe_subscription_id` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_subscriptions_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table factures
-- ============================================
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `invoice_number` VARCHAR(255) NOT NULL,
    `amount_paid` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CHF',
    `promo_code_used` VARCHAR(255),
    `stripe_session_id` VARCHAR(255),
    `stripe_invoice_id` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_invoices_number` (`invoice_number`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table profils entreprise
-- ============================================
DROP TABLE IF EXISTS `company_profiles`;
CREATE TABLE `company_profiles` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `ide_number` VARCHAR(50),
    `street` VARCHAR(255),
    `postal_code` VARCHAR(20),
    `city` VARCHAR(100),
    `canton` VARCHAR(50),
    `country` VARCHAR(100) DEFAULT 'Suisse',
    `contact_name` VARCHAR(255),
    `contact_email` VARCHAR(255),
    `contact_phone` VARCHAR(50),
    `bank_name` VARCHAR(255),
    `iban` VARCHAR(50),
    `bic` VARCHAR(20),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_company_profiles_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table machines (flotte)
-- ============================================
DROP TABLE IF EXISTS `machines`;
CREATE TABLE `machines` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('excavator', 'spider_excavator', 'loader', 'crane', 'drill', 'finisher', 'milling_machine', 'roller', 'dumper', 'forklift', 'crusher', 'generator', 'compressor', 'concrete_pump', 'other') NOT NULL,
    `custom_type` VARCHAR(255) DEFAULT NULL,
    `taxas_activity` ENUM('agriculture_with_direct', 'agriculture_without_direct', 'forestry', 'rinsing', 'concession_transport', 'natural_stone', 'snow_groomer', 'professional_fishing', 'stationary_generator', 'stationary_cleaning', 'stationary_combustion', 'construction', 'other_taxas') DEFAULT 'construction',
    `license_plate` VARCHAR(50),
    `plate_color` ENUM('white', 'green', 'yellow', 'blue', 'none') DEFAULT 'none',
    `chassis_number` VARCHAR(100),
    `year` INT,
    `power` VARCHAR(50),
    `is_eligible` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_machines_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table entrées carburant
-- ============================================
DROP TABLE IF EXISTS `fuel_entries`;
CREATE TABLE `fuel_entries` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `machine_id` VARCHAR(255) NOT NULL,
    `invoice_date` DATETIME NOT NULL,
    `invoice_number` VARCHAR(255),
    `volume_liters` DECIMAL(10,2) NOT NULL,
    `engine_hours` DECIMAL(10,2),
    `fuel_type` ENUM('diesel', 'gasoline', 'biodiesel') NOT NULL DEFAULT 'diesel',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_fuel_entries_user` (`user_id`),
    INDEX `idx_fuel_entries_machine` (`machine_id`),
    INDEX `idx_fuel_entries_date` (`invoice_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table rapports
-- ============================================
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
    `id` VARCHAR(255) NOT NULL DEFAULT (UUID()),
    `user_id` VARCHAR(255) NOT NULL,
    `period_start` DATETIME NOT NULL,
    `period_end` DATETIME NOT NULL,
    `total_volume_liters` DECIMAL(10,2) NOT NULL,
    `eligible_volume_liters` DECIMAL(10,2) NOT NULL,
    `reimbursement_amount` DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `taxas_status` ENUM('draft', 'ready_for_taxas', 'submitted_to_taxas', 'approved') DEFAULT 'draft',
    `taxas_submission_ref` VARCHAR(255),
    `taxas_submitted_at` DATETIME,
    `language` VARCHAR(10) NOT NULL DEFAULT 'fr',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_reports_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table conversations (assistant IA)
-- ============================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
    `id` INT AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table messages (assistant IA)
-- ============================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `id` INT AUTO_INCREMENT,
    `conversation_id` INT NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_messages_conversation` (`conversation_id`),
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Notes importantes pour Infomaniak
-- ============================================
-- 
-- 1. Variables d'environnement requises :
--    - DATABASE_URL : mysql://user:pass@host:3306/db
--    - SESSION_SECRET : clé secrète 32+ caractères
--    - STRIPE_SECRET_KEY : sk_live_...
--    - STRIPE_PUBLISHABLE_KEY : pk_live_...
--    - STRIPE_WEBHOOK_SECRET : whsec_...
--    - OPENAI_API_KEY : sk-... (optionnel)
--
-- 2. Authentification :
--    - auth_provider = 'local' pour les nouveaux utilisateurs
--    - password_hash utilise bcrypt avec facteur 12
--
-- 3. Taux de remboursement OFDF :
--    - 0.3405 CHF par litre de carburant éligible
--
-- ============================================

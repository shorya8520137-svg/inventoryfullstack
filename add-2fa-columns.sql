-- ADD 2FA COLUMNS TO USERS TABLE
-- Add columns for Google 2FA functionality

ALTER TABLE users 
ADD COLUMN two_factor_secret VARCHAR(255) NULL,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_backup_codes JSON NULL,
ADD COLUMN two_factor_setup_at TIMESTAMP NULL;

-- Create index for faster lookups
CREATE INDEX idx_users_two_factor_enabled ON users(two_factor_enabled);

-- Show updated table structure
DESCRIBE users;
-- Add promo codes system
-- Created: 2026-01-25
-- Purpose: Allow offering free 1-year access via promotional codes

-- Table: promo_codes
-- Stores promotional codes with usage limits and expiration dates
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  duration_months INTEGER DEFAULT 12,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: promo_code_redemptions
-- Tracks which users have redeemed which promo codes
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id SERIAL PRIMARY KEY,
  promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON promo_code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_code_redemptions(promo_code_id);

-- Insert initial promo codes
INSERT INTO promo_codes (code, duration_months, max_uses, valid_until, is_active) VALUES
  ('FIDU-FOUNDERS-2026', 12, 3, '2027-06-25 23:59:59', true),
  ('MT-AMBASSADEUR', 12, 3, '2027-06-25 23:59:59', true),
  ('MT-EARLY-ACCESS-2026', 12, 3, '2027-06-25 23:59:59', true),
  ('ENTERPRISE-PILOT-2026', 12, 5, '2027-06-25 23:59:59', true)
ON CONFLICT (code) DO NOTHING;

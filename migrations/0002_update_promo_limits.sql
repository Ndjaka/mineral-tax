-- Update promo code usage limits
-- Created: 2026-01-25
-- Purpose: Increase partner access quotas from 3/5 to 15/20 users

-- Update fiduciary and ambassador codes from 3 to 15 users
UPDATE promo_codes 
SET max_uses = 15, updated_at = NOW()
WHERE code IN ('FIDU-FOUNDERS-2026', 'MT-AMBASSADEUR', 'MT-EARLY-ACCESS-2026');

-- Update enterprise pilot code from 5 to 20 users
UPDATE promo_codes 
SET max_uses = 20, updated_at = NOW()
WHERE code = 'ENTERPRISE-PILOT-2026';

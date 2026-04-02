-- Migration: Add is_active column to campaigns table
-- Adds soft delete support for campaigns

-- Add is_active column with default value TRUE
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add index for filtering active campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns (is_active);

-- Add comment
COMMENT ON COLUMN campaigns.is_active IS 'Soft delete flag - FALSE means deleted';

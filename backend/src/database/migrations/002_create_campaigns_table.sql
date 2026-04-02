-- Migration: Create campaigns table
-- Creates the campaigns table with performance metrics and budget tracking

CREATE TYPE campaign_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed'
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  account_manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status campaign_status NOT NULL DEFAULT 'draft',
  budget DECIMAL(15,2) NOT NULL CHECK (budget >= 0),
  spent DECIMAL(15,2) DEFAULT 0 CHECK (spent >= 0),
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  target_audience TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_manager ON campaigns (account_manager_id);
CREATE INDEX idx_campaigns_dates ON campaigns (start_date, end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns (created_at DESC);
CREATE INDEX idx_campaigns_active ON campaigns (status, end_date) WHERE status = 'active';

-- BRIN index for time-series optimization
CREATE INDEX idx_campaigns_created_brin ON campaigns USING BRIN (created_at);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE campaigns IS 'Marketing campaigns with performance metrics and budget tracking';
COMMENT ON COLUMN campaigns.id IS 'Unique campaign identifier';
COMMENT ON COLUMN campaigns.account_manager_id IS 'Owning account manager (foreign key to users)';
COMMENT ON COLUMN campaigns.status IS 'Campaign lifecycle status';
COMMENT ON COLUMN campaigns.budget IS 'Total campaign budget';
COMMENT ON COLUMN campaigns.spent IS 'Amount spent to date';
COMMENT ON COLUMN campaigns.impressions IS 'Total ad impressions';
COMMENT ON COLUMN campaigns.clicks IS 'Total clicks';

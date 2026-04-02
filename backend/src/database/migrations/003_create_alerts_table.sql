-- Migration: Create alerts table
-- Creates the alerts table for threshold-based campaign notifications

CREATE TYPE alert_type AS ENUM (
  'ctr_threshold',
  'budget_threshold',
  'performance_drop'
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  threshold_value DECIMAL(10,4) NOT NULL,
  current_value DECIMAL(10,4) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for performance
CREATE INDEX idx_alerts_user_unread ON alerts (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_campaign ON alerts (campaign_id);
CREATE INDEX idx_alerts_type ON alerts (type);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);

-- Add comments
COMMENT ON TABLE alerts IS 'Threshold-based notifications for campaign performance monitoring';
COMMENT ON COLUMN alerts.id IS 'Unique alert identifier';
COMMENT ON COLUMN alerts.campaign_id IS 'Related campaign';
COMMENT ON COLUMN alerts.user_id IS 'Alert recipient';
COMMENT ON COLUMN alerts.type IS 'Type of threshold alert';
COMMENT ON COLUMN alerts.threshold_value IS 'Trigger threshold value';
COMMENT ON COLUMN alerts.current_value IS 'Actual value at trigger';
COMMENT ON COLUMN alerts.is_read IS 'Read/unread status';
COMMENT ON COLUMN alerts.is_dismissed IS 'User dismissed flag';

-- Migration: Create audit_logs table
-- Creates the audit_logs table for security compliance and activity tracking

CREATE TYPE audit_action AS ENUM (
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'export'
);

CREATE TYPE audit_resource_type AS ENUM (
  'campaign',
  'brief',
  'alert',
  'user'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  resource_type audit_resource_type NOT NULL,
  resource_id UUID NULL,
  ip_address INET NULL,
  user_agent VARCHAR(500) NULL,
  details JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- BRIN index for time-series optimization
CREATE INDEX idx_audit_logs_created_brin ON audit_logs USING BRIN (created_at);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Security audit trail for authentication and data modification events';
COMMENT ON COLUMN audit_logs.id IS 'Unique log entry identifier';
COMMENT ON COLUMN audit_logs.user_id IS 'Acting user (null for system events)';
COMMENT ON COLUMN audit_logs.action IS 'Action performed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of affected resource';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of affected resource';
COMMENT ON COLUMN audit_logs.ip_address IS 'Request IP address';
COMMENT ON COLUMN audit_logs.details IS 'Additional context (diffs, metadata)';

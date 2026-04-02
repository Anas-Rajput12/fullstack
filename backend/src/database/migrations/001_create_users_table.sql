-- Migration: Create users table
-- Creates the users table with authentication and role-based access control

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM (
  'account_manager',
  'creative_team',
  'marketing_analyst',
  'admin'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'account_manager',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_active ON users (is_active);
CREATE INDEX idx_users_created_at ON users (created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON COLUMN users.id IS 'Unique user identifier';
COMMENT ON COLUMN users.email IS 'User email address (unique, validated)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt password hash (cost 12)';
COMMENT ON COLUMN users.role IS 'User role for access control';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag';

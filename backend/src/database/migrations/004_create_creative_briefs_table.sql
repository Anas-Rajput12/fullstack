-- Migration: Create creative_briefs table
-- Creates the creative_briefs table for AI-generated campaign briefs

CREATE TYPE brief_status AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'exported'
);

CREATE TYPE brand_voice_type AS ENUM (
  'professional',
  'casual',
  'urgent',
  'friendly'
);

CREATE TABLE creative_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  objectives TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  key_messages JSONB NOT NULL DEFAULT '[]',
  brand_voice brand_voice_type DEFAULT 'professional',
  ai_generated_copy JSONB NULL,
  social_posts JSONB NULL,
  hashtags JSONB NULL,
  status brief_status DEFAULT 'draft',
  exported_pdf_url VARCHAR(500) NULL,
  word_count INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_briefs_user ON creative_briefs (user_id);
CREATE INDEX idx_briefs_campaign ON creative_briefs (campaign_id);
CREATE INDEX idx_briefs_status ON creative_briefs (status);
CREATE INDEX idx_briefs_created_at ON creative_briefs (created_at DESC);

-- GIN indexes for JSONB full-text search
CREATE INDEX idx_briefs_key_messages_gin ON creative_briefs USING GIN (key_messages);
CREATE INDEX idx_briefs_ai_copy_gin ON creative_briefs USING GIN (ai_generated_copy);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_creative_briefs_updated_at
  BEFORE UPDATE ON creative_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE creative_briefs IS 'AI-generated creative brief documents with campaign copy and assets';
COMMENT ON COLUMN creative_briefs.id IS 'Unique brief identifier';
COMMENT ON COLUMN creative_briefs.campaign_id IS 'Linked campaign (optional)';
COMMENT ON COLUMN creative_briefs.user_id IS 'Brief creator/owner';
COMMENT ON COLUMN creative_briefs.key_messages IS 'Array of key messaging points (JSONB)';
COMMENT ON COLUMN creative_briefs.ai_generated_copy IS 'AI-generated copy variations (JSONB)';
COMMENT ON COLUMN creative_briefs.social_posts IS 'Platform-specific social posts (JSONB)';
COMMENT ON COLUMN creative_briefs.hashtags IS 'Categorized hashtag sets (JSONB)';
COMMENT ON COLUMN creative_briefs.status IS 'Brief lifecycle status';

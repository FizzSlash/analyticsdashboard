-- Add AI Copy Generation Features to Ops System
-- Run this in Supabase SQL Editor

-- 1. Add brand_questionnaire to clients table (JSONB for flexibility)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS brand_questionnaire JSONB;

-- 2. Expand ops_copy_notes with detailed fields
-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS ops_copy_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Voice & Tone
  voice_tone TEXT, -- "Energetic, professional, friendly"
  brand_personality TEXT[], -- ["Innovative", "Premium", "Bold"]
  writing_style TEXT, -- "Short sentences, benefit-focused"
  
  -- Key Phrases
  key_phrases TEXT[], -- Taglines, value props, CTAs
  words_to_avoid TEXT[], -- Competitor names, overused terms
  
  -- Guidelines  
  copy_guidelines TEXT, -- General copy guidance
  legal_compliance TEXT, -- Required disclaimers
  
  -- Examples
  proven_subject_lines TEXT[], -- Best performers
  successful_structures TEXT, -- What works
  
  -- Target Audience
  target_audience TEXT,
  pain_points TEXT[],
  desires_goals TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per client
  UNIQUE(client_id)
);

-- 3. Add generated_copy column to ops_campaigns to store AI output
ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS generated_copy JSONB,
ADD COLUMN IF NOT EXISTS copy_blocks JSONB;

-- 4. Add generated_copy to ops_flows
ALTER TABLE ops_flows 
ADD COLUMN IF NOT EXISTS generated_copy JSONB,
ADD COLUMN IF NOT EXISTS copy_blocks JSONB;

-- Verify
SELECT '✅ AI Copy features added!' as status;
SELECT 'Added: brand_questionnaire, expanded ops_copy_notes, generated_copy columns' as details;


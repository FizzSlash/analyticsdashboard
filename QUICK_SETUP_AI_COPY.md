# ⚡ QUICK SETUP - AI COPY SYSTEM

## 🚨 YOU NEED TO RUN THIS SQL FIRST!

The AI system is deployed but the database doesn't have the new columns yet.

### **Run in Supabase SQL Editor:**

```sql
-- Add AI Copy Generation Features
-- This adds all the enhanced fields to ops_copy_notes

-- 1. Add brand_questionnaire to clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS brand_questionnaire JSONB;

-- 2. Drop and recreate ops_copy_notes with all enhanced fields
DROP TABLE IF EXISTS ops_copy_notes CASCADE;

CREATE TABLE ops_copy_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Voice & Tone
  voice_tone TEXT,
  brand_personality TEXT[],
  writing_style TEXT,
  
  -- Key Phrases
  key_phrases TEXT[],
  words_to_avoid TEXT[],
  
  -- Guidelines  
  copy_guidelines TEXT,
  legal_compliance TEXT,
  
  -- Examples
  proven_subject_lines TEXT[],
  
  -- Target Audience
  target_audience TEXT,
  pain_points TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id)
);

-- 3. Add generated_copy columns to ops_campaigns
ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS generated_copy JSONB,
ADD COLUMN IF NOT EXISTS copy_blocks JSONB;

-- 4. Add generated_copy to ops_flows
ALTER TABLE ops_flows 
ADD COLUMN IF NOT EXISTS generated_copy JSONB,
ADD COLUMN IF NOT EXISTS copy_blocks JSONB;

SELECT '✅ AI Copy features added!' as status;
```

---

## 🎯 AFTER RUNNING SQL:

1. **Generate Copy Notes:**
   - Content Hub → Copy Notes → "Generate with AI"
   - AI fills all fields
   - Save

2. **Generate Email Copy:**
   - Campaign (status = "copy") → "Generate Email Copy with AI"
   - Enter product URLs
   - Generate → Edit blocks → Save

**That's it!** 🚀


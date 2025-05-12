-- Conceptual Supabase Schema for 'resumes' table
-- This file is for documentation purposes. Actual table creation should be done via Supabase dashboard or migrations.

CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_name TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  json_data JSONB, -- For storing structured parsed data from ParsedResumeDataSchema
  ats_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policies for 'resumes' table:
-- Users can only see and manage their own resumes.

-- Policy: Allow users to select their own resumes
CREATE POLICY "Allow select own resumes"
ON resumes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own resumes
CREATE POLICY "Allow insert own resumes"
ON resumes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own resumes
CREATE POLICY "Allow update own resumes"
ON resumes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own resumes
CREATE POLICY "Allow delete own resumes"
ON resumes
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON resumes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Indexes for performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_updated_at ON resumes(updated_at DESC);

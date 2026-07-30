-- Clinica Database Schema for Supabase PostgreSQL

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Patient Clinical Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_input TEXT NOT NULL,
  patient_name TEXT DEFAULT 'Anonymous Patient',
  triage_level TEXT CHECK (triage_level IN ('HIGH', 'MEDIUM', 'LOW')),
  soap_note JSONB NOT NULL,
  follow_up JSONB NOT NULL,
  triage_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  differentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  icd10 JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Index for session history queries
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- Table 2: Custom Patient Clinical Notes
CREATE TABLE IF NOT EXISTS patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  patient_name TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'Progress Note',
  content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patient_notes_created_at ON patient_notes(created_at DESC);

-- Table 3: Usage Logs for Rate Limiting
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  agent_runs INTEGER NOT NULL DEFAULT 0,
  transcriptions INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT unique_usage_date UNIQUE (date)
);

-- Row Level Security (RLS) setup for public demo app
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for demo environment
CREATE POLICY "Allow public read on sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sessions" ON sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on patient_notes" ON patient_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on patient_notes" ON patient_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service/public read on usage_logs" ON usage_logs FOR SELECT USING (true);
CREATE POLICY "Allow service/public write on usage_logs" ON usage_logs FOR ALL USING (true);

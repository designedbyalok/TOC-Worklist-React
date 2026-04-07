-- Fix entity_id column to support both integer and UUID values
-- Run in Supabase SQL Editor

ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;

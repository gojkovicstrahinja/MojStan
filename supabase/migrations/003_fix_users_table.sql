-- Fix users table by removing password_hash field
-- Supabase Auth handles passwords separately, so we don't need this field

ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Update the table to ensure it works properly with Supabase Auth
-- The id field should match the auth.users.id from Supabase Auth
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
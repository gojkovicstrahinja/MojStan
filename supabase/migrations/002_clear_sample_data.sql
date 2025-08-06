-- Clear all existing sample/mockup property data
-- This migration removes all properties and property images to ensure a clean slate

-- Delete all property images first (due to foreign key constraint)
DELETE FROM property_images;

-- Delete all properties
DELETE FROM properties;

-- Delete all messages (if any exist)
DELETE FROM messages;

-- Delete all favorites (if any exist)
DELETE FROM favorites;

-- Reset sequences if needed (PostgreSQL will handle this automatically)
-- The tables are now empty and ready for real user
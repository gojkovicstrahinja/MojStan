-- Check current permissions for all tables
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant permissions to anon and authenticated roles if not already granted
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

GRANT SELECT ON properties TO anon;
GRANT ALL PRIVILEGES ON properties TO authenticated;

GRANT SELECT ON property_images TO anon;
GRANT ALL PRIVILEGES ON property_images TO authenticated;

GRANT SELECT ON messages TO anon;
GRANT ALL PRIVILEGES ON messages TO authenticated;

GRANT SELECT ON favorites TO anon;
GRANT ALL PRIVILEGES ON favorites TO authenticated;
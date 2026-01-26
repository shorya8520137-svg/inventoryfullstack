#!/bin/bash
# QUICK SERVER LOCATION COLUMNS FIX
# Run this script on the server after SSH

echo "🔧 ADDING LOCATION COLUMNS TO AUDIT_LOGS TABLE"
echo "=============================================="
echo "📍 Database: inventory_db"
echo "📋 Table: audit_logs"
echo ""

# Check if MySQL is running
echo "🔍 Checking MySQL status..."
sudo systemctl status mysql --no-pager -l

echo ""
echo "📊 Current audit_logs table structure:"
sudo mysql -e "USE inventory_db; DESCRIBE audit_logs;"

echo ""
echo "🔧 Adding location columns..."

# Add location columns
sudo mysql inventory_db << 'EOF'
-- Add location columns to audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS location_country VARCHAR(100) NULL AFTER ip_address;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS location_city VARCHAR(100) NULL AFTER location_country;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS location_region VARCHAR(100) NULL AFTER location_city;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS location_coordinates VARCHAR(50) NULL AFTER location_region;

-- Show updated structure
SELECT 'Updated audit_logs table structure:' as info;
DESCRIBE audit_logs;

-- Show location columns specifically
SELECT 'Location columns added:' as info;
SHOW COLUMNS FROM audit_logs LIKE 'location%';

-- Show sample data
SELECT 'Sample audit logs with location columns:' as info;
SELECT id, ip_address, location_country, location_city, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 3;

SELECT '✅ SUCCESS: Location columns added successfully!' as result;
EOF

echo ""
echo "🎉 LOCATION COLUMNS SETUP COMPLETE!"
echo "✅ The server can now store location data"
echo "🧪 Test the API from your local machine:"
echo "   node test-location-api-response.js"
echo ""
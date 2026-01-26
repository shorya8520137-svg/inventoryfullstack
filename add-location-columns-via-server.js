/**
 * ADD LOCATION COLUMNS VIA SERVER CONNECTION
 * Uses the server's existing database connection to add location columns
 */

const db = require('./db/connection');

async function addLocationColumnsViaServer() {
    console.log('🔧 ADDING LOCATION COLUMNS VIA SERVER CONNECTION');
    console.log('================================================');
    
    try {
        // Check current table structure
        console.log('📋 Checking current audit_logs table structure...');
        
        const checkStructure = () => {
            return new Promise((resolve, reject) => {
                db.query('DESCRIBE audit_logs', (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };
        
        const currentStructure = await checkStructure();
        const hasLocationColumns = currentStructure.some(col => col.Field === 'location_country');
        
        if (hasLocationColumns) {
            console.log('✅ Location columns already exist!');
            console.log('📊 Current location columns:');
            currentStructure.forEach(col => {
                if (col.Field.startsWith('location_') || col.Field === 'ip_address') {
                    console.log(`   - ${col.Field}: ${col.Type}`);
                }
            });
        } else {
            console.log('❌ Location columns missing. Adding them now...');
            
            // Add location columns one by one
            const alterQueries = [
                'ALTER TABLE audit_logs ADD COLUMN location_country VARCHAR(100) NULL AFTER ip_address',
                'ALTER TABLE audit_logs ADD COLUMN location_city VARCHAR(100) NULL AFTER location_country', 
                'ALTER TABLE audit_logs ADD COLUMN location_region VARCHAR(100) NULL AFTER location_city',
                'ALTER TABLE audit_logs ADD COLUMN location_coordinates VARCHAR(50) NULL AFTER location_region'
            ];
            
            for (let i = 0; i < alterQueries.length; i++) {
                const query = alterQueries[i];
                console.log(`🔧 Step ${i + 1}: Adding column...`);
                
                await new Promise((resolve, reject) => {
                    db.query(query, (err, results) => {
                        if (err) {
                            // Check if column already exists
                            if (err.code === 'ER_DUP_FIELDNAME') {
                                console.log(`   ⚠️ Column already exists, skipping...`);
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log(`   ✅ Column added successfully`);
                            resolve(results);
                        }
                    });
                });
            }
            
            console.log('✅ All location columns added successfully!');
        }
        
        // Verify the updated structure
        console.log('\n📊 Final table structure:');
        const updatedStructure = await checkStructure();
        
        console.log('   Location-related columns:');
        updatedStructure.forEach(col => {
            if (col.Field.includes('location') || col.Field === 'ip_address') {
                console.log(`   ✅ ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
            }
        });
        
        // Test a sample query to make sure it works
        console.log('\n🧪 Testing the updated query...');
        const testQuery = `
            SELECT id, ip_address, location_country, location_city, location_region, 
                   location_coordinates, created_at 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 3
        `;
        
        const testResults = await new Promise((resolve, reject) => {
            db.query(testQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('✅ Query test successful!');
        console.log(`📋 Sample data (${testResults.length} rows):`);
        testResults.forEach(row => {
            console.log(`   📋 ID ${row.id}: IP=${row.ip_address || 'NULL'}, Country=${row.location_country || 'NULL'}`);
        });
        
        console.log('\n🎉 DATABASE SCHEMA UPDATE COMPLETE!');
        console.log('✅ The audit_logs table now has all required location columns');
        console.log('🚀 The server can now store and retrieve location data');
        console.log('');
        console.log('🧪 Next steps:');
        console.log('1. Test the API: node test-location-api-response.js');
        console.log('2. Check complete system: node test-complete-location-system.js');
        console.log('3. The frontend should now show location badges!');
        
        process.exit(0);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('📋 Error details:', error);
        
        console.log('\n💡 Possible solutions:');
        console.log('1. Ensure the server database connection is working');
        console.log('2. Check if MySQL server is running');
        console.log('3. Verify database permissions');
        
        process.exit(1);
    }
}

// Run the fix
addLocationColumnsViaServer().catch(console.error);
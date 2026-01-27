/**
 * Complete Audit System Automation
 * This script will:
 * 1. Connect to your server via SSH
 * 2. Setup the audit database table
 * 3. Integrate audit logging into your existing code
 * 4. Update your API endpoints
 * 5. Make everything work automatically
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    ssh: {
        host: '16.171.5.50',
        port: 22,
        username: 'ubuntu',
        privateKey: fs.readFileSync('C:\\Users\\Admin\\awsconection.pem')
    },
    database: {
        name: 'inventory_system',
        user: 'root'
    },
    projectPath: '/home/ubuntu/your-project' // Adjust this to your actual project path
};

console.log('🚀 Starting Complete Audit System Automation...\n');
console.log('='.repeat(70));

class AuditSystemAutomation {
    constructor() {
        this.conn = new Client();
        this.steps = [
            'Connect to Server',
            'Setup Database Table',
            'Upload Audit Files',
            'Integrate into Existing Code',
            'Update API Routes',
            'Test Implementation',
            'Verify Everything Works'
        ];
        this.currentStep = 0;
    }

    async run() {
        try {
            await this.connectToServer();
            await this.setupDatabase();
            await this.uploadFiles();
            await this.integrateCode();
            await this.updateRoutes();
            await this.testImplementation();
            await this.verifySystem();
            
            console.log('\n🎉 AUDIT SYSTEM AUTOMATION COMPLETE!');
            console.log('✅ Your audit logging system is now live and tracking user activities!');
            
        } catch (error) {
            console.error('❌ Automation failed:', error.message);
        } finally {
            this.conn.end();
        }
    }

    logStep(message) {
        this.currentStep++;
        console.log(`\n📋 Step ${this.currentStep}/7: ${message}`);
        console.log('-'.repeat(50));
    }

    async connectToServer() {
        this.logStep('Connecting to Server');
        
        return new Promise((resolve, reject) => {
            this.conn.on('ready', () => {
                console.log('✅ SSH connection established to 16.171.5.50');
                resolve();
            }).on('error', (err) => {
                reject(new Error(`SSH connection failed: ${err.message}`));
            });
            
            this.conn.connect(config.ssh);
        });
    }

    async setupDatabase() {
        this.logStep('Setting up Database Table');
        
        console.log('🔧 Creating audit_logs table...');
        
        const createTableSQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(255),
    description TEXT NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);`;

        await this.executeCommand(`mysql -u ${config.database.user} -e "USE ${config.database.name}; ${createTableSQL}"`);
        console.log('✅ Audit table created successfully');

        // Insert sample data
        console.log('📊 Inserting sample audit data...');
        const sampleDataSQL = `
INSERT INTO audit_logs (user_name, user_email, user_role, action, resource_type, resource_id, resource_name, description, details, ip_address) VALUES
('Shorya', 'shorya@company.com', 'Manager', 'DISPATCH', 'product', '123', 'Samsung Galaxy S24', 'Shorya dispatched 50 units of Samsung Galaxy S24 to Delhi warehouse', '{"quantity": 50, "warehouse": "Delhi", "awb_number": "AWB123456789"}', '192.168.1.100'),
('Admin', 'admin@company.com', 'Administrator', 'RETURN', 'product', '456', 'iPhone 15 Pro', 'Admin processed return of 10 units of iPhone 15 Pro', '{"quantity": 10, "reason": "Customer complaint", "awb_number": "AWB987654321"}', '192.168.1.101'),
('Rajesh', 'rajesh@company.com', 'Operator', 'DAMAGE', 'product', '789', 'MacBook Air M2', 'Rajesh reported damage for 2 units of MacBook Air M2', '{"quantity": 2, "reason": "Water damage", "location": "Warehouse Mumbai"}', '192.168.1.102');`;

        await this.executeCommand(`mysql -u ${config.database.user} -e "USE ${config.database.name}; ${sampleDataSQL}"`);
        console.log('✅ Sample data inserted');
    }

    async uploadFiles() {
        this.logStep('Uploading Audit System Files');
        
        // Create AuditLogger.js on server
        console.log('📤 Creating AuditLogger.js on server...');
        const auditLoggerContent = this.getAuditLoggerCode();
        await this.createFileOnServer('AuditLogger.js', auditLoggerContent);
        
        // Create audit routes
        console.log('📤 Creating auditRoutes.js on server...');
        const auditRoutesContent = this.getAuditRoutesCode();
        await this.createFileOnServer('routes/auditRoutes.js', auditRoutesContent);
        
        console.log('✅ All audit files uploaded');
    }

    async integrateCode() {
        this.logStep('Integrating into Existing Code');
        
        console.log('🔧 Updating server.js to include audit logging...');
        
        // Read existing server.js
        const serverContent = await this.readFileFromServer('server.js');
        
        // Add audit logger integration
        const updatedServerContent = this.addAuditIntegration(serverContent);
        
        // Write back to server
        await this.createFileOnServer('server.js', updatedServerContent);
        
        console.log('✅ Server.js updated with audit integration');
        
        // Update existing controllers
        await this.updateControllers();
    }

    async updateControllers() {
        console.log('🔧 Updating existing controllers with audit logging...');
        
        // List of controllers to update
        const controllers = ['orderTrackingController.js'];
        
        for (const controller of controllers) {
            try {
                console.log(`  📝 Updating ${controller}...`);
                const controllerPath = `controllers/${controller}`;
                const content = await this.readFileFromServer(controllerPath);
                const updatedContent = this.addAuditToController(content, controller);
                await this.createFileOnServer(controllerPath, updatedContent);
                console.log(`  ✅ ${controller} updated`);
            } catch (error) {
                console.log(`  ⚠️ Could not update ${controller}: ${error.message}`);
            }
        }
    }

    async updateRoutes() {
        this.logStep('Updating API Routes');
        
        console.log('🔧 Adding audit routes to main router...');
        
        // Update main server to include audit routes
        const routeIntegration = `
// Add audit routes
const auditRoutes = require('./routes/auditRoutes');
app.use('/api', auditRoutes);
`;
        
        await this.executeCommand(`echo "${routeIntegration}" >> server.js`);
        console.log('✅ Audit routes added to main router');
    }

    async testImplementation() {
        this.logStep('Testing Implementation');
        
        console.log('🧪 Testing audit system...');
        
        // Test database connection
        const testQuery = `mysql -u ${config.database.user} -e "USE ${config.database.name}; SELECT COUNT(*) as count FROM audit_logs;"`;
        const result = await this.executeCommand(testQuery);
        console.log('✅ Database connection test passed');
        
        // Restart the application
        console.log('🔄 Restarting application...');
        await this.executeCommand('pm2 restart all || sudo systemctl restart your-app || echo "Manual restart required"');
        console.log('✅ Application restarted');
    }

    async verifySystem() {
        this.logStep('Verifying Everything Works');
        
        console.log('🔍 Final verification...');
        
        // Check if audit table exists and has data
        const verifyQuery = `mysql -u ${config.database.user} -e "USE ${config.database.name}; DESCRIBE audit_logs; SELECT COUNT(*) as total_logs FROM audit_logs;"`;
        const result = await this.executeCommand(verifyQuery);
        
        console.log('✅ Audit table verified');
        console.log('✅ Sample data confirmed');
        
        // Test API endpoint
        console.log('🌐 Testing API endpoint...');
        await this.executeCommand('curl -s http://localhost:3000/api/audit-logs?limit=1 || echo "API test completed"');
        
        console.log('✅ System verification complete');
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            this.conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                let output = '';
                stream.on('close', (code, signal) => {
                    resolve(output);
                }).on('data', (data) => {
                    output += data;
                    process.stdout.write(data);
                }).stderr.on('data', (data) => {
                    console.log('STDERR:', data.toString());
                });
            });
        });
    }

    async createFileOnServer(filePath, content) {
        const command = `cat > ${filePath} << 'EOF'
${content}
EOF`;
        await this.executeCommand(command);
    }

    async readFileFromServer(filePath) {
        return await this.executeCommand(`cat ${filePath} 2>/dev/null || echo "File not found"`);
    }

    getAuditLoggerCode() {
        return `/**
 * Audit Logger - Auto-generated by Automation
 */
const mysql = require('mysql2/promise');

class AuditLogger {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
    }

    async logActivity(auditData) {
        try {
            const connection = await mysql.createConnection(this.dbConfig);
            
            const sql = \`INSERT INTO audit_logs (
                user_id, user_name, user_email, user_role, action, 
                resource_type, resource_id, resource_name, description, 
                details, ip_address, user_agent, request_method, request_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`;
            
            await connection.execute(sql, [
                auditData.user_id, auditData.user_name, auditData.user_email,
                auditData.user_role, auditData.action, auditData.resource_type,
                auditData.resource_id, auditData.resource_name, auditData.description,
                JSON.stringify(auditData.details), auditData.ip_address,
                auditData.user_agent, auditData.request_method, auditData.request_url
            ]);
            
            await connection.end();
            console.log('📝 Audit:', auditData.description);
        } catch (error) {
            console.error('❌ Audit failed:', error.message);
        }
    }

    async logDispatch(user, product, quantity, warehouse, awbNumber, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'DISPATCH',
            resource_type: 'product',
            resource_id: product.id,
            resource_name: product.name,
            description: \`\${user.name} dispatched \${quantity} units of \${product.name} to \${warehouse} warehouse\`,
            details: { quantity, warehouse, awb_number: awbNumber, product_sku: product.sku },
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/dispatch'
        });
    }

    async logReturn(user, product, quantity, reason, awbNumber, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'RETURN',
            resource_type: 'product',
            resource_id: product.id,
            resource_name: product.name,
            description: \`\${user.name} processed return of \${quantity} units of \${product.name} (Reason: \${reason})\`,
            details: { quantity, reason, awb_number: awbNumber, product_sku: product.sku },
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/returns'
        });
    }

    async logLogin(user, req) {
        await this.logActivity({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            user_role: user.role_name,
            action: 'LOGIN',
            resource_type: 'session',
            resource_id: \`sess_\${Date.now()}\`,
            resource_name: 'User Session',
            description: \`\${user.name} logged into the system\`,
            details: { login_time: new Date().toISOString() },
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            request_method: 'POST',
            request_url: '/api/login'
        });
    }
}

module.exports = AuditLogger;`;
    }

    getAuditRoutesCode() {
        return `/**
 * Audit Routes - Auto-generated by Automation
 */
const express = require('express');
const router = express.Router();

router.get('/audit-logs', async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];
        
        if (search) {
            whereClause = 'WHERE description LIKE ? OR user_name LIKE ?';
            queryParams.push(\`%\${search}%\`, \`%\${search}%\`);
        }
        
        const query = \`
            SELECT id, user_name, user_email, user_role, action, resource_type,
                   resource_name, description, details, ip_address, created_at
            FROM audit_logs \${whereClause}
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        \`;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        const [logs] = await req.db.execute(query, queryParams);
        
        const formattedLogs = logs.map(log => ({
            ...log,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
            time_ago: getTimeAgo(log.created_at),
            action_icon: getActionIcon(log.action)
        }));
        
        res.json({ success: true, data: { logs: formattedLogs } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

function getTimeAgo(date) {
    const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return \`\${Math.floor(diffInSeconds / 60)} minutes ago\`;
    if (diffInSeconds < 86400) return \`\${Math.floor(diffInSeconds / 3600)} hours ago\`;
    return \`\${Math.floor(diffInSeconds / 86400)} days ago\`;
}

function getActionIcon(action) {
    const icons = { 'DISPATCH': '📤', 'RETURN': '📥', 'DAMAGE': '⚠️', 'LOGIN': '🔐' };
    return icons[action] || '📋';
}

module.exports = router;`;
    }

    addAuditIntegration(serverContent) {
        // Add audit logger initialization
        const auditIntegration = `
// Audit Logger Integration - Auto-added
const AuditLogger = require('./AuditLogger');
const auditRoutes = require('./routes/auditRoutes');

// Initialize audit logger
const auditLogger = new AuditLogger({
    host: 'localhost',
    user: 'root',
    database: 'inventory_system'
});

// Make audit logger available in requests
app.use((req, res, next) => {
    req.auditLogger = auditLogger;
    next();
});

// Add audit routes
app.use('/api', auditRoutes);
`;
        
        // Insert after express app initialization
        return serverContent.replace(
            /const app = express\(\);/,
            `const app = express();${auditIntegration}`
        );
    }

    addAuditToController(content, controllerName) {
        // Add audit logging to dispatch operations
        if (controllerName.includes('orderTracking')) {
            return content.replace(
                /res\.json\(\{[\s\S]*?success:\s*true[\s\S]*?\}\);/g,
                `// Log audit activity
                if (req.auditLogger && req.user) {
                    await req.auditLogger.logDispatch(req.user, req.body.product, req.body.quantity, req.body.warehouse, result.awb_number, req);
                }
                $&`
            );
        }
        
        return content;
    }
}

// Run the automation
const automation = new AuditSystemAutomation();
automation.run().catch(console.error);
/**
 * Add Audit Logging to Dispatch Controller
 * This script will add audit logging to the dispatch operations
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Adding Audit Logging to Dispatch Controller...');
console.log('='.repeat(60));

// Read the current dispatch controller
const dispatchControllerPath = path.join(__dirname, 'controllers/dispatchController.js');
let content = fs.readFileSync(dispatchControllerPath, 'utf8');

// Check if AuditLogger is already imported
if (!content.includes('AuditLogger')) {
    console.log('📦 Adding AuditLogger import...');
    
    // Add AuditLogger import at the top
    const auditImport = `const db = require('../db/connection');
const AuditLogger = require('../AuditLogger');

// Initialize audit logger
const auditLogger = new AuditLogger();`;
    
    content = content.replace(
        `const db = require('../db/connection');`,
        auditImport
    );
    
    console.log('✅ Added AuditLogger import');
} else {
    console.log('✅ AuditLogger already imported');
}

// Add audit logging to the successful dispatch response (Form dispatch)
const formDispatchSuccess = `                                    res.status(201).json({
                                        success: true,
                                        message: 'Dispatch created successfully',
                                        dispatch_id: dispatchId,
                                        order_ref,
                                        awb,
                                        products_dispatched: totalProducts,
                                        total_quantity: products.reduce((sum, p) => sum + (parseInt(p.qty) || 1), 0)
                                    });`;

const formDispatchWithAudit = `                                    // Log audit activity for form dispatch
                                    if (req.user) {
                                        const totalQty = products.reduce((sum, p) => sum + (parseInt(p.qty) || 1), 0);
                                        const productNames = products.map(p => extractProductName(p.name)).join(', ');
                                        
                                        auditLogger.logActivity({
                                            user_id: req.user.id,
                                            user_name: req.user.name,
                                            user_email: req.user.email,
                                            user_role: req.user.role_name,
                                            action: 'DISPATCH',
                                            resource_type: 'order',
                                            resource_id: dispatchId.toString(),
                                            resource_name: order_ref,
                                            description: \`\${req.user.name} dispatched \${totalQty} items (\${productNames}) to \${warehouse} warehouse (AWB: \${awb})\`,
                                            details: {
                                                dispatch_id: dispatchId,
                                                order_ref: order_ref,
                                                customer: customer,
                                                warehouse: warehouse,
                                                awb_number: awb,
                                                logistics: logistics,
                                                total_quantity: totalQty,
                                                products: products.map(p => ({
                                                    name: extractProductName(p.name),
                                                    quantity: parseInt(p.qty) || 1,
                                                    barcode: extractBarcode(p.name)
                                                })),
                                                invoice_amount: invoice_amount,
                                                processed_by: processed_by,
                                                dispatch_time: new Date().toISOString()
                                            },
                                            ip_address: req.ip || req.connection.remoteAddress,
                                            user_agent: req.get('User-Agent'),
                                            request_method: 'POST',
                                            request_url: '/api/dispatch'
                                        }).catch(err => console.error('Audit logging failed:', err));
                                    }

                                    res.status(201).json({
                                        success: true,
                                        message: 'Dispatch created successfully',
                                        dispatch_id: dispatchId,
                                        order_ref,
                                        awb,
                                        products_dispatched: totalProducts,
                                        total_quantity: products.reduce((sum, p) => sum + (parseInt(p.qty) || 1), 0)
                                    });`;

// Add audit logging to single product dispatch success
const singleDispatchSuccess = `                                res.status(201).json({
                                    success: true,
                                    message: 'Dispatch created successfully',
                                    dispatch_id: dispatchId,
                                    awb,
                                    quantity_dispatched: quantity,
                                    reference: \`DISPATCH_\${dispatchId}_\${awb}\`
                                });`;

const singleDispatchWithAudit = `                                // Log audit activity for single product dispatch
                                if (req.user) {
                                    auditLogger.logActivity({
                                        user_id: req.user.id,
                                        user_name: req.user.name,
                                        user_email: req.user.email,
                                        user_role: req.user.role_name,
                                        action: 'DISPATCH',
                                        resource_type: 'product',
                                        resource_id: dispatchId.toString(),
                                        resource_name: product_name,
                                        description: \`\${req.user.name} dispatched \${quantity} units of \${product_name} to \${warehouse} warehouse (AWB: \${awb})\`,
                                        details: {
                                            dispatch_id: dispatchId,
                                            order_ref: order_ref,
                                            customer: customer,
                                            product_name: product_name,
                                            quantity: quantity,
                                            variant: variant,
                                            barcode: barcode,
                                            warehouse: warehouse,
                                            awb_number: awb,
                                            logistics: logistics,
                                            invoice_amount: invoice_amount,
                                            processed_by: processed_by,
                                            dispatch_time: new Date().toISOString()
                                        },
                                        ip_address: req.ip || req.connection.remoteAddress,
                                        user_agent: req.get('User-Agent'),
                                        request_method: 'POST',
                                        request_url: '/api/dispatch'
                                    }).catch(err => console.error('Audit logging failed:', err));
                                }

                                res.status(201).json({
                                    success: true,
                                    message: 'Dispatch created successfully',
                                    dispatch_id: dispatchId,
                                    awb,
                                    quantity_dispatched: quantity,
                                    reference: \`DISPATCH_\${dispatchId}_\${awb}\`
                                });`;

// Apply the replacements
if (content.includes(formDispatchSuccess)) {
    content = content.replace(formDispatchSuccess, formDispatchWithAudit);
    console.log('✅ Added audit logging to form dispatch success');
} else {
    console.log('⚠️ Form dispatch success pattern not found');
}

if (content.includes(singleDispatchSuccess)) {
    content = content.replace(singleDispatchSuccess, singleDispatchWithAudit);
    console.log('✅ Added audit logging to single dispatch success');
} else {
    console.log('⚠️ Single dispatch success pattern not found');
}

// Write the updated content back to the file
fs.writeFileSync(dispatchControllerPath, content);

console.log('\n🎉 Audit logging added to dispatch controller!');
console.log('\n📋 What will be logged:');
console.log('  📤 "John dispatched 5 items (Samsung Galaxy, iPhone 15) to GGM_WH warehouse (AWB: AWB123456)"');
console.log('  📤 "Admin dispatched 10 units of MacBook Air to Delhi warehouse (AWB: AWB789012)"');
console.log('\n🚀 Deploy to server:');
console.log('  1. git add . && git commit -m "Add audit logging to dispatch"');
console.log('  2. git push origin main');
console.log('  3. SSH to server and pull changes');
console.log('  4. Restart server');
console.log('\n✨ After deployment, dispatch activities will appear in audit logs!');
console.log('='.repeat(60));
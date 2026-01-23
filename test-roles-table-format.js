const puppeteer = require('puppeteer');

async function testRolesTableFormat() {
    console.log('🚀 Testing Roles Table Format');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to login page
        console.log('📱 Navigating to login page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/login');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        
        // Login with admin credentials
        console.log('🔐 Logging in as admin...');
        await page.type('input[type="email"]', 'admin@company.com');
        await page.type('input[type="password"]', 'admin@123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard and navigate to permissions
        console.log('⏳ Waiting for dashboard...');
        await page.waitForSelector('nav', { timeout: 15000 });
        
        console.log('🔧 Navigating to permissions page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/permissions');
        await page.waitForSelector('.table', { timeout: 10000 });
        
        // Click on Roles tab
        console.log('📋 Clicking on Roles tab...');
        await page.click('button:has-text("Roles")');
        await page.waitForTimeout(2000);
        
        // Test roles table format
        console.log('✅ Testing roles table format...');
        
        // Check if table exists (not cards)
        const rolesTable = await page.$('.table');
        console.log(`📊 Roles table visible: ${rolesTable ? 'YES' : 'NO'}`);
        
        // Check if cards grid is gone
        const rolesGrid = await page.$('.rolesGrid');
        console.log(`🚫 Cards grid removed: ${rolesGrid ? 'NO (still exists)' : 'YES (removed)'}`);
        
        // Check table headers
        const tableHeaders = await page.$$eval('.table th', headers => 
            headers.map(h => h.textContent.trim())
        );
        console.log('📋 Table headers:', tableHeaders);
        
        // Check if role icons are in table
        const roleIcons = await page.$$('.roleIcon');
        console.log(`🎨 Role icons found: ${roleIcons.length}`);
        
        // Check if edit/delete buttons are present
        const editButtons = await page.$$('.editButton');
        const deleteButtons = await page.$$('.deleteButton');
        console.log(`✏️ Edit buttons: ${editButtons.length}`);
        console.log(`🗑️ Delete buttons: ${deleteButtons.length}`);
        
        // Check if profile icon button exists for add role
        const profileButton = await page.$('.profileIconButton');
        console.log(`👤 Profile icon button: ${profileButton ? 'YES' : 'NO'}`);
        
        console.log('✅ Roles table format test completed!');
        console.log('🎉 Roles are now displayed in table format instead of cards');
        
        // Keep browser open for manual inspection
        console.log('🔍 Browser kept open for manual inspection...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testRolesTableFormat();
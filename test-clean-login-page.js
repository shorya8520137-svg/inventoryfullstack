const puppeteer = require('puppeteer');

async function testCleanLoginPage() {
    console.log('🧪 Testing Clean Login Page...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to login page
        console.log('📍 Navigating to login page...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        
        // Wait for page to load
        await page.waitForSelector('.loginCard', { timeout: 10000 });
        
        // Check page content
        const pageContent = await page.content();
        
        // Security checks - these should NOT be present
        const securityIssues = [];
        
        if (pageContent.includes('admin@company.com') || pageContent.includes('admin@123')) {
            securityIssues.push('❌ SECURITY RISK: Demo credentials found on page');
        }
        
        if (pageContent.includes('SSL') || pageContent.includes('certificate')) {
            securityIssues.push('❌ SECURITY RISK: SSL/Certificate information exposed');
        }
        
        if (pageContent.includes('Demo Credentials') || pageContent.includes('Test Login')) {
            securityIssues.push('❌ SECURITY RISK: Demo/Test sections found');
        }
        
        if (pageContent.includes('16.171.5.50') || pageContent.includes('API endpoint')) {
            securityIssues.push('❌ SECURITY RISK: API endpoint exposed on frontend');
        }
        
        // Check for required elements
        const requiredElements = [];
        
        try {
            await page.waitForSelector('input[type="email"]', { timeout: 2000 });
            requiredElements.push('✅ Email input field present');
        } catch {
            requiredElements.push('❌ Email input field missing');
        }
        
        try {
            await page.waitForSelector('input[type="password"]', { timeout: 2000 });
            requiredElements.push('✅ Password input field present');
        } catch {
            requiredElements.push('❌ Password input field missing');
        }
        
        try {
            await page.waitForSelector('button[type="submit"]', { timeout: 2000 });
            requiredElements.push('✅ Submit button present');
        } catch {
            requiredElements.push('❌ Submit button missing');
        }
        
        // Check company branding
        const companyName = await page.$eval('.companyName', el => el.textContent).catch(() => null);
        if (companyName === 'hunyhuny') {
            requiredElements.push('✅ Company branding correct');
        } else {
            requiredElements.push('❌ Company branding missing or incorrect');
        }
        
        // Print results
        console.log('🔒 SECURITY AUDIT RESULTS:');
        if (securityIssues.length === 0) {
            console.log('✅ NO SECURITY ISSUES FOUND - Login page is clean!');
        } else {
            console.log('🚨 SECURITY ISSUES DETECTED:');
            securityIssues.forEach(issue => console.log(`   ${issue}`));
        }
        
        console.log('\n📋 FUNCTIONALITY CHECK:');
        requiredElements.forEach(element => console.log(`   ${element}`));
        
        // Test form interaction
        console.log('\n🎯 TESTING FORM INTERACTION:');
        
        // Fill in test data (not real credentials)
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'testpassword');
        console.log('   ✅ Form fields accept input');
        
        // Check if form validates
        const submitButton = await page.$('button[type="submit"]');
        const isEnabled = await page.evaluate(btn => !btn.disabled, submitButton);
        console.log(`   ${isEnabled ? '✅' : '❌'} Submit button is ${isEnabled ? 'enabled' : 'disabled'}`);
        
        // Take screenshot for verification
        await page.screenshot({ path: 'login-page-test.png', fullPage: true });
        console.log('   📸 Screenshot saved as login-page-test.png');
        
        console.log('\n🎉 LOGIN PAGE TEST COMPLETED!');
        
        if (securityIssues.length === 0) {
            console.log('✅ READY FOR PRODUCTION - No security issues detected');
        } else {
            console.log('🚨 NOT READY FOR PRODUCTION - Security issues must be fixed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testCleanLoginPage().catch(console.error);
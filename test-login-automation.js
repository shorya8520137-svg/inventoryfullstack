const puppeteer = require('puppeteer');

async function testLoginPage() {
    console.log('🚀 Starting Login Page Automation Test...');
    
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        devtools: true,  // Open DevTools
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen to console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`🔍 CONSOLE [${type.toUpperCase()}]:`, text);
    });
    
    // Listen to page errors
    page.on('pageerror', error => {
        console.log('❌ PAGE ERROR:', error.message);
    });
    
    // Listen to failed requests
    page.on('requestfailed', request => {
        console.log('❌ REQUEST FAILED:', request.url(), request.failure().errorText);
    });
    
    try {
        console.log('📱 Navigating to login page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('⏳ Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 Checking if login form exists...');
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        const submitButton = await page.$('button[type="submit"]');
        
        if (!emailInput) {
            console.log('❌ Email input not found!');
            return;
        }
        if (!passwordInput) {
            console.log('❌ Password input not found!');
            return;
        }
        if (!submitButton) {
            console.log('❌ Submit button not found!');
            return;
        }
        
        console.log('✅ All form elements found');
        
        console.log('📝 Filling in login credentials...');
        await page.type('input[type="email"]', 'admin@company.com');
        await page.type('input[type="password"]', 'Admin@123');
        
        console.log('⏳ Waiting a moment...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🖱️ Clicking submit button...');
        await page.click('button[type="submit"]');
        
        console.log('⏳ Waiting for response...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if we're still on login page or redirected
        const currentUrl = page.url();
        console.log('🌐 Current URL:', currentUrl);
        
        if (currentUrl.includes('/login')) {
            console.log('⚠️ Still on login page - login may have failed');
            
            // Check for error messages
            const errorElement = await page.$('.errorMessage, .error, [class*="error"]');
            if (errorElement) {
                const errorText = await page.evaluate(el => el.textContent, errorElement);
                console.log('❌ Error message found:', errorText);
            } else {
                console.log('🤔 No error message visible - button may not be working');
            }
        } else {
            console.log('✅ Redirected successfully! Login worked!');
        }
        
        console.log('📊 Final page analysis...');
        
        // Check localStorage
        const localStorage = await page.evaluate(() => {
            return {
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user')
            };
        });
        
        console.log('💾 LocalStorage:', localStorage);
        
        // Keep browser open for manual inspection
        console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        await browser.close();
        console.log('✅ Test completed');
    }
}

testLoginPage().catch(console.error);
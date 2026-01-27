/**
 * TEST ACTUAL LOGIN PAGE API CALLS
 * Check what API the login page is actually using
 */

const puppeteer = require('puppeteer');

async function testLoginPageApi() {
    console.log('🔍 TESTING ACTUAL LOGIN PAGE API CALLS');
    console.log('=' .repeat(60));
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false,
            devtools: true,
            args: ['--ignore-certificate-errors', '--ignore-ssl-errors']
        });
        
        const page = await browser.newPage();
        
        // Listen to network requests
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers()
                });
                console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
            }
        });
        
        // Listen to console logs from the page
        page.on('console', msg => {
            if (msg.text().includes('API') || msg.text().includes('DEBUG')) {
                console.log(`🖥️ Browser Console: ${msg.text()}`);
            }
        });
        
        // Go to login page
        console.log('📱 Opening login page...');
        await page.goto('http://localhost:3000/login', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        // Check what API base is being used
        const apiBase = await page.evaluate(() => {
            return process.env.NEXT_PUBLIC_API_BASE || 'NOT_FOUND';
        });
        
        console.log(`📍 Page API Base: ${apiBase}`);
        
        // Fill login form
        console.log('📝 Filling login form...');
        await page.type('input[type="email"]', 'admin@company.com');
        await page.type('input[type="password"]', 'admin@123');
        
        // Submit form and capture the API call
        console.log('🚀 Submitting login form...');
        await page.click('button[type="submit"]');
        
        // Wait for API call
        await page.waitForTimeout(3000);
        
        console.log('\n📊 CAPTURED API REQUESTS:');
        requests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
        });
        
        // Check for errors on page
        const errorMessage = await page.$eval('.errorMessage', el => el.textContent).catch(() => null);
        if (errorMessage) {
            console.log(`❌ Error on page: ${errorMessage}`);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\n💡 Fallback: Manual check required');
        console.log('1. Open: http://localhost:3000/login');
        console.log('2. Open browser DevTools (F12)');
        console.log('3. Go to Network tab');
        console.log('4. Try to login');
        console.log('5. Check what API URL is being called');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Alternative simple test without puppeteer
async function simpleApiCheck() {
    console.log('\n🔧 SIMPLE API CHECK (No Browser)');
    console.log('=' .repeat(40));
    
    // Load environment like the frontend does
    require('dotenv').config({ path: '.env.local' });
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    console.log(`Environment API Base: ${apiBase}`);
    
    if (apiBase && apiBase.includes('16.171.5.50') && apiBase.includes('nip.io')) {
        console.log('✅ Environment is correct');
    } else {
        console.log('❌ Environment is wrong!');
        console.log('Expected: https://16.171.5.50.nip.io');
        console.log(`Got: ${apiBase}`);
    }
    
    // Check if dev server is using correct env
    console.log('\n🔍 Manual Check Instructions:');
    console.log('1. Open: http://localhost:3000/api-debug');
    console.log('2. Check what API base is shown');
    console.log('3. If wrong, restart dev server after clearing cache');
}

// Try puppeteer test first, fallback to simple check
testLoginPageApi().catch(() => {
    console.log('\n⚠️ Puppeteer not available, running simple check...');
    simpleApiCheck();
});and 
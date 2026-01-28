const puppeteer = require('puppeteer');

async function testProfessionalDeleteModal() {
    console.log('🧪 Testing Professional Delete Confirmation Modal...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to login page
        console.log('📱 Navigating to login page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/login', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Login
        console.log('🔐 Logging in...');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'admin@company.com');
        await page.type('input[type="password"]', 'Admin@123');
        
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        
        // Navigate to permissions page
        console.log('👥 Navigating to permissions page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/permissions', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForSelector('[class*="container"]', { timeout: 10000 });
        
        // Test 1: Check if users tab is active
        console.log('🔍 Test 1: Checking users tab...');
        const usersTab = await page.$('button:has-text("Users"), [class*="navItem"]:has-text("Users")');
        if (usersTab) {
            await usersTab.click();
            console.log('✅ Users tab clicked');
        }
        
        await page.waitForTimeout(2000);
        
        // Test 2: Look for delete buttons
        console.log('🔍 Test 2: Looking for delete buttons...');
        const deleteButtons = await page.$$('button[title*="Delete"], button:has-text("Delete"), [class*="deleteBtn"]');
        
        if (deleteButtons.length > 0) {
            console.log(`✅ Found ${deleteButtons.length} delete buttons`);
            
            // Click the first delete button
            console.log('🔍 Test 3: Clicking delete button...');
            await deleteButtons[0].click();
            
            await page.waitForTimeout(1000);
            
            // Test 3: Check if professional modal appears
            console.log('🔍 Test 4: Checking for professional delete modal...');
            const modal = await page.$('[class*="overlay"], [class*="modal"]');
            
            if (modal) {
                console.log('✅ Delete modal appeared');
                
                // Check modal elements
                const title = await page.$('[class*="title"]');
                const message = await page.$('[class*="message"]');
                const cancelBtn = await page.$('button:has-text("Cancel")');
                const confirmBtn = await page.$('button:has-text("Delete")');
                
                console.log(`✅ Modal title: ${title ? 'Found' : 'Not found'}`);
                console.log(`✅ Modal message: ${message ? 'Found' : 'Not found'}`);
                console.log(`✅ Cancel button: ${cancelBtn ? 'Found' : 'Not found'}`);
                console.log(`✅ Delete button: ${confirmBtn ? 'Found' : 'Not found'}`);
                
                // Test cancel functionality
                if (cancelBtn) {
                    console.log('🔍 Test 5: Testing cancel functionality...');
                    await cancelBtn.click();
                    await page.waitForTimeout(500);
                    
                    const modalAfterCancel = await page.$('[class*="overlay"]');
                    if (!modalAfterCancel) {
                        console.log('✅ Modal closed after clicking cancel');
                    } else {
                        console.log('❌ Modal still visible after clicking cancel');
                    }
                }
            } else {
                console.log('❌ Professional delete modal not found');
                
                // Check if old confirm dialog appeared
                const dialogText = await page.evaluate(() => {
                    return window.confirm ? 'Browser confirm available' : 'No browser confirm';
                });
                console.log(`Old dialog check: ${dialogText}`);
            }
        } else {
            console.log('❌ No delete buttons found');
        }
        
        console.log('\n🎉 Professional Delete Modal Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testProfessionalDeleteModal();
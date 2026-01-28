const puppeteer = require('puppeteer');

async function testInventoryFilterFix() {
    console.log('🧪 Testing Inventory Filter Panel Layout Fix...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to login page
        console.log('📱 Navigating to login page...');
        await page.goto('https://stockiq-fullstack-test.vercel.app/login', { 
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
        
        // Navigate to inventory page
        console.log('📦 Navigating to inventory page...');
        await page.goto('https://stockiq-fullstack-test.vercel.app/inventory', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForSelector('[data-testid="inventory-container"], .container', { timeout: 10000 });
        
        // Test 1: Check navbar is visible and positioned correctly
        console.log('🔍 Test 1: Checking navbar positioning...');
        const navbar = await page.$('.topNav, [class*="topNav"]');
        if (navbar) {
            const navbarBox = await navbar.boundingBox();
            console.log(`✅ Navbar found at top: ${navbarBox.y}px, height: ${navbarBox.height}px`);
        } else {
            console.log('❌ Navbar not found');
        }
        
        // Test 2: Click "More Filters" button
        console.log('🔍 Test 2: Testing filter panel opening...');
        const filterButton = await page.$('button:has-text("More"), button[class*="filterBtn"]');
        if (!filterButton) {
            // Try alternative selectors
            const buttons = await page.$$('button');
            for (let button of buttons) {
                const text = await page.evaluate(el => el.textContent, button);
                if (text.includes('More') || text.includes('Filter')) {
                    await button.click();
                    console.log('✅ Found and clicked filter button');
                    break;
                }
            }
        } else {
            await filterButton.click();
            console.log('✅ Clicked More Filters button');
        }
        
        // Wait for filter panel to appear
        await page.waitForTimeout(500);
        
        // Test 3: Check if filter panel is positioned correctly
        console.log('🔍 Test 3: Checking filter panel positioning...');
        const filterPanel = await page.$('[class*="filterSidebar"]');
        if (filterPanel) {
            const panelBox = await filterPanel.boundingBox();
            console.log(`✅ Filter panel found at top: ${panelBox.y}px`);
            
            if (panelBox.y >= 60) {
                console.log('✅ Filter panel positioned below navbar (correct)');
            } else {
                console.log('❌ Filter panel overlapping navbar (incorrect)');
            }
        } else {
            console.log('❌ Filter panel not found');
        }
        
        // Test 4: Check navbar is still visible and not compressed
        console.log('🔍 Test 4: Checking navbar after filter panel opens...');
        if (navbar) {
            const navbarBoxAfter = await navbar.boundingBox();
            console.log(`✅ Navbar still at top: ${navbarBoxAfter.y}px, height: ${navbarBoxAfter.height}px`);
            
            if (navbarBoxAfter.y === 0 && navbarBoxAfter.height >= 50) {
                console.log('✅ Navbar maintains proper position and size');
            } else {
                console.log('❌ Navbar position or size affected by filter panel');
            }
        }
        
        // Test 5: Check overlay positioning
        console.log('🔍 Test 5: Checking overlay positioning...');
        const overlay = await page.$('[class*="filterOverlay"]');
        if (overlay) {
            const overlayBox = await overlay.boundingBox();
            console.log(`✅ Overlay found at top: ${overlayBox.y}px`);
            
            if (overlayBox.y >= 60) {
                console.log('✅ Overlay positioned below navbar (correct)');
            } else {
                console.log('❌ Overlay covering navbar (incorrect)');
            }
        } else {
            console.log('❌ Overlay not found');
        }
        
        // Test 6: Test closing filter panel
        console.log('🔍 Test 6: Testing filter panel closing...');
        if (overlay) {
            await overlay.click();
            await page.waitForTimeout(500);
            
            const filterPanelAfterClose = await page.$('[class*="filterSidebar"]');
            if (!filterPanelAfterClose) {
                console.log('✅ Filter panel closed successfully');
            } else {
                console.log('❌ Filter panel still visible after clicking overlay');
            }
        }
        
        console.log('\n🎉 Inventory Filter Panel Layout Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testInventoryFilterFix();
const puppeteer = require('puppeteer');

async function testProfessionalOrderUI() {
    console.log('🧪 Testing Professional Order UI Improvements...\n');
    
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
        
        // Navigate to order page
        console.log('📦 Navigating to order page...');
        await page.goto('https://stockiqfullstacktest.vercel.app/order', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForSelector('[class*="container"]', { timeout: 10000 });
        
        // Test 1: Check compact search bar
        console.log('🔍 Test 1: Checking compact search bar...');
        const searchBar = await page.$('[class*="smartSearchWrapper"]');
        if (searchBar) {
            const searchBarBox = await searchBar.boundingBox();
            console.log(`✅ Search bar found - width: ${searchBarBox.width}px, height: ${searchBarBox.height}px`);
            
            if (searchBarBox.width <= 450 && searchBarBox.height <= 50) {
                console.log('✅ Search bar is compact and professional');
            } else {
                console.log('❌ Search bar is too large');
            }
        } else {
            console.log('❌ Search bar not found');
        }
        
        // Test 2: Check compact date inputs
        console.log('🔍 Test 2: Checking compact date inputs...');
        const dateInputs = await page.$$('input[type="date"]');
        if (dateInputs.length >= 2) {
            console.log(`✅ Found ${dateInputs.length} date inputs`);
            
            for (let i = 0; i < dateInputs.length; i++) {
                const dateBox = await dateInputs[i].boundingBox();
                console.log(`✅ Date input ${i + 1} - width: ${dateBox.width}px, height: ${dateBox.height}px`);
                
                if (dateBox.width <= 150 && dateBox.height <= 45) {
                    console.log(`✅ Date input ${i + 1} is compact`);
                } else {
                    console.log(`❌ Date input ${i + 1} is too large`);
                }
            }
        } else {
            console.log('❌ Date inputs not found');
        }
        
        // Test 3: Check bulk actions bar
        console.log('🔍 Test 3: Checking bulk actions bar...');
        const bulkActions = await page.$('[class*="bulkActions"]');
        if (bulkActions) {
            console.log('✅ Bulk actions bar found');
            
            // Check select all checkbox
            const selectAllCheckbox = await page.$('[class*="selectAllCheckbox"]');
            if (selectAllCheckbox) {
                console.log('✅ Select all checkbox found');
            } else {
                console.log('❌ Select all checkbox not found');
            }
        } else {
            console.log('❌ Bulk actions bar not found');
        }
        
        // Test 4: Check standard checkboxes in table rows
        console.log('🔍 Test 4: Checking row checkboxes...');
        const rowCheckboxes = await page.$$('[class*="rowCheckbox"]');
        if (rowCheckboxes.length > 0) {
            console.log(`✅ Found ${rowCheckboxes.length} row checkboxes`);
            
            // Test checkbox functionality
            if (rowCheckboxes.length > 0) {
                await rowCheckboxes[0].click();
                console.log('✅ Clicked first checkbox');
                
                await page.waitForTimeout(500);
                
                // Check if bulk delete button appears
                const bulkDeleteBtn = await page.$('[class*="bulkDeleteBtn"]');
                if (bulkDeleteBtn) {
                    console.log('✅ Bulk delete button appeared after selecting checkbox');
                } else {
                    console.log('❌ Bulk delete button not found after selecting checkbox');
                }
            }
        } else {
            console.log('❌ Row checkboxes not found');
        }
        
        // Test 5: Check overall UI compactness
        console.log('🔍 Test 5: Checking overall UI compactness...');
        const filterBar = await page.$('[class*="filterBar"]');
        if (filterBar) {
            const filterBarBox = await filterBar.boundingBox();
            console.log(`✅ Filter bar height: ${filterBarBox.height}px`);
            
            if (filterBarBox.height <= 80) {
                console.log('✅ Filter bar is compact');
            } else {
                console.log('❌ Filter bar is too tall');
            }
        }
        
        console.log('\n🎉 Professional Order UI Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testProfessionalOrderUI();
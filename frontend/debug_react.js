const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer JS debugger...");
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => {
            console.log(`[CLIENT-CONSOLE] ${msg.type().toUpperCase()}:`, msg.text());
        });
        
        page.on('pageerror', err => {
            console.error(`[REACT-FATAL-CRASH]:`, err.message);
        });

        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        const content = await page.content();
        console.log(`Page fully loaded. DOM Size: ${content.length}`);
        
        await browser.close();
    } catch (e) {
        console.error("Puppeteer Script Failed:", e);
    }
})();

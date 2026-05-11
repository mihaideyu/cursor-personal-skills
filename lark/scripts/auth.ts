import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

/** 与 package.json 同级的 lark skill 根目录 */
const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
    console.log('Launching browser for Yuque authentication...');

    // Launch non-headless so user can log in interactively
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to https://yuque.antfin.com/dashboard ...');
        await page.goto('https://yuque.antfin.com/dashboard');

        console.log('Please log in using the browser window...');
        console.log('Monitoring cookies (will update every 2 seconds)...');
        console.log('NOTE: Process will exit if login is not detected within 2 minutes.');

        const startTime = Date.now();
        const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
        let hasLoggedInOnce = false;

        // Infinite loop to monitor and update cookies
        while (true) {
            // Get cookies for all relevant domains
            const cookies = await context.cookies([
                'https://yuque.antfin.com',
                'https://alipay.com',
                'https://antfin.com'
            ]);

            // Convert to simple string format: "key=value; key2=value2"
            const cookieStr = cookies
                .map(c => `${c.name}=${c.value}`)
                .join('; ');

            // Check for key session cookies indicating successful login
            // STRICTER CHECK:
            // 1. Must have CSRF token (ctoken or yuque_ctoken)
            // 2. Must have USER IDENTIFIER (userId) - this usually comes from alipay.com/antfin.com after login
            //    OR _yuque_session (for public Yuque)

            const hasCsrf = cookieStr.includes('ctoken') || cookieStr.includes('yuque_ctoken');

            // userId is a strong indicator of being logged in on Ant/Alipay stacks
            const hasUser = cookieStr.includes('userId') || cookieStr.includes('bucUserId');

            // _yuque_session is for standard Yuque
            const hasYuqueSession = cookieStr.includes('_yuque_session');

            const isLoggedIn = hasCsrf && (hasUser || hasYuqueSession);

            if (isLoggedIn) {
                hasLoggedInOnce = true;

                const targetDir = path.join(skillRoot, '.claude');
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const targetFile = path.join(targetDir, 'yuque_cookies.txt');

                // Add timestamp for easier verification
                const content = `# Updated at: ${new Date().toISOString()}\n${cookieStr}`;
                fs.writeFileSync(targetFile, content);

                // Only log periodically to avoid spamming
                if (new Date().getSeconds() % 10 === 0) {
                     console.log(`[${new Date().toLocaleTimeString()}] Cookies updated. Browser window keeping open.`);
                }
            } else {
                 // Not logged in yet, or lost session
                 if (!hasLoggedInOnce) {
                     const elapsed = Date.now() - startTime;
                     if (elapsed > TIMEOUT_MS) {
                         console.error('\nTimeout: Login not detected within 2 minutes. Exiting.');
                         await browser.close();
                         process.exit(1);
                     }

                     // Log waiting status periodically
                     if (Math.floor(elapsed / 1000) % 5 === 0) {
                         console.log(`[${new Date().toLocaleTimeString()}] Waiting for valid session... (${Math.round((TIMEOUT_MS - elapsed)/1000)}s remaining)`);
                     }
                 } else {
                     // Was logged in, but now cookies are missing?
                     // Maybe user logged out or cookies expired.
                     // We just wait, maybe they are logging in again.
                     if (new Date().getSeconds() % 10 === 0) {
                        console.log(`[${new Date().toLocaleTimeString()}] Session lost? Waiting for cookies...`);
                     }
                 }
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (error) {
        console.error('An error occurred during authentication:', error);
        // If critical error, we might need to close, but keeping open for debugging if possible
        try { await browser.close(); } catch(e) {}
        process.exit(1);
    }
}

main();

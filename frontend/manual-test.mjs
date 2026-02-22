import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:5173/taipower-tou-web/');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/frontend-test-screenshot.png' });
    console.log('Screenshot saved to /tmp/frontend-test-screenshot.png');

    // Check for key elements
    const title = await page.title();
    console.log('Page title:', title);

    const h1Text = await page.locator('h1').textContent();
    console.log('H1 text:', h1Text);

    // Test manual input flow
    console.log('\nTesting manual input flow...');

    // Click on manual input button
    const manualButton = page.locator('button:has-text("手動輸入")');
    if (await manualButton.isVisible()) {
      await manualButton.click();
      console.log('Clicked manual input button');
      await page.waitForTimeout(1000);

      // Fill in usage
      const input = page.locator('input[type="number"]');
      if (await input.isVisible()) {
        await input.fill('350');
        console.log('Filled in usage: 350 kWh');
        await page.waitForTimeout(500);

        // Take screenshot of form
        await page.screenshot({ path: '/tmp/frontend-test-form.png' });
        console.log('Form screenshot saved to /tmp/frontend-test-form.png');

        // Try to click confirm
        const confirmButton = page.locator('button:has-text("確認並開始比較")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          console.log('Clicked confirm button');
          await page.waitForTimeout(2000);

          // Take screenshot of confirmation page
          await page.screenshot({ path: '/tmp/frontend-test-confirm.png' });
          console.log('Confirm page screenshot saved to /tmp/frontend-test-confirm.png');

          // Check if habit selector is visible
          const habitTitle = page.locator('h3:has-text("選擇最像你家的用電習慣")');
          if (await habitTitle.isVisible({ timeout: 3000 })) {
            console.log('✓ Habit selector is visible');

            // Click first habit card
            const habitCard = page.locator('.cursor-pointer.rounded-lg').first();
            if (await habitCard.isVisible()) {
              await habitCard.click();
              console.log('Clicked first habit card');
              await page.waitForTimeout(1000);

              // Take screenshot after selection
              await page.screenshot({ path: '/tmp/frontend-test-habit.png' });
              console.log('Habit selection screenshot saved');

              // Click confirm to calculate
              const useResultButton = page.locator('button:has-text("使用此估算結果繼續")');
              if (await useResultButton.isVisible()) {
                await useResultButton.click();
                console.log('Clicked use result button');
                await page.waitForTimeout(3000);

                // Take screenshot of results
                await page.screenshot({ path: '/tmp/frontend-test-result.png' });
                console.log('Result page screenshot saved to /tmp/frontend-test-result.png');

                // Check if results are shown
                const resultTitle = page.locator('h2:has-text("方案比較結果")');
                if (await resultTitle.isVisible({ timeout: 5000 })) {
                  console.log('✓ Results page loaded successfully!');
                } else {
                  console.log('✗ Results page did not load properly');
                }
              }
            }
          }
        }
      }
    }

    console.log('\nTest completed. Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();

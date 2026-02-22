import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slower for better visibility
  });
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log(`Browser Console [${msg.type()}]:`, msg.text());
  });
  page.on('pageerror', error => {
    console.error('Browser Page Error:', error);
  });

  try {
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:5173/taipower-tou-web/');

    // Wait for React to load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/debug-01-home.png' });
    console.log('✓ Home page screenshot saved');

    // Click on manual input button
    const manualButton = page.locator('button:has-text("手動輸入")');
    await manualButton.click();
    console.log('✓ Clicked manual input button');
    await page.waitForTimeout(1000);

    // Fill in usage
    const input = page.locator('input[type="number"]');
    await input.fill('350');
    console.log('✓ Filled in usage: 350 kWh');
    await page.waitForTimeout(500);

    // Take screenshot of form
    await page.screenshot({ path: '/tmp/debug-02-form.png' });

    // Click confirm button
    const confirmButton = page.locator('button:has-text("確認並開始比較")');
    await confirmButton.click();
    console.log('✓ Clicked confirm button');
    await page.waitForTimeout(2000);

    // Check if habit selector appears
    const habitTitle = page.locator('h3:has-text("選擇最像你家的用電習慣")');
    const habitVisible = await habitTitle.isVisible({ timeout: 5000 });
    console.log(`Habit selector visible: ${habitVisible}`);

    if (!habitVisible) {
      console.error('ERROR: Habit selector did not appear!');
      await page.screenshot({ path: '/tmp/debug-error-no-habit.png' });
    } else {
      await page.screenshot({ path: '/tmp/debug-03-habit.png' });
      console.log('✓ Habit selector screenshot saved');

      // Get the current URL
      const url = page.url();
      console.log('Current URL:', url);

      // Get the page content
      const bodyText = await page.locator('body').textContent();
      console.log('Page body preview:', bodyText?.substring(0, 500));

      // Click first habit card
      const habitCard = page.locator('.cursor-pointer.rounded-lg').first();
      await habitCard.click();
      console.log('✓ Clicked first habit card');
      await page.waitForTimeout(1000);

      // Take screenshot after selection
      await page.screenshot({ path: '/tmp/debug-04-habit-selected.png' });

      // Look for the confirm button
      const useResultButton = page.locator('button:has-text("使用此估算結果繼續")');
      const buttonVisible = await useResultButton.isVisible({ timeout: 2000 });
      console.log(`Confirm button visible: ${buttonVisible}`);

      if (buttonVisible) {
        await useResultButton.click();
        console.log('✓ Clicked use result button');
        await page.waitForTimeout(5000);

        // Take screenshot of results
        await page.screenshot({ path: '/tmp/debug-05-result.png' });

        // Check for results
        const resultTitle = page.locator('h2:has-text("方案比較結果")');
        const resultVisible = await resultTitle.isVisible({ timeout: 3000 });
        console.log(`Results page visible: ${resultVisible}`);

        if (!resultVisible) {
          console.error('ERROR: Results page did not load!');

          // Check what's actually on the page
          const currentStage = await page.locator('h2, h3').allTextContents();
          console.log('Current page headings:', currentStage);

          // Check if we're still on habit selector
          const stillOnHabit = await habitTitle.isVisible({ timeout: 1000 });
          console.log(`Still on habit selector: ${stillOnHabit}`);

          // Check for any error messages
          const errorElements = await page.locator('text=/錯誤|error|失敗/').all();
          console.log(`Error elements found: ${errorElements.length}`);
        }
      }
    }

    console.log('\nTest completed. Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: '/tmp/debug-error.png' });
  } finally {
    await browser.close();
  }
})();

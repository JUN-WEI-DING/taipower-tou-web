#!/usr/bin/env node
/**
 * Comprehensive test covering multiple scenarios
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';

async function testScenario(page, scenario) {
  console.log('');
  console.log(`📋 測試場景: ${scenario.name}`);
  console.log('  設定:');
  console.log(`    契約容量: ${scenario.capacity}A`);
  console.log(`    電壓: ${scenario.voltage}V`);
  console.log(`    用電度數: ${scenario.consumption} 度`);
  console.log(`    月份: ${scenario.month} 月`);

  // Reset - click "比較其他電費單" button to go back to upload stage
  const resetBtn = page.locator('button').filter({ hasText: '比較其他電費單' });
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(1000);
  }
  // Then click manual input button
  const manualBtn = page.locator('button').filter({ hasText: '手動輸入' });
  if (await manualBtn.isVisible()) {
    await manualBtn.click();
  }
  await page.waitForTimeout(500);

  // Fill form
  const consumptionInput = page.locator('input[placeholder*="例如"]');
  await consumptionInput.fill(String(scenario.consumption));
  await page.waitForTimeout(200);

  // Submit
  await page.locator('button').filter({ hasText: '開始比較' }).click();
  await page.waitForTimeout(2000);

  // Select habit card - use different habits based on scenario
  const cards = await page.locator('.cursor-pointer').all();
  const habitIndex = scenario.habitIndex || 0;
  if (cards.length > habitIndex) {
    await cards[habitIndex].click();
    await page.waitForTimeout(500);
  }

  // Confirm
  await page.locator('button').filter({ hasText: '使用此估算結果繼續' }).click();
  await page.waitForTimeout(3000);

  // Check results
  const hasResults = await page.locator('h2:has-text("方案比較結果")').isVisible();
  const allText = await page.locator('body').textContent();

  // Extract plan info
  const nonTOUPrice = extractPrice(allText, '非時間電價');
  const simple2Price = extractPrice(allText, '二段式');
  const simple3Price = extractPrice(allText, '三段式');

  console.log('  結果:');
  console.log(`    非時間電價: $${nonTOUPrice}`);
  console.log(`    二段式時間電價: $${simple2Price}`);
  console.log(`    三段式時間電價: $${simple3Price}`);

  return {
    success: hasResults,
    nonTOUPrice,
    simple2Price,
    simple3Price
  };
}

function extractPrice(text, label) {
  const regex = new RegExp(label + '[^$]*\\$(\\d+)', 'i');
  const match = text.match(regex);
  return match ? match[1] : 'N/A';
}

async function runTests() {
  console.log('🧪 綜合測試 - 多種場景');
  console.log('=====================================');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(URL);
    await page.waitForTimeout(1000);

    const scenarios = [
      { name: '低用電量 (100度)', capacity: 10, voltage: 110, consumption: 100, month: 1, habitIndex: 0 },
      { name: '中用電量 (350度)', capacity: 20, voltage: 110, consumption: 350, month: 2, habitIndex: 0 },
      { name: '高用電量 (800度)', capacity: 40, voltage: 220, consumption: 800, month: 7, habitIndex: 0 },
      { name: '夜貓子習慣', capacity: 20, voltage: 110, consumption: 350, month: 8, habitIndex: 2 },
    ];

    const results = [];
    for (const scenario of scenarios) {
      const result = await testScenario(page, scenario);
      results.push({ scenario, result });
    }

    console.log('');
    console.log('=====================================');
    console.log('📊 測試結果總結:');
    console.log('=====================================');

    let passCount = 0;
    results.forEach(({ scenario, result }) => {
      const passed = result.success && result.nonTOUPrice !== 'N/A';
      if (passed) passCount++;
      console.log(`${passed ? '✅' : '❌'} ${scenario.name}`);
      if (!passed) {
        console.log(`   失敗原因: ${result.success ? '價格提取失敗' : '結果未顯示'}`);
      }
    });

    console.log('');
    console.log(`通過: ${passCount}/${scenarios.length}`);

    if (passCount === scenarios.length) {
      console.log('🎉 所有測試通過！');
    } else {
      console.log('⚠️  部分測試失敗');
    }

    await page.screenshot({ path: '/Users/macmini/Desktop/fe-screenshots/comprehensive-final.png' });

  } catch (error) {
    console.error('測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);

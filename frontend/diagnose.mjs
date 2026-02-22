#!/usr/bin/env node
/**
 * Diagnostic test - shows all plan prices displayed in UI
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/?t=' + Date.now();

async function diagnose() {
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║              前端診斷測試 - 顯示所有方案價格            ║');
  console.log('╚═════════════════════════════════════════════════════════╝');
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    // Bypass server-side caching
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  try {
    // 1. 導入頁面
    console.log('[1/4] 導入頁面...');
    await page.goto(URL, { waitUntil: 'networkidle' });
    console.log('  ✅ 頁面載入成功');
    console.log('');

    // 2. 手動輸入
    console.log('[2/4] 填寫表單...');
    await page.click('button:has-text("手動輸入")');
    await page.waitForTimeout(500);

    const selects = await page.$$('select');
    await selects[0].selectOption('2025');
    await selects[1].selectOption('7');
    await selects[2].selectOption('10');
    await selects[3].selectOption('110');
    await page.fill('input[type="number"]', '350');
    await page.waitForTimeout(500);

    console.log('  設定: 2025/7月, 10A, 110V, 350度');
    console.log('  ✅ 表單填寫完成');
    console.log('');

    // 3. 提交
    console.log('[3/4] 選擇用電習慣並計算...');
    await page.click('button:has-text("開始比較")');
    await page.waitForTimeout(2000);

    // 選擇用電習慣
    const cards = await page.locator('.cursor-pointer').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(500);
    }

    // 點擊確認按鈕
    const confirmButton = await page.$('button:has-text("使用此估算結果繼續")');
    if (confirmButton) {
      await confirmButton.click();
    } else {
      await page.click('button:has-text("開始計算")');
    }
    await page.waitForTimeout(3000);
    console.log('  ✅ 計算完成');
    console.log('');

    // 4. 擷取所有方案資訊
    console.log('[4/4] 擷取方案資訊...');
    const planData = await page.evaluate(() => {
      const plans = [];
      const planCards = document.querySelectorAll('.bg-white.rounded-lg');

      planCards.forEach(card => {
        const nameEl = card.querySelector('h4');
        const priceEl = card.querySelector('.text-3xl');
        const rankEl = card.querySelector('.text-yellow-500, .text-gray-400, .text-orange-600');

        if (nameEl && priceEl) {
          plans.push({
            name: nameEl.textContent.trim(),
            price: priceEl.textContent.trim(),
            rank: rankEl ? '有排名' : '無排名'
          });
        }
      });

      return plans;
    });

    console.log(`  找到 ${planData.length} 個方案:`);
    console.log('');
    planData.forEach((plan, i) => {
      console.log(`  ${i + 1}. ${plan.name}`);
      console.log(`     價格: ${plan.price}`);
      console.log(`     排名: ${plan.rank}`);
      console.log('');
    });

    // 截圖
    await page.screenshot({ path: '/Users/macmini/Desktop/fe-diagnose.png', fullPage: true });
    console.log('  截圖: /Users/macmini/Desktop/fe-diagnose.png');

    // 檢查是否有問題
    const expectedPlans = [
      '表燈(住商)非時間電價-住宅用',
      '簡易型時間電價-二段式',
      '簡易型時間電價-三段式',
      '標準型時間電價-二段式',
      '標準型時間電價-三段式',
      '低壓電力-非時間電價',
      '低壓電力-二段式時間電價',
      '低壓電力-三段式時間電價'
    ];

    const displayedNames = planData.map(p => p.name);
    const missingPlans = expectedPlans.filter(name => !displayedNames.includes(name));

    console.log('╔═════════════════════════════════════════════════════════╗');
    console.log('║                        診斷結果                        ║');
    console.log('╚═════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`預期方案數量: ${expectedPlans.length}`);
    console.log(`實際顯示數量: ${planData.length}`);
    console.log('');

    if (missingPlans.length > 0) {
      console.log('❌ 缺少的方案:');
      missingPlans.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✅ 所有預期方案都已顯示');
    }

    if (planData.length < expectedPlans.length) {
      console.log('');
      console.log('⚠️  部分方案未顯示，可能需要檢查過濾邏輯');
    }

  } catch (error) {
    console.error('❌ 診斷過程發生錯誤:', error.message);
  } finally {
    await browser.close();
  }
}

diagnose().catch(console.error);

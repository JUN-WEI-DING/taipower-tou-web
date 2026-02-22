#!/usr/bin/env node
/**
 * 綜合前端測試腳本
 * 測試完整的手動輸入流程
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';

async function test() {
  console.log('🚀 開始測試前端功能...');
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // 1. 訪問首頁
    console.log('📍 步驟 1: 訪問首頁...');
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 檢查頁面標題
    const title = await page.title();
    console.log('  頁面標題:', title);

    // 檢查主要元素
    const header = await page.locator('h1').first().textContent();
    console.log('  主標題:', header);

    // 2. 切換到手動輸入模式
    console.log('');
    console.log('📍 步驟 2: 切換到手動輸入模式...');
    const manualButton = page.locator('button:has-text("手動輸入")');
    await manualButton.click();
    await page.waitForTimeout(500);

    // 3. 填寫表單
    console.log('');
    console.log('📍 步驟 3: 填寫表單資料...');

    // 設定契約容量
    await page.selectOption('select:has-text("10 A")', '20');

    // 設定電壓類型
    await page.selectOption('select:has-text("110V")', '110');

    // 設定用電度數
    await page.fill('input[placeholder*="例如"]', '350');

    console.log('  契約容量: 20A');
    console.log('  電壓: 110V');
    console.log('  用電度數: 350 度');

    // 4. 提交表單
    console.log('');
    console.log('📍 步驟 4: 提交表單...');
    const submitButton = page.locator('button:has-text("開始比較")');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // 5. 檢查確認階段
    console.log('');
    console.log('📍 步驟 5: 檢查確認階段...');
    const stageText = await page.locator('h2').first().textContent();
    console.log('  當前階段:', stageText);

    // 截圖
    await page.screenshot({ path: '/Users/macmini/Desktop/fe-screenshots/step5-confirm.png' });
    console.log('  截圖已儲存');

    // 6. 選擇用電習慣 (如果需要)
    console.log('');
    console.log('📍 步驟 6: 選擇用電習慣...');

    // 檢查是否顯示用電習慣選擇器
    const habitSelectorVisible = await page.locator('text=需要選擇用電習慣').isVisible();
    if (habitSelectorVisible) {
      console.log('  顯示用電習慣選擇器');

      // 點擊第一個用電習慣卡片 (一般上班族家庭)
      const habitCard = page.locator('.cursor-pointer.rounded-lg').first();
      await habitCard.click();
      await page.waitForTimeout(500);

      // 點擊確認按鈕
      const confirmButton = page.locator('button:has-text("使用此估算結果繼續")');
      await confirmButton.click();
      await page.waitForTimeout(2000);

      console.log('  已選擇用電習慣並確認');
    } else {
      // 如果不需要選擇習慣，直接點擊開始計算
      const calculateButton = page.locator('button:has-text("開始計算")');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // 7. 檢查結果階段
    console.log('');
    console.log('📍 步驟 7: 檢查結果階段...');
    const resultsText = await page.locator('h2').first().textContent();
    console.log('  當前階段:', resultsText);

    // 截圖
    await page.screenshot({ path: '/Users/macmini/Desktop/fe-screenshots/step7-results.png' });
    console.log('  截圖已儲存');

    // 8. 檢查方案卡片
    console.log('');
    console.log('📍 步驟 8: 檢查方案卡片...');
    // PlanCard uses border-2 class, not just border
    const planCards = await page.locator('.bg-white.rounded-lg, .border-2').all();
    console.log(`  找到 ${planCards.length} 個卡片元素`);

    // Look for plan prices using text content
    const priceElements = await page.locator('text=/$/').all();
    console.log(`  找到 ${priceElements.length} 個價格元素`);

    // 獲取每個方案的名稱和價格
    for (let i = 0; i < Math.min(planCards.length, 10); i++) {
      try {
        const card = planCards[i];
        const textContent = await card.textContent();
        if (textContent && textContent.length > 10 && textContent.length < 200) {
          console.log(`  元素 ${i + 1}:`, textContent.substring(0, 50));
        }
      } catch (e) {
        // Skip elements that can't be accessed
      }
    }

    // 9. 檢查圖表
    console.log('');
    console.log('📍 步驟 9: 檢查圖表...');
    const chartContainer = await page.locator('.recharts-wrapper, .bg-white.rounded-lg.shadow').first();
    if (await chartContainer.isVisible()) {
      console.log('  圖表顯示正常');
    }

    // 10. 測試重新計算
    console.log('');
    console.log('📍 步驟 10: 測試重新計算...');
    const resetButton = page.locator('button:has-text("比較其他電費單")');
    await resetButton.click();
    await page.waitForTimeout(1000);

    // 檢查是否回到上傳階段
    const backToUpload = await page.locator('h2:has-text("上傳你的電費單")').isVisible();
    console.log('  是否回到上傳階段:', backToUpload);

    // 截圖
    await page.screenshot({ path: '/Users/macmini/Desktop/fe-screenshots/step10-reset.png' });
    console.log('  截圖已儲存');

    console.log('');
    console.log('✅ 測試完成！');
    console.log('');
    console.log('📸 截圖已儲存到: /Users/macmini/Desktop/fe-screenshots/');

  } catch (error) {
    console.error('');
    console.error('❌ 測試失敗:', error.message);
    await page.screenshot({ path: '/Users/macmini/Desktop/fe-screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

test().catch(err => {
  console.error('❌ 程式錯誤:', err);
  process.exit(1);
});

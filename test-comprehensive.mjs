#!/usr/bin/env node
/**
 * 綜合功能測試 - 檢查所有功能是否正常運作
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';

async function runComprehensiveTest() {
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║           綜合功能測試 - 檢查所有功能                    ║');
  console.log('╚═════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  try {
    // 測試 1: 頁面載入
    console.log('📋 測試 1: 頁面載入');
    await page.goto(URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   ✓ 頁面標題: ${title}`);

    // 測試 2: 手動輸入模式
    console.log('\n📋 測試 2: 手動輸入模式');
    await page.click('button:has-text("⌨️ 手動輸入")');
    await page.waitForSelector('input[placeholder="例如：350"]', { timeout: 5000 });
    console.log('   ✓ 手動輸入表單顯示');

    // 輸入測試資料
    await page.fill('input[placeholder="例如：350"]', '350');

    // 先取得所有 select，找出契約容量的那個
    const selects = await page.$$('select');
    // 契約容量是第一個 select（年份）之後的第二個
    await selects[1].selectOption('20'); // 選擇契約容量 20A
    console.log('   ✓ 輸入測試資料: 350度, 20A');

    // 測試 3: 點擊開始比較
    console.log('\n📋 測試 3: 點擊開始比較');
    await page.click('button:has-text("開始比較")');

    // 等待結果頁面
    await page.waitForSelector('text=方案比較結果', { timeout: 15000 });
    console.log('   ✓ 進入結果頁面');

    // 測試 4: 檢查結果顯示
    console.log('\n📋 測試 4: 檢查結果顯示');
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 5000 });

    // 獲取所有方案卡片
    const planCards = await page.$$('.bg-white.rounded-lg.border-2');
    console.log(`   ✓ 找到 ${planCards.length} 個方案卡片`);

    // 顯示每個方案的資訊
    console.log('\n📊 方案比較結果:');
    for (let i = 0; i < planCards.length; i++) {
      const card = planCards[i];
      const name = await card.$eval('h4', el => el.textContent).catch(() => 'Unknown');
      const price = await card.$eval('.text-3xl', el => el.textContent).catch(() => 'N/A');
      const badge = await card.$eval('.inline-flex', el => el.textContent).catch(() => '');

      console.log(`   ${i + 1}. ${name}: ${price} (${badge.trim()})`);
    }

    // 測試 5: 檢查最便宜方案
    console.log('\n📋 測試 5: 檢查最便宜方案');
    const firstCard = planCards[0];
    const firstPrice = await firstCard.$eval('.text-3xl', el => el.textContent);
    console.log(`   ✓ 最便宜方案價格: ${firstPrice}`);

    // 測試 6: 檢查圖表
    console.log('\n📋 測試 6: 檢查圖表');
    const chartVisible = await page.isVisible('text=每月預估電費').catch(() => false);
    console.log(`   ${chartVisible ? '✓' : '✗'} 圖表顯示: ${chartVisible ? '是' : '否'}`);

    // 測試 7: 檢查費用明細
    console.log('\n📋 測試 7: 檢查費用明細');
    const hasBreakdown = await page.isVisible('text=時段用電明細').catch(() => false) ||
                         await page.isVisible('text=累進費率明細').catch(() => false);
    console.log(`   ${hasBreakdown ? '✓' : '✗'} 費用明細: ${hasBreakdown ? '顯示' : '未顯示'}`);

    // 測試 8: 重新測試
    console.log('\n📋 測試 8: 重新測試其他電費單');
    await page.click('button:has-text("🔄 比較其他電費單")');
    await page.waitForSelector('text=上傳你的電費單', { timeout: 5000 });
    console.log('   ✓ 回到上傳頁面');

    // 測試 9: 切換到 OCR 模式
    console.log('\n📋 測試 9: 切換到 OCR 模式');
    await page.click('button:has-text("📸 拍照上傳")');
    console.log('   ✓ 切換到 OCR 模式');

    // 檢查上傳區域是否存在
    const uploadZoneExists = await page.isVisible('text=拖曳圖片到這裡').catch(() => false) ||
                             await page.isVisible('text=點擊上傳').catch(() => false);
    console.log(`   ${uploadZoneExists ? '✓' : '✗'} 上傳區域: ${uploadZoneExists ? '顯示' : '未顯示'}`);

    console.log('\n╔═════════════════════════════════════════════════════════╗');
    console.log('║                  測試完成                                ║');
    console.log('╚═════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    await page.screenshot({ path: '/tmp/test-error.png' });
    console.log('   截圖已儲存到 /tmp/test-error.png');
  } finally {
    await browser.close();
  }
}

runComprehensiveTest().catch(console.error);

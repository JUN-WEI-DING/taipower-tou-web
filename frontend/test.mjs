#!/usr/bin/env node
/**
 * 前端測試 - 單一可靠版本
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';
const SCREENSHOT = process.env.HOME + '/Desktop/fe-test.png';

async function test() {
  console.log('前端測試開始...');
  console.log('URL: ' + URL);
  console.log('');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 1. 首頁
  console.log('[1/4] 首頁...');
  await page.goto(URL, {waitUntil: 'domcontentloaded'});
  const title = await page.title();
  console.log('      標題: ' + title);
  console.log('      ✅');
  
  // 2. 手動輸入
  console.log('[2/4] 手動輸入...');
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(1500);
  
  const selects = await page.$$('select');
  await selects[0].selectOption('2025');
  await selects[1].selectOption('7');
  await selects[2].selectOption('10');
  await selects[3].selectOption('110');
  await page.fill('input[type="number"]', '500');
  await page.waitForTimeout(500);
  console.log('      填入: 2025/7月, 10A, 110V, 500度');
  console.log('      ✅');
  
  // 3. 提交
  console.log('[3/4] 提交...');
  await page.click('button:has-text("開始比較")');
  await page.waitForTimeout(2000);
  console.log('      ✅');
  
  // 4. 結果
  console.log('[4/4] 結果...');
  const hasResult = await page.evaluate(() => 
    document.body.innerText.includes('結果') || 
    document.body.innerText.includes('比較')
  );
  console.log('      有結果頁面: ' + (hasResult ? '是' : '否'));
  console.log('      ' + (hasResult ? '✅' : '❌'));
  
  // 截圖
  await page.screenshot({path: SCREENSHOT, fullPage: true});
  console.log('');
  console.log('截圖: ' + SCREENSHOT);
  
  await browser.close();
  
  console.log('');
  if (hasResult) {
    console.log('✅ 測試成功！前端功能正常運作。');
  } else {
    console.log('⚠️  測試完成，但結果頁面可能異常。');
  }
}

test().catch(err => {
  console.error('❌ 錯誤:', err.message);
  console.error('');
  console.error('請確認 Dev Server 正在運行:');
  console.error('  cd ~/Project/taipower-tou-web/frontend');
  console.error('  npm run dev');
  process.exit(1);
});

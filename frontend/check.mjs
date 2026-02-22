#!/usr/bin/env node
/**
 * 快速系統檢查工具
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';

const URL = 'http://localhost:5173/taipower-tou-web/';
const SCREENSHOT_DIR = process.env.HOME + '/Desktop/fe-screenshots';

console.log('╔═════════════════════════════════════════════════════════╗');
console.log('║           前端開發工具 - 系統檢查                        ║');
console.log('╚═════════════════════════════════════════════════════════╝');
console.log('');

async function check() {
  // 1. 檢查 Dev Server
  try {
    const response = await fetch(URL);
    console.log('Dev Server: ✅ 運行中');
    console.log('URL: ' + URL);
  } catch {
    console.log('Dev Server: ❌ 未運行');
    console.log('');
    console.log('請執行: npm run dev');
    return;
  }

  // 2. 開啟瀏覽器
  console.log('');
  console.log('正在開啟瀏覽器...');
  try {
    execSync('open "' + URL + '"');
    console.log('✅ 瀏覽器已開啟');
  } catch {
    console.log('⚠️  無法自動開啟瀏覽器');
    console.log('請手動打開: ' + URL);
  }

  // 3. 快速測試
  console.log('');
  console.log('執行快速測試...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: 'domcontentloaded'});
  
  const data = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
    return { buttons };
  });
  
  console.log('  找到 ' + data.buttons.length + ' 個按鈕:');
  data.buttons.forEach((b, i) => console.log('    ' + (i+1) + '. ' + b));
  
  await page.screenshot({path: SCREENSHOT_DIR + '/check.png'});
  await browser.close();
  
  console.log('');
  console.log('截圖: ' + SCREENSHOT_DIR + '/check.png');
  
  console.log('');
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ 系統正常運作                      ║');
  console.log('╚═════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('快速命令:');
  console.log('  npm run dev        - 啟動 Dev Server');
  console.log('  npm run tool       - 開發工具選單');
  console.log('  npm run test-electricity - 自動測試');
}

check().catch(err => {
  console.error('❌ 錯誤:', err.message);
});

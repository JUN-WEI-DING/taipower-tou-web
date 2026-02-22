#!/usr/bin/env node
/**
 * Live Frontend Preview - 直接操作和看到前端
 * 不依賴 MCP，直接使用 Playwright
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const FRONTEND_URL = 'http://localhost:5173/taipower-tou-web/';
const SCREENSHOT_DIR = process.env.HOME + '/Desktop/fe-live';

console.log('═══════════════════════════════════════');
console.log('    Live Frontend Preview');
console.log('═══════════════════════════════════════');
console.log('');
console.log('URL:', FRONTEND_URL);
console.log('');

// 使用有頭模式 - 真實可見
const browser = await chromium.launch({ 
  headless: false,
  slowMo: 100  // 慢速操作，更容易看到
});

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// 收集錯誤
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', msg => {
  if (msg.type() === 'error') console.log('[Console Error]', msg.text());
});

console.log('→ 載入首頁...');
await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });

console.log('✅ 首頁已載入');
console.log('');

// 列出可用的操作
console.log('═══════════════════════════════════════');
console.log('    可用操作');
console.log('═══════════════════════════════════════');
console.log('');
console.log('1. 點擊「手動輸入」');
console.log('2. 點擊「拍照上傳」');
console.log('3. 點擊「使用相機拍照」');
console.log('4. 測試完整流程');
console.log('5. 截圖並儲存');
console.log('0. 離開');
console.log('');
console.log('═══════════════════════════════════════');
console.log('');

// 保持瀏覽器開啟 30 秒供操作
console.log('瀏覽器將保持開啟 30 秒...');
console.log('您可以直接在瀏覽器中操作前端！');
console.log('');

await page.waitForTimeout(30000);

if (errors.length > 0) {
  console.log('');
  console.log('發現的錯誤:');
  errors.forEach(e => console.log('  -', e));
}

await browser.close();

console.log('');
console.log('✅ 預覽結束');

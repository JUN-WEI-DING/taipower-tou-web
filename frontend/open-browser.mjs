#!/usr/bin/env node
/**
 * 真正的前端測試工具 - 打開實際瀏覽器
 * 用法: node open-browser.mjs
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';

async function openBrowser() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     開啟瀏覽器 - 真實前端操作                     ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log('URL: ' + URL);
  console.log('');

  const browser = await chromium.launch({
    headless: false,  // 使用有頭模式 - 真正可見的瀏覽器
    slowMo: 500       // 慢速模式 - 可以看到操作過程
  });

  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: 'domcontentloaded'});

  console.log('✅ 瀏覽器已開啟');
  console.log('');
  console.log('現在可以:');
  console.log('  - 在瀏覽器中看到前端頁面');
  console.log('  - 手動測試功能');
  console.log('  - 觀察頁面變化');
  console.log('');
  console.log('按 Ctrl+C 關閉瀏覽器');

  // 保持瀏覽器開啟，直到用戶中斷
  await new Promise(() => {});
}

openBrowser().catch(err => {
  console.error('❌ 錯誤:', err.message);
  console.error('');
  console.error('請確認:');
  console.error('1. Dev Server 正在運行: npm run dev');
  console.error('2. URL 正確: ' + URL);
  process.exit(1);
});

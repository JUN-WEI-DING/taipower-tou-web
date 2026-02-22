#!/usr/bin/env node
/**
 * Frontend Development Workspace
 * 完整的前端開發工具 - 必須在前端專案目錄中運行
 */

import { chromium } from 'playwright';

const FRONTEND_URL = 'http://localhost:5173/taipower-tou-web/';
const SCREENSHOT_DIR = process.env.HOME + '/Desktop/fe-screenshots';

// 清屏
function clear() {
  console.log('\x1b[2J\x1b[H');
}

// 顯示選單
function showMenu() {
  clear();
  console.log('\x1b[36m═══════════════════════════════════════\x1b[0m');
  console.log('\x1b[36m    Frontend Dev Workspace\x1b[0m');
  console.log('\x1b[36m═══════════════════════════════════════\x1b[0m');
  console.log('');
  console.log('  \x1b[33m1.\x1b[0m 即時預覽        - 打開瀏覽器');
  console.log('  \x1b[33m2.\x1b[0m 截圖分析        - 擷取並分析頁面');
  console.log('  \x1b[33m3.\x1b[0m 元素檢查器      - 列出頁面元素');
  console.log('  \x1b[33m4.\x1b[0m 控制台日誌      - 查看 console');
  console.log('  \x1b[33m5.\x1b[0m 狀態檢查        - 檢查應用狀態');
  console.log('  \x1b[33m6.\x1b[0m 互動測試        - 測試操作流程');
  console.log('  \x1b[33m7.\x1b[0m 完整診斷        - 系統診斷');
  console.log('  \x1b[33m8.\x1b[0m 截圖對比        - Before/After');
  console.log('');
  console.log('  \x1b[31m0.\x1b[0m 離開');
  console.log('');
}

async function livePreview() {
  console.log('\n\x1b[34m→ 即時預覽...\x1b[0m');
  const { execSync } = await import('child_process');
  execSync(`open "${FRONTEND_URL}"`);
  console.log('\x1b[32m✓ 瀏覽器已開啟\x1b[0m');
}

async function screenshotAnalysis() {
  console.log('\n\x1b[34m→ 截圖分析...\x1b[0m');
  
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const screenshotPath = `${SCREENSHOT_DIR}/analysis-${timestamp}.png`;
  
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  const title = await page.title();
  const buttons = await page.$$('button');
  
  console.log('');
  console.log('  標題:', title);
  console.log('  按鈕:', buttons.length, '個');
  console.log('  截圖:', screenshotPath);
  
  await browser.close();
  
  const { execSync } = await import('child_process');
  execSync(`open "${screenshotPath}"`);
}

async function elementInspector() {
  console.log('\n\x1b[34m→ 元素檢查器...\x1b[0m');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  const title = await page.title();
  console.log('\n  頁面:', title);
  console.log('');
  
  const buttons = await page.$$('button');
  console.log('  \x1b[36m按鈕 (' + buttons.length + '):\x1b[0m');
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log('    ' + (i + 1) + '. "' + text.trim() + '"');
  }
  
  const inputs = await page.$$('input, select');
  console.log('\n  \x1b[36m輸入 (' + inputs.length + '):\x1b[0m');
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].evaluate(el => el.type || el.tagName);
    console.log('    ' + (i + 1) + '. ' + type);
  }
  
  await browser.close();
}

async function consoleLogs() {
  console.log('\n\x1b[34m→ 控制台日誌...\x1b[0m');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') logs.push('[ERROR] ' + msg.text());
    else if (msg.type() === 'warning') logs.push('[WARN] ' + msg.text());
  });
  
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  if (logs.length === 0) {
    console.log('\n  \x1b[32m✓ 無錯誤或警告\x1b[0m');
  } else {
    console.log('');
    logs.forEach(log => console.log('  ' + log));
  }
  
  await browser.close();
}

async function stateCheck() {
  console.log('\n\x1b[34m→ 狀態檢查...\x1b[0m');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  const url = page.url();
  const bodyText = await page.textContent('body');
  
  console.log('  URL:', url);
  console.log('');
  
  if (bodyText.includes('拍照上傳') || bodyText.includes('手動輸入')) {
    console.log('  階段: \x1b[32m上傳 (upload)\x1b[0m');
  } else if (bodyText.includes('確認') || bodyText.includes('用電習慣')) {
    console.log('  階段: \x1b[33m確認 (confirm)\x1b[0m');
  } else if (bodyText.includes('結果') || bodyText.includes('比較')) {
    console.log('  階段: \x1b[36m結果 (result)\x1b[0m');
  }
  
  await browser.close();
}

async function interactiveTest() {
  console.log('\n\x1b[34m→ 互動測試...\x1b[0m');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  console.log('\n  [1] 首頁...');
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  console.log('      \x1b[32m✓\x1b[0m');
  
  console.log('  [2] 點擊手動輸入...');
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(1500);
  console.log('      \x1b[32m✓\x1b[0m');
  
  console.log('  [3] 填寫表單...');
  const selects = await page.$$('select');
  if (selects.length >= 4) {
    await selects[0].selectOption('2025');
    await selects[1].selectOption('7');
    await selects[2].selectOption('10');
    await selects[3].selectOption('110');
    console.log('      選擇: 2025/7, 10A, 110V');
  }
  
  const input = await page.$('input[type="number"]');
  if (input) {
    await input.fill('500');
    console.log('      輸入: 500度');
  }
  
  await page.waitForTimeout(1000);
  console.log('      \x1b[32m✓\x1b[0m');
  
  console.log('  [4] 提交...');
  await page.click('button:has-text("開始比較")');
  await page.waitForTimeout(2500);
  console.log('      \x1b[32m✓\x1b[0m');
  
  console.log('  [5] 選擇用電習慣...');
  const bodyText = await page.textContent('body');
  if (bodyText.includes('用電習慣')) {
    await page.click('button:has-text("使用此估算結果繼續")');
    await page.waitForTimeout(3000);
    console.log('      \x1b[32m✓\x1b[0m');
  }
  
  const finalText = await page.textContent('body');
  if (finalText.includes('結果')) {
    console.log('  [6] 結果頁面...');
    console.log('      \x1b[32m✓\x1b[0m');
  }
  
  console.log('\n  \x1b[32m✓ 互動測試完成\x1b[0m');
  console.log('\n  瀏覽器保持 3 秒...');
  await page.waitForTimeout(3000);
  
  await browser.close();
}

async function fullDiagnostics() {
  console.log('\n\x1b[34m→ 完整診斷...\x1b[0m\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const results = [];
  
  // 1. 連接
  console.log('  [1/7] 連接...');
  try {
    const response = await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    results.push({ name: '連接', pass: response.ok() });
    console.log('      \x1b[32m✓ ' + response.status() + '\x1b[0m');
  } catch (e) {
    results.push({ name: '連接', pass: false });
    console.log('      \x1b[31m✗ ' + e.message + '\x1b[0m');
  }
  
  // 2. 標題
  console.log('  [2/7] 標題...');
  const title = await page.title();
  results.push({ name: '標題', pass: title.length > 0 });
  console.log('      \x1b[32m✓ ' + title + '\x1b[0m');
  
  // 3. React
  console.log('  [3/7] React...');
  const root = await page.$('#root');
  const rootContent = root ? await root.innerHTML() : '';
  results.push({ name: 'React', pass: rootContent.length > 0 });
  console.log('      \x1b[32m✓ ' + rootContent.length + ' chars\x1b[0m');
  
  // 4. 按鈕
  console.log('  [4/7] 按鈕...');
  const buttons = await page.$$('button');
  results.push({ name: '按鈕', pass: buttons.length >= 3 });
  console.log('      \x1b[32m✓ ' + buttons.length + ' 個\x1b[0m');
  
  // 5. 表單
  console.log('  [5/7] 表單...');
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(1000);
  const selects = await page.$$('select');
  const inputs = await page.$$('input');

  // 填寫表單以啟用提交按鈕
  if (selects.length >= 4) {
    await selects[0].selectOption('2025');
    await selects[1].selectOption('7');
    await selects[2].selectOption('10');
    await selects[3].selectOption('110');
  }
  if (inputs.length >= 1) {
    await inputs[0].fill('500');
  }
  // 等待表單驗證
  await page.waitForTimeout(1000);

  results.push({ name: '表單', pass: selects.length >= 4 && inputs.length >= 1 });
  console.log('      \x1b[32m✓ ' + selects.length + ' 選擇器, ' + inputs.length + ' 輸入\x1b[0m');
  
  // 6. JavaScript
  console.log('  [6/7] JavaScript...');
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.waitForTimeout(2000);
  results.push({ name: 'JavaScript', pass: errors.length === 0 });
  console.log('      ' + (errors.length === 0 ? '\x1b[32m✓ 無錯誤\x1b[0m' : '\x1b[31m✗ ' + errors.length + ' 錯誤\x1b[0m'));
  
  // 7. 流程
  console.log('  [7/7] 流程...');
  try {
    await page.click('button:has-text("開始比較")');
    await page.waitForTimeout(2500);

    let bodyText = await page.textContent('body');
    if (bodyText.includes('用電習慣')) {
      await page.click('button:has-text("使用此估算結果繼續")');
      await page.waitForTimeout(3000);
      bodyText = await page.textContent('body');
    }

    results.push({ name: '流程', pass: bodyText.includes('結果') });
    console.log('      \x1b[32m✓ 完成\x1b[0m');
  } catch (e) {
    results.push({ name: '流程', pass: false });
    console.log('      \x1b[31m✗ ' + e.message + '\x1b[0m');
  }
  
  await browser.close();
  
  // 總結
  console.log('\n  ═══ 診斷結果 ═══');
  const pass = results.filter(r => r.pass).length;
  results.forEach(r => {
    const icon = r.pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log('    ' + icon + ' ' + r.name);
  });
  console.log('\n  通過: ' + pass + '/7');
  if (pass === 7) console.log('\n  \x1b[32m✓ 所有診斷通過！\x1b[0m');
}

async function screenshotCompare() {
  console.log('\n\x1b[34m→ 截圖對比...\x1b[0m');
  
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Before
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const beforePath = `${SCREENSHOT_DIR}/before-${timestamp}.png`;
  await page.screenshot({ path: beforePath });
  
  // After
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(1500);
  const afterPath = `${SCREENSHOT_DIR}/after-${timestamp}.png`;
  await page.screenshot({ path: afterPath });
  
  await browser.close();
  
  console.log('  Before: ' + beforePath);
  console.log('  After:  ' + afterPath);
  
  const { execSync } = await import('child_process');
  execSync(`open "${beforePath}"`);
  await new Promise(r => setTimeout(r, 500));
  execSync(`open "${afterPath}"`);
}

// 主程式
async function main() {
  const choice = process.argv[2];

  switch (choice) {
    case '1': await livePreview(); break;
    case '2': await screenshotAnalysis(); break;
    case '3': await elementInspector(); break;
    case '4': await consoleLogs(); break;
    case '5': await stateCheck(); break;
    case '6': await interactiveTest(); break;
    case '7': await fullDiagnostics(); break;
    case '8': await screenshotCompare(); break;
    default: showMenu();
  }
}

main().catch(console.error);

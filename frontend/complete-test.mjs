#!/usr/bin/env node
/**
 * 完整功能測試 - 驗證所有業務功能
 */

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';
const SCREENSHOT_DIR = process.env.HOME + '/Desktop/fe-screenshots';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║              前端應用完整功能驗證                          ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log('║  測試時間: ' + new Date().toLocaleString('zh-TW') + '               ║');
console.log('║  測試URL: ' + URL + '                        ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

const browser = await chromium.launch();
const page = await browser.newPage();

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  process.stdout.write(`[${total}] ${name}... `);
  try {
    await fn();
    passed++;
    console.log('✅ 通過');
    return true;
  } catch (e) {
    console.log('❌ 失敗:', e.message);
    return false;
  }
}

// ============ 功能測試 ============

console.log('📍 階段 1: 首頁功能');
console.log('─'.repeat(60));

await test('首頁載入', async () => {
  await page.goto(URL, {waitUntil: 'domcontentloaded'});
  const title = await page.title();
  if (title !== '臺電時間電價比較網站') {
    throw new Error('標題不正確: ' + title);
  }
});

await test('三個主要按鈕顯示', async () => {
  const buttons = await page.$$('button');
  if (buttons.length !== 3) {
    throw new Error('按鈕數量錯誤: ' + buttons.length);
  }
  const texts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
  );
  
  const hasPhoto = texts.some(t => t.includes('拍照') || t.includes('上傳'));
  const hasManual = texts.some(t => t.includes('手動') || t.includes('輸入'));
  const hasCamera = texts.some(t => t.includes('相機'));
  
  if (!hasPhoto) throw new Error('缺少「拍照上傳」按鈕');
  if (!hasManual) throw new Error('缺少「手動輸入」按鈕');
  if (!hasCamera) throw new Error('缺少「使用相機拍照」按鈕');
});

console.log('');
console.log('📍 階段 2: 手動輸入功能');
console.log('─'.repeat(60));

await test('進入手動輸入頁面', async () => {
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(1500);
  
  const hasInput = await page.$('input[type="number"]');
  if (!hasInput) throw new Error('找不到用電度數輸入框');
  
  const title = await page.evaluate(() => {
    const h3 = document.querySelector('h3');
    return h3 ? h3.textContent.trim() : '';
  });
  if (!title.includes('手動輸入')) {
    throw new Error('未進入手動輸入頁面');
  }
});

await test('表單欄位完整', async () => {
  const selects = await page.$$('select');
  if (selects.length !== 4) {
    throw new Error('下拉選單數量錯誤: ' + selects.length);
  }
  
  const input = await page.$('input[type="number"]');
  if (!input) throw new Error('找不到用電度數輸入框');
});

await test('填寫表單', async () => {
  const selects = await page.$$('select');
  
  await selects[0].selectOption('2025');
  const yearVal = await selects[0].evaluate(el => el.value);
  if (yearVal !== '2025') throw new Error('年份選擇失敗');
  
  await selects[1].selectOption('7');
  const monthVal = await selects[1].evaluate(el => el.value);
  if (monthVal !== '7') throw new Error('月份選擇失敗');
  
  await selects[2].selectOption('15');
  const capVal = await selects[2].evaluate(el => el.value);
  if (capVal !== '15') throw new Error('契約容量選擇失敗');
  
  await selects[3].selectOption('110');
  const voltVal = await selects[3].evaluate(el => el.value);
  if (voltVal !== '110') throw new Error('電壓選擇失敗');
  
  await page.fill('input[type="number"]', '500');
  const inputVal = await page.$eval('input[type="number"]', el => el.value);
  if (inputVal !== '500') throw new Error('用電度數填寫失敗');
  
  await page.waitForTimeout(500);
});

await test('表單提交', async () => {
  await page.click('button:has-text("開始比較")');
  await page.waitForTimeout(2000);
  
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('確認')) {
    throw new Error('未進入確認頁面');
  }
});

console.log('');
console.log('📍 階段 3: 確認與用電習慣');
console.log('─'.repeat(60));

await test('確認頁面顯示', async () => {
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('電費單資訊')) {
    throw new Error('確認頁面缺少資訊顯示');
  }
});

await test('用電習慣選擇器出現', async () => {
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('用電習慣')) {
    throw new Error('缺少用電習慣選擇');
  }
});

await test('選擇用電習慣', async () => {
  // 查找並點擊估算結果繼續按鈕
  const buttons = await page.$$('button');
  let clicked = false;
  for (const btn of buttons) {
    const text = await btn.textContent();
    const visible = await btn.isVisible();
    if (visible && text && text.includes('使用此估算結果繼續')) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  
  if (!clicked) throw new Error('無法找到「使用此估算結果繼續」按鈕');
  await page.waitForTimeout(5000);
});

console.log('');
console.log('📍 階段 4: 結果頁面');
console.log('─'.repeat(60));

await test('結果頁面標題', async () => {
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('結果') && !pageText.includes('比較')) {
    throw new Error('結果頁面標題缺失');
  }
});

await test('方案列表顯示', async () => {
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes('非時間電價')) {
    throw new Error('缺少非時間電價方案');
  }
  if (!pageText.includes('時間電價')) {
    throw new Error('缺少時間電價方案');
  }
});

await test('金額資訊顯示', async () => {
  const pageText = await page.evaluate(() => document.body.innerText);
  const hasMoney = pageText.includes('$') || pageText.includes('元') || pageText.includes('NTD');
  if (!hasMoney) throw new Error('缺少金額資訊');
});

await test('圖表顯示', async () => {
  const hasChart = await page.evaluate(() => {
    return document.querySelector('canvas, svg') !== null;
  });
  if (!hasChart) throw new Error('缺少圖表');
});

await test('保存結果截圖', async () => {
  await page.screenshot({
    path: SCREENSHOT_DIR + '/complete-test-' + TIMESTAMP + '.png',
    fullPage: true
  });
});

await browser.close();

// ============ 總結報告 ============

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║                    測試結果摘要                            ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log('║  總測試數: ' + total + '                                         ║');
console.log('║  通過數: ' + passed + '                                         ║');
console.log('║  失敗數: ' + (total - passed) + '                                         ║');
console.log('║  成功率: ' + Math.round(passed/total*100) + '%                                         ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

if (passed === total) {
  console.log('✅ 所有功能測試通過！前端應用完全正常運作。');
  console.log('');
  console.log('功能驗證:');
  console.log('  ✅ 首頁 - 三個主要按鈕正常');
  console.log('  ✅ 手動輸入 - 表單填寫與提交正常');
  console.log('  ✅ 確認頁面 - 資料顯示正常');
  console.log('  ✅ 用電習慣 - 選擇器正常');
  console.log('  ✅ 結果頁面 - 方案比較、金額、圖表全部正常');
} else {
  console.log('⚠️  部分功能測試失敗，請檢查上述錯誤訊息。');
}

console.log('');
console.log('截圖已保存: ' + SCREENSHOT_DIR + '/complete-test-' + TIMESTAMP + '.png');

process.exit(passed === total ? 0 : 1);

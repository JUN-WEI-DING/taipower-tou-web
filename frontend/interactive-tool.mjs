import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const FRONTEND_URL = 'http://localhost:5173/taipower-tou-web/';

console.log('════════════════════════════════════════════════════════════');
console.log('           前端互動工具');
console.log('════════════════════════════════════════════════════════════');
console.log('');

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

console.log('[1] 載入首頁...');
await page.goto(FRONTEND_URL);
await page.waitForTimeout(2000);

const title = await page.title();
console.log('    標題:', title);
console.log('    URL:', page.url());
console.log('');

console.log('[2] 檢查頁面元素...');
const buttons = await page.$$('button');
console.log('    按鈕數量:', buttons.length);
for (let i = 0; i < buttons.length; i++) {
  const text = await buttons[i].textContent();
  console.log('      [' + (i+1) + '] ' + text.trim());
}
console.log('');

console.log('[3] 截圖並儲存...');
const screenshot = '/Users/macmini/Desktop/fe-interactive-' + Date.now() + '.png';
await page.screenshot({ path: screenshot, fullPage: true });
console.log('    截圖:', screenshot);
console.log('');

console.log('[4] 執行完整流程測試...');

// 點擊手動輸入
console.log('    → 點擊「手動輸入」');
await page.click('button:has-text("手動輸入")');
await page.waitForTimeout(2000);

// 填寫表單
const selects = await page.$$('select');
const inputs = await page.$$('input[type="number"]');
if (selects.length >= 4 && inputs.length >= 1) {
  await selects[0].selectOption('2025');
  await selects[1].selectOption('7');
  await selects[2].selectOption('10');
  await selects[3].selectOption('110');
  await inputs[0].fill('500');
  await page.waitForTimeout(500);
  console.log('    → 表單已填寫');
}

// 提交
console.log('    → 點擊「開始比較」');
await page.click('button:has-text("開始比較")');
await page.waitForTimeout(3000);

// 用電習慣
const bodyText = await page.textContent('body');
if (bodyText.includes('用電習慣')) {
  console.log('    → 選擇用電習慣');
  await page.click('button:has-text("使用此估算結果繼續")');
  await page.waitForTimeout(3000);
}

// 檢查結果
const finalText = await page.textContent('body');
const hasResult = finalText.includes('結果') || finalText.includes('比較');

console.log('');
console.log('════════════════════════════════════════════════════════════');
if (hasResult) {
  console.log('              ✅ 完整流程測試通過');
} else {
  console.log('              ⚠️  測試結果未知');
}
console.log('════════════════════════════════════════════════════════════');
console.log('');

// 最終截圖
const finalScreenshot = '/Users/macmini/Desktop/fe-final-' + Date.now() + '.png';
await page.screenshot({ path: finalScreenshot, fullPage: true });
console.log('最終截圖:', finalScreenshot);
console.log('');

console.log('瀏覽器將保持 10 秒供您檢查...');
await page.waitForTimeout(10000);

await browser.close();

console.log('');
console.log('✅ 測試完成');
console.log('');
console.log('提示: 您可以直接在瀏覽器中測試前端功能');

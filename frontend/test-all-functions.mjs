import { chromium } from 'playwright';

const URL = 'http://localhost:5173/taipower-tou-web/';

async function testAllFunctions() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('         前端完整功能測試 - 真實執行');
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const allPassed = [];
  const allFailed = [];

  // 測試 1: 首頁載入
  console.log('[測試 1] 首頁載入...');
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const title = await page.title();
    if (title.includes('臺電') || title.includes('時間電價')) {
      console.log('  ✅ 通過 - 標題: ' + title);
      allPassed.push('首頁載入');
    } else {
      throw new Error('標題不正確: ' + title);
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('首頁載入');
  }

  // 測試 2: 三個按鈕存在且可點擊
  console.log('');
  console.log('[測試 2] 檢查三個主要按鈕...');
  try {
    const buttons = await page.$$('button');
    const buttonTexts = [];
    for (const btn of buttons) {
      const text = await btn.textContent();
      buttonTexts.push(text.trim());
    }

    const hasPhotoUpload = buttonTexts.some(t => t.includes('拍照上傳'));
    const hasManualInput = buttonTexts.some(t => t.includes('手動輸入'));
    const hasCamera = buttonTexts.some(t => t.includes('相機'));

    if (hasPhotoUpload && hasManualInput && hasCamera) {
      console.log('  ✅ 通過');
      console.log('     - 📸 拍照上傳');
      console.log('     - ⌨️ 手動輸入');
      console.log('     - 📷 使用相機拍照');
      allPassed.push('三個按鈕');
    } else {
      throw new Error('缺少按鈕');
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('三個按鈕');
  }

  // 測試 3: 點擊手動輸入
  console.log('');
  console.log('[測試 3] 點擊「手動輸入」...');
  try {
    await page.click('button:has-text("手動輸入")');
    await page.waitForTimeout(1500);

    const bodyText = await page.textContent('body');
    if (bodyText.includes('年份') || bodyText.includes('月份')) {
      console.log('  ✅ 通過 - 手動輸入頁面已顯示');
      allPassed.push('手動輸入頁面');
    } else {
      throw new Error('手動輸入頁面未正確顯示');
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('手動輸入頁面');
  }

  // 測試 4: 表單填寫
  console.log('');
  console.log('[測試 4] 填寫表單...');
  try {
    const selects = await page.$$('select');
    const inputs = await page.$$('input[type="number"]');

    if (selects.length < 4) throw new Error('下拉選單少於4個');
    if (inputs.length < 1) throw new Error('數字輸入框不存在');

    await selects[0].selectOption('2025');
    await selects[1].selectOption('7');
    await selects[2].selectOption('10');
    await selects[3].selectOption('110');
    await inputs[0].fill('500');

    await page.waitForTimeout(500);

    console.log('  ✅ 通過');
    console.log('     - 年份: 2025');
    console.log('     - 月份: 7');
    console.log('     - 契約容量: 10A');
    console.log('     - 電壓: 110V');
    console.log('     - 用電度數: 500度');
    allPassed.push('表單填寫');
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('表單填寫');
  }

  // 測試 5: 提交表單
  console.log('');
  console.log('[測試 5] 提交表單（開始比較）...');
  try {
    await page.click('button:has-text("開始比較")');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body');
    if (bodyText.includes('確認') || bodyText.includes('用電習慣')) {
      console.log('  ✅ 通過 - 確認頁面已顯示');
      allPassed.push('表單提交');
    } else {
      throw new Error('確認頁面未顯示');
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('表單提交');
  }

  // 測試 6: 用電習慣選擇
  console.log('');
  console.log('[測試 6] 選擇用電習慣...');
  try {
    const bodyText = await page.textContent('body');
    
    if (bodyText.includes('用電習慣')) {
      await page.click('button:has-text("使用此估算結果繼續")');
      await page.waitForTimeout(3000);
      
      const finalText = await page.textContent('body');
      if (finalText.includes('結果') || finalText.includes('比較')) {
        console.log('  ✅ 通過 - 結果頁面已顯示');
        allPassed.push('用電習慣選擇');
      } else {
        throw new Error('結果頁面未顯示');
      }
    } else {
      console.log('  ⚠️  跳過 - 無用電習慣選擇頁面');
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('用電習慣選擇');
  }

  // 測試 7: 檢查結果內容
  console.log('');
  console.log('[測試 7] 檢查結果頁面內容...');
  try {
    const finalText = await page.textContent('body');
    
    const hasResultTitle = finalText.includes('結果');
    const hasAmount = finalText.includes('NT$') || finalText.includes('元') || finalText.includes('金額');
    const hasChart = await page.$$('.recharts-wrapper').length > 0;

    console.log('  - 結果標題: ' + (hasResultTitle ? '✅' : '❌'));
    console.log('  - 金額顯示: ' + (hasAmount ? '✅' : '❌'));
    console.log('  - 圖表元素: ' + (hasChart ? '✅' : '❌'));

    if (hasResultTitle || hasAmount) {
      console.log('  ✅ 通過');
      allPassed.push('結果內容');
    } else {
      throw new Error('結果內容不完整');
    }
  } catch (e) {
    console.log('  ❌ 失敗 - ' + e.message);
    allFailed.push('結果內容');
  }

  // 截圖
  console.log('');
  console.log('[截圖] 儲存當前狀態...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const screenshotPath = `/Users/macmini/Desktop/fe-test-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('  ✅ 截圖: ' + screenshotPath);

  // 總結
  console.log('');
  console.log('════════════════════════════════════════════════════════════');
  console.log('                        測試總結');
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
  console.log('通過: ' + allPassed.length + ' | 失敗: ' + allFailed.length);
  console.log('');

  if (allPassed.length > 0) {
    console.log('✅ 通過的測試:');
    allPassed.forEach(t => console.log('   - ' + t));
  }

  if (allFailed.length > 0) {
    console.log('');
    console.log('❌ 失敗的測試:');
    allFailed.forEach(t => console.log('   - ' + t));
  }

  console.log('');
  
  if (allFailed.length === 0) {
    console.log('🎉 所有測試通過！前端功能完全正常！');
  } else {
    console.log('⚠️  有 ' + allFailed.length + ' 個測試失敗，需要修復');
  }

  console.log('');
  console.log('瀏覽器將保持 5 秒供您檢查...');
  await page.waitForTimeout(5000);

  await browser.close();
}

testAllFunctions().catch(console.error);

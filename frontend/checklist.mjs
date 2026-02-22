import { chromium } from 'playwright';

console.log('════════════════════════════════════════════════════════════');
console.log('           前端功能完整檢查清單');
console.log('════════════════════════════════════════════════════════════');
console.log('');

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const issues = [];
const passed = [];

// 檢查 1: Dev Server
console.log('[1] Dev Server 狀態...');
try {
  const response = await page.goto('http://localhost:5173/taipower-tou-web/', { waitUntil: 'domcontentloaded' });
  if (response.ok()) {
    console.log('    ✅ Dev Server 運行正常');
    passed.push('Dev Server');
  } else {
    throw new Error('HTTP ' + response.status());
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('Dev Server: ' + e.message);
}

// 檢查 2: 頁面標題
console.log('[2] 頁面標題...');
try {
  const title = await page.title();
  if (title.includes('臺電') && title.includes('時間電價')) {
    console.log('    ✅ ' + title);
    passed.push('頁面標題');
  } else {
    throw new Error('標題不正確: ' + title);
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('頁面標題: ' + e.message);
}

// 檢查 3: React 掛載
console.log('[3] React 掛載...');
try {
  const rootContent = await page.$eval('#root', el => el.innerHTML);
  if (rootContent && rootContent.length > 100) {
    console.log('    ✅ React 已掛載 (' + rootContent.length + ' chars)');
    passed.push('React 掛載');
  } else {
    throw new Error('React 未正確掛載');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('React 掛載: ' + e.message);
}

// 檢查 4: 三個按鈕
console.log('[4] 三個主要按鈕...');
try {
  await page.waitForSelector('button', { state: 'visible', timeout: 5000 });
  const buttons = await page.$$('button');
  
  const hasPhotoUpload = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('拍照上傳'));
  });
  const hasManualInput = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('手動輸入'));
  });
  const hasCamera = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('相機'));
  });
  
  if (hasPhotoUpload && hasManualInput && hasCamera) {
    console.log('    ✅ 三個按鈕全部存在');
    passed.push('三個按鈕');
  } else {
    throw new Error('缺少按鈕');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('三個按鈕: ' + e.message);
}

// 檢查 5: 手動輸入功能
console.log('[5] 手動輸入功能...');
try {
  await page.click('button:has-text("手動輸入")');
  await page.waitForTimeout(2000);
  
  const selects = await page.$$('select');
  const inputs = await page.$$('input');
  
  if (selects.length >= 4 && inputs.length >= 1) {
    console.log('    ✅ 手動輸入頁面 (表單: ' + selects.length + ' 選擇器, ' + inputs.length + ' 輸入)');
    passed.push('手動輸入頁面');
  } else {
    throw new Error('表單元素不足');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('手動輸入: ' + e.message);
}

// 檢查 6: 表單填寫
console.log('[6] 表單填寫...');
try {
  const selects = await page.$$('select');
  const inputs = await page.$$('input[type="number"]');
  
  if (selects.length >= 4 && inputs.length >= 1) {
    await selects[0].selectOption('2025');
    await selects[1].selectOption('7');
    await selects[2].selectOption('10');
    await selects[3].selectOption('110');
    await inputs[0].fill('500');
    await page.waitForTimeout(500);
    
    // 驗證填寫
    const select1Value = await selects[0].evaluate(el => el.value);
    const inputValue = await inputs[0].evaluate(el => el.value);
    
    if (select1Value === '2025' && inputValue === '500') {
      console.log('    ✅ 表單可正常填寫');
      passed.push('表單填寫');
    } else {
      throw new Error('填寫後驗證失敗');
    }
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('表單填寫: ' + e.message);
}

// 檢查 7: 提交按鈕
console.log('[7] 提交按鈕...');
try {
  const submitBtn = await page.$('button:has-text("開始比較")');
  if (submitBtn) {
    const isEnabled = await submitBtn.isEnabled();
    if (isEnabled) {
      console.log('    ✅ 提交按鈕可用');
      passed.push('提交按鈕');
    } else {
      throw new Error('提交按鈕被禁用');
    }
  } else {
    throw new Error('找不到提交按鈕');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('提交按鈕: ' + e.message);
}

// 檢查 8: 提交功能
console.log('[8] 提交功能...');
try {
  await page.click('button:has-text("開始比較")');
  await page.waitForTimeout(3000);
  
  const bodyText = await page.textContent('body');
  if (bodyText.includes('確認') || bodyText.includes('用電習慣')) {
    console.log('    ✅ 提交後進入確認頁面');
    passed.push('提交功能');
  } else {
    throw new Error('提交後頁面狀態不正確');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('提交功能: ' + e.message);
}

// 檢查 9: 用電習慣選擇
console.log('[9] 用電習慣選擇...');
try {
  const bodyText = await page.textContent('body');
  if (bodyText.includes('用電習慣')) {
    const continueBtn = await page.$('button:has-text("使用此估算結果繼續")');
    if (continueBtn) {
      await continueBtn.click();
      await page.waitForTimeout(3000);
      console.log('    ✅ 用電習慣選擇功能正常');
      passed.push('用電習慣選擇');
    }
  } else {
    console.log('    ⚠️  無用電習慣選擇頁面 (可能直接進入結果)');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('用電習慣選擇: ' + e.message);
}

// 檢查 10: 結果頁面
console.log('[10] 結果頁面...');
try {
  const finalText = await page.textContent('body');
  const hasResult = finalText.includes('結果') || finalText.includes('比較');
  
  if (hasResult) {
    console.log('    ✅ 結果頁面顯示正常');
    passed.push('結果頁面');
  } else {
    throw new Error('結果頁面未正確顯示');
  }
} catch (e) {
  console.log('    ❌ ' + e.message);
  issues.push('結果頁面: ' + e.message);
}

// 截圖
await page.screenshot({ path: '/Users/macmini/Desktop/fe-checklist.png', fullPage: true });
console.log('');
console.log('截圖已保存: ~/Desktop/fe-checklist.png');

await browser.close();

// 總結
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('檢查結果總結');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('通過: ' + passed.length + '/' + (passed.length + issues.length));
console.log('失敗: ' + issues.length);
console.log('');

if (issues.length > 0) {
  console.log('發現的問題:');
  issues.forEach((issue, i) => {
    console.log('  ' + (i + 1) + '. ' + issue);
  });
} else {
  console.log('✅ 所有檢查項目通過！');
}

console.log('');
if (issues.length === 0) {
  console.log('前端功能完全正常運作 🟢');
} else {
  console.log('前端發現問題，需要修復 🔴');
}

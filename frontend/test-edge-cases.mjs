#!/usr/bin/env node
/**
 * 邊界情況測試 - 測試各種使用情境
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173/taipower-tou-web/';

const testCases = [
  {
    name: '低用電量（夏季）',
    year: 2025,
    month: 7,
    contract: 10,
    voltage: '110',
    consumption: 50,
  },
  {
    name: '一般用電量（夏季）',
    year: 2025,
    month: 7,
    contract: 10,
    voltage: '110',
    consumption: 300,
  },
  {
    name: '高用電量（夏季）',
    year: 2025,
    month: 7,
    contract: 10,
    voltage: '110',
    consumption: 800,
  },
  {
    name: '超高用電量（夏季）',
    year: 2025,
    month: 7,
    contract: 20,
    voltage: '110',
    consumption: 2000,
  },
  {
    name: '一般用電量（非夏季）',
    year: 2025,
    month: 1,
    contract: 10,
    voltage: '110',
    consumption: 300,
  },
  {
    name: '高用電量（非夏季）',
    year: 2025,
    month: 1,
    contract: 10,
    voltage: '110',
    consumption: 600,
  },
  {
    name: '大契約容量（夏季）',
    year: 2025,
    month: 7,
    contract: 40,
    voltage: '110',
    consumption: 500,
  },
  {
    name: '220V 電壓（夏季）',
    year: 2025,
    month: 7,
    contract: 10,
    voltage: '220',
    consumption: 400,
  },
];

async function runTest(testCase) {
  console.log(`\n 測試: ${testCase.name}`);
  console.log(`   參數: ${testCase.year}年${testCase.month}月, ${testCase.contract}A, ${testCase.voltage}V, ${testCase.consumption}度`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // 點擊手動輸入
    await page.click('text=/⌨️ 手動輸入|手動輸入/');
    await page.waitForTimeout(500);

    // 填入表單
    const selects = await page.$$('select');
    await selects[0].selectOption(String(testCase.year));
    await selects[1].selectOption(String(testCase.month));
    await selects[2].selectOption(String(testCase.contract));
    await selects[3].selectOption(testCase.voltage);

    await page.fill('input[type="number"]', String(testCase.consumption));
    await page.waitForTimeout(200);

    // 提交
    await page.click('button:has-text("開始比較")');
    await page.waitForTimeout(2000);

    // 檢查是否需要選擇用電習慣
    const needsHabitSelection = await page.evaluate(() =>
      document.body.innerText.includes('用電習慣')
    );

    if (needsHabitSelection) {
      // 選擇預設的「一般上班族家庭」
      await page.click('text=/一般上班族家庭/');
      await page.waitForTimeout(500);

      // 點擊確認按鈕
      await page.click('button:has-text("使用此估算結果繼續")');
      await page.waitForTimeout(3000);
    }

    // 檢查結果
    const hasResults = await page.evaluate(() =>
      document.body.innerText.includes('方案比較結果') ||
      document.body.innerText.includes('比較結果')
    );

    if (hasResults) {
      // 等待圖表和結果載入
      await page.waitForTimeout(1000);

      // 取得頁面文字
      const pageText = await page.evaluate(() => document.body.innerText);

      // 判斷季節
      const isSummer = testCase.month >= 6 && testCase.month <= 9;
      const expectedSeason = isSummer ? '夏季' : '非夏季';

      // 檢查季節是否正確顯示
      const hasCorrectSeason = pageText.includes(expectedSeason);
      console.log(`   🌡️  季節: ${expectedSeason} ${hasCorrectSeason ? '✅' : '❌'}`);

      // 檢查是否有方案結果
      const hasPlanResults = pageText.includes('表燈') || pageText.includes('時間電價');
      console.log(`   📊 方案結果: ${hasPlanResults ? '有' : '無'}`);

      // 檢查圖表
      const hasChart = await page.$('.recharts-wrapper') !== null;
      console.log(`   📈 圖表: ${hasChart ? '有' : '無'}`);

      // 檢查是否有省錢建議
      const hasSavings = pageText.includes('省錢建議');
      console.log(`   💰 省錢建議: ${hasSavings ? '有' : '無'}`);
    } else {
      console.log(`   ❌ 沒有結果`);
    }

    await browser.close();
    return hasResults;
  } catch (error) {
    console.log(`   ❌ 錯誤: ${error.message}`);
    await browser.close();
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('邊界情況測試');
  console.log('═══════════════════════════════════════════════════════════');

  const results = [];
  for (const testCase of testCases) {
    const passed = await runTest(testCase);
    results.push({ name: testCase.name, passed });
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('測試摘要');
  console.log('═══════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
  });

  console.log(`\n通過: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n✅ 所有測試通過！');
    process.exit(0);
  } else {
    console.log('\n⚠️ 部分測試失敗');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 錯誤:', err.message);
  console.error('\n請確認 Dev Server 正在運行:');
  console.error('  cd ~/Project/taipower-tou-web/frontend');
  console.error('  npm run dev');
  process.exit(1);
});

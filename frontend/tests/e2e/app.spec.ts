import { test, expect } from '@playwright/test';

test.describe('臺電時間電價比較網站 - E2E 測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/taipower-tou-web/');
  });

  test('首頁載入成功', async ({ page }) => {
    // 等待頁面載入
    await expect(page.locator('h1')).toContainText('臺電時間電價比較');
    await expect(page.getByText('上傳電費單，找出最省錢的電價方案')).toBeVisible();
  });

  test('手動輸入表單可以正常工作', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 輸入用電度數
    await page.locator('input[type="number"]').fill('350');

    // 提交表單
    await page.click('button:has-text("確認並開始比較")');

    // 應該進入確認階段
    await expect(page.locator('h2:has-text("確認電費單資訊")')).toBeVisible();
  });

  test('用電習慣選擇器可以正常工作', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 輸入用電度數
    await page.locator('input[type="number"]').fill('350');

    // 提交表單
    await page.click('button:has-text("確認並開始比較")');

    // 等待確認頁面
    await expect(page.locator('h2:has-text("確認電費單資訊")')).toBeVisible();

    // 確認用電習慣選擇器顯示（因為只有總用電度數）
    await expect(page.locator('h3:has-text("選擇最像你家的用電習慣")')).toBeVisible();

    // 選擇第一個習慣卡片
    const habitCards = page.locator('.cursor-pointer.rounded-lg');
    await habitCards.first().click();

    // 等待預估分配顯示（使用更寬鬆的選擇器）
    await expect(page.locator('.grid.grid-cols-3')).toBeVisible();

    // 確認按鈕應該可點選
    const confirmButton = page.locator('button:has-text("使用此估算結果繼續")');
    await expect(confirmButton).toBeEnabled();
  });

  test('方案結果可以正常顯示', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 輸入用電度數
    await page.locator('input[type="number"]').fill('350');

    // 提交表單
    await page.click('button:has-text("確認並開始比較")');

    // 等待確認頁面
    await expect(page.locator('h2:has-text("確認電費單資訊")')).toBeVisible();

    // 選擇第一個習慣卡片
    const habitCards = page.locator('.cursor-pointer.rounded-lg');
    await habitCards.first().click();

    // 確認估算結果
    await page.click('button:has-text("使用此估算結果繼續")');

    // 等待結果頁面
    await expect(page.locator('h2:has-text("方案比較結果")')).toBeVisible();

    // 應該有方案卡片（使用 ocean-card class）
    const planCards = page.locator('.ocean-card');
    await expect(planCards.first()).toBeVisible();

    // 第一個方案應該有排名圖示（獎杯）- 使用更精確的選擇器
    await expect(planCards.first().locator('svg.lucide-trophy')).toBeVisible();
  });

  test('重新開始按鈕可以正常工作', async ({ page }) => {
    // 完成一個完整的流程
    await page.click('button:has-text("手動輸入")');
    await page.locator('input[type="number"]').fill('350');
    await page.click('button:has-text("開始比較")');
    await expect(page.locator('h2:has-text("確認電費單資訊")')).toBeVisible();

    // 選擇習慣
    const habitCards = page.locator('.cursor-pointer.rounded-lg');
    await habitCards.first().click();
    await page.click('button:has-text("使用此估算結果繼續")');

    // 等待結果頁面
    await expect(page.locator('h2:has-text("方案比較結果")')).toBeVisible();

    // 點選重新開始
    await page.click('button:has-text("比較其他電費單")');

    // 應該回到上傳頁面（檢查主標題）
    await expect(page.locator('h1:has-text("臺電時間電價比較")')).toBeVisible();
  });

  test('月份選擇顯示季節資訊', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 選擇夏季月份（7月）
    const monthSelect = page.locator('select').nth(1); // 第二個 select 是月份
    await monthSelect.selectOption('7');

    // 驗證月份選項已選中
    await expect(monthSelect).toHaveValue('7');

    // 提交表單檢視確認頁的季節指示器
    await page.locator('input[type="number"]').fill('350');
    await page.click('button:has-text("確認並開始比較")');

    // 檢查確認頁的季節指示器（夏季費率顯示）
    await expect(page.locator('text=夏季費率').or(page.locator('text=🌞 夏季'))).toBeVisible();
  });

  test('季節指示器在結果頁顯示', async ({ page }) => {
    // 完成流程到結果頁
    await page.click('button:has-text("手動輸入")');
    await page.locator('input[type="number"]').fill('350');

    // 選擇夏季月份
    const monthSelect = page.locator('select').nth(1);
    await monthSelect.selectOption('7');

    await page.click('button:has-text("確認並開始比較")');

    // 選擇習慣並確認
    const habitCards = page.locator('.cursor-pointer.rounded-lg');
    await habitCards.first().click();
    await page.click('button:has-text("使用此估算結果繼續")');

    // 在結果頁應該有季節指示器（使用 first() 解決多元素問題）
    await expect(page.locator('text=🌞 夏季').or(page.locator('text=夏季費率')).first()).toBeVisible();
  });

  test('契約容量下拉選項可選', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 找契約容量下拉選項（使用 label 定位）
    const contractLabel = page.locator('label:has-text("契約容量")');
    const contractSelect = contractLabel.locator('+ select');

    // 選擇 20A（選擇顯示 "20 A" 的選項）
    await contractSelect.selectOption({ label: '20 A' });

    // 驗證已選中 20A
    await expect(contractSelect).toHaveValue('20');
  });

  test('電壓下拉選項可選', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 找電壓下拉選項 (使用 "電壓" 標籤)
    const voltageLabel = page.locator('label:has-text("電壓")');
    const voltageSelect = voltageLabel.locator('xpath=following-sibling::select');

    // 選擇 220V
    await voltageSelect.selectOption('220');

    // 驗證已選中 220V
    await expect(voltageSelect).toHaveValue('220');
  });

  test('相位下拉選項可選', async ({ page }) => {
    // 切換到手動輸入模式
    await page.click('button:has-text("手動輸入")');

    // 找相位下拉選項 (使用 "相位" 標籤)
    const phaseLabel = page.locator('label:has-text("相位")');
    const phaseSelect = phaseLabel.locator('xpath=following-sibling::select');

    // 選擇三相
    await phaseSelect.selectOption('three');

    // 驗證已選中三相
    await expect(phaseSelect).toHaveValue('three');
  });
});

# 臺電時間電價比較網站 - 問題追蹤清單

部署狀態：✅ 已部署到 https://jun-wei-ding.github.io/taipower-tou-web/

## 完成專案

### 功能性問題
[x] 1. 驗證網站是否可以正常訪問和載入
[x] 4. 檢查行動裝置上的響應式表現

### UI/UX 改進
[x] 5. 頁面標題顯示 "frontend" 應改為中文標題
[x] 6. 確認上傳區域的使用者引導是否清晰
[x] 7. 確認 OCR 處理過程的載入提示是否友善
[x] 8. 檢查錯誤處理提示是否清楚

### 程式碼品質
[x] 9. 移除大部分 `as any` 使用
[x] 14. UploadZone 改用匯入的 Button 元件
[x] 15. OCR 錯誤處理改用友善提示
[x] 16. OCRProgress 元件整合：移除 UploadZone 重複的進度 UI

## 待處理專案

### 功能性問題
[ ] 2. 驗證 OCR 功能是否能正常運作（需要真實圖片測試）
[ ] 3. 驗證費率計算是否正確（與臺電官方結果比對）

### 測試覆蓋率
[x] 10. 錯誤邊界處理是否完善
[ ] 11. 提升測試覆蓋率至 80% 目標 (持續改進中)
[ ] 12. 新增 E2E 測試

### UI/UX 改進
[x] 17. ResultChart 需要空狀態處理（無結果時）
[x] 18. PlanList 需要空狀態處理（無結果時）
[x] 19. App.tsx 移除 alert()，使用友善錯誤提示
[x] 20. 鍵盤導航支援：新增 skip-link 和 focus-visible 樣式

---

## 修正記錄

### 迭代 1-2
- ✅ 網站可訪問性驗證
- ✅ 頁面標題中文化
- ✅ 響應式設計檢查
- ✅ TypeScript 最佳化

### 迭代 3
- ✅ 上傳區域重構：使用統一的 Button 元件
- ✅ 錯誤處理改善：移除 alert()，使用內聯錯誤訊息
- ✅ 型別安全改進：Tesseract 結果使用型別交集

### 迭代 4
- ✅ 錯誤邊界處理：新增 ErrorBoundary 元件
- ✅ 空狀態處理：ResultChart 和 PlanList 加入空狀態 UI
- ✅ 型別匯入修復：ErrorBoundary 使用 type-only import

### 迭代 5
- ✅ 進度顯示重構：移除 UploadZone 重複的進度 UI，統一使用 OCRProgress 元件

### 迭代 6
- ✅ 錯誤處理改善：App.tsx 移除 alert()，使用內聯錯誤訊息顯示計算失敗

### 迭代 7
- ✅ 鍵盤導航改善：新增 skip-link 讓鍵盤使用者可跳過導航
- ✅ 無障礙樣式：新增 focus-visible 樣式改善鍵盤焦點可見性
- ✅ 語意化 HTML：main 元素加入 id 屬性配合 skip-link

### 迭代 8
- ✅ 移除未使用檔案：刪除舊版 API 相關檔案和未使用的元件
  - 刪除 src/api/ 資料夾
  - 刪除未使用的 hooks (useFileUpload, usePlans, useCalculation)
  - 刪除未使用的元件 (PlanSelector, CostBreakdown, CSVUploader, BillingInputsForm)
  - 刪除未使用的 store (calculationStore)

### 迭代 9
- ✅ 測試覆蓋率提升：新增 DataCompletenessDetector 單元測試
  - 新增 6 個測試案例涵蓋三種資料完整度等級
  - 測試 detect() 方法的各種情況
  - 測試 getLevelLabel() 和 getLevelDescription() 方法
  - 總測試數從 20 增加到 26 (增加 30%)

### 迭代 10
- ✅ 檔案更新：重寫 README.md 反映現有架構
  - 更新為純前端應用說明
  - 新增功能特點、技術棧說明
  - 移除過時的後端相關說明
  - 新增支援的費率方案表格

### 🔴 Critical Issues (Must Fix)
- `frontend/src/components/results/ResultsSummary.tsx:16`  
  當找不到 `isCurrentPlan` 時，直接把 `results[results.length - 1]` 當「目前方案」，會產生錯誤節費金額（把最差方案當基準，造成虛高 savings）。
- `frontend/src/components/landing/HeroSection.tsx:2`  
  `ChevronRight` 未使用，`npm run lint` 目前直接失敗（CI 阻塞）。

### 🟡 Suggestions (Should Consider)
- `frontend/src/services/calculation/RateCalculator.ts:373` 與 `frontend/src/services/calculation/RateCalculator.ts:551`  
  surcharge 計算邏輯重複，建議抽成共用 helper，降低後續規則修改的漏改風險（DRY）。
- `frontend/src/services/calculation/RateCalculator.ts`、`frontend/src/services/calculation/plans.ts`  
  最近修了 surcharge precedence/validation，但目前測試僅覆蓋 `TwoTierSplitter`/`UsageEstimator`/`DataCompletenessDetector`，沒有針對 `RateCalculator` 與 `plans` 新規則的單元測試。建議補：  
  1. `billing_rules` 優先於 plan-level surcharge  
  2. 非法 surcharge 值（NaN/負數）  
  3. >2000 度與邊界值（2000、2000.1）
- `frontend/src/App.tsx:162`  
  直接回顯 `error.message` 給終端使用者，可能造成內部錯誤細節外洩。建議顯示通用訊息，詳細錯誤只留在 logging/monitoring。
- 結構維護性：repo 目前追蹤了產出物與雜訊檔（`frontend/playwright-report/index.html`, `frontend/test-results/.last-run.json`, `frontend/frontend/public/data/plans.json`）。建議清理並加強 ignore 規則，避免版本庫汙染。

### 🟢 What's Working Well
- `frontend/src/components/upload/UploadZone.tsx:30` 起有明確檔案型別/大小驗證，安全與 UX 基本面是正確方向。
- `frontend/src/services/calculation/plans.ts:268` 起對 surcharge 規則做了格式標準化與有效值檢查，方向正確。
- 測試現況可透過：Vitest `3 files / 26 tests` 全綠，至少基線品質穩定。

### 📊 Task Alignment
目前提交主要是「自製 Tech Innovation 主題重繪」，與任務要求的「先套用成熟第三方前端模板再最佳化」不一致；另外此輪變更看不到模板整合證據（例如模板來源、對應版型結構、migration 說明）。  
同時，任務要求的 `commit + push` 在這次 review 輸出中尚未被驗證落實。

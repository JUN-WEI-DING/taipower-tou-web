# Web Feature Risk Register（前後端功能）

本文件登記本次前後端功能 review 風險，作為修復與驗收追蹤依據。

## Risk Register

| ID | 風險描述 | 影響範圍 | 可能性 | 影響程度 | 當前狀態 | 證據 |
|---|---|---|---|---|---|---|
| R1 | CSV 解析在正常輸入下可能丟出 `TypeError`，導致上傳 API 失敗 | 後端 `/api/v1/upload/csv`、前端上傳流程 | 高 | 高 | Open | `backend/services/csv_parser_service.py:113`，實測 `examples/sample_usage_data.csv` 可重現 |
| R2 | 前端上傳流程未使用後端解析結果，且請求時固定 `start=now`、`freq=1h`，可能造成 TOU/夏月判斷偏差 | 前端計算準確性、使用者決策品質 | 高 | 高 | Open | `frontend/src/components/usage/CSVUploader.tsx:77`、`frontend/src/App.tsx:61` |
| R3 | 比較 API 吞掉錯誤後仍回傳 200 + 空結果，造成「看似成功」的誤導 | 後端 `/api/v1/calculate/compare`、前端 UX | 中 | 中 | Open | `backend/services/calculation_service.py:340`，以不存在 `plan_id` 實測回空陣列 |
| R4 | 啟動腳本以 `pkill -f` 清理服務，可能誤殺其他 uvicorn 程序 | 本機開發環境穩定性 | 中 | 中 | Open | `start-web.sh:14` |
| R5 | 版本控制納入 `node_modules`、`dist`、`__pycache__` 等產物，增加 PR 噪音與衝突風險 | 開發流程、Code Review、CI | 高 | 中 | Open | `git status --short` 顯示大量產物檔案 |

## Suggested Solution To-Do List

- [ ] R1: 修正 `total_usage` 計算邏輯，移除 `float(list)`，以 `sum()`/向量化方式計算並補上型別防護。
- [ ] R1: 新增 `CSVParserService.parse_csv` 單元測試，至少覆蓋「正常 CSV」「空檔」「非數值欄位」。
- [ ] R2: 前端改為透過 `/api/v1/upload/csv` 取得 `data/start/freq`，不要在 `App.tsx` 寫死時間與頻率。
- [ ] R2: 若後端回傳 validation warning，前端需顯示可見提示（非僅 `console.warn`）。
- [ ] R2: 針對 15 分鐘、1 小時、跨月份資料新增端到端測試，確認計算結果不偏移。
- [ ] R3: `compare` 在全部方案失敗時回 `4xx`（含可讀錯誤訊息），不要回空成功結果。
- [ ] R3: 針對部分失敗情境，回傳成功結果同時附帶 `failed_plans` 明細（或等價欄位）。
- [ ] R4: `start-web.sh` 改為只 `kill $BACKEND_PID` / `kill $FRONTEND_PID`，避免全域 pattern kill。
- [ ] R4: 補充啟動腳本錯誤處理（前端啟動失敗時同步清理 backend）。
- [ ] R5: 更新 `.gitignore`（frontend 與 repo root）排除建置/快取產物。
- [ ] R5: 從版本控制移除已納管產物，並在 CI 加入檢查避免再次提交。

## Execution Checklist

### Functional Fix Checklist

- [ ] `POST /api/v1/upload/csv` 對 `examples/sample_usage_data.csv` 回 200 且含 `parsed.statistics.total_usage_kwh`。
- [ ] 前端上傳後送出的 `calculate` request 使用 CSV 實際 `start`、`freq`。
- [ ] 上傳有 warning 的 CSV 時，UI 顯示警告訊息。
- [ ] `POST /api/v1/calculate/compare` 全部 plan 無效時回 4xx 並含錯誤原因。
- [ ] `POST /api/v1/calculate/compare` 部分 plan 失敗時仍回成功比較結果且可見失敗清單。

### Script and Repo Hygiene Checklist

- [ ] `start-web.sh` 僅終止本次啟動 PID，不影響其他 uvicorn。
- [ ] `git status --short` 不再出現 `frontend/node_modules`、`frontend/dist`、`__pycache__`。
- [ ] README 或開發文件補充「需先安裝 frontend 依賴後再啟動」步驟。

### Verification Checklist

- [ ] 後端測試：`pytest`（至少涵蓋 CSV 解析與 compare API）。
- [ ] 前端檢查：`npm run build`、`npm run lint`（若專案已配置）。
- [ ] 手動驗證：上傳 CSV -> 計算 -> 顯示月份/時段明細流程可完成。


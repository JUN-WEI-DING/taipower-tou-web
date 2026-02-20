# 臺電時間電價比較網站

一個純前端的臺灣時間電價（TOU）比較工具，上傳電費單即可找出最省錢的電價方案。

## ✨ 功能特點

- **📸 OCR 電費單識別**：上傳電費單圖片，自動識別用電資訊
- **💰 20+ 種費率方案比較**：涵蓋非時間電價、兩段式、三段式、完整時間電價
- **🔒 隱私保護**：純前端應用，所有資料都在瀏覽器處理，不上傳伺服器
- **📱 響應式設計**：支援桌面和行動裝置
- **♿ 無障礙支援**：支援鍵盤導航和螢幕閱讀器

## 🚀 快速開始

### 線上使用

直接造訪：https://jun-wei-ding.github.io/taipower-tou-web/

### 本地開發

#### 前置需求

- Node.js 18+
- npm 或 yarn

#### 安裝與執行

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開發伺服器將在 http://localhost:5173 啟動。

#### 建置生產版本

```bash
npm run build
```

建置結果將輸出至 `frontend/dist` 目錄。

## 🏗️ 專案結構

```
taipower-tou-web/
├── frontend/
│   ├── src/
│   │   ├── components/      # React 元件
│   │   ├── services/        # 業務邏輯
│   │   │   ├── calculation/ # 費率計算引擎
│   │   │   ├── ocr/         # OCR 服務
│   │   │   ├── parser/      # 電費單解析
│   │   │   └── data/        # 資料完整度偵測
│   │   ├── stores/          # Zustand 狀態管理
│   │   ├── types/           # TypeScript 型別定義
│   │   └── styles/          # 樣式檔案
│   ├── public/              # 靜態資源
│   └── index.html           # HTML 樣板
└── .github/
    └── workflows/           # GitHub Actions CI/CD
```

## 🧪 測試

```bash
# 執行單元測試
npm test

# 執行測試並產生覆蓋率報告
npm test -- --coverage
```

## 📦 技術棧

- **框架**：React 18 + TypeScript
- **建置工具**：Vite
- **狀態管理**：Zustand
- **樣式**：Tailwind CSS
- **OCR**：Tesseract.js (繁體中文)
- **圖表**：Recharts
- **測試**：Vitest

## 📊 支援的費率方案

| 方案型別 | 說明 |
|---------|------|
| 非時間電價 | 傳統累進電價 |
| 兩段式時間電價 | 尖峰 / 離峰 |
| 三段式時間電價 | 尖峰 / 半尖峰 / 離峰 |
| 完整時間電價 | 按時段細分費率 |

## 🔍 電費單識別

目前支援識別以下資訊：

- ✅ 計費期間
- ✅ 總用電度數
- ✅ 尖峰 / 半尖峰 / 離峰度數（如電費單有顯示）
- ✅ 電費單編號
- ✅ 使用者名稱稱

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🔗 相關專案

- [taipower-tou](https://github.com/JUN-WEI-DING/taipower-tou) - Python 版本的時間電價計算工具

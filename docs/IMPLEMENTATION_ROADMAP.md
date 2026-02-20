# 臺電時間電價比較網站 - 實作路線圖

## 專案現狀分析

### 現有資源

| 資源型別 | 內容 | 狀態 |
|----------|------|------|
| **技術規格書** | `docs/SPEC.md` | ✅ 完成 |
| **資料不完整解決方案** | `docs/MISSING_DATA_SOLUTION.md` | ✅ 完成 |
| **完整情境分析** | `docs/COMPLETE_SCENARIO_ANALYSIS.md` | ✅ 完成 |
| **Python 參考實作** | `/tmp/taipower-tou` | ✅ 已取得 |
| **費率資料** | `plans.json` | ⚠️ 需轉換格式 |
| **Frontend 骨架** | React + Vite + TypeScript | ⚠️ 需大幅重構 |

### 現有 Frontend 狀態

```
frontend/src/
├── components/
│   ├── forms/BillingInputsForm.tsx      ← 舊的表單（需重寫）
│   ├── plans/PlanSelector.tsx           ← 舊的選擇器（需重寫）
│   ├── usage/CSVUploader.tsx            ← CSV 上傳（需改為圖片上傳）
│   └── results/CostBreakdown.tsx        ← 舊的結果顯示（需重寫）
├── hooks/
│   ├── usePlans.ts                      ← 呼叫 API（需改為本地）
│   ├── useCalculation.ts                ← 呼叫 API（需改為本地）
│   └── useFileUpload.ts                 ← CSV 處理（需改為圖片）
├── api/
│   ├── client.ts                        ← Axios client（不再需要）
│   └── types.ts                         ← 舊型別（需擴充）
├── store/
│   └── calculationStore.ts              ← Zustand store（需重構）
├── App.tsx                              ← 主應用（需重寫）
└── main.tsx                             ← 進入點（保留）
```

### 需要新增的套件

| 套件 | 用途 | 優先順序 |
|------|------|--------|
| `tesseract.js` | OCR 文字識別 | P0 |
| `tailwindcss` | 響應式樣式 | P0 |
| `lucide-react` | 圖示 | P1 |
| `@radix-ui/react-*` | UI 元件基礎 | P1 |
| `date-fns` | 日期處理 | P1 |
| `vitest` | 單元測試 | P1 |
| `playwright` | E2E 測試 | P2 |

---

## 實作階段規劃

### 🎯 階段 0：準備工作（1-2 天）

#### 任務清單

- [ ] **設定 Git 分支策略**
  - 建立 `develop` 分支
  - 建立 feature 分支模板
  - 設定保護分支規則

- [ ] **安裝必要套件**
  ```bash
  cd frontend
  npm install tesseract.js
  npm install tailwindcss postcss autoprefixer
  npm install lucide-react
  npm install @radix-ui/react-dialog @radix-ui/react-radio-group @radix-ui/react-slider
  npm install date-fns
  npm install -D vitest @vitest/ui @playwright/test
  ```

- [ ] **設定 Tailwind CSS**
  - 初始化 Tailwind 配置
  - 設定 CSS 變數
  - 建立基礎元件樣式

- [ ] **準備費率資料**
  - 從 `/tmp/taipower-tou` 轉換 `plans.json`
  - 放置到 `public/data/plans.json`
  - 建立 TypeScript 型別定義

- [ ] **建立專案結構**
  ```bash
  frontend/src/
  ├── components/
  │   ├── layout/           # 佈局元件
  │   ├── upload/           # 上傳相關
  │   ├── ocr/              # OCR 相關
  │   ├── form/             # 表單元件
  │   ├── results/          # 結果展示
  │   └── ui/               # 通用 UI 元件
  ├── services/             # 服務層（新增）
  │   ├── ocr/
  │   ├── parser/
  │   ├── calculation/
  │   └── comparison/
  ├── stores/               # 狀態管理
  ├── hooks/                # 自訂 Hooks
  ├── utils/                # 工具函式
  ├── types/                # 型別定義
  └── styles/               # 樣式
  ```

---

### 🎯 階段 1：基礎架構（3-5 天）

#### 1.1 型別定義系統

**檔案**: `frontend/src/types/index.d.ts`

```typescript
// 資料完整度等級
enum DataCompletenessLevel {
  TOTAL_ONLY = 'total_only',
  TWO_TIER = 'two_tier',
  THREE_TIER = 'three_tier',
}

// 估算模式
enum EstimationMode {
  AVERAGE = 'average',
  HOME_DURING_DAY = 'home_during_day',
  NIGHT_OWL = 'night_owl',
  CUSTOM = 'custom',
}

// 電費單資料
interface BillData {
  customerName?: string;
  accountNumber?: string;
  billingPeriod: { start: Date; end: Date };
  consumption: {
    total: number;
    peakOnPeak?: number;
    semiPeak?: number;
    offPeak?: number;
  };
  currentPlan?: {
    id: string;
    name: string;
    type: 'non_tou' | 'two_tier' | 'three_tier';
  };
  source: {
    type: 'ocr' | 'manual';
    completenessLevel: DataCompletenessLevel;
  };
}

// 費率方案
interface Plan {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  touType: 'none' | 'simple_2_tier' | 'simple_3_tier' | 'full_tou';
  // ... 更多欄位
}

// 計算結果
interface PlanCalculationResult {
  planId: string;
  planName: string;
  charges: { base: number; energy: number; total: number };
  label: {
    accuracy: 'accurate' | 'estimated' | 'partial_estimated';
    badge: string;
    tooltip: string;
  };
  comparison: {
    rank: number;
    difference: number;
    savingPercentage: number;
  };
}
```

#### 1.2 狀態管理 (Zustand)

**檔案**: `frontend/src/stores/useAppStore.ts`

```typescript
interface AppStore {
  // 階段
  stage: 'upload' | 'confirm' | 'result';

  // 電費單資料
  billData: BillData | null;
  setBillData: (data: BillData) => void;

  // OCR 狀態
  ocrStatus: 'idle' | 'processing' | 'done' | 'error';
  ocrProgress: number;
  setOcrStatus: (status: OcrStatus, progress?: number) => void;

  // 估算設定
  estimationMode: EstimationMode;
  setEstimationMode: (mode: EstimationMode) => void;

  // 計算結果
  results: PlanCalculationResult[];
  setResults: (results: PlanCalculationResult[]) => void;

  // 重置
  reset: () => void;
}
```

#### 1.3 費率資料載入器

**檔案**: `frontend/src/services/calculation/plans.ts`

```typescript
// 從 public/data/plans.json 載入費率資料
// 提供查詢和篩選功能

class PlansLoader {
  private static plans: Plan[] | null = null;

  static async load(): Promise<Plan[]> {
    if (this.plans) return this.plans;

    const response = await fetch('/data/plans.json');
    const data = await response.json();
    this.plans = data.plans;
    return this.plans;
  }

  static getById(id: string): Plan | undefined {
    return this.plans?.find(p => p.id === id);
  }

  static getAvailablePlans(voltageType: string): Plan[] {
    return this.plans?.filter(p => /* 篩選邏輯 */) || [];
  }
}
```

---

### 🎯 階段 2：OCR 模組（5-7 天）

#### 2.1 OCR 服務

**檔案**: `frontend/src/services/ocr/OCRService.ts`

```typescript
class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    this.worker = await createWorker('chi_tra');
  }

  async recognize(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    // 1. 圖片預處理
    // 2. 執行 OCR
    // 3. 回傳結果與信心度
  }

  async terminate(): Promise<void> {
    await this.worker?.terminate();
  }
}
```

#### 2.2 圖片預處理

**檔案**: `frontend/src/services/ocr/ImagePreprocessor.ts`

```typescript
class ImagePreprocessor {
  static async compress(file: File, maxSize: number): Promise<string> {
    // 使用 Canvas 壓縮圖片
  }

  static async toGrayscale(dataUrl: string): Promise<string> {
    // 轉換為灰階
  }

  static async binarize(dataUrl: string): Promise<string> {
    // 二值化處理
  }
}
```

#### 2.3 電費單解析器

**檔案**: `frontend/src/services/parser/BillParser.ts`

```typescript
class BillParser {
  private static PATTERNS = {
    accountNumber: /電號[:\s]*([0-9]{8,10})/,
    date: /中華民國(\d{2,3})年(\d{1,2})月/,
    consumption: /本期度數[:\s]*([\d,]+)/,
    // ... 更多模式
  };

  static parse(ocrResult: OCRResult): ParsedBill {
    // 1. 提取各欄位
    // 2. 驗證合理性
    // 3. 判斷資料完整度
  }

  static detectCompleteness(parsed: ParsedBill): DataCompletenessLevel {
    // 判斷資料完整度等級
  }
}
```

#### 2.4 UI 元件

**檔案**: `frontend/src/components/upload/UploadZone.tsx`

```tsx
// 支援拖曳、點選上傳、相機
// 顯示圖片預覽
// 觸發 OCR 識別
```

**檔案**: `frontend/src/components/ocr/OCRProgress.tsx`

```tsx
// 顯示 OCR 載入進度
// 顯示識別階段（初始化、識別中、完成）
```

---

### 🎯 階段 3：資料完整度處理（3-5 天）

#### 3.1 資料完整度偵測

**檔案**: `frontend/src/services/data/DataCompletenessDetector.ts`

```typescript
class DataCompletenessDetector {
  static detect(parsedBill: ParsedBill): CompletenessReport {
    return {
      level: DataCompletenessLevel.TOTAL_ONLY,
      canCalculateAccurately: ['non_tou'],
      needsEstimation: ['two_tier', 'three_tier'],
      needsSplit: [],
    };
  }
}
```

#### 3.2 用電習慣選擇器（情境 A）

**檔案**: `frontend/src/components/habit/UsageHabitSelector.tsx`

```tsx
// 顯示四種用電習慣卡片
// 一般上班族家庭、白天在家、夜貓子、自訂
```

**檔案**: `frontend/src/services/calculation/UsageEstimator.ts`

```typescript
class UsageEstimator {
  static estimateByHabit(
    total: number,
    habit: EstimationMode,
    season: 'summer' | 'non_summer'
  ): TOUConsumption {
    // 根據用電習慣估算時段分配
  }
}
```

#### 3.3 兩段式拆分器（情境 B）

**檔案**: `frontend/src/components/split/SplitModeSelector.tsx`

```tsx
// 選擇拆分方式
// 預設、保守、積極、自訂
```

**檔案**: `frontend/src/services/calculation/TwoTierSplitter.ts`

```typescript
class TwoTierSplitter {
  static split(
    peak: number,
    offPeak: number,
    mode: SplitMode
  ): TOUConsumption {
    // 從兩段式拆分為三段式
  }
}
```

---

### 🎯 階段 4：費率計算引擎（7-10 天）

#### 4.1 核心計算引擎

**檔案**: `frontend/src/services/calculation/RateCalculator.ts`

```typescript
class RateCalculator {
  /**
   * 計算所有可用方案
   */
  calculateAll(input: CalculationInput): PlanCalculationResult[] {
    const season = this.determineSeason(input.billingPeriod);
    const processedInput = this.ensureTOUData(input, season);
    const plans = PlansLoader.getAvailablePlans(input.voltageType);

    return plans.map(plan =>
      this.calculatePlan(plan, processedInput, season)
    );
  }

  /**
   * 非時間電價計算
   */
  private calculateNonTOU(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    // 累進費率計算邏輯
  }

  /**
   * 兩段式時間電價計算
   */
  private calculateSimple2Tier(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    // 兩段式計算邏輯
  }

  /**
   * 三段式時間電價計算
   */
  private calculateSimple3Tier(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    // 三段式計算邏輯
  }

  /**
   * 判斷季節
   */
  private determineSeason(period: DateRange): Season {
    // 夏月：6-9月，非夏月：10-5月
  }

  /**
   * 確保有時段資料（處理缺失資料）
   */
  private ensureTOUData(
    input: CalculationInput,
    season: Season
  ): CalculationInput {
    // 如果沒有時段資料，使用估算
  }
}
```

#### 4.2 結果標籤系統

**檔案**: `frontend/src/services/calculation/ResultLabeler.ts`

```typescript
class ResultLabeler {
  static label(
    result: PlanCalculationResult,
    inputData: BillData,
    targetPlan: Plan
  ): ResultWithLabel {
    return {
      ...result,
      label: {
        accuracy: 'accurate' | 'estimated' | 'partial_estimated',
        badge: '✅ 準確' | '⚠️ 估算' | '⚠️ 部分估算',
        tooltip: '...',
      },
    };
  }
}
```

---

### 🎯 階段 5：結果展示（3-5 天）

#### 5.1 方案列表

**檔案**: `frontend/src/components/results/PlanList.tsx`

```tsx
// 顯示所有方案排名
// 依電費由低到高排序
```

#### 5.2 方案卡片

**檔案**: `frontend/src/components/results/PlanCard.tsx`

```tsx
// 顯示單一方案
// 包含：名稱、電費、排名、準確度標籤
// 與當前方案比較
```

#### 5.3 圖表展示

**檔案**: `frontend/src/components/results/ResultChart.tsx`

```tsx
// 使用 Recharts 顯示長條圖
// 比較各方案電費
```

#### 5.4 結果標籤

**檔案**: `frontend/src/components/results/ResultBadge.tsx`

```tsx
// 顯示準確度標籤
// ✅ 準確 / ⚠️ 估算 / ⚠️ 部分估算
```

---

### 🎯 階段 6：UI/UX 完善（3-5 天）

#### 6.1 主要頁面流程

**檔案**: `frontend/src/App.tsx`

```tsx
// 階段 1: 上傳頁面
// 階段 2: 確認/選擇頁面
// 階段 3: 結果頁面
```

#### 6.2 響應式設計

- 手機版（320px+）
- 平板版（768px+）
- 桌面版（1024px+）

#### 6.3 無障礙

- ARIA 屬性
- 鍵盤導航
- 色彩對比

---

### 🎯 階段 7：測試（5-7 天）

#### 7.1 單元測試

**目標覆蓋率**: ≥ 80%

```typescript
// tests/unit/
// ├── services/ocr/OCRService.test.ts
// ├── services/parser/BillParser.test.ts
// ├── services/calculation/RateCalculator.test.ts
// ├── services/calculation/UsageEstimator.test.ts
// └── services/calculation/TwoTierSplitter.test.ts
```

#### 7.2 整合測試

```typescript
// tests/integration/
// ├── bill-to-calculation.test.ts
// └── ocr-to-result.test.ts
```

#### 7.3 E2E 測試

```typescript
// tests/e2e/
// ├── complete-flow.spec.ts
// ├── non-tou-to-tou.spec.ts
// └── two-tier-to-three-tier.spec.ts
```

#### 7.4 OCR 準確度測試

```typescript
// tests/ocr-accuracy/
// ├── accuracy-test.ts
// └── fixtures/
//     ├── non-tou-bills/
//     ├── two-tier-bills/
//     └── three-tier-bills/
```

---

### 🎯 階段 8：部署（1-2 天）

#### 8.1 GitHub Pages 設定

**檔案**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/dist
      - uses: actions/deploy-pages@v4
```

#### 8.2 Vite 配置

**檔案**: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  base: '/taipower-tou-web/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'tesseract': ['tesseract.js'],
          'recharts': ['recharts'],
        },
      },
    },
  },
});
```

---

## 任務優先順序矩陣

| 任務 | 重要性 | 緊急度 | 優先順序 |
|------|--------|--------|--------|
| 費率資料轉換 | 高 | 高 | P0 |
| 型別定義系統 | 高 | 高 | P0 |
| OCR 服務 | 高 | 高 | P0 |
| 電費單解析器 | 高 | 高 | P0 |
| 資料完整度偵測 | 高 | 高 | P0 |
| 用電習慣選擇 | 高 | 中 | P0 |
| 核心計算引擎 | 高 | 高 | P0 |
| 結果展示 | 高 | 中 | P1 |
| 兩段式拆分 | 中 | 中 | P1 |
| 圖表展示 | 中 | 低 | P2 |
| 響應式設計 | 中 | 中 | P2 |
| 測試 | 高 | 中 | P2 |
| E2E 測試 | 中 | 低 | P3 |

---

## 預估工時

| 階段 | 任務 | 預估工時 | 依賴 |
|------|------|----------|------|
| 0 | 準備工作 | 1-2 天 | - |
| 1 | 基礎架構 | 3-5 天 | 階段 0 |
| 2 | OCR 模組 | 5-7 天 | 階段 1 |
| 3 | 資料完整度處理 | 3-5 天 | 階段 1, 2 |
| 4 | 費率計算引擎 | 7-10 天 | 階段 1, 3 |
| 5 | 結果展示 | 3-5 天 | 階段 4 |
| 6 | UI/UX 完善 | 3-5 天 | 階段 5 |
| 7 | 測試 | 5-7 天 | 階段 2-6 |
| 8 | 部署 | 1-2 天 | 階段 7 |
| **總計** | | **31-48 天** | |

---

## 里程碑

| 里程碑 | 目標 | 預計日期 |
|--------|------|----------|
| M1 | 基礎架構完成 | Day 7 |
| M2 | OCR 可以識別電費單 | Day 14 |
| M3 | 可以計算並顯示結果 | Day 24 |
| M4 | 處理所有資料不完整情境 | Day 29 |
| M5 | 測試透過並部署 | Day 48 |

---

## 風險與緩解

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| OCR 準確度不足 | 高 | 1. 圖片預處理<br>2. 手動修正介面<br>3. 持續最佳化 |
| 計算邏輯錯誤 | 高 | 1. 與 Python 版本比對<br>2. 完整測試<br>3. 邊界案例測試 |
| 進度延遲 | 中 | 1. 優先實作 P0 功能<br>2. 分階段上線 |
| Tesseract.js 效能 | 中 | 1. 圖片壓縮<br>2. Web Worker |
| 電費單格式多樣 | 高 | 1. 收集多種樣本<br>2. 彈性解析邏輯 |

---

## 下一步行動

1. **建立 develop 分支**
2. **安裝必要套件**
3. **開始階段 1：基礎架構**
   - 建立型別定義
   - 設定 Zustand store
   - 載入費率資料

是否開始實作？

/**
 * 臺電時間電價比較網站 - 核心型別定義
 */

/**
 * 資料完整度等級
 */
export enum DataCompletenessLevel {
  /**
   * 等級 1：只有總用電度數
   * 來源：非時間電價電費單
   */
  TOTAL_ONLY = 'total_only',

  /**
   * 等級 2：兩段式時間電價資料
   * 來源：兩段式時間電價電費單
   */
  TWO_TIER = 'two_tier',

  /**
   * 等級 3：三段式時間電價資料
   * 來源：三段式時間電價電費單
   */
  THREE_TIER = 'three_tier',
}

/**
 * 估算模式
 */
export enum EstimationMode {
  /** 一般上班族家庭（平均） */
  AVERAGE = 'average',
  /** 白天在家的家庭 */
  HOME_DURING_DAY = 'home_during_day',
  /** 夜貓子型 */
  NIGHT_OWL = 'night_owl',
  /** 自訂比例 */
  CUSTOM = 'custom',
}

/**
 * 時段定義
 */
export interface TimeSlot {
  period: Period;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

/**
 * 每日用電模式
 */
export interface DailyUsagePattern {
  weekday: number;  // 週一至週五每日用電
  saturday: number; // 週六用電
  sunday: number;   // 週日/假日用電
}

/**
 * 拆分模式（兩段式 → 三段式）
 */
export enum SplitMode {
  /** 預設：依時段長度比例 */
  DEFAULT = 'default',
  /** 保守：尖峰用電較多 */
  CONSERVATIVE = 'conservative',
  /** 積極：半尖峰用電較多 */
  AGGRESSIVE = 'aggressive',
  /** 自訂 */
  CUSTOM = 'custom',
}

/**
 * 季節
 */
export interface Season {
  name: 'summer' | 'non_summer';
  start: string; // "MM-DD"
  end: string;   // "MM-DD"
}

/**
 * 時段
 */
export type Period = 'peak' | 'semi_peak' | 'off_peak' | 'flat';

/**
 * 日期型別
 */
export type DayType = 'weekday' | 'saturday' | 'sunday_holiday';

/**
 * 時段定義
 */
export interface TimeSlot {
  period: Period;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

/**
 * 最低用電規則
 */
export interface MinimumUsageRule {
  label: string;
  phase: 'single' | 'three';
  voltage_v: number;
  ampere_threshold: number;
  kwh_per_ampere: number;
  kwh_per_ampere_over?: number;
}

/**
 * 計費規則
 */
export interface BillingRules {
  min_monthly_fee?: number;
  minimum_usage_rules_ref?: string;
  billing_cycle_months?: number;
  over_2000_kwh_surcharge?: { threshold_kwh: number; cost_per_kwh: number };
}

/**
 * 費率方案
 */
export interface Plan {
  id: string;
  name: string;
  nameEn: string;
  type: 'residential' | 'lighting' | 'commercial';
  category?: 'lighting' | 'residential' | 'commercial' | 'low_voltage' | 'high_voltage' | 'extra_high_voltage';
  touType: 'none' | 'simple_2_tier' | 'simple_3_tier' | 'full_tou';
  voltage: 'low_voltage' | 'high_voltage';
  phase?: 'single' | 'three';
  requiresMeter: boolean;
  minimumConsumption: number | null;

  // 費率資料
  basicCharges: BasicChargeRate[];
  energyCharges: {
    summer: EnergyChargeRate[];
    nonSummer: EnergyChargeRate[];
  };

  // 時間電價專用
  timeSlots?: {
    weekday: TimeSlot[];
    saturday: TimeSlot[];
    sundayHoliday: TimeSlot[];
  };

  // 累進費率專用
  tierRates?: TierRate[];

  // 季節定義
  seasons: {
    summer: Season;
    nonSummer: Season;
  };

  // 計費規則（最低用電、基本電費等）
  billingRules?: BillingRules;

  // 原始資料（用於訪問最低用電規則等）
  raw?: {
    basic_fee?: number;
    billing_rules?: BillingRules;
  };
}

/**
 * 基本電費率
 */
export interface BasicChargeRate {
  voltageType: 'low_voltage' | 'high_voltage';
  phase: 'single' | 'three';
  capacityRange: {
    min: number;
    max: number | null;
  };
  summerRate: number;
  nonSummerRate: number;
}

/**
 * 流動電費率
 */
export interface EnergyChargeRate {
  period: Period;
  rate: number; // 元/kWh
}

/**
 * 累進費率
 */
export interface TierRate {
  tier: number;
  minKwh: number;
  maxKwh: number | null;
  summerRate: number; // 夏季費率 (元/kWh)
  nonSummerRate: number; // 非夏季費率 (元/kWh)
}

/**
 * 費率資料集
 */
export interface PlansData {
  version: string;
  plans: Plan[];
}

/**
 * 時段用電資料
 */
export interface TOUConsumption {
  peakOnPeak: number;
  semiPeak: number;
  offPeak: number;
  total?: number;
  isEstimated?: boolean;
  estimationMode?: EstimationMode;
}

/**
 * 計算期間
 */
export interface BillingPeriod {
  start: Date;
  end: Date;
  days: number;
}

/**
 * 用電資料
 */
export interface Consumption {
  previousReading: number;
  currentReading: number;
  usage: number;
  multiplier: number;
}

/**
 * 當前方案資訊
 */
export interface CurrentPlan {
  name: string;
  baseCharge: number;
  energyCharge: number;
  total: number;
}

/**
 * OCR 識別結果
 */
export interface OCRResult {
  text: string;
  confidence: number;
  words: {
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }[];
  processingTime: number;
}

/**
 * 電費單資料（完整）
 */
export interface BillData {
  customerName?: string;
  accountNumber?: string;
  billingPeriod: BillingPeriod;
  consumption: Consumption & Partial<TOUConsumption>;
  currentPlan?: CurrentPlan;
  // 契約容量資訊 - 影響基本電費和最低用電計算
  contractCapacity?: number; // 安培數 (10, 15, 20, etc.)
  voltageType?: '110' | '220'; // 電壓型別
  phaseType?: 'single' | 'three'; // 相位型別
  ocrMetadata?: {
    confidence: number;
    fieldConfidences: { [field: string]: number };
    processingTime: number;
  };
  source: {
    type: 'ocr' | 'manual';
    completenessLevel: DataCompletenessLevel;
    isEstimated: boolean;
    estimationMode?: EstimationMode;
    splitMode?: SplitMode;
  };
}

/**
 * 計算輸入
 */
export interface CalculationInput {
  consumption: number;
  touConsumption?: TOUConsumption;
  billingPeriod: BillingPeriod;
  voltageType: 'low_voltage' | 'high_voltage';
  voltageV?: number; // 實際電壓值 (110, 220, etc.) - 用於最低用電計算
  phase: 'single' | 'three';
  contractCapacity?: number;
  estimationSettings?: {
    mode: EstimationMode;
    season: 'summer' | 'non_summer';
    customPercents?: {
      peakOnPeak: number;
      semiPeak: number;
      offPeak: number;
    };
  };
}

/**
 * 費用明細
 */
export interface Charges {
  base: number;
  energy: number;
  total: number;
}

/**
 * 明細專案
 */
export interface BreakdownItem {
  tier?: number;
  period?: Period;
  kwh: number;
  rate: number;
  charge: number;
  label?: string; // 用於特殊專案如附加費（此時 period 為空）
}

/**
 * 計算明細
 */
export interface Breakdown {
  tierBreakdown?: BreakdownItem[];
  touBreakdown?: BreakdownItem[];
}

/**
 * 結果標籤
 */
export interface ResultLabel {
  accuracy: 'accurate' | 'estimated' | 'partial_estimated';
  badge: string;
  tooltip: string;
  detail?: string;
}

/**
 * 比較結果
 */
export interface Comparison {
  isCurrentPlan: boolean;
  rank: number;
  difference: number;
  savingPercentage: number;
}

/**
 * 季節資訊
 */
export interface SeasonInfo {
  season: 'summer' | 'non_summer';
  isSummer: boolean;
}

/**
 * 方案計算結果
 */
export interface PlanCalculationResult {
  planId: string;
  planName: string;
  planNameEn: string;
  charges: Charges;
  breakdown: Breakdown;
  label: ResultLabel;
  comparison: Comparison;
  seasonInfo: SeasonInfo;
}

/**
 * 計算回應
 */
export interface CalculationResponse {
  input: {
    consumption: number;
    billingPeriod: BillingPeriod;
  };
  results: PlanCalculationResult[];
  recommendations: {
    cheapestPlan: {
      planId: string;
      planName: string;
      totalCost: number;
    };
    maximumSaving: {
      planId: string;
      planName: string;
      amount: number;
      percentage: number;
    };
    switchablePlans: string[];
  };
}

/**
 * 資料完整度報告
 */
export interface CompletenessReport {
  level: DataCompletenessLevel;
  canCalculateAccurately: string[];
  needsEstimation: string[];
  needsSplit: string[];
}

/**
 * 解析的電費單
 */
export interface ParsedBill {
  customerName?: string;
  accountNumber?: string;
  billingPeriod: BillingPeriod;
  consumption: Consumption & Partial<TOUConsumption>;
  currentPlan?: CurrentPlan;
  confidences: {
    [field: string]: number;
  };
}

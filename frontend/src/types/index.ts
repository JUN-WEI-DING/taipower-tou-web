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
 * 費率方案
 */
export interface Plan {
  id: string;
  name: string;
  nameEn: string;
  type: 'residential' | 'lighting' | 'commercial';
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
  ocrMetadata?: {
    confidence: number;
    fieldConfidences: { [key: string]: number };
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

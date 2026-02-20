import type { OCRResult } from '../../types';
import type { ParsedBill, BillingPeriod, Consumption } from '../../types';
import { DataCompletenessLevel } from '../../types';

/**
 * 電費單解析器
 *
 * 從 OCR 識別的文字中提取關鍵欄位
 */
export class BillParser {
  /**
   * 正規表示式模式
   */
  private static PATTERNS = {
    // 電號: 8-10 位數字
    accountNumber: /電號[:\s]*([0-9]{8,10})/,

    // 日期: 中華民國 XXX 年 XX 月 XX 日
    date: /中華民國(\d{2,3})年(\d{1,2})月(\d{1,2})日/,

    // 月度: 中華民國 XXX 年 XX 月
    month: /中華民國(\d{2,3})年(\d{1,2})月/,

    // 用電度數 - 多種格式
    consumption: [
      /本期度數[:\s]*([\d,]+)/,
      /用電度數[:\s]*([\d,]+)/,
      /計費度數[:\s]*([\d,]+)/,
      /總用電[:\s]*([\d,]+)/,
      /流動電費.*?度數[:\s]*([\d,]+)/,
    ],

    // 電費金額
    amount: [
      /電費小計[:\s]*\$?([\d,]+)/,
      /應繳總額[:\s]*\$?([\d,]+)/,
      /本期電費[:\s]*\$?([\d,]+)/,
      /流動電費[:\s]*\$?([\d,]+)/,
    ],

    // 方案名稱
    planName: [
      /電價方案[:\s]*([^\s\n]+)/,
      /計費方式[:\s]*([^\s\n]+)/,
      /用電類別[:\s]*([^\s\n]+)/,
    ],

    // 尖峰用電
    peakConsumption: [
      /尖峰.*?度數[:\s]*([\d,]+)/,
      /尖峰用電[:\s]*([\d,]+)/,
    ],

    // 離峰用電
    offPeakConsumption: [
      /離峰.*?度數[:\s]*([\d,]+)/,
      /離峰用電[:\s]*([\d,]+)/,
      /非尖峰.*?度數[:\s]*([\d,]+)/,
    ],

    // 半尖峰用電
    semiPeakConsumption: [
      /半尖峰.*?度數[:\s]*([\d,]+)/,
      /半尖峰用電[:\s]*([\d,]+)/,
    ],
  };

  /**
   * 解析電費單
   */
  static parse(ocrResult: OCRResult): ParsedBill {
    const text = ocrResult.text;
    const confidences: { [field: string]: number } = {};

    // 提取電號
    const accountNumber = this.extractField(text, this.PATTERNS.accountNumber, 'accountNumber', confidences);

    // 提取日期
    const billingPeriod = this.extractBillingPeriod(text, confidences);

    // 提取用電度數
    const consumption = this.extractConsumption(text, confidences);

    // 提取電費金額
    const currentPlan = this.extractCurrentPlan(text, confidences);

    return {
      customerName: undefined, // 通常需要更複雜的解析
      accountNumber,
      billingPeriod,
      consumption,
      currentPlan,
      confidences,
    };
  }

  /**
   * 提取單一欄位
   */
  private static extractField(
    text: string,
    pattern: RegExp,
    fieldName: string,
    confidences: { [field: string]: number }
  ): string | undefined {
    const match = text.match(pattern);
    if (match && match[1]) {
      // 記錄信心度（簡化：使用預設值）
      confidences[fieldName] = 0.8;
      return match[1].replace(',', '');
    }
    return undefined;
  }

  /**
   * 提取計費期間
   */
  private static extractBillingPeriod(
    text: string,
    confidences: { [field: string]: number }
  ): BillingPeriod {
    // 嘗試匹配完整日期
    const dateMatch = text.match(this.PATTERNS.date);
    if (dateMatch) {
      const year = 1911 + parseInt(dateMatch[1], 10); // 民國轉西元
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month - 1, day);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      confidences.billingPeriod = 0.9;

      return {
        start: startDate,
        end: endDate,
        days: days || 30,
      };
    }

    // 嘗試匹配月度
    const monthMatch = text.match(this.PATTERNS.month);
    if (monthMatch) {
      const year = 1911 + parseInt(monthMatch[1], 10);
      const month = parseInt(monthMatch[2], 10);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // 月底
      const days = endDate.getDate();

      confidences.billingPeriod = 0.8;

      return {
        start: startDate,
        end: endDate,
        days,
      };
    }

    // 預設：使用當前月份
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    confidences.billingPeriod = 0.3;

    return {
      start: startDate,
      end: endDate,
      days: endDate.getDate(),
    };
  }

  /**
   * 提取用電資訊
   */
  private static extractConsumption(
    text: string,
    confidences: { [field: string]: number }
  ): Consumption & {
    peakOnPeak?: number;
    semiPeak?: number;
    offPeak?: number;
  } {
    // 提取總用電
    let total = 0;
    for (const pattern of this.PATTERNS.consumption) {
      const match = text.match(pattern);
      if (match && match[1]) {
        total = parseInt(match[1].replace(',', ''), 10);
        break;
      }
    }

    // 提取尖峰用電
    let peakOnPeak: number | undefined;
    for (const pattern of this.PATTERNS.peakConsumption) {
      const match = text.match(pattern);
      if (match && match[1]) {
        peakOnPeak = parseInt(match[1].replace(',', ''), 10);
        break;
      }
    }

    // 提取離峰用電
    let offPeak: number | undefined;
    for (const pattern of this.PATTERNS.offPeakConsumption) {
      const match = text.match(pattern);
      if (match && match[1]) {
        offPeak = parseInt(match[1].replace(',', ''), 10);
        break;
      }
    }

    // 提取半尖峰用電
    let semiPeak: number | undefined;
    for (const pattern of this.PATTERNS.semiPeakConsumption) {
      const match = text.match(pattern);
      if (match && match[1]) {
        semiPeak = parseInt(match[1].replace(',', ''), 10);
        break;
      }
    }

    confidences.consumption = total > 0 ? 0.9 : 0.3;

    return {
      previousReading: 0, // 通常需要更複雜的解析
      currentReading: total,
      usage: total,
      multiplier: 1,
      peakOnPeak,
      semiPeak,
      offPeak,
    };
  }

  /**
   * 提取當前方案資訊
   */
  private static extractCurrentPlan(
    text: string,
    confidences: { [field: string]: number }
  ): { name: string; baseCharge: number; energyCharge: number; total: number } | undefined {
    // 提取方案名稱
    let name: string | undefined;
    for (const pattern of this.PATTERNS.planName) {
      const match = text.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    // 提取金額
    let total = 0;
    for (const pattern of this.PATTERNS.amount) {
      const match = text.match(pattern);
      if (match && match[1]) {
        total = parseInt(match[1].replace(',', ''), 10);
        break;
      }
    }

    if (name || total > 0) {
      confidences.currentPlan = 0.7;

      return {
        name: name || '未知方案',
        baseCharge: 0, // 通常需要更複雜的解析
        energyCharge: total,
        total,
      };
    }

    return undefined;
  }

  /**
   * 偵測資料完整度
   */
  static detectCompleteness(parsed: ParsedBill): DataCompletenessLevel {
    const hasPeak = parsed.consumption.peakOnPeak !== undefined && parsed.consumption.peakOnPeak > 0;
    const hasSemiPeak = parsed.consumption.semiPeak !== undefined && parsed.consumption.semiPeak > 0;
    const hasOffPeak = parsed.consumption.offPeak !== undefined && parsed.consumption.offPeak > 0;

    if (hasPeak && hasSemiPeak && hasOffPeak) {
      return DataCompletenessLevel.THREE_TIER;
    }

    if (hasPeak && hasOffPeak && !hasSemiPeak) {
      return DataCompletenessLevel.TWO_TIER;
    }

    return DataCompletenessLevel.TOTAL_ONLY;
  }

  /**
   * 驗證解析結果
   */
  static validate(parsed: ParsedBill): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查用電度數
    if (parsed.consumption.usage <= 0) {
      errors.push('用電度數無效');
    }

    // 檢查計費期間
    if (parsed.billingPeriod.days <= 0 || parsed.billingPeriod.days > 31) {
      errors.push('計費期間無效');
    }

    // 檢查時段用電合理性
    const { peakOnPeak = 0, semiPeak = 0, offPeak = 0 } = parsed.consumption;
    const total = parsed.consumption.usage;

    if (peakOnPeak + semiPeak + offPeak > total * 1.1) {
      errors.push('時段用電總和超過總用電');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 取得資料完整度報告
   */
  static getCompletenessReport(parsed: ParsedBill): {
    level: DataCompletenessLevel;
    canCalculateAccurately: string[];
    needsEstimation: string[];
    needsSplit: string[];
  } {
    const level = this.detectCompleteness(parsed);

    switch (level) {
      case DataCompletenessLevel.THREE_TIER:
        return {
          level,
          canCalculateAccurately: ['non_tou', 'simple_2_tier', 'simple_3_tier', 'full_tou'],
          needsEstimation: [],
          needsSplit: [],
        };

      case DataCompletenessLevel.TWO_TIER:
        return {
          level,
          canCalculateAccurately: ['non_tou', 'simple_2_tier'],
          needsEstimation: [],
          needsSplit: ['simple_3_tier', 'full_tou'],
        };

      case DataCompletenessLevel.TOTAL_ONLY:
        return {
          level,
          canCalculateAccurately: ['non_tou'],
          needsEstimation: ['simple_2_tier', 'simple_3_tier', 'full_tou'],
          needsSplit: [],
        };

      default:
        return {
          level: DataCompletenessLevel.TOTAL_ONLY,
          canCalculateAccurately: [],
          needsEstimation: [],
          needsSplit: [],
        };
    }
  }
}

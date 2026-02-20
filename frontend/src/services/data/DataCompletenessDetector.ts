import type { BillData, CompletenessReport } from '../../types';
import { DataCompletenessLevel } from '../../types';

/**
 * 資料完整度偵測器
 *
 * 判斷電費單資料的完整度，並分析可計算的方案
 */
export class DataCompletenessDetector {
  /**
   * 偵測資料完整度
   */
  static detect(billData: BillData): CompletenessReport {
    const level = this.determineLevel(billData);

    return {
      level,
      canCalculateAccurately: this.getCanCalculateAccurately(level),
      needsEstimation: this.getNeedsEstimation(level),
      needsSplit: this.getNeedsSplit(level),
    };
  }

  /**
   * 判斷資料完整度等級
   */
  private static determineLevel(billData: BillData): DataCompletenessLevel {
    const { consumption } = billData;

    const hasTotal = consumption.usage > 0;
    const hasPeak = consumption.peakOnPeak !== undefined && consumption.peakOnPeak > 0;
    const hasSemiPeak = consumption.semiPeak !== undefined && consumption.semiPeak > 0;
    const hasOffPeak = consumption.offPeak !== undefined && consumption.offPeak > 0;

    // 三段式：有完整時段資料
    if (hasTotal && hasPeak && hasSemiPeak && hasOffPeak) {
      return DataCompletenessLevel.THREE_TIER;
    }

    // 兩段式：有尖峰和離峰，沒有半尖峰
    if (hasTotal && hasPeak && hasOffPeak && !hasSemiPeak) {
      return DataCompletenessLevel.TWO_TIER;
    }

    // 非時間電價：只有總用電
    if (hasTotal && !hasPeak && !hasSemiPeak && !hasOffPeak) {
      return DataCompletenessLevel.TOTAL_ONLY;
    }

    // 預設：當作只有總用電
    return DataCompletenessLevel.TOTAL_ONLY;
  }

  /**
   * 取得可準確計算的方案
   */
  private static getCanCalculateAccurately(level: DataCompletenessLevel): string[] {
    switch (level) {
      case DataCompletenessLevel.THREE_TIER:
        return ['non_tou', 'simple_2_tier', 'simple_3_tier', 'full_tou'];

      case DataCompletenessLevel.TWO_TIER:
        return ['non_tou', 'simple_2_tier'];

      case DataCompletenessLevel.TOTAL_ONLY:
        return ['non_tou'];

      default:
        return [];
    }
  }

  /**
   * 取得需要估算的方案
   */
  private static getNeedsEstimation(level: DataCompletenessLevel): string[] {
    switch (level) {
      case DataCompletenessLevel.TOTAL_ONLY:
        return ['simple_2_tier', 'simple_3_tier', 'full_tou'];

      default:
        return [];
    }
  }

  /**
   * 取得需要拆分的方案
   */
  private static getNeedsSplit(level: DataCompletenessLevel): string[] {
    switch (level) {
      case DataCompletenessLevel.TWO_TIER:
        return ['simple_3_tier', 'full_tou'];

      default:
        return [];
    }
  }

  /**
   * 取得完整度等級的中文說明
   */
  static getLevelLabel(level: DataCompletenessLevel): string {
    switch (level) {
      case DataCompletenessLevel.THREE_TIER:
        return '三段式完整資料';
      case DataCompletenessLevel.TWO_TIER:
        return '兩段式完整資料';
      case DataCompletenessLevel.TOTAL_ONLY:
        return '僅有總用電';
      default:
        return '未知';
    }
  }

  /**
   * 取得完整度等級的描述
   */
  static getLevelDescription(level: DataCompletenessLevel): string {
    switch (level) {
      case DataCompletenessLevel.THREE_TIER:
        return '您的電費單包含完整的時段用電資料，所有方案都可以準確計算。';

      case DataCompletenessLevel.TWO_TIER:
        return '您的電費單包含尖峰和離峰用電資料，三段式方案需要從尖峰拆分半尖峰。';

      case DataCompletenessLevel.TOTAL_ONLY:
        return '您的電費單只包含總用電度數，時間電價方案需要估算時段分配。';

      default:
        return '無法判斷資料完整度。';
    }
  }
}

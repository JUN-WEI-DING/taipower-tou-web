import type { TOUConsumption } from '../../types';
import { SplitMode } from '../../types';

/**
 * 兩段式拆分器
 *
 * 將兩段式時間電價的尖峰用電拆分為三段式的尖峰和半尖峰
 */
export class TwoTierSplitter {
  /**
   * 從兩段式拆分為三段式
   */
  static split(
    peakOnPeak: number,
    offPeak: number,
    mode: SplitMode,
    customPeakPercent?: number
  ): TOUConsumption {
    let peakPercent: number;

    switch (mode) {
      case SplitMode.DEFAULT:
        // 依時段長度比例
        // 兩段式尖峰：09:00-24:00 = 15小時
        // 三段式尖峰：10:00-12:00, 16:00-21:00 = 7小時
        // 比例：7/15 = 46.7%
        peakPercent = 7 / 15;
        break;

      case SplitMode.CONSERVATIVE:
        // 保守：假設尖峰時段用電較多
        peakPercent = 0.6;
        break;

      case SplitMode.AGGRESSIVE:
        // 積極：假設半尖峰時段用電較多
        peakPercent = 0.3;
        break;

      case SplitMode.CUSTOM:
        if (customPeakPercent === undefined) {
          throw new Error('Custom mode requires customPeakPercent');
        }
        peakPercent = customPeakPercent / 100;
        break;

      default:
        peakPercent = 7 / 15;
    }

    // 兩段式尖峰拆分
    const threeTierPeak = peakOnPeak * peakPercent;
    const threeTierSemiPeakFromPeak = peakOnPeak * (1 - peakPercent);

    // 兩段式離峰中，三段式半尖峰時段的用電
    // 三段式半尖峰在兩段式離峰時段：23:00-01:00 (2小時)
    // 兩段式離峰總共：00:00-09:00 (9小時)
    // 比例：2/9 = 22.2%
    const threeTierSemiPeakFromOffPeak = offPeak * (2 / 9);

    // 三段式離峰
    const threeTierOffPeak = offPeak * (7 / 9);

    return {
      peakOnPeak: threeTierPeak,
      semiPeak: threeTierSemiPeakFromPeak + threeTierSemiPeakFromOffPeak,
      offPeak: threeTierOffPeak,
    };
  }

  /**
   * 取得拆分模式的說明
   */
  static getSplitModeDescription(mode: SplitMode): {
    title: string;
    description: string;
    explanation: string;
  } {
    switch (mode) {
      case SplitMode.DEFAULT:
        return {
          title: '預設拆分（推薦）',
          description: '依時段長度比例拆分',
          explanation: `兩段式尖峰時段 (09:00-24:00，共15小時)
= 三段式尖峰 (10:00-12:00, 16:00-21:00，共7小時) + 三段式半尖峰 (部分)

按時段長度比例：7小時 ÷ 15小時 = 46.7%

即：兩段式的尖峰用電 → 46.7% 為三段式尖峰 + 53.3% 為三段式半尖峰`,
        };

      case SplitMode.CONSERVATIVE:
        return {
          title: '保守拆分',
          description: '假設尖峰時段用電較多',
          explanation: `假設在兩段式的尖峰時段中，真正在三段式尖峰時段的用電比例較高。

拆分比例：60% 尖峰 + 40% 半尖峰

適合：傍晚晚間（17:00-21:00）用電特別多的家庭`,
        };

      case SplitMode.AGGRESSIVE:
        return {
          title: '積極拆分',
          description: '假設半尖峰時段用電較多',
          explanation: `假設在兩段式的尖峰時段中，較多用電發生在三段式的半尖峰時段。

拆分比例：30% 尖峰 + 70% 半尖峰

適合：上午和下午時段（10:00-12:00, 12:00-16:00）用電較多的家庭`,
        };

      case SplitMode.CUSTOM:
        return {
          title: '自訂拆分',
          description: '用滑桿決定拆分比例',
          explanation: `您可以自行決定兩段式尖峰用電中，有多少比例是真正的尖峰。

建議：
- 傍晚晚間（17:00-21:00）用電多 → 提高尖峰比例
- 上午下午（10:00-16:00）用電多 → 降低尖峰比例`,
        };

      default:
        return {
          title: '預設拆分',
          description: '依時段長度比例拆分',
          explanation: '',
        };
    }
  }

  /**
   * 取得所有拆分模式選項
   */
  static getAllSplitModes(): Array<{
    mode: SplitMode;
    title: string;
    description: string;
    recommended: boolean;
  }> {
    return [
      {
        mode: SplitMode.DEFAULT,
        title: '預設拆分（推薦）',
        description: '依時段長度比例拆分',
        recommended: true,
      },
      {
        mode: SplitMode.CONSERVATIVE,
        title: '保守拆分',
        description: '假設尖峰時段用電較多',
        recommended: false,
      },
      {
        mode: SplitMode.AGGRESSIVE,
        title: '積極拆分',
        description: '假設半尖峰時段用電較多',
        recommended: false,
      },
      {
        mode: SplitMode.CUSTOM,
        title: '自訂拆分',
        description: '用滑桿決定拆分比例',
        recommended: false,
      },
    ];
  }
}

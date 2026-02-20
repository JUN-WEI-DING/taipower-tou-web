import { EstimationMode } from '../../types';
import type { TOUConsumption } from '../../types';

/**
 * 用電模式估算器
 *
 * 根據用電習慣估算時段用電分配
 */
export class UsageEstimator {
  /**
   * 用電習慣的預設比例
   */
  private static readonly HABIT_RATIOS: Record<
    Exclude<EstimationMode, EstimationMode.CUSTOM>,
    {
      description: string;
      season: {
        summer: { peakOnPeak: number; semiPeak: number; offPeak: number };
        nonSummer: { peakOnPeak: number; semiPeak: number; offPeak: number };
      };
      typicalDay: string[];
    }
  > = {
    [EstimationMode.AVERAGE]: {
      description: '一般上班族家庭',
      season: {
        summer: { peakOnPeak: 0.35, semiPeak: 0.25, offPeak: 0.4 },
        nonSummer: { peakOnPeak: 0.3, semiPeak: 0.25, offPeak: 0.45 },
      },
      typicalDay: [
        '早上 7-9 點：趕快出門，用電不多',
        '白天 9-5 點：家裡沒人，只有冰箱',
        '晚上 6-11 點：回家，開燈電視煮飯冷氣',
        '深夜 11 點後：大家都睡了',
      ],
    },

    [EstimationMode.HOME_DURING_DAY]: {
      description: '白天在家的家庭',
      season: {
        summer: { peakOnPeak: 0.45, semiPeak: 0.2, offPeak: 0.35 },
        nonSummer: { peakOnPeak: 0.4, semiPeak: 0.2, offPeak: 0.4 },
      },
      typicalDay: [
        '早上 8-11 點：在家，煮飯洗衣看電視',
        '白天 11-5 點：持續在家，冷氣開比較久',
        '晚上 6-11 點：大家都在家用電',
        '深夜：晚上比較晚睡，用電比一般家庭多',
      ],
    },

    [EstimationMode.NIGHT_OWL]: {
      description: '夜貓子型',
      season: {
        summer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
        nonSummer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
      },
      typicalDay: [
        '早上 9-11 點才起床，早上用電少',
        '白天可能外出或午睡',
        '晚上 11 點後還沒睡，洗衣機這時候跑',
      ],
    },
  };

  /**
   * 估算時段用電分配
   */
  static estimate(
    totalConsumption: number,
    mode: EstimationMode,
    season: 'summer' | 'non_summer',
    customPercents?: { peakOnPeak: number; semiPeak: number; offPeak: number }
  ): TOUConsumption {
    // 自訂模式
    if (mode === EstimationMode.CUSTOM) {
      if (!customPercents) {
        throw new Error('Custom mode requires customPercents');
      }
      return this.estimateCustom(totalConsumption, customPercents);
    }

    // 預設模式
    const habit = this.HABIT_RATIOS[mode];
    if (!habit) {
      throw new Error(`Unknown estimation mode: ${mode}`);
    }

    const ratios = habit.season[season === 'non_summer' ? 'nonSummer' : season];

    return {
      peakOnPeak: totalConsumption * ratios.peakOnPeak,
      semiPeak: totalConsumption * ratios.semiPeak,
      offPeak: totalConsumption * ratios.offPeak,
    };
  }

  /**
   * 自訂估算
   */
  private static estimateCustom(
    totalConsumption: number,
    percents: { peakOnPeak: number; semiPeak: number; offPeak: number }
  ): TOUConsumption {
    const totalPercent = percents.peakOnPeak + percents.semiPeak + percents.offPeak;

    if (Math.abs(totalPercent - 100) > 0.1) {
      throw new Error('Percentages must sum to 100%');
    }

    return {
      peakOnPeak: (totalConsumption * percents.peakOnPeak) / 100,
      semiPeak: (totalConsumption * percents.semiPeak) / 100,
      offPeak: (totalConsumption * percents.offPeak) / 100,
    };
  }

  /**
   * 取得用電習慣的描述
   */
  static getHabitDescription(mode: EstimationMode): string {
    if (mode === EstimationMode.CUSTOM) {
      return '自訂比例';
    }
    return this.HABIT_RATIOS[mode]?.description || '';
  }

  /**
   * 取得典型的一天
   */
  static getTypicalDay(mode: EstimationMode): string[] {
    if (mode === EstimationMode.CUSTOM) {
      return ['依您設定的比例'];
    }
    return this.HABIT_RATIOS[mode]?.typicalDay || [];
  }

  /**
   * 取得所有用電習慣選項
   */
  static getAllHabits(): Array<{
    mode: EstimationMode;
    description: string;
    emoji: string;
    whoIsItFor: string;
    summerBreakdown: string;
    nonSummerBreakdown: string;
  }> {
    return [
      {
        mode: EstimationMode.AVERAGE,
        description: '一般上班族家庭',
        emoji: '👨‍💼👩‍💼',
        whoIsItFor: '最常見的家庭型別',
        summerBreakdown: '尖峰 35% / 半尖峰 25% / 離峰 40%',
        nonSummerBreakdown: '尖峰 30% / 半尖峰 25% / 離峰 45%',
      },
      {
        mode: EstimationMode.HOME_DURING_DAY,
        description: '白天在家的家庭',
        emoji: '👵👶',
        whoIsItFor: '有家庭主婦、長輩、小孩的家庭',
        summerBreakdown: '尖峰 45% / 半尖峰 20% / 離峰 35%',
        nonSummerBreakdown: '尖峰 40% / 半尖峰 20% / 離峰 40%',
      },
      {
        mode: EstimationMode.NIGHT_OWL,
        description: '夜貓子型',
        emoji: '🦉',
        whoIsItFor: '作息較晚、半夜洗衣的人',
        summerBreakdown: '尖峰 25% / 半尖峰 20% / 離峰 55%',
        nonSummerBreakdown: '尖峰 25% / 半尖峰 20% / 離峰 55%',
      },
      {
        mode: EstimationMode.CUSTOM,
        description: '我自己調整',
        emoji: '🎚️',
        whoIsItFor: '清楚自己用電習慣的人',
        summerBreakdown: '依你設定',
        nonSummerBreakdown: '依你設定',
      },
    ];
  }
}

import type {
  Plan,
  CalculationInput,
  PlanCalculationResult,
  Season,
  TOUConsumption,
  Charges,
  ResultLabel,
  Comparison,
  SeasonInfo,
} from '../../types';
import { EstimationMode } from '../../types';

/**
 * 費率計算引擎
 *
 * 移植自 Python taipower-tou 套件的計算邏輯
 */
export class RateCalculator {
  private plans: Plan[] = [];

  constructor(plans: Plan[]) {
    this.plans = plans;
  }

  /**
   * 計算所有可用方案
   */
  calculateAll(input: CalculationInput): PlanCalculationResult[] {
    const season = this.determineSeason(input.billingPeriod);
    const processedInput = this.ensureTOUData(input, season);

    // 取得可用的方案
    const availablePlans = this.getAvailablePlans(input);

    // 計算每個方案
    const results: PlanCalculationResult[] = availablePlans.map((plan) => {
      const result = this.calculatePlan(plan, processedInput, season);

      // 加入標籤
      result.label = this.createLabel(result, input, plan);

      // 加入比較資訊
      result.comparison = this.createComparison(result, input);

      return result;
    });

    // 依電費排序
    return results.sort((a, b) => a.charges.total - b.charges.total);
  }

  /**
   * 計算單一方案
   */
  private calculatePlan(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    switch (plan.touType) {
      case 'none':
        return this.calculateNonTOU(plan, input, season);
      case 'simple_2_tier':
        return this.calculateSimple2Tier(plan, input, season);
      case 'simple_3_tier':
        return this.calculateSimple3Tier(plan, input, season);
      case 'full_tou':
        return this.calculateFullTOU(plan, input, season);
      default:
        throw new Error(`Unknown TOU type: ${plan.touType}`);
    }
  }

  /**
   * 非時間電價（累進費率）計算
   */
  private calculateNonTOU(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    const tierRates = plan.tierRates || [];
    let totalEnergyCharge = 0;
    let remainingKwh = input.consumption;
    const tierBreakdown: any[] = [];

    for (const tier of tierRates) {
      if (remainingKwh <= 0) break;

      const tierMaxKwh = tier.maxKwh ?? Infinity;
      const tierMinKwh = tier.minKwh;
      const tierRange = tierMaxKwh - tierMinKwh;
      const kwhInTier = Math.min(remainingKwh, tierRange);
      const charge = kwhInTier * tier.rate;

      totalEnergyCharge += charge;
      remainingKwh -= kwhInTier;

      tierBreakdown.push({
        tier: tier.tier,
        kwh: kwhInTier,
        rate: tier.rate,
        charge: charge,
      });
    }

    // 基本電費（依契約容量）
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge,
      total: basicCharge + totalEnergyCharge,
    };

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { tierBreakdown },
      label: {
        accuracy: 'accurate',
        badge: '✅ 準確',
        tooltip: '依據電費單資料計算',
      },
      comparison: {
        isCurrentPlan: false,
        rank: 0,
        difference: 0,
        savingPercentage: 0,
      },
      seasonInfo: {
        season: season.name,
        isSummer: season.name === 'summer',
      },
    };
  }

  /**
   * 兩段式時間電價計算
   */
  private calculateSimple2Tier(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    const touConsumption = input.touConsumption;
    if (!touConsumption) {
      throw new Error('TOU consumption required for 2-tier calculation');
    }

    const seasonKey = season.name === 'summer' ? 'summer' : 'nonSummer';
    const energyCharges = plan.energyCharges[seasonKey];

    // 找出尖峰和離峰費率
    const peakRate = energyCharges.find((r) => r.period === 'peak')?.rate || 0;
    const offPeakRate =
      energyCharges.find((r) => r.period === 'off_peak')?.rate || 0;

    // 計算流動電費
    const peakCharge = touConsumption.peakOnPeak * peakRate;
    const offPeakCharge = touConsumption.offPeak * offPeakRate;

    // 如果有半尖峰度數（來自估算），作為離峰計算
    let semiPeakCharge = 0;
    if (touConsumption.semiPeak && touConsumption.semiPeak > 0) {
      semiPeakCharge = touConsumption.semiPeak * offPeakRate;
    }

    const totalEnergyCharge = peakCharge + offPeakCharge + semiPeakCharge;

    const touBreakdown = [
      { period: 'peak' as const, kwh: touConsumption.peakOnPeak, rate: peakRate, charge: peakCharge },
      { period: 'off_peak' as const, kwh: touConsumption.offPeak, rate: offPeakRate, charge: offPeakCharge },
    ];

    if (touConsumption.semiPeak && touConsumption.semiPeak > 0) {
      touBreakdown.push({
        period: 'off_peak' as const,
        kwh: touConsumption.semiPeak,
        rate: offPeakRate,
        charge: semiPeakCharge,
      });
    }

    // 基本電費
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge,
      total: basicCharge + totalEnergyCharge,
    };

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { touBreakdown },
      label: {
        accuracy: 'accurate',
        badge: '✅ 準確',
        tooltip: '依據電費單資料計算',
      },
      comparison: {
        isCurrentPlan: false,
        rank: 0,
        difference: 0,
        savingPercentage: 0,
      },
      seasonInfo: {
        season: season.name,
        isSummer: season.name === 'summer',
      },
    };
  }

  /**
   * 三段式時間電價計算
   */
  private calculateSimple3Tier(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    const touConsumption = input.touConsumption;
    if (!touConsumption) {
      throw new Error('TOU consumption required for 3-tier calculation');
    }

    const seasonKey = season.name === 'summer' ? 'summer' : 'nonSummer';
    const energyCharges = plan.energyCharges[seasonKey];

    // 找出各時段費率
    const peakRate = energyCharges.find((r) => r.period === 'peak')?.rate || 0;
    const semiPeakRate = energyCharges.find((r) => r.period === 'semi_peak')?.rate || 0;
    const offPeakRate = energyCharges.find((r) => r.period === 'off_peak')?.rate || 0;

    // 計算流動電費
    const peakCharge = touConsumption.peakOnPeak * peakRate;
    const semiPeakCharge = touConsumption.semiPeak * semiPeakRate;
    const offPeakCharge = touConsumption.offPeak * offPeakRate;

    const totalEnergyCharge = peakCharge + semiPeakCharge + offPeakCharge;

    const touBreakdown = [
      { period: 'peak' as const, kwh: touConsumption.peakOnPeak, rate: peakRate, charge: peakCharge },
      { period: 'semi_peak' as const, kwh: touConsumption.semiPeak, rate: semiPeakRate, charge: semiPeakCharge },
      { period: 'off_peak' as const, kwh: touConsumption.offPeak, rate: offPeakRate, charge: offPeakCharge },
    ];

    // 基本電費
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge,
      total: basicCharge + totalEnergyCharge,
    };

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { touBreakdown },
      label: {
        accuracy: 'accurate',
        badge: '✅ 準確',
        tooltip: '依據電費單資料計算',
      },
      comparison: {
        isCurrentPlan: false,
        rank: 0,
        difference: 0,
        savingPercentage: 0,
      },
      seasonInfo: {
        season: season.name,
        isSummer: season.name === 'summer',
      },
    };
  }

  /**
   * 完整時間電價計算
   */
  private calculateFullTOU(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    // 完整時間電價與三段式類似，但時段定義更詳細
    // 這裡先使用三段式的邏輯
    return this.calculateSimple3Tier(plan, input, season);
  }

  /**
   * 計算基本電費
   */
  private calculateBasicCharge(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): number {
    // 簡化版本：使用固定基本電費
    // 實際應根據契約容量和電壓型別計算
    const basicCharge = plan.basicCharges[0];
    if (basicCharge) {
      return season.name === 'summer' ? basicCharge.summerRate : basicCharge.nonSummerRate;
    }

    // 如果沒有定義，使用預設值
    return 75; // 住家用電基本電費
  }

  /**
   * 判斷季節
   */
  private determineSeason(period: { start: Date; end: Date }): Season {
    const month = period.start.getMonth() + 1; // 1-12
    const isSummer = month >= 6 && month <= 9;

    return {
      name: isSummer ? 'summer' : 'non_summer',
      start: isSummer ? '06-01' : '10-01',
      end: isSummer ? '09-30' : '05-31',
    };
  }

  /**
   * 確保有時段用電資料
   * 如果沒有，使用估算
   */
  private ensureTOUData(
    input: CalculationInput,
    season: Season
  ): CalculationInput {
    // 如果已有時段資料且不是估算的，直接回傳
    if (input.touConsumption && !input.touConsumption.isEstimated) {
      return input;
    }

    // 如果有估算設定，使用估算
    if (input.estimationSettings) {
      const estimated = this.estimateTOUConsumption(
        input.consumption,
        input.estimationSettings.mode,
        season.name,
        input.estimationSettings.customPercents
      );

      return {
        ...input,
        touConsumption: {
          ...estimated,
          isEstimated: true,
          estimationMode: input.estimationSettings.mode,
        },
      };
    }

    // 預設使用平均估算
    const defaultEstimated = this.estimateTOUConsumption(
      input.consumption,
      EstimationMode.AVERAGE,
      season.name
    );

    return {
      ...input,
      touConsumption: {
        ...defaultEstimated,
        isEstimated: true,
        estimationMode: EstimationMode.AVERAGE,
      },
    };
  }

  /**
   * 估算時段用電分配
   */
  private estimateTOUConsumption(
    totalConsumption: number,
    mode: EstimationMode,
    season: 'summer' | 'non_summer',
    customPercents?: { peakOnPeak: number; semiPeak: number; offPeak: number }
  ): TOUConsumption {
    if (mode === EstimationMode.CUSTOM && customPercents) {
      const totalPercent = customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak;
      if (Math.abs(totalPercent - 100) > 0.1) {
        throw new Error('Custom percentages must sum to 100%');
      }

      return {
        peakOnPeak: (totalConsumption * customPercents.peakOnPeak) / 100,
        semiPeak: (totalConsumption * customPercents.semiPeak) / 100,
        offPeak: (totalConsumption * customPercents.offPeak) / 100,
      };
    }

    // 預設估算比例（根據用電習慣）
    const ratios: Record<string, any> = {
      [EstimationMode.AVERAGE]: {
        summer: { peakOnPeak: 0.35, semiPeak: 0.25, offPeak: 0.4 },
        nonSummer: { peakOnPeak: 0.3, semiPeak: 0.25, offPeak: 0.45 },
      },
      [EstimationMode.HOME_DURING_DAY]: {
        summer: { peakOnPeak: 0.45, semiPeak: 0.2, offPeak: 0.35 },
        nonSummer: { peakOnPeak: 0.4, semiPeak: 0.2, offPeak: 0.4 },
      },
      [EstimationMode.NIGHT_OWL]: {
        summer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
        nonSummer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
      },
    };

    const selectedRatios = ratios[mode]?.[season];

    if (!selectedRatios) {
      // 預設平均
      return {
        peakOnPeak: totalConsumption * 0.35,
        semiPeak: totalConsumption * 0.25,
        offPeak: totalConsumption * 0.4,
      };
    }

    return {
      peakOnPeak: totalConsumption * selectedRatios.peakOnPeak,
      semiPeak: totalConsumption * selectedRatios.semiPeak,
      offPeak: totalConsumption * selectedRatios.offPeak,
    };
  }

  /**
   * 取得可用的方案
   */
  private getAvailablePlans(input: CalculationInput): Plan[] {
    // 簡化版本：回傳所有方案
    // 實際應根據電壓型別、契約容量等篩選
    return this.plans.filter((plan) => {
      // 只包含住家用電和表燈用電
      return plan.type === 'residential' || plan.type === 'lighting';
    });
  }

  /**
   * 建立結果標籤
   */
  private createLabel(
    result: PlanCalculationResult,
    input: CalculationInput,
    plan: Plan
  ): ResultLabel {
    // 檢查資料是否足夠
    const hasTOUData = input.touConsumption && !input.touConsumption.isEstimated;

    if (plan.touType === 'none') {
      // 非時間電價：只要有總用電就夠
      return {
        accuracy: 'accurate',
        badge: '✅ 準確',
        tooltip: '依據電費單資料計算',
      };
    }

    if (hasTOUData) {
      // 有完整時段資料
      return {
        accuracy: 'accurate',
        badge: '✅ 準確',
        tooltip: '依據電費單資料計算',
      };
    }

    // 需要估算
    const habitLabels: Record<string, string> = {
      [EstimationMode.AVERAGE]: '一般上班族家庭',
      [EstimationMode.HOME_DURING_DAY]: '白天在家的家庭',
      [EstimationMode.NIGHT_OWL]: '夜貓子型',
      [EstimationMode.CUSTOM]: '自訂比例',
    };

    return {
      accuracy: 'estimated',
      badge: '⚠️ 估算',
      tooltip: `依「${habitLabels[input.estimationSettings?.mode || EstimationMode.AVERAGE]}」估算`,
      detail: '實際電費可能因用電習慣不同而有所差異',
    };
  }

  /**
   * 建立比較資訊
   */
  private createComparison(
    result: PlanCalculationResult,
    input: CalculationInput
  ): Comparison {
    return {
      isCurrentPlan: false,
      rank: 0,
      difference: 0,
      savingPercentage: 0,
    };
  }
}

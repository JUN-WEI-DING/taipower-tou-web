import type {
  Plan,
  CalculationInput,
  PlanCalculationResult,
  Season,
  TOUConsumption,
  Charges,
  ResultLabel,
  Comparison,
  BreakdownItem,
  TimeSlot,
} from '../../types';
import { EstimationMode } from '../../types';
import { PlansLoader } from './plans';

/**
 * 計費期間天數統計
 */
interface BillingPeriodDays {
  weekdays: number;
  saturdays: number;
  sundaysHolidays: number;
  total: number;
}

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
   * 計算計費期間的天數統計
   */
  private calculateBillingPeriodDays(period: { start: Date; end: Date }): BillingPeriodDays {
    let weekdays = 0;
    let saturdays = 0;
    let sundaysHolidays = 0;

    const current = new Date(period.start);
    const end = new Date(period.end);

    while (current <= end) {
      const day = current.getDay();
      if (day === 0) {
        // Sunday
        sundaysHolidays++;
      } else if (day === 6) {
        // Saturday
        saturdays++;
      } else {
        // Weekday (Monday-Friday)
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return {
      weekdays,
      saturdays,
      sundaysHolidays,
      total: weekdays + saturdays + sundaysHolidays,
    };
  }

  /**
   * 計算時段總小時數
   */
  private calculatePeriodHours(timeSlots: TimeSlot[]): number {
    let totalHours = 0;
    for (const slot of timeSlots) {
      const [startH, startM] = slot.start.split(':').map(Number);
      const [endH, endM] = slot.end.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // Handle overnight slots (e.g., 22:00-24:00 or 00:00-08:00)
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Next day
      }

      totalHours += (endMinutes - startMinutes) / 60;
    }
    return totalHours;
  }

  /**
   * 計算所有可用方案
   */
  calculateAll(input: CalculationInput): PlanCalculationResult[] {
    // 驗證輸入
    if (!input || typeof input.consumption !== 'number' || input.consumption <= 0) {
      throw new Error('用電度數必須大於 0');
    }

    if (!input.billingPeriod || !input.billingPeriod.start || !input.billingPeriod.end) {
      throw new Error('計費期間無效');
    }

    const season = this.determineSeason(input.billingPeriod);
    const processedInput = this.ensureTOUData(input, season);

    // 取得可用的方案
    const availablePlans = this.getAvailablePlans();

    // 計算每個方案
    const results: PlanCalculationResult[] = availablePlans.map((plan) => {
      const result = this.calculatePlan(plan, processedInput, season);

      // 加入標籤（保留最低用電警告）
      if (!result.label.badge.includes('最低用電')) {
        result.label = this.createLabel(result, input, plan);
      }

      // 加入比較資訊
      result.comparison = this.createComparison();

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
   * 非時間電價（累進費率或固定費率）計算
   */
  private calculateNonTOU(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): PlanCalculationResult {
    const tierRates = plan.tierRates || [];

    // 計算最低用電度數
    const contractCapacity = input.contractCapacity || 10;
    const phase = input.phase || 'single';
    const voltageV = input.voltageV || 110;

    const minimumUsage = PlansLoader.calculateMinimumUsage(
      contractCapacity,
      phase,
      voltageV
    );

    // 使用實際用電與最低用電的較大值
    const billableConsumption = Math.max(input.consumption, minimumUsage);

    let totalEnergyCharge = 0;
    const tierBreakdown: BreakdownItem[] = [];

    const isSummer = season.name === 'summer';

    // 檢查是否有固定費率（flat rate）
    const seasonKey = season.name === 'summer' ? 'summer' : 'nonSummer';
    const flatRate = plan.energyCharges[seasonKey].find(r => r.period === 'flat');

    if (flatRate && tierRates.length === 0) {
      // 使用固定費率計算（如低壓電力非時間電價）
      totalEnergyCharge = billableConsumption * flatRate.rate;
      tierBreakdown.push({
        kwh: billableConsumption,
        rate: flatRate.rate,
        charge: totalEnergyCharge,
        label: '固定費率',
      });
    } else if (tierRates.length > 0) {
      // 使用累進費率計算 - 修正：使用累積的上限來計算每個級距的度數
      let remainingKwh = billableConsumption;
      let lastLimitKwh = 0; // 追蹤前一個級距的上限

      for (const tier of tierRates) {
        if (remainingKwh <= 0) break;

        const tierEnd = tier.maxKwh ?? Infinity;
        // 計算本級距的實際度數範圍（本級距上限 - 前一級距上限）
        const tierLimitKwh = tierEnd - lastLimitKwh;
        const kwhInTier = Math.min(remainingKwh, tierLimitKwh);
        const rate = isSummer ? tier.summerRate : tier.nonSummerRate;
        const charge = kwhInTier * rate;

        totalEnergyCharge += charge;
        remainingKwh -= kwhInTier;
        lastLimitKwh = tierEnd; // 更新累積上限

        tierBreakdown.push({
          tier: tier.tier,
          kwh: kwhInTier,
          rate: rate,
          charge: charge,
        });
      }
    }

    // 基本電費（依契約容量）
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge,
      total: basicCharge + totalEnergyCharge,
    };

    // 如果使用了最低用電規則，在標籤中標示
    const usedMinimumUsage = input.consumption < minimumUsage;

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { tierBreakdown },
      label: {
        accuracy: usedMinimumUsage ? 'estimated' : 'accurate',
        badge: usedMinimumUsage ? '⚠️ 最低用電' : '✅ 準確',
        tooltip: usedMinimumUsage
          ? `用電低於最低度數 ${minimumUsage} 度，按最低度數計費`
          : '依據電費單資料計算',
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

    // 計算最低用電度數
    const contractCapacity = input.contractCapacity || 10;
    const phase = input.phase || 'single';
    const voltageV = input.voltageV || 110;

    const minimumUsage = PlansLoader.calculateMinimumUsage(
      contractCapacity,
      phase,
      voltageV
    );

    // 計算總用電（時段用電總和）
    const totalTOUConsumption = touConsumption.peakOnPeak +
                                (touConsumption.semiPeak || 0) +
                                touConsumption.offPeak;

    // 檢查是否需要最低用電調整
    const needsMinimumUsageAdjustment = totalTOUConsumption < minimumUsage;

    let adjustedPeakOnPeak = touConsumption.peakOnPeak;
    let adjustedSemiPeak = touConsumption.semiPeak || 0;
    let adjustedOffPeak = touConsumption.offPeak;

    // 如果需要調整到最低用電，按比例增加各時段用電
    if (needsMinimumUsageAdjustment && totalTOUConsumption > 0) {
      const usageRatio = minimumUsage / totalTOUConsumption;
      adjustedPeakOnPeak = touConsumption.peakOnPeak * usageRatio;
      adjustedSemiPeak = (touConsumption.semiPeak || 0) * usageRatio;
      adjustedOffPeak = touConsumption.offPeak * usageRatio;
    }

    const seasonKey = season.name === 'summer' ? 'summer' : 'nonSummer';
    const energyCharges = plan.energyCharges[seasonKey];

    // 找出尖峰和離峰費率
    const peakRate = energyCharges.find((r) => r.period === 'peak')?.rate;
    const offPeakRate = energyCharges.find((r) => r.period === 'off_peak')?.rate;

    // 兩段式時間電價沒有半尖峰費率，將半尖峰度數按比例分配到尖峰和離峰
    let finalPeakKwh = adjustedPeakOnPeak;
    let finalOffPeakKwh = adjustedOffPeak;

    if (adjustedSemiPeak > 0) {
      // 將半尖峰按比例分配到尖峰和離峰
      const totalMainPeriods = adjustedPeakOnPeak + adjustedOffPeak;
      if (totalMainPeriods > 0) {
        const peakRatio = adjustedPeakOnPeak / totalMainPeriods;
        const offPeakRatio = adjustedOffPeak / totalMainPeriods;

        const semiToPeak = adjustedSemiPeak * peakRatio;
        const semiToOffPeak = adjustedSemiPeak * offPeakRatio;

        finalPeakKwh = adjustedPeakOnPeak + semiToPeak;
        finalOffPeakKwh = adjustedOffPeak + semiToOffPeak;
      } else {
        // 如果沒有尖峰和離峰度數，全部按離峰計算
        finalOffPeakKwh = adjustedOffPeak + adjustedSemiPeak;
      }
    }

    // 計算流動電費（如果沒有費率則為 0）
    const peakCharge = (peakRate || 0) * finalPeakKwh;
    const offPeakCharge = (offPeakRate || 0) * finalOffPeakKwh;

    const totalEnergyCharge = peakCharge + offPeakCharge;

    // 建立 breakdown，只包含有費率的時段
    const touBreakdown: Array<{
      period?: 'peak' | 'off_peak' | 'semi_peak';
      kwh: number;
      rate: number;
      charge: number;
      label?: string;
    }> = [];

    if (peakRate !== undefined && finalPeakKwh > 0) {
      touBreakdown.push({ period: 'peak' as const, kwh: finalPeakKwh, rate: peakRate, charge: peakCharge });
    }
    if (offPeakRate !== undefined && finalOffPeakKwh > 0) {
      touBreakdown.push({ period: 'off_peak' as const, kwh: finalOffPeakKwh, rate: offPeakRate, charge: offPeakCharge });
    }

    // 如果有半尖峰度數，加入分配說明
    if (adjustedSemiPeak > 0) {
      const totalMainPeriods = adjustedPeakOnPeak + adjustedOffPeak;
      if (totalMainPeriods > 0) {
        const peakRatio = adjustedPeakOnPeak / totalMainPeriods;
        const offPeakRatio = adjustedOffPeak / totalMainPeriods;
        const semiToPeak = adjustedSemiPeak * peakRatio;
        const semiToOffPeak = adjustedSemiPeak * offPeakRatio;
        touBreakdown.push({
          label: `半尖峰 ${adjustedSemiPeak.toFixed(1)} 度 → 尖峰 ${semiToPeak.toFixed(1)} + 離峰 ${semiToOffPeak.toFixed(1)}`,
          kwh: adjustedSemiPeak,
          rate: 0,
          charge: 0,
        });
      }
    }

    // 計算超過 2000 度的附加費（如適用）
    let surcharge = 0;
    const totalBillableConsumption = finalPeakKwh + finalOffPeakKwh;

    // 檢查附加費規則（已在 plans.ts 中標準化到 billing_rules）
    const surchargeRule = plan.billingRules?.over_2000_kwh_surcharge;
    if (surchargeRule &&
        Number.isFinite(surchargeRule.threshold_kwh) &&
        Number.isFinite(surchargeRule.cost_per_kwh) &&
        totalBillableConsumption > surchargeRule.threshold_kwh) {
      const overAmount = totalBillableConsumption - surchargeRule.threshold_kwh;
      surcharge = overAmount * surchargeRule.cost_per_kwh;
    }

    // 基本電費
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge + surcharge,
      total: basicCharge + totalEnergyCharge + surcharge,
    };

    // 如果有附加費，加入 breakdown
    if (surcharge > 0 && plan.billingRules?.over_2000_kwh_surcharge) {
      const rule = plan.billingRules.over_2000_kwh_surcharge;
      touBreakdown.push({
        kwh: totalBillableConsumption - rule.threshold_kwh,
        rate: rule.cost_per_kwh,
        charge: surcharge,
        label: `超過${rule.threshold_kwh}度附加費`,
      });
    }

    // 如果使用了最低用電規則，在標籤中標示
    const usedMinimumUsage = totalTOUConsumption < minimumUsage;

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { touBreakdown },
      label: {
        accuracy: usedMinimumUsage ? 'estimated' : 'accurate',
        badge: usedMinimumUsage ? '⚠️ 最低用電' : '✅ 準確',
        tooltip: usedMinimumUsage
          ? `用電低於最低度數 ${minimumUsage} 度，按最低度數計費`
          : '依據電費單資料計算',
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

    // 計算最低用電度數
    const contractCapacity = input.contractCapacity || 10;
    const phase = input.phase || 'single';
    const voltageV = input.voltageV || 110;

    const minimumUsage = PlansLoader.calculateMinimumUsage(
      contractCapacity,
      phase,
      voltageV
    );

    // 計算總用電（時段用電總和）
    const totalTOUConsumption = touConsumption.peakOnPeak +
                                touConsumption.semiPeak +
                                touConsumption.offPeak;

    // 檢查是否需要最低用電調整
    const needsMinimumUsageAdjustment = totalTOUConsumption < minimumUsage;

    let adjustedPeakOnPeak = touConsumption.peakOnPeak;
    let adjustedSemiPeak = touConsumption.semiPeak;
    let adjustedOffPeak = touConsumption.offPeak;

    // 如果需要調整到最低用電，按比例增加各時段用電
    if (needsMinimumUsageAdjustment && totalTOUConsumption > 0) {
      const usageRatio = minimumUsage / totalTOUConsumption;
      adjustedPeakOnPeak = touConsumption.peakOnPeak * usageRatio;
      adjustedSemiPeak = touConsumption.semiPeak * usageRatio;
      adjustedOffPeak = touConsumption.offPeak * usageRatio;
    }

    const seasonKey = season.name === 'summer' ? 'summer' : 'nonSummer';
    const energyCharges = plan.energyCharges[seasonKey];

    // 找出各時段費率
    const peakRate = energyCharges.find((r) => r.period === 'peak')?.rate;
    const semiPeakRate = energyCharges.find((r) => r.period === 'semi_peak')?.rate;
    const offPeakRate = energyCharges.find((r) => r.period === 'off_peak')?.rate;

    // 處理時段度數分配：如果某時段沒有費率，將其度數分配到其他時段
    let finalPeakKwh = adjustedPeakOnPeak;
    let finalSemiPeakKwh = adjustedSemiPeak;
    let finalOffPeakKwh = adjustedOffPeak;
    let finalPeakRate = peakRate;
    let finalSemiPeakRate = semiPeakRate;
    const finalOffPeakRate = offPeakRate;

    // 如果沒有尖峰費率（如標準型三段式非夏季），將尖峰度數併入半尖峰
    if (peakRate === undefined && adjustedPeakOnPeak > 0) {
      finalPeakKwh = 0;
      finalSemiPeakKwh = adjustedSemiPeak + adjustedPeakOnPeak;
      finalPeakRate = 0; // 沒有尖峰費率
    }

    // 如果沒有半尖峰費率，將半尖峰度數按比例分配到尖峰和離峰
    if (semiPeakRate === undefined && adjustedSemiPeak > 0) {
      const totalMainPeriods = adjustedPeakOnPeak + adjustedOffPeak;
      if (totalMainPeriods > 0) {
        const peakRatio = adjustedPeakOnPeak / totalMainPeriods;
        const offPeakRatio = adjustedOffPeak / totalMainPeriods;
        finalPeakKwh = adjustedPeakOnPeak + adjustedSemiPeak * peakRatio;
        finalOffPeakKwh = adjustedOffPeak + adjustedSemiPeak * offPeakRatio;
      } else {
        finalOffPeakKwh = adjustedOffPeak + adjustedSemiPeak;
      }
      finalSemiPeakKwh = 0;
      finalSemiPeakRate = 0; // 沒有半尖峰費率
    }

    // 計算流動電費
    const peakCharge = (finalPeakRate || 0) * finalPeakKwh;
    const semiPeakCharge = (finalSemiPeakRate || 0) * finalSemiPeakKwh;
    const offPeakCharge = (finalOffPeakRate || 0) * finalOffPeakKwh;

    const totalEnergyCharge = peakCharge + semiPeakCharge + offPeakCharge;

    // 建立 breakdown，只包含有費率的時段
    const touBreakdown: Array<{
      period?: 'peak' | 'off_peak' | 'semi_peak';
      kwh: number;
      rate: number;
      charge: number;
      label?: string;
    }> = [];

    if (finalPeakRate !== undefined && finalPeakKwh > 0) {
      touBreakdown.push({ period: 'peak' as const, kwh: finalPeakKwh, rate: finalPeakRate, charge: peakCharge });
    }
    if (finalSemiPeakRate !== undefined && finalSemiPeakKwh > 0) {
      touBreakdown.push({ period: 'semi_peak' as const, kwh: finalSemiPeakKwh, rate: finalSemiPeakRate, charge: semiPeakCharge });
    }
    if (finalOffPeakRate !== undefined && finalOffPeakKwh > 0) {
      touBreakdown.push({ period: 'off_peak' as const, kwh: finalOffPeakKwh, rate: finalOffPeakRate, charge: offPeakCharge });
    }

    // 如果 breakdown 為空（不應該發生），新增一個預設專案
    if (touBreakdown.length === 0) {
      touBreakdown.push({ kwh: totalTOUConsumption, rate: 0, charge: 0, label: '費率資料缺失' });
    }

    // 計算超過 2000 度的附加費（如適用）
    let surcharge = 0;
    const totalBillableConsumption = finalPeakKwh + finalSemiPeakKwh + finalOffPeakKwh;
    const surchargeRule = plan.billingRules?.over_2000_kwh_surcharge;
    if (surchargeRule &&
        Number.isFinite(surchargeRule.threshold_kwh) &&
        Number.isFinite(surchargeRule.cost_per_kwh) &&
        totalBillableConsumption > surchargeRule.threshold_kwh) {
      const overAmount = totalBillableConsumption - surchargeRule.threshold_kwh;
      surcharge = overAmount * surchargeRule.cost_per_kwh;
    }

    // 基本電費
    const basicCharge = this.calculateBasicCharge(plan, input, season);

    const charges: Charges = {
      base: basicCharge,
      energy: totalEnergyCharge + surcharge,
      total: basicCharge + totalEnergyCharge + surcharge,
    };

    // 如果有附加費，加入 breakdown
    if (surcharge > 0 && surchargeRule) {
      touBreakdown.push({
        kwh: totalBillableConsumption - surchargeRule.threshold_kwh,
        rate: surchargeRule.cost_per_kwh,
        charge: surcharge,
        label: `超過${surchargeRule.threshold_kwh}度附加費`,
      });
    }

    // 如果使用了最低用電規則，在標籤中標示
    const usedMinimumUsage = totalTOUConsumption < minimumUsage;

    return {
      planId: plan.id,
      planName: plan.name,
      planNameEn: plan.nameEn,
      charges,
      breakdown: { touBreakdown },
      label: {
        accuracy: usedMinimumUsage ? 'estimated' : 'accurate',
        badge: usedMinimumUsage ? '⚠️ 最低用電' : '✅ 準確',
        tooltip: usedMinimumUsage
          ? `用電低於最低度數 ${minimumUsage} 度，按最低度數計費`
          : '依據電費單資料計算',
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
   * 將契約容量（安培數）轉換為功率（kW）
   * 標準型時間電價需要用 kW 來計算基本電費
   */
  private convertAmpsToKW(
    amps: number,
    phase: 'single' | 'three',
    voltageV: number
  ): number {
    if (phase === 'three') {
      // 三相：kW = A * V * √3 / 1000
      return (amps * voltageV * Math.sqrt(3)) / 1000;
    } else {
      // 單相：kW = A * V / 1000
      return (amps * voltageV) / 1000;
    }
  }

  /**
   * 計算基本電費
   * 根據臺電實際規則：
   * 1. 簡易型時間電價：固定基本電費（如 $75）
   * 2. 標準型時間電價：按戶計收 + 經常契約費（按 kW 計算）
   * 3. 低壓電力：裝置契約費（按 kW 計算）
   * 4. 非時間電價：最低月費（如 $100）
   */
  private calculateBasicCharge(
    plan: Plan,
    input: CalculationInput,
    season: Season
  ): number {
    const contractCapacity = input.contractCapacity || 10; // 預設 10A
    const phase = input.phase || 'single';
    const voltageV = input.voltageV || 110;

    // 檢查是否為標準型時間電價或低壓電力（需要從 basic_fees 計算）
    if (plan.raw && plan.basicCharges && plan.basicCharges.length > 0) {
      // 標準型時間電價：按戶計收 + 經常契約費
      // 低壓電力：裝置契約費（按 kW 計算）

      // 1. 找出按戶計收的費用（單相或三相）- 只有標準型時間電價有
      // 首先嘗試匹配相位，如果沒有找到則嘗試相位無關的費用
      let householdFee = plan.basicCharges.find(charge =>
        charge.capacityRange.min === 0 &&
        charge.capacityRange.max === null &&
        charge.phase === phase
      );

      // 如果沒有找到相位特定的費用，嘗試找相位無關的費用
      if (!householdFee) {
        householdFee = plan.basicCharges.find(charge =>
          charge.capacityRange.min === 0 &&
          charge.capacityRange.max === null &&
          !charge.phase
        );
      }

      // 2. 找出契約費率（裝置契約或經常契約）
      // 需要先計算 contractKW 才能正確匹配容量範圍
      const contractKW = this.convertAmpsToKW(contractCapacity, phase, voltageV);

      // 首先嘗試匹配相位和容量範圍
      let contractCharge = plan.basicCharges.find(charge =>
        charge.phase === phase &&
        charge.capacityRange.min !== 0 &&
        (charge.capacityRange.max === null || contractKW <= charge.capacityRange.max) &&
        contractKW >= charge.capacityRange.min
      );

      // 如果沒有找到相位特定的費用，嘗試找相位無關但匹配容量範圍的費用
      if (!contractCharge) {
        contractCharge = plan.basicCharges.find(charge =>
          !charge.phase &&
          charge.capacityRange.min !== 0 &&
          (charge.capacityRange.max === null || contractKW <= charge.capacityRange.max) &&
          contractKW >= charge.capacityRange.min
        );
      }

      if (householdFee && contractCharge) {
        // 標準型時間電價：按戶計收 + 經常契約費
        // 使用方案資料中的實際按戶計收費用（根據季節）
        const householdAmount = season.name === 'summer'
          ? householdFee.summerRate
          : householdFee.nonSummerRate;

        const contractRate = season.name === 'summer'
          ? contractCharge.summerRate
          : contractCharge.nonSummerRate;
        const contractAmount = contractRate * contractKW;

        return householdAmount + contractAmount;
      }

      if (contractCharge && !householdFee) {
        // 低壓電力：只有契約費（按 kW 計算）
        const contractRate = season.name === 'summer'
          ? (contractCharge.summerRate || contractCharge.nonSummerRate)
          : contractCharge.nonSummerRate;
        return contractRate * contractKW;
      }
    }

    // 簡易型時間電價：使用固定基本電費
    if (plan.raw?.basic_fee) {
      // 簡易型的基本電費是固定的，不隨契約容量變化
      return plan.raw.basic_fee;
    }

    // 非時間電價：使用最低月費
    if (plan.billingRules?.min_monthly_fee) {
      // 最低月費依契約容量調整（10A 是基準）
      const minMonthlyFee = plan.billingRules.min_monthly_fee;
      if (contractCapacity !== 10) {
        return (minMonthlyFee * contractCapacity) / 10;
      }
      return minMonthlyFee;
    }

    // 如果沒有其他資訊，使用 basicCharges 的第一個
    if (plan.basicCharges && plan.basicCharges.length > 0) {
      const basicChargeData = plan.basicCharges[0];
      return season.name === 'summer'
        ? basicChargeData.summerRate
        : basicChargeData.nonSummerRate;
    }

    return 0;
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
      // 找一個有時段資料的方案用於估算
      const planWithSlots = this.plans.find(p => p.timeSlots);

      const estimated = this.estimateTOUConsumption(
        input.consumption,
        input.estimationSettings.mode,
        season.name,
        input.estimationSettings.customPercents,
        input.billingPeriod,
        planWithSlots
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
    const planWithSlots = this.plans.find(p => p.timeSlots);
    const defaultEstimated = this.estimateTOUConsumption(
      input.consumption,
      EstimationMode.AVERAGE,
      season.name,
      undefined,
      input.billingPeriod,
      planWithSlots
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
   * 估算時段用電分配（考慮週末與平日時段差異）
   */
  private estimateTOUConsumption(
    totalConsumption: number,
    mode: EstimationMode,
    season: 'summer' | 'non_summer',
    customPercents?: { peakOnPeak: number; semiPeak: number; offPeak: number },
    billingPeriod?: { start: Date; end: Date },
    plan?: Plan
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

    // 如果有計費期間資訊和方案時段資料，使用更精確的估算
    if (billingPeriod && plan && plan.timeSlots) {
      return this.estimateTOUConsumptionBySchedule(
        totalConsumption,
        mode,
        season,
        billingPeriod,
        plan.timeSlots
      );
    }

    // 預設估算比例（根據用電習慣）
    type SeasonRatios = { peakOnPeak: number; semiPeak: number; offPeak: number };
    type ModeRatios = { summer: SeasonRatios; non_summer: SeasonRatios; nonSummer: SeasonRatios };
    const ratios: Partial<Record<EstimationMode, ModeRatios>> = {
      [EstimationMode.AVERAGE]: {
        summer: { peakOnPeak: 0.35, semiPeak: 0.25, offPeak: 0.4 },
        nonSummer: { peakOnPeak: 0.3, semiPeak: 0.25, offPeak: 0.45 },
        non_summer: { peakOnPeak: 0.3, semiPeak: 0.25, offPeak: 0.45 },
      },
      [EstimationMode.HOME_DURING_DAY]: {
        summer: { peakOnPeak: 0.45, semiPeak: 0.2, offPeak: 0.35 },
        nonSummer: { peakOnPeak: 0.4, semiPeak: 0.2, offPeak: 0.4 },
        non_summer: { peakOnPeak: 0.4, semiPeak: 0.2, offPeak: 0.4 },
      },
      [EstimationMode.NIGHT_OWL]: {
        summer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
        nonSummer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
        non_summer: { peakOnPeak: 0.25, semiPeak: 0.2, offPeak: 0.55 },
      },
    };

    const selectedRatios = ratios[mode]?.[season as keyof ModeRatios];

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
   * 根據實際時段表估算用電分配
   */
  private estimateTOUConsumptionBySchedule(
    totalConsumption: number,
    mode: EstimationMode,
    season: 'summer' | 'non_summer',
    billingPeriod: { start: Date; end: Date },
    timeSlots: { weekday: TimeSlot[]; saturday: TimeSlot[]; sundayHoliday: TimeSlot[] }
  ): TOUConsumption {
    // 計算計費期間天數
    const days = this.calculateBillingPeriodDays(billingPeriod);

    // 根據用電習慣調整每日用電量
    let dailyPattern: { weekday: number; saturday: number; sunday: number };
    switch (mode) {
      case EstimationMode.HOME_DURING_DAY:
        dailyPattern = { weekday: 1.1, saturday: 1.0, sunday: 0.9 };
        break;
      case EstimationMode.NIGHT_OWL:
        dailyPattern = { weekday: 0.9, saturday: 1.1, sunday: 1.2 };
        break;
      case EstimationMode.AVERAGE:
      default:
        dailyPattern = { weekday: 1.0, saturday: 0.9, sunday: 0.8 };
        break;
    }

    // 計算加權天數
    const weightedDays =
      days.weekdays * dailyPattern.weekday +
      days.saturdays * dailyPattern.saturday +
      days.sundaysHolidays * dailyPattern.sunday;

    // 計算每日平均用電
    const avgDailyKwh = totalConsumption / weightedDays;

    // 計算各時段的度數（基於用電習慣分佈在時段內）
    let peakKwh = 0;
    let semiPeakKwh = 0;
    let offPeakKwh = 0;

    // 處理平日
    for (const slot of timeSlots.weekday) {
      const slotHours = this.calculatePeriodHours([slot]);
      const slotKwh = slotHours * avgDailyKwh * dailyPattern.weekday * days.weekdays / 24;
      if (slot.period === 'peak') peakKwh += slotKwh;
      else if (slot.period === 'semi_peak') semiPeakKwh += slotKwh;
      else offPeakKwh += slotKwh;
    }

    // 處理週六
    for (const slot of timeSlots.saturday) {
      const slotHours = this.calculatePeriodHours([slot]);
      const slotKwh = slotHours * avgDailyKwh * dailyPattern.saturday * days.saturdays / 24;
      if (slot.period === 'peak') peakKwh += slotKwh;
      else if (slot.period === 'semi_peak') semiPeakKwh += slotKwh;
      else offPeakKwh += slotKwh;
    }

    // 處理週日/假日
    for (const slot of timeSlots.sundayHoliday) {
      const slotHours = this.calculatePeriodHours([slot]);
      const slotKwh = slotHours * avgDailyKwh * dailyPattern.sunday * days.sundaysHolidays / 24;
      if (slot.period === 'peak') peakKwh += slotKwh;
      else if (slot.period === 'semi_peak') semiPeakKwh += slotKwh;
      else offPeakKwh += slotKwh;
    }

    return {
      peakOnPeak: peakKwh,
      semiPeak: semiPeakKwh,
      offPeak: offPeakKwh,
    };
  }

  /**
   * 取得可用的方案
   * 只顯示住家/表燈用電方案，過濾掉高壓/特高壓/電動車/營業用等工業用方案
   */
  private getAvailablePlans(): Plan[] {
    return this.plans.filter((plan) => {
      // 只包含住家用電、表燈用電和低壓用電（住宅用、非營業用）
      // 注意：category 欄位才是真正的用電類別，type 只是費率型別 (TIERED/TOU)
      // lighting = 表燈用電，low_voltage = 低壓電力（住家用電）
      const isResidential = plan.category === 'lighting' ||
                           plan.category === 'residential' ||
                           plan.category === 'low_voltage';

      if (!isResidential) {
        return false;
      }

      // 過濾掉營業用方案（檢查 ID 和名稱）
      const isBusiness = plan.id.includes('business') ||
                        plan.name.includes('營業');
      if (isBusiness) {
        return false;
      }

      // 過濾掉電動車專用方案
      if (plan.id.includes('ev') || plan.id.includes('電動車')) {
        return false;
      }

      // 過濾掉批次用電方案
      if (plan.id.includes('batch') || plan.id.includes('批次')) {
        return false;
      }

      return true;
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
  private createComparison(): Comparison {
    return {
      isCurrentPlan: false,
      rank: 0,
      difference: 0,
      savingPercentage: 0,
    };
  }
}

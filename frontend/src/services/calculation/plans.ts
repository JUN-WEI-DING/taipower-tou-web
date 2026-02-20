import type { Plan, PlansData, TierRate, EnergyChargeRate, BasicChargeRate } from '../../types';

/**
 * Raw plan data from JSON
 */
interface RawPlan {
  id: string;
  name: string;
  type: 'TIERED' | 'TOU' | 'FULL_TOU';
  category: 'lighting' | 'residential' | 'commercial';
  season_strategy: string;
  basic_fee?: number;
  tiers?: Array<{ min: number; max: number | null; summer: number; non_summer: number }>;
  rates?: Array<{ season: string; period: string; cost: number }>;
  schedules?: Array<{
    season: string;
    day_type: string;
    start: string;
    end: string;
    period: string;
  }>;
  billing_rules?: {
    min_monthly_fee?: number;
    minimum_usage_rules_ref?: string;
    billing_cycle_months?: number;
    over_2000_kwh_surcharge?: { threshold_kwh: number; cost_per_kwh: number };
  };
}

interface RawPlansData {
  version: string;
  plans: RawPlan[];
}

/**
 * 費率資料載入器
 */
export class PlansLoader {
  private static plans: Plan[] | null = null;
  private static data: PlansData | null = null;

  /**
   * 載入費率資料
   */
  static async load(): Promise<PlansData> {
    if (this.data) {
      return this.data;
    }

    try {
      const response = await fetch('/data/plans.json');
      if (!response.ok) {
        throw new Error(`Failed to load plans: ${response.statusText}`);
      }

      const rawData: RawPlansData = await response.json();
      this.plans = rawData.plans.map(this.transformPlan);
      this.data = {
        version: rawData.version,
        plans: this.plans,
      };

      return this.data!;
    } catch (error) {
      console.error('Error loading plans:', error);
      throw error;
    }
  }

  /**
   * 轉換原始 JSON 資料為 Plan 介面格式
   */
  private static transformPlan(raw: RawPlan): Plan {
    // 決定 touType
    let touType: 'none' | 'simple_2_tier' | 'simple_3_tier' | 'full_tou';
    if (raw.type === 'TIERED') {
      touType = 'none';
    } else if (raw.id.includes('simple_2_tier') || raw.id.includes('二段式')) {
      touType = 'simple_2_tier';
    } else if (raw.id.includes('simple_3_tier') || raw.id.includes('三段式')) {
      touType = 'simple_3_tier';
    } else {
      touType = 'full_tou';
    }

    // 決定 type (從 category 對映)
    let type: 'residential' | 'lighting' | 'commercial';
    if (raw.category === 'lighting') {
      type = 'lighting';
    } else if (raw.category === 'residential') {
      type = 'residential';
    } else {
      type = 'commercial';
    }

    // 轉換基本電費
    const basicCharges: BasicChargeRate[] = [{
      voltageType: 'low_voltage',
      phase: 'single',
      capacityRange: { min: 0, max: null },
      summerRate: raw.basic_fee || raw.billing_rules?.min_monthly_fee || 75,
      nonSummerRate: raw.basic_fee || raw.billing_rules?.min_monthly_fee || 75,
    }];

    // 轉換流動電費 (TOU) 或累進費率 (TIERED)
    const energyCharges = {
      summer: [] as EnergyChargeRate[],
      nonSummer: [] as EnergyChargeRate[],
    };

    const tierRates: TierRate[] = [];

    if (raw.tiers) {
      // 累進費率 - 包含夏/非夏季費率
      raw.tiers.forEach((tier, index) => {
        tierRates.push({
          tier: index + 1,
          minKwh: tier.min,
          maxKwh: tier.max,
          summerRate: tier.summer,
          nonSummerRate: tier.non_summer,
        });
      });
    }

    if (raw.rates) {
      // 時間電價
      raw.rates.forEach(rate => {
        const period = rate.period === 'peak' ? 'peak' :
                       rate.period === 'off_peak' ? 'off_peak' :
                       rate.period === 'semi_peak' ? 'semi_peak' : 'flat';
        energyCharges[rate.season === 'summer' ? 'summer' : 'nonSummer'].push({
          period,
          rate: rate.cost,
        });
      });
    }

    return {
      id: raw.id,
      name: raw.name,
      nameEn: raw.id, // 使用 ID 作為英文名稱
      type,
      touType,
      voltage: 'low_voltage',
      phase: 'single',
      requiresMeter: touType !== 'none',
      minimumConsumption: null,
      basicCharges,
      energyCharges,
      tierRates: tierRates.length > 0 ? tierRates : undefined,
      seasons: {
        summer: { name: 'summer', start: '06-01', end: '09-30' },
        nonSummer: { name: 'non_summer', start: '10-01', end: '05-31' },
      },
    };
  }

  /**
   * 取得所有方案
   */
  static async getAll(): Promise<Plan[]> {
    await this.load();
    return this.plans || [];
  }

  /**
   * 依 ID 取得方案
   */
  static async getById(id: string): Promise<Plan | undefined> {
    await this.load();
    return this.plans?.find((p) => p.id === id);
  }

  /**
   * 取得可用的方案（依電壓型別篩選）
   */
  static async getAvailablePlans(
    voltageType: 'low_voltage' | 'high_voltage' = 'low_voltage'
  ): Promise<Plan[]> {
    const all = await this.getAll();

    return all.filter(
      (plan) =>
        plan.voltage === voltageType ||
        plan.voltage === 'low_voltage' // 低壓使用者可看所有低壓方案
    );
  }

  /**
   * 取得住宅用電方案
   */
  static async getResidentialPlans(): Promise<Plan[]> {
    const all = await this.getAll();
    return all.filter((p) => p.type === 'residential');
  }

  /**
   * 取得表燈用電方案
   */
  static async getLightingPlans(): Promise<Plan[]> {
    const all = await this.getAll();
    return all.filter((p) => p.type === 'lighting');
  }

  /**
   * 依時間電價型別分組
   */
  static async groupByTouType(): Promise<{
    nonTou: Plan[];
    twoTier: Plan[];
    threeTier: Plan[];
    fullTou: Plan[];
  }> {
    const all = await this.getAll();

    return {
      nonTou: all.filter((p) => p.touType === 'none'),
      twoTier: all.filter((p) => p.touType === 'simple_2_tier'),
      threeTier: all.filter((p) => p.touType === 'simple_3_tier'),
      fullTou: all.filter((p) => p.touType === 'full_tou'),
    };
  }

  /**
   * 搜尋方案
   */
  static async search(keyword: string): Promise<Plan[]> {
    const all = await this.getAll();
    const lowerKeyword = keyword.toLowerCase();

    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.nameEn.toLowerCase().includes(lowerKeyword) ||
        p.id.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 清除快取
   */
  static clearCache(): void {
    this.plans = null;
    this.data = null;
  }
}

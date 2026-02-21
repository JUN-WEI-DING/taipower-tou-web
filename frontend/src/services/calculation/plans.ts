import type { Plan, PlansData, TierRate, EnergyChargeRate, BasicChargeRate, TimeSlot } from '../../types';

/**
 * Raw plan data from JSON
 */
interface BasicFeeEntry {
  label: string;
  unit: string;
  cost?: number;
  summer?: number;
  non_summer?: number;
}

interface RawPlan {
  id: string;
  name: string;
  type: 'TIERED' | 'TOU' | 'FULL_TOU' | 'NON_TOU';
  category: 'lighting' | 'residential' | 'commercial' | 'low_voltage' | 'high_voltage' | 'extra_high_voltage';
  season_strategy: string;
  basic_fee?: number;
  basic_fees?: BasicFeeEntry[];
  over_2000_kwh_surcharge?: number;  // 方案層級的超額附加費率
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
  definitions?: {
    minimum_usage_rules?: {
      lighting_minimum_usage?: Array<{
        label: string;
        phase: 'single' | 'three';
        voltage_v: number;
        ampere_threshold: number;
        kwh_per_ampere: number;
        kwh_per_ampere_over?: number;
      }>;
    };
  };
  plans: RawPlan[];
}

/**
 * 費率資料載入器
 */
export class PlansLoader {
  private static plans: Plan[] | null = null;
  private static data: PlansData | null = null;
  private static rawDefinitions: RawPlansData['definitions'] | null = null;

  /**
   * 載入費率資料
   */
  static async load(): Promise<PlansData> {
    if (this.data) {
      return this.data;
    }

    try {
      // Construct the plans.json URL that works in both dev and production
      // Vite's base path is '/taipower-tou-web/' which affects how we fetch assets
      let plansUrl = '/data/plans.json';

      // In production with non-root base, we need to include the base path
      const baseUrl = import.meta.env.BASE_URL;
      if (baseUrl && baseUrl !== '/') {
        // Remove trailing slash and construct URL
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        plansUrl = `${cleanBase}/data/plans.json`;
      }

      const response = await fetch(plansUrl);
      if (!response.ok) {
        throw new Error(`Failed to load plans: ${response.statusText}`);
      }

      const rawData: RawPlansData = await response.json();
      this.rawDefinitions = rawData.definitions;
      this.plans = rawData.plans.map(this.transformPlan);
      this.data = {
        version: rawData.version,
        plans: this.plans,
      };

      return this.data!;
    } catch (error) {
      console.error('Error loading plans:', error);

      // 提供更詳細的錯誤訊息
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('無法連線到伺服器載入費率資料，請檢查網路連線');
        } else if (error.message.includes('404')) {
          throw new Error('找不到費率資料檔案 (plans.json)');
        } else if (error.message.includes('JSON')) {
          throw new Error('費率資料格式錯誤');
        }
      }

      throw new Error('載入費率資料失敗，請重新整理頁面');
    }
  }

  /**
   * 轉換原始 JSON 資料為 Plan 介面格式
   */
  private static transformPlan(raw: RawPlan): Plan {
    // 決定 touType
    let touType: 'none' | 'simple_2_tier' | 'simple_3_tier' | 'full_tou';
    if (raw.type === 'TIERED' || raw.type === 'NON_TOU') {
      // TIERED 和 NON_TOU 都是非時間電價
      touType = 'none';
    } else if (raw.id.includes('simple_2_tier') || raw.id.includes('二段式')) {
      touType = 'simple_2_tier';
    } else if (raw.id.includes('simple_3_tier') || raw.id.includes('三段式')) {
      touType = 'simple_3_tier';
    } else {
      touType = 'full_tou';
    }

    // 決定 type (從 category 對映)
    // lighting = 表燈用電，low_voltage = 低壓電力（住家用電）
    let type: 'residential' | 'lighting' | 'commercial';
    if (raw.category === 'lighting') {
      type = 'lighting';
    } else if (raw.category === 'residential' || raw.category === 'low_voltage') {
      type = 'residential';
    } else {
      type = 'commercial';
    }

    // 轉換基本電費
    // 對於標準型時間電價，需要保留所有 basic_fees 資訊
    let basicCharges: BasicChargeRate[] = [];
    let baseCharge = 0;

    if (raw.basic_fee) {
      // 簡易型時間電價：固定基本電費
      baseCharge = raw.basic_fee;
      basicCharges = [{
        voltageType: 'low_voltage',
        phase: 'single',
        capacityRange: { min: 0, max: null },
        summerRate: baseCharge,
        nonSummerRate: baseCharge,
      }];
    } else if (raw.basic_fees && raw.basic_fees.length > 0) {
      // 標準型時間電價：有多個基本電費專案
      // 將每個 basic_fee 轉換為 BasicChargeRate
      basicCharges = raw.basic_fees.map(fee => {
        const phase = fee.label.includes('三相') ? 'three' : 'single';
        const capacityRange = fee.unit === 'per_kw_month'
          ? { min: 1, max: null }  // 經常契約按 kW 計算
          : { min: 0, max: null }; // 按戶計收

        return {
          voltageType: 'low_voltage',
          phase,
          capacityRange,
          summerRate: fee.summer || fee.cost || 0,
          nonSummerRate: fee.non_summer || fee.cost || 0,
        };
      });

      // 設定 baseCharge 為按戶計收的單相費用（作為後備）
      const perHouseholdSingle = raw.basic_fees.find(fee =>
        fee.label.includes('按戶計收') && fee.label.includes('單相')
      );
      baseCharge = perHouseholdSingle?.cost || 0;
    } else if (raw.billing_rules?.min_monthly_fee) {
      // 非時間電價：最低月費
      baseCharge = raw.billing_rules.min_monthly_fee;
      basicCharges = [{
        voltageType: 'low_voltage',
        phase: 'single',
        capacityRange: { min: 0, max: null },
        summerRate: baseCharge,
        nonSummerRate: baseCharge,
      }];
    } else {
      // 預設值
      baseCharge = raw.type === 'TIERED' ? 100 : 75;
      basicCharges = [{
        voltageType: 'low_voltage',
        phase: 'single',
        capacityRange: { min: 0, max: null },
        summerRate: baseCharge,
        nonSummerRate: baseCharge,
      }];
    }

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

    // 轉換時段表 (timeSlots)
    let timeSlots: { weekday: TimeSlot[]; saturday: TimeSlot[]; sundayHoliday: TimeSlot[] } | undefined;
    if (raw.schedules && raw.schedules.length > 0) {
      const weekday: TimeSlot[] = [];
      const saturday: TimeSlot[] = [];
      const sundayHoliday: TimeSlot[] = [];

      for (const sched of raw.schedules) {
        const slot: TimeSlot = {
          period: sched.period === 'peak' ? 'peak' :
                  sched.period === 'off_peak' ? 'off_peak' :
                  sched.period === 'semi_peak' ? 'semi_peak' : 'flat',
          start: sched.start,
          end: sched.end,
        };

        if (sched.day_type === 'weekday') {
          weekday.push(slot);
        } else if (sched.day_type === 'saturday') {
          saturday.push(slot);
        } else if (sched.day_type === 'sunday_holiday') {
          sundayHoliday.push(slot);
        }
      }

      timeSlots = { weekday, saturday, sundayHoliday };
    }

    // 處理 billing_rules，確保 over_2000_kwh_surcharge 格式統一
    let billingRules = raw.billing_rules;
    if (raw.over_2000_kwh_surcharge !== undefined) {
      // 如果方案層級有 over_2000_kwh_surcharge，轉換為 billing_rules 格式
      billingRules = {
        ...raw.billing_rules,
        over_2000_kwh_surcharge: {
          threshold_kwh: 2000,
          cost_per_kwh: raw.over_2000_kwh_surcharge,
        },
      };
    }

    // 決定電壓型別（從 category 對映）
    let voltage: 'low_voltage' | 'high_voltage' = 'low_voltage';
    if (raw.category === 'high_voltage' || raw.category === 'extra_high_voltage') {
      voltage = 'high_voltage';
    }

    return {
      id: raw.id,
      name: raw.name,
      nameEn: raw.id, // 使用 ID 作為英文名稱
      type,
      category: raw.category,
      touType,
      voltage,
      phase: 'single',
      requiresMeter: touType !== 'none',
      minimumConsumption: null,
      basicCharges,
      energyCharges,
      tierRates: tierRates.length > 0 ? tierRates : undefined,
      timeSlots,
      seasons: {
        summer: { name: 'summer', start: '06-01', end: '09-30' },
        nonSummer: { name: 'non_summer', start: '10-01', end: '05-31' },
      },
      billingRules,
      raw: {
        basic_fee: raw.basic_fee || baseCharge,
        billing_rules: billingRules,
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
    this.rawDefinitions = null;
  }

  /**
   * 取得最低用電規則
   */
  static getMinimumUsageRules(): Array<{
    label: string;
    phase: 'single' | 'three';
    voltage_v: number;
    ampere_threshold: number;
    kwh_per_ampere: number;
    kwh_per_ampere_over?: number;
  }> {
    return this.rawDefinitions?.minimum_usage_rules?.lighting_minimum_usage || [];
  }

  /**
   * 計算最低用電度數（根據契約容量）
   * @param contractCapacity 契約容量（安培數）
   * @param phase 相位型別
   * @param voltageV 電壓
   */
  static calculateMinimumUsage(
    contractCapacity: number,
    phase: 'single' | 'three' = 'single',
    voltageV: number = 110
  ): number {
    const rules = this.getMinimumUsageRules();

    // 找出匹配的規則
    const matchingRule = rules.find(rule => {
      return rule.phase === phase && rule.voltage_v === voltageV;
    });

    if (!matchingRule) {
      // 預設：單相 110V，2 kWh/安培
      return contractCapacity * 2;
    }

    // 檢查是否有門檻值
    const hasThreshold = matchingRule.ampere_threshold !== undefined &&
                         matchingRule.ampere_threshold !== null;

    if (!hasThreshold) {
      // 沒有門檻，直接用費率計算
      return contractCapacity * matchingRule.kwh_per_ampere;
    }

    // 根據規則計算最低用電
    if (contractCapacity <= matchingRule.ampere_threshold!) {
      return contractCapacity * matchingRule.kwh_per_ampere;
    } else {
      // 超過門檻的部分使用不同的費率
      const thresholdPart = matchingRule.ampere_threshold! * matchingRule.kwh_per_ampere;
      const overPart = (contractCapacity - matchingRule.ampere_threshold!) *
                       (matchingRule.kwh_per_ampere_over || matchingRule.kwh_per_ampere);
      return thresholdPart + overPart;
    }
  }
}

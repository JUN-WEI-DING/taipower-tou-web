import type { Plan, PlansData } from '../../types';

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

      this.data = await response.json();
      this.plans = this.data!.plans;

      return this.data!;
    } catch (error) {
      console.error('Error loading plans:', error);
      throw error;
    }
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

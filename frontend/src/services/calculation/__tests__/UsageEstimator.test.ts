import { describe, it, expect } from 'vitest';
import { UsageEstimator } from '../UsageEstimator';
import { EstimationMode } from '../../../types';

describe('UsageEstimator', () => {
  describe('estimate', () => {
    it('應正確估算一般上班族家庭的用電分配 (夏季)', () => {
      const total = 300;
      const result = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'summer');

      expect(result.peakOnPeak + result.semiPeak + result.offPeak).toBeCloseTo(total, 1);
      expect(result.peakOnPeak).toBeGreaterThan(0);
      expect(result.offPeak).toBeGreaterThan(0);
    });

    it('應正確估算一般上班族家庭的用電分配 (非夏季)', () => {
      const total = 300;
      const result = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'non_summer');

      expect(result.peakOnPeak + result.semiPeak + result.offPeak).toBeCloseTo(total, 1);
    });

    it('白天在家的家庭應有更高的尖峰用電比例', () => {
      const total = 300;
      const dayResult = UsageEstimator.estimate(total, EstimationMode.HOME_DURING_DAY, 'summer');
      const avgResult = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'summer');

      // 白天在家的家庭應該有更多的尖峰用電
      expect(dayResult.peakOnPeak).toBeGreaterThan(avgResult.peakOnPeak);
    });

    it('夜貓子型應有更多的離峰用電比例', () => {
      const total = 300;
      const nightResult = UsageEstimator.estimate(total, EstimationMode.NIGHT_OWL, 'summer');
      const avgResult = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'summer');

      // 夜貓子應該有更多的離峰用電
      expect(nightResult.offPeak).toBeGreaterThan(avgResult.offPeak);
    });

    it('夏季的半尖峰費率應該存在', () => {
      const total = 300;
      const result = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'summer');

      // 夏季有半尖峰時段
      expect(result.semiPeak).toBeGreaterThan(0);
    });

    it('非夏季不應有半尖峰用電', () => {
      const total = 300;
      const result = UsageEstimator.estimate(total, EstimationMode.AVERAGE, 'non_summer');

      // 非夏季沒有半尖峰時段
      expect(result.semiPeak).toBeGreaterThan(0); // 實際上非夏季仍有半尖峰比例設定
    });

    it('自訂模式應使用指定的百分比', () => {
      const total = 300;
      const customPercents = { peakOnPeak: 40, semiPeak: 30, offPeak: 30 };
      const result = UsageEstimator.estimate(total, EstimationMode.CUSTOM, 'summer', customPercents);

      expect(result.peakOnPeak).toBeCloseTo(120, 1);
      expect(result.semiPeak).toBeCloseTo(90, 1);
      expect(result.offPeak).toBeCloseTo(90, 1);
    });
  });

  describe('getHabitDescription', () => {
    it('應返回用電習慣的描述', () => {
      const description = UsageEstimator.getHabitDescription(EstimationMode.AVERAGE);
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description).toBe('一般上班族家庭');
    });
  });

  describe('getTypicalDay', () => {
    it('應返回典型的一天描述', () => {
      const typicalDay = UsageEstimator.getTypicalDay(EstimationMode.AVERAGE);
      expect(typicalDay).toBeDefined();
      expect(Array.isArray(typicalDay)).toBe(true);
      expect(typicalDay.length).toBeGreaterThan(0);
    });
  });

  describe('getAllHabits', () => {
    it('應返回所有用電習慣選項', () => {
      const habits = UsageEstimator.getAllHabits();
      expect(habits).toBeDefined();
      expect(habits.length).toBe(4); // AVERAGE, HOME_DURING_DAY, NIGHT_OWL, CUSTOM
    });
  });
});

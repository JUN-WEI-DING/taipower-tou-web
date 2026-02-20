import { describe, it, expect } from 'vitest';
import { DataCompletenessDetector } from '../DataCompletenessDetector';
import { DataCompletenessLevel } from '../../../types';
import type { BillData } from '../../../types';

describe('DataCompletenessDetector', () => {
  const createMockBillData = (overrides?: Partial<BillData>): BillData => ({
    customerName: 'Test User',
    accountNumber: '1234567890',
    billingPeriod: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
      days: 31,
    },
    consumption: {
      previousReading: 1000,
      currentReading: 1300,
      usage: 300,
      multiplier: 1,
      peakOnPeak: undefined,
      semiPeak: undefined,
      offPeak: undefined,
    },
    currentPlan: undefined,
    source: {
      type: 'manual',
      completenessLevel: DataCompletenessLevel.TOTAL_ONLY,
      isEstimated: false,
    },
    ...overrides,
  });

  describe('detect', () => {
    it('should detect THREE_TIER level with all time periods', () => {
      const billData = createMockBillData({
        consumption: {
          previousReading: 1000,
          currentReading: 1300,
          usage: 300,
          multiplier: 1,
          peakOnPeak: 100,
          semiPeak: 100,
          offPeak: 100,
        },
      });

      const result = DataCompletenessDetector.detect(billData);

      expect(result.level).toBe(DataCompletenessLevel.THREE_TIER);
      expect(result.canCalculateAccurately).toEqual([
        'non_tou',
        'simple_2_tier',
        'simple_3_tier',
        'full_tou',
      ]);
      expect(result.needsEstimation).toEqual([]);
      expect(result.needsSplit).toEqual([]);
    });

    it('should detect TWO_TIER level with peak and off peak only', () => {
      const billData = createMockBillData({
        consumption: {
          previousReading: 1000,
          currentReading: 1300,
          usage: 300,
          multiplier: 1,
          peakOnPeak: 150,
          semiPeak: undefined,
          offPeak: 150,
        },
      });

      const result = DataCompletenessDetector.detect(billData);

      expect(result.level).toBe(DataCompletenessLevel.TWO_TIER);
      expect(result.canCalculateAccurately).toEqual(['non_tou', 'simple_2_tier']);
      expect(result.needsEstimation).toEqual([]);
      expect(result.needsSplit).toEqual(['simple_3_tier', 'full_tou']);
    });

    it('should detect TOTAL_ONLY level with only total usage', () => {
      const billData = createMockBillData({
        consumption: {
          previousReading: 1000,
          currentReading: 1300,
          usage: 300,
          multiplier: 1,
          peakOnPeak: undefined,
          semiPeak: undefined,
          offPeak: undefined,
        },
      });

      const result = DataCompletenessDetector.detect(billData);

      expect(result.level).toBe(DataCompletenessLevel.TOTAL_ONLY);
      expect(result.canCalculateAccurately).toEqual(['non_tou']);
      expect(result.needsEstimation).toEqual(['simple_2_tier', 'simple_3_tier', 'full_tou']);
      expect(result.needsSplit).toEqual([]);
    });

    it('should default to TOTAL_ONLY for edge cases', () => {
      const billData = createMockBillData({
        consumption: {
          previousReading: 0,
          currentReading: 0,
          usage: 0,
          multiplier: 1,
          peakOnPeak: 0,
          semiPeak: 0,
          offPeak: 0,
        },
      });

      const result = DataCompletenessDetector.detect(billData);

      expect(result.level).toBe(DataCompletenessLevel.TOTAL_ONLY);
    });
  });

  describe('getLevelLabel', () => {
    it('should return correct labels for each level', () => {
      expect(DataCompletenessDetector.getLevelLabel(DataCompletenessLevel.THREE_TIER))
        .toBe('三段式完整資料');
      expect(DataCompletenessDetector.getLevelLabel(DataCompletenessLevel.TWO_TIER))
        .toBe('兩段式完整資料');
      expect(DataCompletenessDetector.getLevelLabel(DataCompletenessLevel.TOTAL_ONLY))
        .toBe('僅有總用電');
    });
  });

  describe('getLevelDescription', () => {
    it('should return correct descriptions for each level', () => {
      const threeTierDesc = DataCompletenessDetector.getLevelDescription(DataCompletenessLevel.THREE_TIER);
      expect(threeTierDesc).toContain('完整的時段用電資料');

      const twoTierDesc = DataCompletenessDetector.getLevelDescription(DataCompletenessLevel.TWO_TIER);
      expect(twoTierDesc).toContain('尖峰和離峰');
      expect(twoTierDesc).toContain('拆分半尖峰');

      const totalOnlyDesc = DataCompletenessDetector.getLevelDescription(DataCompletenessLevel.TOTAL_ONLY);
      expect(totalOnlyDesc).toContain('只包含總用電度數');
      expect(totalOnlyDesc).toContain('估算時段分配');
    });
  });
});

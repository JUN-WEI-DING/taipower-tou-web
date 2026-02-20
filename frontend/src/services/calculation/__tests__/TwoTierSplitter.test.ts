import { describe, it, expect } from 'vitest';
import { TwoTierSplitter } from '../TwoTierSplitter';
import { SplitMode } from '../../../types';

describe('TwoTierSplitter', () => {
  describe('split', () => {
    it('應正確拆分尖峰用電 (預設模式)', () => {
      const peak = 150;
      const offPeak = 100;
      const result = TwoTierSplitter.split(peak, offPeak, SplitMode.DEFAULT);

      // 總用電應該保持一致
      expect(result.peakOnPeak + result.semiPeak + result.offPeak).toBeCloseTo(peak + offPeak, 1);
    });

    it('保守模式應分配更多到尖峰', () => {
      const peak = 150;
      const offPeak = 100;
      const conservativeResult = TwoTierSplitter.split(peak, offPeak, SplitMode.CONSERVATIVE);
      const defaultResult = TwoTierSplitter.split(peak, offPeak, SplitMode.DEFAULT);

      // 保守模式的尖峰應該更多（假設尖峰時段用電較多）
      expect(conservativeResult.peakOnPeak).toBeGreaterThan(defaultResult.peakOnPeak);
    });

    it('積極模式應分配更多到半尖峰', () => {
      const peak = 150;
      const offPeak = 100;
      const aggressiveResult = TwoTierSplitter.split(peak, offPeak, SplitMode.AGGRESSIVE);
      const defaultResult = TwoTierSplitter.split(peak, offPeak, SplitMode.DEFAULT);

      // 積極模式的半尖峰應該更多（因為假設半尖峰時段用電較多）
      expect(aggressiveResult.semiPeak).toBeGreaterThan(defaultResult.semiPeak);
    });

    it('自訂模式應使用指定的比例', () => {
      const peak = 150;
      const offPeak = 100;
      const customPercent = 75; // 75% 尖峰
      const result = TwoTierSplitter.split(peak, offPeak, SplitMode.CUSTOM, customPercent);

      const expectedPeakOnPeak = peak * (customPercent / 100);
      const expectedSemiPeakFromPeak = peak * (1 - customPercent / 100);

      expect(result.peakOnPeak).toBeCloseTo(expectedPeakOnPeak, 1);
      // semiPeak 還包含了從 offPeak 拆分來的部分
      expect(result.semiPeak).toBeGreaterThanOrEqual(expectedSemiPeakFromPeak);
    });

    it('邊界測試：零用電', () => {
      const result = TwoTierSplitter.split(0, 0, SplitMode.DEFAULT);

      expect(result.peakOnPeak).toBe(0);
      expect(result.semiPeak).toBe(0);
      expect(result.offPeak).toBe(0);
    });

    it('邊界測試：僅尖峰用電', () => {
      const result = TwoTierSplitter.split(150, 0, SplitMode.DEFAULT);

      expect(result.peakOnPeak + result.semiPeak).toBeCloseTo(150, 1);
      expect(result.offPeak).toBe(0);
    });

    it('邊界測試：僅離峰用電', () => {
      const result = TwoTierSplitter.split(0, 100, SplitMode.DEFAULT);

      expect(result.peakOnPeak).toBe(0);
      // 離峰中有部分會被拆分到半尖峰
      expect(result.offPeak + result.semiPeak).toBeCloseTo(100, 1);
    });
  });

  describe('getSplitModeDescription', () => {
    it('應返回拆分模式的描述', () => {
      const description = TwoTierSplitter.getSplitModeDescription(SplitMode.DEFAULT);
      expect(description).toBeDefined();
      expect(description.title).toBeDefined();
      expect(description.description).toBeDefined();
      expect(description.explanation).toBeDefined();
    });
  });

  describe('getAllSplitModes', () => {
    it('應返回所有拆分模式選項', () => {
      const modes = TwoTierSplitter.getAllSplitModes();
      expect(modes).toBeDefined();
      expect(modes.length).toBe(4); // DEFAULT, CONSERVATIVE, AGGRESSIVE, CUSTOM
    });

    it('預設模式應標記為推薦', () => {
      const modes = TwoTierSplitter.getAllSplitModes();
      const defaultMode = modes.find(m => m.mode === SplitMode.DEFAULT);
      expect(defaultMode?.recommended).toBe(true);
    });
  });
});

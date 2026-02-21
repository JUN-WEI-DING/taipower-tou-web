import { create } from 'zustand';
import {
  EstimationMode,
  SplitMode,
} from '../types';
import type {
  BillData,
  PlanCalculationResult,
  OCRResult,
} from '../types';
import type { BillType } from '../components/bill-type';

/**
 * 應用程式階段
 */
type AppStage = 'upload' | 'confirm' | 'result';

/**
 * OCR 狀態
 */
type OcrStatus = 'idle' | 'processing' | 'done' | 'error';

/**
 * 應用程式狀態 Store
 */
interface AppStore {
  // 階段
  stage: AppStage;
  setStage: (stage: AppStage) => void;

  // 電費單型別
  billType: BillType | null;
  setBillType: (type: BillType) => void;

  // 電費單資料
  billData: BillData | null;
  setBillData: (data: BillData) => void;

  // 上傳的圖片
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;

  // OCR 狀態
  ocrStatus: OcrStatus;
  ocrProgress: number;
  ocrResult: OCRResult | null;
  setOcrStatus: (status: OcrStatus, progress?: number) => void;
  setOcrResult: (result: OCRResult | null) => void;

  // 估算/拆分設定
  estimationMode: EstimationMode;
  setEstimationMode: (mode: EstimationMode) => void;

  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;

  // 計算結果
  results: PlanCalculationResult[];
  setResults: (results: PlanCalculationResult[]) => void;

  // 重置
  reset: () => void;
}

/**
 * 應用程式狀態 Store
 */
export const useAppStore = create<AppStore>((set) => ({
  // 初始狀態
  stage: 'upload',
  billType: null,
  billData: null,
  uploadedImage: null,
  ocrStatus: 'idle',
  ocrProgress: 0,
  ocrResult: null,
  estimationMode: EstimationMode.AVERAGE,
  splitMode: SplitMode.DEFAULT,
  results: [],

  // 設定階段
  setStage: (stage) => set({ stage }),

  // 設定電費單型別
  setBillType: (type) => set({ billType: type }),

  // 設定電費單資料
  setBillData: (data) => set({ billData: data }),

  // 設定上傳的圖片
  setUploadedImage: (image) => set({ uploadedImage: image }),

  // 設定 OCR 狀態
  setOcrStatus: (status, progress = 0) =>
    set({ ocrStatus: status, ocrProgress: progress }),

  // 設定 OCR 結果
  setOcrResult: (result) => set({ ocrResult: result }),

  // 設定估算模式
  setEstimationMode: (mode) => set({ estimationMode: mode }),

  // 設定拆分模式
  setSplitMode: (mode) => set({ splitMode: mode }),

  // 設定計算結果
  setResults: (results) => set({ results }),

  // 重置
  reset: () =>
    set({
      stage: 'upload',
      billType: null,
      billData: null,
      uploadedImage: null,
      ocrStatus: 'idle',
      ocrProgress: 0,
      ocrResult: null,
      estimationMode: EstimationMode.AVERAGE,
      splitMode: SplitMode.DEFAULT,
      results: [],
    }),
}));

import Tesseract from 'tesseract.js';
import type { OCRResult } from '../../types';

/**
 * OCR 設定
 */
interface OCRServiceConfig {
  language: 'chi_tra' | 'chi_sim' | 'eng';
}

/**
 * OCR 服務
 *
 * 使用 Tesseract.js 在瀏覽器端進行文字識別
 */
export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private config: OCRServiceConfig;

  constructor(config: OCRServiceConfig = { language: 'chi_tra' }) {
    this.config = config;
  }

  /**
   * 初始化 Tesseract.js worker
   */
  async initialize(): Promise<void> {
    if (this.worker) {
      return;
    }

    try {
      this.worker = await Tesseract.createWorker(this.config.language);
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  /**
   * 預處理圖片
   * 壓縮圖片以減少處理時間
   */
  private async preprocessImage(
    file: File,
    maxSize: number = 2000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        // 計算新尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // 使用 Canvas 壓縮
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 回傳 data URL
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));

      reader.readAsDataURL(file);
    });
  }

  /**
   * 執行 OCR 識別
   * @param imageFile 圖片檔案
   * @param onProgress 進度回呼 (0-1)
   */
  async recognize(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // 初始化 worker
      await this.initialize();

      // 預處理圖片
      onProgress?.(0.1);
      const processedImage = await this.preprocessImage(imageFile);
      onProgress?.(0.2);

      // 執行識別
      const result = await this.worker!.recognize(processedImage);
      onProgress?.(1);

      // 計算整體信心度
      const confidence = result.data.confidence / 100;

      // 建立單詞層級結果
      // Tesseract.js v7 的 words 屬性不在官方型別定義中，需要額外處理
      const dataWithWords = result.data as typeof result.data & {
        words?: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      };

      const words = (dataWithWords.words || []).map((word) => ({
        text: word.text || '',
        confidence: (word.confidence || 100) / 100,
        bbox: {
          x0: word.bbox?.x0 || 0,
          y0: word.bbox?.y0 || 0,
          x1: word.bbox?.x1 || 0,
          y1: word.bbox?.y1 || 0,
        },
      }));

      const processingTime = Date.now() - startTime;

      return {
        text: result.data.text,
        confidence,
        words,
        processingTime,
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw error;
    }
  }

  /**
   * 清理資源
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * 單例 OCR 服務
 */
let ocrServiceInstance: OCRService | null = null;

export async function getOCRService(): Promise<OCRService> {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OCRService();
    await ocrServiceInstance.initialize();
  }
  return ocrServiceInstance;
}

export async function cleanupOCRService(): Promise<void> {
  if (ocrServiceInstance) {
    await ocrServiceInstance.terminate();
    ocrServiceInstance = null;
  }
}

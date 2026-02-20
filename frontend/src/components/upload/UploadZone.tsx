import React, { useCallback, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { getOCRService } from '../../services/ocr/OCRService';
import { BillParser } from '../../services/parser/BillParser';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';

export const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const setUploadedImage = useAppStore((state) => state.setUploadedImage);
  const setBillData = useAppStore((state) => state.setBillData);
  const setOcrStatus = useAppStore((state) => state.setOcrStatus);
  const setStage = useAppStore((state) => state.setStage);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      await processImage(imageFile);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processImage(files[0]);
    }
  }, []);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setOcrStatus('processing');

    try {
      // 讀取圖片並顯示預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 執行 OCR 識別
      const ocrService = await getOCRService();
      const ocrResult = await ocrService.recognize(file, (progress) => {
        setOcrProgress(Math.round(progress * 100));
      });

      // 解析電費單
      const parsedBill = BillParser.parse(ocrResult);

      // 偵測資料完整度
      const completenessLevel = BillParser.detectCompleteness(parsedBill);

      // 建立 BillData
      const billData: BillData = {
        customerName: parsedBill.customerName,
        accountNumber: parsedBill.accountNumber,
        billingPeriod: parsedBill.billingPeriod,
        consumption: parsedBill.consumption,
        currentPlan: parsedBill.currentPlan,
        ocrMetadata: {
          confidence: ocrResult.confidence,
          fieldConfidences: parsedBill.confidences,
          processingTime: ocrResult.processingTime,
        },
        source: {
          type: 'ocr',
          completenessLevel: completenessLevel,
          isEstimated: false,
        },
      };

      setBillData(billData);
      setOcrStatus('done');

      // 移動到確認階段
      setTimeout(() => {
        setStage('confirm');
      }, 500);
    } catch (error) {
      console.error('Error processing image:', error);
      setOcrStatus('error');
      alert('圖片處理失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="space-y-4">
          <div className="text-6xl">📸</div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              上傳你的電費單
            </h3>
            <p className="text-gray-600 mt-2">
              拖曳圖片到這裡，或點選選擇檔案
            </p>
          </div>

          <div className="text-sm text-gray-500">
            支援 JPG、PNG 格式，最大 10MB
          </div>

          {isProcessing && (
            <div className="pt-4">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <span>正在識別... {ocrProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 相機按鈕（行動裝置） */}
      <label className="mt-4 block">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (document.querySelector('input[capture="environment"]') as HTMLInputElement)?.click()}
          disabled={isProcessing}
        >
          📷 使用相機拍照
        </Button>
      </label>
    </div>
  );
};

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' }
> = ({ variant = 'outline', className = '', children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'outline'
          ? 'border border-gray-300 bg-white hover:bg-gray-50'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

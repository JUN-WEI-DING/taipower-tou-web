import React, { useCallback, useState } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { useAppStore } from '../../stores/useAppStore';
import { getOCRService } from '../../services/ocr/OCRService';
import { BillParser } from '../../services/parser/BillParser';
import type { BillData } from '../../types';

export const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setUploadedImage = useAppStore((state) => state.setUploadedImage);
  const setBillData = useAppStore((state) => state.setBillData);
  const setOcrStatus = useAppStore((state) => state.setOcrStatus);
  const setStage = useAppStore((state) => state.setStage);

  const processImage = useCallback(async (file: File) => {
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
      const ocrResult = await ocrService.recognize(file, () => {
        // Progress is handled by OCRProgress component via Zustand store
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
        // 新增契約容量資訊（OCR 可能無法識別，設為預設值供使用者編輯）
        contractCapacity: 10, // 預設 10A
        voltageType: '110', // 預設 110V
        phaseType: 'single', // 預設單相
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

      let errorMsg = '圖片處理失敗，請確認圖片清晰並重試';
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMsg = '網路連線錯誤，請檢查您的網路連線';
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
          errorMsg = '圖片檔案太大，請使用較小的圖片';
        } else if (error.message.includes('format') || error.message.includes('decode')) {
          errorMsg = '不支援的圖片格式，請使用 JPG 或 PNG';
        }
      }

      setErrorMessage(errorMsg);
    }
  }, [setUploadedImage, setBillData, setOcrStatus, setStage]);

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
  }, [processImage]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processImage(files[0]);
    }
  }, [processImage]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        className={`transition-all cursor-pointer border-2 border-dashed ${
          isDragging ? 'border-primary bg-primary-50' : 'border-default-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isPressable
        onPress={() => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          input?.click();
        }}
      >
        <CardBody className="p-12">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="text-6xl">📸</div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">
                上傳你的電費單
              </h3>
              <p className="text-default-500 mt-2">
                拖曳圖片到這裡，或點選選擇檔案
              </p>
            </div>

            <div className="text-sm text-default-400">
              支援 JPG、PNG 格式，最大 10MB
            </div>

            {errorMessage && (
              <Card className="bg-danger-50 border-danger-200">
                <CardBody className="p-3">
                  <p className="text-sm text-danger">⚠️ {errorMessage}</p>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    className="mt-2"
                    onClick={() => setErrorMessage(null)}
                  >
                    關閉
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 相機按鈕（行動裝置） */}
      <label className="mt-4 block">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          color="primary"
          variant="bordered"
          className="w-full"
          onClick={() => (document.querySelector('input[capture="environment"]') as HTMLInputElement)?.click()}
        >
          📷 使用相機拍照
        </Button>
      </label>
    </div>
  );
};

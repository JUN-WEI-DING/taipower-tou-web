import React, { useCallback, useState } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
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
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className={`transition-all duration-300 cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-energy-blue border-3 bg-gradient-to-br from-energy-blue/10 to-energy-cyan/10 scale-[1.02] shadow-glow'
              : 'border-2 border-dashed border-slate-300 hover:border-energy-blue hover:shadow-energy'
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
          <CardBody className="p-10 md:p-16">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-6 text-center">
              {/* Animated upload icon */}
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-subtle shadow-energy"
                animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-12 h-12 text-energy-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  上傳電費單照片
                </h3>
                <p className="text-default-500 text-base">
                  拖曳圖片到這裡，或點選選擇檔案
                </p>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: '⚡', text: 'AI 智慧識別' },
                  { icon: '🔒', text: '資料不上傳' },
                  { icon: '⏱️', text: '30 秒完成' },
                ].map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-default-100 text-sm font-medium text-default-600"
                  >
                    <span>{feature.icon}</span>
                    <span>{feature.text}</span>
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-sm text-default-400">
                  支援 JPG、PNG 格式，建議檔案小於 10MB
                </p>
              </div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card className="bg-danger-50 border-danger-200">
                    <CardBody className="p-4">
                      <p className="text-sm text-danger font-medium">⚠️ {errorMessage}</p>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        className="mt-3"
                        onClick={() => setErrorMessage(null)}
                      >
                        關閉
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 相機按鈕（行動裝置） */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-6"
      >
        <label className="block">
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
            size="lg"
            className="w-full h-14 text-base font-semibold border-2"
            startContent={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onPress={() => (document.querySelector('input[capture="environment"]') as HTMLInputElement)?.click()}
          >
            使用相機拍照
          </Button>
        </label>
      </motion.div>
    </div>
  );
};

import React, { useCallback, useState } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { getOCRService } from '../../services/ocr/OCRService';
import { BillParser } from '../../services/parser/BillParser';
import type { BillData } from '../../types';

/**
 * UploadZone Component
 * Modern drag-and-drop file upload with clean professional design
 */
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
        contractCapacity: 10,
        voltageType: '110',
        phaseType: 'single',
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
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm ${
            isDragging
              ? 'border-2 border-primary-500 shadow-glow-lg bg-gradient-to-br from-primary-50 to-secondary-50 scale-[1.01]'
              : 'border-2 border-dashed border-gray-300 hover:border-primary-400 hover:shadow-card bg-white'
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

            <div className="space-y-8 text-center">
              {/* Animated upload icon */}
              <motion.div
                className="relative inline-flex items-center justify-center"
                animate={isDragging ? { scale: 1.15 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-300 ${
                  isDragging ? 'bg-primary-400/40' : 'bg-primary-400/20'
                }`} />

                {/* Icon container */}
                <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragging
                    ? 'bg-gradient-primary shadow-glow'
                    : 'bg-gradient-to-br from-primary-600 to-secondary-600 shadow-lg'
                }`}>
                  <svg
                    className={`w-14 h-14 text-white transition-transform duration-300 ${
                      isDragging ? 'scale-110' : ''
                    }`}
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
                </div>
              </motion.div>

              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  上傳電費單照片
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  拖曳圖片到這裡，或點選選擇檔案
                </p>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: '⚡', text: 'AI 智慧識別', gradient: 'from-primary-100 to-primary-50', border: 'border-primary-200', textColor: 'text-primary-700' },
                  { icon: '🔒', text: '資料不上傳', gradient: 'from-success-100 to-success-50', border: 'border-success-200', textColor: 'text-success-700' },
                  { icon: '⏱️', text: '30 秒完成', gradient: 'from-secondary-100 to-secondary-50', border: 'border-secondary-200', textColor: 'text-secondary-700' },
                ].map((feature, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br ${feature.gradient} border ${feature.border} ${feature.textColor} text-sm font-semibold shadow-sm`}
                  >
                    <span>{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.span>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  支援 JPG、PNG 格式，建議檔案小於 10MB
                </p>
              </div>

              {/* Error message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card className="bg-danger-50/80 backdrop-blur-sm border-danger-200/50">
                    <CardBody className="p-5">
                      <p className="text-sm text-danger font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errorMessage}
                      </p>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="mt-4 font-medium"
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

      {/* Camera button (mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
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
            className="w-full h-14 text-base font-semibold border-2 border-primary-300 hover:border-primary-500 hover:bg-primary-50 transition-all"
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

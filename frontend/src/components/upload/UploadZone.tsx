import React, { useCallback, useState, useRef } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { getOCRService } from '../../services/ocr/OCRService';
import { BillParser } from '../../services/parser/BillParser';
import type { BillData } from '../../types';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * UploadZone Component - Clean Minimal Design
 * Simple, focused on functionality with subtle animations
 */
export const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use refs for file inputs to avoid querySelector issues
  const mainInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const setUploadedImage = useAppStore((state) => state.setUploadedImage);
  const setBillData = useAppStore((state) => state.setBillData);
  const setOcrStatus = useAppStore((state) => state.setOcrStatus);
  const setStage = useAppStore((state) => state.setStage);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: '不支援的圖片格式，請使用 JPG、PNG 或 WebP' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: '圖片檔案太大，請使用小於 10MB 的圖片' };
    }
    return { valid: true };
  };

  const processImage = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || '圖片處理失敗');
      return;
    }

    setOcrStatus('processing');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const ocrService = await getOCRService();
      const ocrResult = await ocrService.recognize(file, () => {});

      const parsedBill = BillParser.parse(ocrResult);
      const completenessLevel = BillParser.detectCompleteness(parsedBill);

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

  const handleMainInputClick = useCallback(() => {
    mainInputRef.current?.click();
  }, []);

  const handleCameraInputClick = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-2 border-primary shadow-md bg-primary/5'
              : 'border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-card'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isPressable
          onPress={handleMainInputClick}
        >
          <CardBody className="p-12 md:p-16">
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-8 text-center">
              {/* Upload icon */}
              <motion.div
                className="relative inline-flex items-center justify-center"
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragging ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <svg
                    className={`w-10 h-10 transition-colors duration-300 ${
                      isDragging ? 'text-white' : 'text-primary'
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
                <h3 className="text-2xl md:text-3xl font-bold text-card-foreground">
                  上傳電費單照片
                </h3>
                <p className="text-muted-foreground text-lg">
                  拖曳圖片到這裡，或點選選擇檔案
                </p>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: '⚡', text: 'AI 智慧識別' },
                  { icon: '🔒', text: '本地運算' },
                  { icon: '⏱️', text: '30 秒完成' },
                ].map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium"
                  >
                    <span>{feature.icon}</span>
                    <span>{feature.text}</span>
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  支援 JPG、PNG、WebP 格式，建議檔案小於 10MB
                </p>
              </div>

              {/* Error message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium mb-3">
                      {errorMessage}
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onClick={() => setErrorMessage(null)}
                    >
                      關閉
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Camera button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <label>
          <input
            ref={cameraInputRef}
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
            className="w-full"
            startContent={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onPress={handleCameraInputClick}
          >
            使用相機拍照
          </Button>
        </label>
      </motion.div>
    </div>
  );
};

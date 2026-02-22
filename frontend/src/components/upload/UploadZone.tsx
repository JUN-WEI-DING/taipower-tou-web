import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import { getOCRService } from '../../services/ocr/OCRService';
import { BillParser } from '../../services/parser/BillParser';
import type { BillData } from '../../types';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle } from '../icons';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * UploadZone Component - Enhanced with Orange Theme
 * Clean minimal design with enhanced micro-interactions
 */
export const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Use refs for file inputs to avoid querySelector issues
  const mainInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const setUploadedImage = useAppStore((state) => state.setUploadedImage);
  const setBillData = useAppStore((state) => state.setBillData);
  const setOcrStatus = useAppStore((state) => state.setOcrStatus);
  const setStage = useAppStore((state) => state.setStage);

  // Track timeouts for cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup effect to clear all pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

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
      setUploadSuccess(false);
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);

    // Show success feedback immediately
    setUploadSuccess(true);
    const successTimeout = setTimeout(() => setUploadSuccess(false), 2000);
    timeoutsRef.current.add(successTimeout);

    setOcrStatus('processing');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.onerror = () => {
        setOcrStatus('error');
        setErrorMessage('圖片讀取失敗，請重試或選擇其他圖片');
        setUploadSuccess(false);
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

      const stageTimeout = setTimeout(() => {
        setStage('confirm');
      }, 500);
      timeoutsRef.current.add(stageTimeout);
    } catch (error) {
      console.error('Error processing image:', error);
      setOcrStatus('error');
      setUploadSuccess(false);

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
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card
          className={cn(
            "transition-all duration-300 cursor-pointer relative overflow-hidden group",
            isDragging
              ? 'border-2 border-orange-500 shadow-lg shadow-orange-500/30 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20'
              : 'border-2 border-dashed border-muted-foreground/25 hover:border-orange-400 hover:shadow-md bg-card'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isPressable
          onPress={handleMainInputClick}
        >
          {/* Animated background gradient on drag */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-400/5 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Ripple effect container */}
          <div className="absolute inset-0 pointer-events-none" />

          <CardBody className="p-10 md:p-14 relative">
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-8 text-center relative z-10">
              {/* Upload icon with enhanced animation */}
              <motion.div
                className="relative inline-flex items-center justify-center"
                animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Glow effect behind icon */}
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-orange-400 rounded-full blur-xl"
                    />
                  )}
                </AnimatePresence>
                <div className={cn(
                  "w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg relative",
                  isDragging
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/50'
                    : 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 shadow-orange-200 dark:shadow-orange-900/20'
                )}>
                  <svg
                    className={cn(
                      "w-12 h-12 transition-colors duration-300",
                      isDragging ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                    )}
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

                {/* Success checkmark */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle size={18} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="space-y-3">
                <motion.h3
                  className={cn(
                    "text-2xl md:text-3xl font-bold transition-colors",
                    isDragging ? 'text-orange-700 dark:text-orange-300' : 'text-card-foreground'
                  )}
                  animate={isDragging ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                >
                  {isDragging ? '放開圖片即可上傳' : '上傳電費單照片'}
                </motion.h3>
                <p className="text-muted-foreground text-lg">
                  拖曳圖片到這裡，或點選選擇檔案
                </p>
              </div>

              {/* Enhanced feature badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: '⚡', text: 'AI 智慧識別', color: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/20' },
                  { icon: '🔒', text: '本地運算', color: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20' },
                  { icon: '⏱️', text: '30 秒完成', color: 'from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20' },
                ].map((feature, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-800 shadow-sm",
                      isDragging
                        ? 'bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700'
                        : `bg-gradient-to-r ${feature.color}`
                    )}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.span>
                ))}
              </div>

              <div className="pt-6 border-t border-border/60">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  支援 JPG、PNG、WebP 格式，建議檔案小於 10MB
                </p>
              </div>

              {/* Error message with enhanced styling */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <div className="p-4 bg-gradient-to-r from-destructive/10 to-red-50 dark:from-destructive/5 dark:to-red-950/30 border border-destructive/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-destructive font-medium mb-3">
                            {errorMessage}
                          </p>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onClick={() => setErrorMessage(null)}
                            className="text-xs"
                          >
                            關閉
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Enhanced camera button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <label className="block">
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
            className={cn(
              "w-full font-medium transition-all duration-300",
              "hover:from-orange-500 hover:to-orange-600",
              "hover:shadow-lg hover:shadow-orange-500/30",
              "hover:-translate-y-0.5 active:translate-y-0"
            )}
            startContent={
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </motion.svg>
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

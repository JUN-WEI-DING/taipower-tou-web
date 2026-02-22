import React from 'react';
import { Card, CardBody, Progress } from '@nextui-org/react';
import { useAppStore } from '../../stores/useAppStore';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from '../icons';

/**
 * OCRProgress Component
 * Shows OCR processing progress with modern clean design
 */
export const OCRProgress: React.FC = () => {
  const ocrStatus = useAppStore((state) => state.ocrStatus);
  const ocrProgress = useAppStore((state) => state.ocrProgress);

  if (ocrStatus !== 'processing') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-glow border-2 border-primary-300 backdrop-blur-sm bg-white/50">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-400/20 opacity-50 animate-gradient-shift bg-[length:200%_100%]" />

        <CardBody className="p-8 relative">
          <div className="text-center space-y-7">
            {/* Animated icon */}
            <motion.div
              className="flex justify-center relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary-400/30 blur-xl animate-pulse" />

              {/* Rotating ring */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary-500/50 border-r-secondary-500/50" />

              {/* Icon container */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap size={36} className="text-white" />
                </motion.div>
              </div>

              {/* Orbiting particles */}
              {[0, 120, 240].map((deg, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-secondary-400"
                  animate={{
                    rotate: 360,
                    x: [0, Math.cos((deg * Math.PI) / 180) * 50],
                    y: [0, Math.sin((deg * Math.PI) / 180) * 50],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>

            {/* Text */}
            <div>
              <motion.h3
                className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                正在識別電費單...
              </motion.h3>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-primary-500" />
                這可能需要幾秒鐘，請稍候
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-3">
              <Progress
                color="primary"
                value={ocrProgress}
                className="w-full"
                size="lg"
                showValueLabel={true}
                classNames={{
                  track: 'h-3 bg-gray-200 border border-gray-300 rounded-full overflow-hidden',
                  indicator: 'bg-gradient-primary h-full shadow-glow',
                  label: 'text-sm font-semibold text-primary-600',
                }}
              />
              <motion.div
                className="flex justify-between text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span>0%</span>
                <span>{Math.round(ocrProgress)}%</span>
                <span>100%</span>
              </motion.div>
            </div>

            {/* Steps */}
            <div className="text-left space-y-3">
              {[
                { text: '載入 OCR 引擎', icon: '📦', delay: 0 },
                { text: '識別文字中', icon: '🔍', delay: 0.15 },
                { text: '提取電費資訊', icon: '⚡', delay: 0.3 },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay, duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-gray-600 bg-gray-100/50 rounded-lg px-4 py-2.5 border border-gray-200"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: idx * 0.2 }}
                    className="text-lg"
                  >
                    {step.icon}
                  </motion.span>
                  <span className="font-medium">{step.text}</span>
                  <motion.div
                    className="ml-auto"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

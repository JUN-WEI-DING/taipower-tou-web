import React from 'react';
import { Card, CardBody, Spinner, Progress } from '@nextui-org/react';
import { useAppStore } from '../../stores/useAppStore';
import { motion } from 'framer-motion';
import { Zap } from '../icons';

export const OCRProgress: React.FC = () => {
  const ocrStatus = useAppStore((state) => state.ocrStatus);
  const ocrProgress = useAppStore((state) => state.ocrProgress);

  if (ocrStatus !== 'processing') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-energy border-2 border-energy-blue/20">
        <CardBody className="p-8">
          <div className="text-center space-y-6">
            {/* Animated icon */}
            <motion.div
              className="flex justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-energy flex items-center justify-center shadow-energy">
                <Zap size={32} className="text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                正在識別電費單...
              </h3>
              <p className="text-sm text-default-500">
                這可能需要幾秒鐘，請稍候
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress
                color="primary"
                value={ocrProgress}
                className="w-full"
                size="lg"
                showValueLabel={true}
                classNames={{
                  track: 'border border-default-200',
                  indicator: 'bg-gradient-energy',
                }}
              />
            </div>

            {/* Steps */}
            <div className="text-left space-y-2">
              {[
                { text: '載入 OCR 引擎...', delay: 0 },
                { text: '識別文字中...', delay: 0.2 },
                { text: '提取電費資訊...', delay: 0.4 },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay, duration: 0.3 }}
                  className="flex items-center gap-2 text-sm text-default-600"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-energy-blue" />
                  <span>{step.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

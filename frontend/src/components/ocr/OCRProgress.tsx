import React from 'react';
import { Card, CardBody, Spinner, Progress } from '@nextui-org/react';
import { useAppStore } from '../../stores/useAppStore';

export const OCRProgress: React.FC = () => {
  const ocrStatus = useAppStore((state) => state.ocrStatus);
  const ocrProgress = useAppStore((state) => state.ocrProgress);

  if (ocrStatus !== 'processing') {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardBody className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Spinner
              color="primary"
              size="lg"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">
              正在識別電費單...
            </h3>
            <p className="text-sm text-default-500 mt-1">
              這可能需要幾秒鐘，請稍候
            </p>
          </div>

          <Progress
            color="primary"
            value={ocrProgress}
            className="w-full"
            size="md"
            showValueLabel={true}
          />

          <div className="text-xs text-default-400 space-y-1">
            <p>• 載入 OCR 引擎...</p>
            <p>• 識別文字中...</p>
            <p>• 提取電費資訊...</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

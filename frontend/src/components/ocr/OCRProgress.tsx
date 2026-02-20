import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

export const OCRProgress: React.FC = () => {
  const ocrStatus = useAppStore((state) => state.ocrStatus);
  const ocrProgress = useAppStore((state) => state.ocrProgress);

  if (ocrStatus !== 'processing') {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            正在識別電費單...
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            這可能需要幾秒鐘，請稍候
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${ocrProgress}%` }}
          />
        </div>

        <p className="text-sm font-medium text-blue-600">{ocrProgress}%</p>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• 載入 OCR 引擎...</p>
          <p>• 識別文字中...</p>
          <p>• 提取電費資訊...</p>
        </div>
      </div>
    </div>
  );
};

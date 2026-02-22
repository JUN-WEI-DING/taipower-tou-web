import React from 'react';
import { X } from '../icons';
import { useAppStore } from '../../stores/useAppStore';

export const ImagePreview: React.FC = () => {
  const uploadedImage = useAppStore((state) => state.uploadedImage);
  const setUploadedImage = useAppStore((state) => state.setUploadedImage);

  if (!uploadedImage) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <img
        src={uploadedImage}
        alt="電費單預覽"
        className="max-w-full max-h-96 rounded-lg border border-divider"
      />
      <button
        onClick={() => setUploadedImage(null)}
        className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full hover:bg-danger-600 transition-colors"
        aria-label="移除圖片"
      >
        <X size={16} />
      </button>
    </div>
  );
};

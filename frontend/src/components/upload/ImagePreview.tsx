import React from 'react';
import { X } from 'lucide-react';
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
        className="max-w-full max-h-96 rounded-lg border border-gray-200"
      />
      <button
        onClick={() => setUploadedImage(null)}
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        aria-label="移除圖片"
      >
        <X size={16} />
      </button>
    </div>
  );
};

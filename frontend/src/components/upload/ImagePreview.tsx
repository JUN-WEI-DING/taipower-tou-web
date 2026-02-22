import React from 'react';
import { X } from '../icons';
import { useAppStore } from '../../stores/useAppStore';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ImagePreview Component
 * Displays uploaded bill image with modern clean design
 */
export const ImagePreview: React.FC = () => {
  const uploadedImage = useAppStore((state) => state.uploadedImage);
  const setUploadedImage = useAppStore((state) => state.setUploadedImage);

  const handleRemove = () => {
    setUploadedImage(null);
  };

  if (!uploadedImage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card className="relative shadow-card overflow-hidden border border-gray-200 backdrop-blur-sm">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />

          <CardBody className="p-0">
            <div className="relative group rounded-xl overflow-hidden">
              {/* Image container with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <img
                src={uploadedImage}
                alt="電費單預覽"
                width={800}
                height={384}
                loading="lazy"
                className="relative w-full max-h-96 object-contain bg-gray-50 rounded-xl"
              />

              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
              />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Remove button */}
              <motion.div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transition-transform duration-300"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  isIconOnly
                  color="danger"
                  size="lg"
                  className="shadow-lg bg-danger-500 hover:bg-danger-600 border-2 border-white/20"
                  onClick={handleRemove}
                  aria-label="移除圖片"
                >
                  <X size={20} className="text-white" />
                </Button>
              </motion.div>

              {/* Caption */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm font-medium">點選圖片可放大檢視</p>
                </div>
              </motion.div>

              {/* Success indicator */}
              <motion.div
                className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transition-transform duration-500 delay-100"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-600/90 backdrop-blur-md rounded-full border border-success-400/30 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-semibold text-white">已上傳</span>
                </div>
              </motion.div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

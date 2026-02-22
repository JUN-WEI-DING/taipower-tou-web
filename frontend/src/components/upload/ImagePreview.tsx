import React from 'react';
import { X, ZoomIn } from '../icons';
import { useAppStore } from '../../stores/useAppStore';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ImagePreview Component
 * Displays uploaded bill image with modern glassmorphism design
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
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <Card className="relative shadow-tech-card overflow-hidden border border-tech-blue/20 backdrop-blur-sm">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-tech-blue/5 via-transparent to-tech-violet/5 pointer-events-none" />

          <CardBody className="p-0">
            <div className="relative group rounded-xl overflow-hidden">
              {/* Image container with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-tech-blue/20 via-tech-violet/10 to-tech-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <img
                src={uploadedImage}
                alt="電費單預覽"
                className="relative w-full max-h-96 object-contain bg-default-50 rounded-xl"
              />

              {/* Enhanced gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-tech-dark/80 via-tech-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
              />

              {/* Tech grid pattern overlay */}
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

              {/* Enhanced remove button */}
              <motion.div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  isIconOnly
                  color="danger"
                  size="lg"
                  className="shadow-tech-glow bg-danger-500 hover:bg-danger-600 border-2 border-white/20"
                  onClick={handleRemove}
                  aria-label="移除圖片"
                >
                  <X size={20} className="text-white" />
                </Button>
              </motion.div>

              {/* Enhanced caption */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <ZoomIn size={18} className="text-tech-cyan" />
                  <p className="text-sm font-medium">點選圖片可放大檢視</p>
                </div>
              </motion.div>

              {/* Success indicator */}
              <motion.div
                className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-tech-emerald/90 backdrop-blur-md rounded-full border border-tech-emerald/30 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

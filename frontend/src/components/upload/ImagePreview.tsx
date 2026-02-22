import React from 'react';
import { X } from '../icons';
import { useAppStore } from '../../stores/useAppStore';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';

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
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="relative shadow-energy overflow-hidden">
          <CardBody className="p-0">
            <div className="relative group rounded-xl overflow-hidden">
              <img
                src={uploadedImage}
                alt="電費單預覽"
                className="w-full max-h-96 object-contain bg-default-50"
              />

              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Remove button */}
              <motion.div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
              >
                <Button
                  isIconOnly
                  color="danger"
                  size="lg"
                  className="shadow-lg"
                  onClick={handleRemove}
                  aria-label="移除圖片"
                >
                  <X size={20} />
                </Button>
              </motion.div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium">點選圖片可放大檢視</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

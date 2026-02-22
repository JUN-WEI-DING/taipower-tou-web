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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        <Card className="relative shadow-lg">
          <CardBody className="p-0">
            <div className="relative group">
              <img
                src={uploadedImage}
                alt="電費單預覽"
                className="max-w-full max-h-96 rounded-lg"
              />

              {/* Remove button with overlay */}
              <motion.div
                className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              >
                <Button
                  isIconOnly
                  color="danger"
                  size="lg"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  aria-label="移除圖片"
                >
                  <X size={20} />
                </Button>
              </motion.div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

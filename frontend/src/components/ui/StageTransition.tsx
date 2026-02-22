import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface StageTransitionProps {
  children: ReactNode;
  className?: string;
  direction?: 'forward' | 'backward';
}

/**
 * StageTransition Component
 *
 * Provides smooth animated transitions between app stages.
 * Uses slide and fade animations for a polished feel.
 */
export const StageTransition: React.FC<StageTransitionProps> = ({
  children,
  className = '',
  direction = 'forward'
}) => {
  const variants = {
    enter: {
      x: direction === 'forward' ? 20 : -20,
      opacity: 0,
      scale: 0.98
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: {
      x: direction === 'forward' ? -20 : 20,
      opacity: 0,
      scale: 0.98
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageTransition Component
 *
 * Wraps content with fade and slide animation for page-level transitions.
 */
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeTransition Component
 *
 * Simple fade in/out transition for subtle content changes.
 */
interface FadeTransitionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  className = '',
  duration = 0.2
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * ScaleTransition Component
 *
 * Scale animation for modal or card appearances.
 */
interface ScaleTransitionProps {
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
}

export const ScaleTransition: React.FC<ScaleTransitionProps> = ({
  children,
  className = '',
  isOpen = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * StaggerChildren Component
 *
 * Staggers animation of child elements for sequential reveals.
 */
interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delay = 0
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
        when: 'beforeChildren',
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
};

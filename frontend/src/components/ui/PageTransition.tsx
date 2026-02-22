import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Page Transition Component with Framer Motion
 *
 * Smooth page transitions for different stages and views.
 * Includes multiple transition variants for different effects.
 */
export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /**
   * The transition variant to use
   * @default "fade"
   */
  variant?: 'fade' | 'slide' | 'scale' | 'flip' | 'none';
  /**
   * Direction for slide transitions
   * @default "up"
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  /**
   * Duration in seconds
   * @default 0.3
   */
  duration?: number;
  /**
   * Delay in seconds
   * @default 0
   */
  delay?: number;
  /**
   * Whether to animate
   * @default true
   */
  animate?: boolean;
}

const transitionVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    up: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    down: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    left: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    right: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  flip: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  },
  none: {
    hidden: {},
    visible: {},
    exit: {},
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variant = 'fade',
  direction = 'up',
  duration = 0.3,
  delay = 0,
  animate = true,
}) => {
  if (!animate) {
    return <>{children}</>;
  }

  const getVariants = () => {
    if (variant === 'slide') {
      return transitionVariants.slide[direction];
    }
    return transitionVariants[variant];
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={getVariants()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Children - Animates children with staggered delays
 */
export const StaggerChildren: React.FC<
  PageTransitionProps & {
    staggerDelay?: number;
    children: React.ReactNode;
  }
> = ({
  children,
  className,
  staggerDelay = 0.1,
  duration = 0.4,
  delay = 0,
  animate = true,
}) => {
  if (!animate) {
    return <>{children}</>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Route Transition - Wrapper for route changes
 */
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={window.location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

/**
 * Slide Over Transition - For panels/drawers
 */
export const SlideOverTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}> = ({ children, isOpen, direction = 'right', className }) => {
  const variants = {
    left: {
      closed: { x: '-100%' },
      open: { x: 0 },
    },
    right: {
      closed: { x: '100%' },
      open: { x: 0 },
    },
    top: {
      closed: { y: '-100%' },
      open: { y: 0 },
    },
    bottom: {
      closed: { y: '100%' },
      open: { y: 0 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants[direction]}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn('fixed inset-0 z-50', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Modal/Dialog Transition
 */
export const ModalTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}> = ({ children, isOpen, onClose, className }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }}
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-lg max-h-[90vh] overflow-auto',
            className
          )}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/**
 * List Item Transition - For animated list items
 */
export const ListItemTransition: React.FC<{
  children: React.ReactNode;
  index?: number;
  className?: string;
}> = ({ children, index = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      delay: index * 0.05,
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Hover Lift Component - Adds lift effect on hover
 */
export const HoverLift: React.FC<{
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({ children, disabled = false, className }) => (
  <motion.div
    whileHover={disabled ? undefined : { y: -4, scale: 1.02 }}
    whileTap={disabled ? undefined : { scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Shimmer Effect - For loading skeletons
 */
export const Shimmer: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className, width = '100%', height = '100%' }) => (
  <motion.div
    className={cn('bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 rounded', className)}
    style={{ width, height }}
    animate={{
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

/**
 * Pulse Ring Effect - For notifications/indicators
 */
export const PulseRing: React.FC<{
  children: React.ReactNode;
  color?: string;
  className?: string;
}> = ({ children, color = '#f97316', className }) => (
  <div className={cn('relative inline-flex', className)}>
    <motion.span
      animate={{
        scale: [1, 1.5],
        opacity: [0.5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeOut',
      }}
      className="absolute inset-0 rounded-full"
      style={{ backgroundColor: color }}
    />
    {children}
  </div>
);

/**
 * Typing Animation - For text effects
 */
export const TypingText: React.FC<{
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}> = ({ text, className, speed = 0.05, delay = 0 }) => {
  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      timeout = setTimeout(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
          startTyping();
        }
      }, speed * 1000);
    };

    const initialDelay = setTimeout(() => {
      startTyping();
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(initialDelay);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-4 bg-primary ml-1"
      />
    </span>
  );
};

/**
 * Counter Animation - Animated number counting
 */
export const CounterUp: React.FC<{
  end: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({
  end,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(end * progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

import React from 'react';

export default PageTransition;

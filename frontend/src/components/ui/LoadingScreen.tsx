import { motion } from 'framer-motion';
import { Zap } from '../icons';
import { cn } from '../../lib/utils';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

/**
 * LoadingScreen Component - Orange Theme
 *
 * A polished loading screen with animated elements and progress indication.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '載入中...',
  progress
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-orange-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-300/15 to-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          className="relative"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30"
            animate={{
              boxShadow: [
                '0 10px 40px -10px rgba(249, 115, 22, 0.3)',
                '0 20px 50px -10px rgba(249, 115, 22, 0.4)',
                '0 10px 40px -10px rgba(249, 115, 22, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Zap size={36} className="text-white" />
          </motion.div>

          {/* Orbiting particles */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 w-20 h-20"
              initial={{ rotate: i * 120 }}
              animate={{ rotate: i * 120 + 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-orange-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Loading message */}
        <div className="text-center">
          <motion.h2
            className="text-xl font-semibold text-gray-800 dark:text-gray-100"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {message}
          </motion.h2>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mt-4 w-64 overflow-hidden">
              <motion.div
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MinimalLoader Component
 *
 * A smaller, inline loading indicator.
 */
interface MinimalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MinimalLoader: React.FC<MinimalLoaderProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn('rounded-full border-4 border-orange-200 border-t-orange-600', sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

/**
 * DotsLoader Component
 *
 * Bouncing dots loading indicator.
 */
interface DotsLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full bg-orange-500', sizeClasses[size])}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonLoader Component
 *
 * Skeleton placeholder for content loading.
 */
interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'text',
  width,
  height
}) => {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  return (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
      animate={{
        backgroundPosition: ['0% 0%', '200% 0%', '0% 0%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

/**
 * PulseLoader Component
 *
 * Pulsing loading indicator with orange glow.
 */
interface PulseLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-br from-orange-500 to-orange-600',
          sizeClasses[size]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default LoadingScreen;

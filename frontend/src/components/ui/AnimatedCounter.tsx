import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

// ========================================
// TYPES
// ========================================

export interface AnimatedCounterProps {
  /**
   * The target value to count to
   */
  value: number;

  /**
   * Duration of the animation in seconds
   * @default 1.5
   */
  duration?: number;

  /**
   * Number of decimal places to show
   * @default 0
   */
  decimals?: number;

  /**
   * Whether to show currency symbol
   * @default false
   */
  currency?: boolean;

  /**
   * Currency symbol to use
   * @default "$"
   */
  currencySymbol?: string;

  /**
   * Whether to add commas for thousands
   * @default true
   */
  formatNumber?: boolean;

  /**
   * Prefix to add before the value
   */
  prefix?: string;

  /**
   * Suffix to add after the value
   */
  suffix?: string;

  /**
   * Start value for the animation
   * @default 0
   */
  startValue?: number;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;

  /**
   * Delay before starting animation (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Accessibility label
   */
  ariaLabel?: string;

  /**
   * Size variant
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Color variant
   * @default "default"
   */
  variant?: 'default' | 'orange' | 'green' | 'blue';
}

// ========================================
// MAIN COMPONENT
// ========================================

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  decimals = 0,
  currency = false,
  currencySymbol = '$',
  formatNumber = true,
  prefix = '',
  suffix = '',
  startValue = 0,
  className,
  animateOnMount = true,
  delay = 0,
  ariaLabel,
  size = 'md',
  variant = 'default',
}) => {
  const [hasAnimated, setHasAnimated] = useState(!animateOnMount);
  const motionValue = useMotionValue(startValue);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const variantClasses = {
    default: 'text-foreground',
    orange: 'text-orange-600 dark:text-orange-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  // Transform the motion value to the formatted string
  const displayValue = useTransform(spring, (latest) => {
    const rounded = Number(latest.toFixed(decimals));
    let formatted: string;

    if (formatNumber) {
      formatted = rounded.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } else {
      formatted = rounded.toFixed(decimals);
    }

    if (currency) {
      formatted = `${currencySymbol}${formatted}`;
    }

    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (animateOnMount && !hasAnimated) {
      const timer = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animateOnMount, hasAnimated, spring, value, delay]);

  // Handle value changes after mount
  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  return (
    <motion.span
      className={cn(
        'font-numeric tabular-nums',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={ariaLabel || `${prefix}${value}${suffix}`}
      aria-live="polite"
    >
      {displayValue}
    </motion.span>
  );
};

// ========================================
// SPECIALIZED COUNTER COMPONENTS
// ========================================

/**
 * Currency Counter - specifically for money values
 */
export const CurrencyCounter: React.FC<
  Omit<AnimatedCounterProps, 'currency' | 'currencySymbol' | 'variant'>
> = ({ value, ...props }) => {
  const isNegative = value < 0;
  const absoluteValue = Math.abs(value);

  return (
    <AnimatedCounter
      {...props}
      value={absoluteValue}
      currency
      currencySymbol="$"
      variant={isNegative ? 'default' : 'green'}
      prefix={isNegative ? '-' : ''}
    />
  );
};

/**
 * Percentage Counter - specifically for percentages
 */
export const PercentageCounter: React.FC<
  Omit<AnimatedCounterProps, 'suffix' | 'variant'>
> = ({ value, decimals = 1, ...props }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <AnimatedCounter
      {...props}
      value={Math.abs(value)}
      decimals={decimals}
      suffix="%"
      variant={isPositive ? 'green' : isNegative ? 'default' : 'orange'}
    />
  );
};

/**
 * Savings Counter - shows savings with special styling
 */
export const SavingsCounter: React.FC<{
  savings: number;
  percentage?: number;
  size?: AnimatedCounterProps['size'];
  className?: string;
}> = ({ savings, percentage, size = 'xl', className }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CurrencyCounter
        value={savings}
        size={size}
        ariaLabel={`Estimated savings of ${savings} dollars`}
      />
      {percentage !== undefined && (
        <PercentageCounter
          value={percentage}
          size="sm"
          decimals={1}
        />
      )}
    </div>
  );
};

// ========================================
// PROGRESS COUNTER
// ========================================

interface ProgressCounterProps {
  current: number;
  total: number;
  label?: string;
  size?: AnimatedCounterProps['size'];
  className?: string;
  showPercentage?: boolean;
}

export const ProgressCounter: React.FC<ProgressCounterProps> = ({
  current,
  total,
  label,
  size = 'md',
  className,
  showPercentage = true,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-1">
        <AnimatedCounter value={current} size={size} variant="orange" />
        <span className="text-muted-foreground">/</span>
        <AnimatedCounter value={total} size={size} />
      </div>
      {showPercentage && (
        <span className="text-sm text-muted-foreground">
          (<PercentageCounter value={percentage} size="sm" />)
        </span>
      )}
    </div>
  );
};

// ========================================
// COUNTDOWN TIMER
// ========================================

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  size?: AnimatedCounterProps['size'];
  className?: string;
  showLabel?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  onComplete,
  size = 'md',
  className,
  showLabel = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const getVariant = () => {
    if (timeLeft <= 5) return 'default'; // red/warning when low
    if (timeLeft <= 10) return 'orange';
    return 'blue';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && <span className="text-sm text-muted-foreground">剩餘時間：</span>}
      <AnimatedCounter
        value={timeLeft}
        size={size}
        variant={getVariant()}
        suffix="秒"
        ariaLabel={`${timeLeft} seconds remaining`}
      />
    </div>
  );
};

// ========================================
// STAT CARD COUNTER
// ========================================

interface StatCardCounterProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCardCounter: React.FC<StatCardCounterProps> = ({
  value,
  label,
  icon,
  description,
  trend,
  className,
}) => {
  return (
    <div className={cn('p-6 bg-card rounded-xl border border-border', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <AnimatedCounter
            value={value}
            size="xl"
            variant="orange"
            ariaLabel={`${label}: ${value}`}
          />
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'font-medium',
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground">vs 上月</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedCounter;

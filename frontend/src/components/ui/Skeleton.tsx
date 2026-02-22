import { cn } from '../../lib/utils';

/**
 * Skeleton Component - Enhanced with shimmer animation
 *
 * Loading placeholder components that indicate content is being loaded.
 * Uses the orange theme for consistent branding.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the skeleton
   * @default "default"
   */
  variant?: 'default' | 'text' | 'circular' | 'rounded' | 'card';

  /**
   * The width of the skeleton
   */
  width?: string | number;

  /**
   * The height of the skeleton
   */
  height?: string | number;

  /**
   * Whether to show the animation
   * @default true
   */
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', width, height, animate = true, ...props }, ref) => {
    const variantStyles = {
      default: 'rounded-md',
      text: 'rounded-sm h-4',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      card: 'rounded-xl',
    };

    const style: React.CSSProperties = {
      width: width ?? (variant === 'circular' ? '40px' : undefined),
      height: height ?? (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '2.5rem'),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0 bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100',
          'dark:from-orange-900/20 dark:via-orange-800/10 dark:to-orange-900/20',
          animate && 'animate-shimmer',
          variantStyles[variant],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Card Skeleton - For loading card components
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4', className)}>
    <div className="space-y-2">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="text" width="60%" />
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

/**
 * Hero Skeleton - For loading hero section
 */
export const HeroSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-8', className)}>
    <Skeleton variant="rounded" width="200px" height="36px" />
    <div className="space-y-4">
      <Skeleton variant="text" height="48px" />
      <Skeleton variant="text" width="80%" height="24px" />
    </div>
    <div className="flex gap-4">
      <Skeleton variant="rounded" width="180px" height="56px" />
      <Skeleton variant="rounded" width="180px" height="56px" />
    </div>
  </div>
);

/**
 * List Skeleton - For loading list items
 */
export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 3, className }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Table Skeleton - For loading table rows
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="rounded" width="100%" height="40px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="rounded" width="100%" height="48px" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Stats Skeleton - For loading statistics cards
 */
export const StatsSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 3, className }) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 space-y-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="70%" height="32px" />
      </div>
    ))}
  </div>
);

import React from 'react';

export default Skeleton;

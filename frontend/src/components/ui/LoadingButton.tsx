import { Button, type ButtonProps } from '@nextui-org/react';
import { Zap } from '../icons';
import { cn } from '../../lib/utils';

/**
 * LoadingButton Component
 *
 * A button component with integrated loading states and micro-interactions.
 * Maintains the orange theme throughout all states.
 */
export interface LoadingButtonProps extends Omit<ButtonProps, 'startContent' | 'endContent'> {
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;

  /**
   * Content to show when loading
   * @default "載入中..."
   */
  loadingText?: string;

  /**
   * Icon to show in the button
   */
  icon?: React.ReactNode;

  /**
   * Whether to show the spinner
   * @default true
   */
  showSpinner?: boolean;

  /**
   * The size of the spinner
   * @default "sm"
   */
  spinnerSize?: 'sm' | 'md' | 'lg';
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    children,
    isLoading = false,
    loadingText = '載入中...',
    icon,
    showSpinner = true,
    spinnerSize = 'sm',
    disabled,
    className,
    ...props
  }, ref) => {
    const spinnerSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'relative transition-all duration-300',
          isLoading && 'cursor-not-allowed',
          className
        )}
        startContent={!isLoading && icon}
        {...props}
      >
        <span className={cn('transition-opacity duration-200', isLoading && 'opacity-0')}>
          {children}
        </span>

        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            {showSpinner && (
              <svg
                className={cn('animate-spin', spinnerSizes[spinnerSize])}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            <span className="text-sm">{loadingText}</span>
          </span>
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

/**
 * Primary CTA Loading Button with orange theme
 */
export const PrimaryCTAButton: React.FC<LoadingButtonProps> = (props) => (
  <LoadingButton
    color="primary"
    size="lg"
    className={cn(
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'hover:from-orange-600 hover:to-orange-700',
      'shadow-lg shadow-orange-500/30',
      'hover:shadow-xl hover:shadow-orange-500/40',
      'hover:-translate-y-0.5 active:translate-y-0',
      'font-semibold'
    )}
    {...props}
  />
);

/**
 * Secondary Loading Button
 */
export const SecondaryLoadingButton: React.FC<LoadingButtonProps> = (props) => (
  <LoadingButton
    variant="bordered"
    size="lg"
    className="hover:bg-orange-50 hover:border-orange-300"
    {...props}
  />
);

/**
 * Icon-only Loading Button (e.g., for refresh actions)
 */
export const IconButtonLoading: React.FC<
  LoadingButtonProps & { 'aria-label': string }
> = ({ 'aria-label': ariaLabel, isLoading, ...props }) => (
  <Button
    isIconOnly
    aria-label={ariaLabel}
    disabled={isLoading}
    className={cn(
      'transition-all duration-300',
      isLoading && 'cursor-not-allowed'
    )}
    {...props}
  >
    {isLoading ? (
      <svg
        className="w-4 h-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : (
      props.children
    )}
  </Button>
);

/**
 * Success Button - Shows success state after loading
 */
export const SuccessButton: React.FC<
  LoadingButtonProps & { success?: boolean; successText?: string }
> = ({ isLoading, success = false, successText = '完成!', children, ...props }) => (
  <LoadingButton
    isLoading={isLoading}
    {...props}
    className={cn(
      'transition-all duration-300',
      success && 'bg-success-500 hover:bg-success-600'
    )}
  >
    {success ? (
      <span className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        {successText}
      </span>
    ) : (
      children
    )}
  </LoadingButton>
);

import React from 'react';

export default LoadingButton;

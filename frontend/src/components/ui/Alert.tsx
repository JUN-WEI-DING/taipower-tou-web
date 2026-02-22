import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, X, Warning } from '../icons';

/**
 * Alert Component with Orange Theme
 *
 * A consistent alert component for displaying messages, warnings, and errors.
 * Follows the orange design system with appropriate colors for each variant.
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the alert
   * @default "default"
   */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';

  /**
   * The title of the alert
   */
  title?: string;

  /**
   * Whether to show the icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;

  /**
   * Callback when dismiss is clicked
   */
  onDismiss?: () => void;

  /**
   * Size of the alert
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = 'default',
    title,
    showIcon = true,
    dismissible = false,
    onDismiss,
    size = 'md',
    children,
    ...props
  }, ref) => {
    const variantStyles = {
      default: {
        container: 'bg-background border-border text-foreground',
        icon: 'text-foreground',
      },
      info: {
        container: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100',
        icon: 'text-amber-500',
      },
      success: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100',
        icon: 'text-emerald-500',
      },
      warning: {
        container: 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100',
        icon: 'text-orange-500',
      },
      danger: {
        container: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
        icon: 'text-red-500',
      },
    };

    const sizes = {
      sm: {
        container: 'p-3',
        icon: 'w-4 h-4',
        title: 'text-sm font-semibold',
        content: 'text-xs',
        dismiss: 'w-4 h-4',
      },
      md: {
        container: 'p-4',
        icon: 'w-5 h-5',
        title: 'text-base font-semibold',
        content: 'text-sm',
        dismiss: 'w-5 h-5',
      },
      lg: {
        container: 'p-5',
        icon: 'w-6 h-6',
        title: 'text-lg font-semibold',
        content: 'text-base',
        dismiss: 'w-6 h-6',
      },
    };

    const icons = {
      default: Info,
      info: Info,
      success: CheckCircle,
      warning: Warning,
      danger: AlertCircle,
    };

    const IconComponent = icons[variant];
    const styles = variantStyles[variant];
    const sizeStyles = sizes[size];

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border',
          'flex items-start gap-3',
          'animate-fade-in',
          styles.container,
          sizeStyles.container,
          className
        )}
        role="alert"
        {...props}
      >
        {showIcon && IconComponent && (
          <IconComponent
            className={cn(
              'flex-shrink-0 mt-0.5',
              styles.icon,
              sizeStyles.icon
            )}
          />
        )}

        <div className="flex-1 space-y-1">
          {title && (
            <div className={cn('font-bold', sizeStyles.title)}>{title}</div>
          )}
          {children && (
            <div className={cn('leading-relaxed', sizeStyles.content)}>
              {children}
            </div>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 rounded-lg p-1',
              'transition-all duration-200',
              'hover:bg-black/5 dark:hover:bg-white/10',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              sizeStyles.dismiss
            )}
            aria-label="Dismiss alert"
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

/**
 * Inline Alert - Compact variant for inline messages
 */
export const InlineAlert: React.FC<
  Omit<AlertProps, 'size'> & { icon?: React.ReactNode }
> = ({ variant = 'default', icon, children, ...props }) => {
  return (
    <Alert
      variant={variant}
      size="sm"
      className="flex-row items-center gap-2 py-2"
      {...props}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs">{children}</span>
      </div>
    </Alert>
  );
};

/**
 * Alert Title Component
 */
export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('font-semibold text-sm mb-1', className)}>
    {children}
  </div>
);

/**
 * Alert Description Component
 */
export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('text-sm leading-relaxed opacity-90', className)}>
    {children}
  </div>
);

/**
 * Toast Alert - Fixed position notification
 */
export const ToastAlert: React.FC<
  AlertProps & { position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }
> = ({ position = 'top-right', ...props }) => {
  const positionStyles = {
    top: 'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md',
    bottom: 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md',
    'top-right': 'fixed top-4 right-4 z-50 w-full max-w-md',
    'top-left': 'fixed top-4 left-4 z-50 w-full max-w-md',
    'bottom-right': 'fixed bottom-4 right-4 z-50 w-full max-w-md',
    'bottom-left': 'fixed bottom-4 left-4 z-50 w-full max-w-md',
  };

  return (
    <Alert
      {...props}
      className={cn(
        positionStyles[position],
        'shadow-lg',
        'animate-slide-down',
        props.className
      )}
    />
  );
};

/**
 * Alert Group - Container for multiple alerts
 */
export const AlertGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('space-y-3', className)} role="group" aria-label="Alerts">
    {children}
  </div>
);

import React from 'react';

export default Alert;

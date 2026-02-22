import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from '../icons';

// ========================================
// TYPES
// ========================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// ========================================
// CONTEXT
// ========================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ========================================
// PROVIDER
// ========================================

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer position={position} className={positionClasses[position]} />
    </ToastContext.Provider>
  );
};

// ========================================
// TOAST COMPONENT
// ========================================

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  }, [onRemove]);

  useEffect(() => {
    return () => {
      // Cleanup if unmounted
    };
  }, []);

  const variantStyles = {
    success: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-success-500',
      icon: 'text-success-500',
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      title: 'text-success-700 dark:text-success-400',
    },
    error: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-destructive-500',
      icon: 'text-destructive-500',
      iconBg: 'bg-destructive-100 dark:bg-destructive-900/30',
      title: 'text-destructive-700 dark:text-destructive-400',
    },
    warning: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-warning-500',
      icon: 'text-warning-500',
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      title: 'text-warning-700 dark:text-warning-400',
    },
    info: {
      container: 'bg-white dark:bg-gray-800 border-l-4 border-orange-500',
      icon: 'text-orange-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      title: 'text-orange-700 dark:text-orange-400',
    },
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const styles = variantStyles[toast.variant];
  const icon = icons[toast.variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'pointer-events-auto w-full max-w-md overflow-hidden rounded-lg shadow-lg border',
        styles.container
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', styles.iconBg)}>
            <span className={styles.icon}>{icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={cn('font-semibold text-sm mb-1', styles.title)}>
                {toast.title}
              </h4>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {toast.message}
            </p>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick();
                  handleRemove();
                }}
                className="mt-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          >
            <motion.div
              className={cn('h-full rounded-full', {
                'bg-success-500': toast.variant === 'success',
                'bg-destructive-500': toast.variant === 'error',
                'bg-warning-500': toast.variant === 'warning',
                'bg-orange-500': toast.variant === 'info',
              })}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ========================================
// TOAST CONTAINER
// ========================================

interface ToastContainerProps {
  position: ToastPosition;
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ className }) => {
  const { toasts, removeToast } = useToast();

  const isTop = className?.includes('top-');
  const stackOrder = isTop ? 0 : toasts.length - 1;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-3 pointer-events-none',
        className
      )}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              order: isTop ? index : toasts.length - 1 - index,
            }}
          >
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ========================================
// CONVENIENCE HOOKS
// ========================================

export const useToastActions = () => {
  const { addToast, clearToasts } = useToast();

  return {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
      addToast({ variant: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
      addToast({ variant: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
      addToast({ variant: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
      addToast({ variant: 'info', message, ...options }),
    clear: clearToasts,
  };
};

export default Toast;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check, ChevronRight } from '../icons';

// ========================================
// TYPES
// ========================================

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface Step {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'minimal';
  showLabels?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

// ========================================
// MAIN COMPONENT
// ========================================

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  variant = 'gradient',
  showLabels = true,
  showDescriptions = false,
  className,
}) => {
  const isClickable = onStepClick !== undefined;

  const sizeClasses = {
    sm: { step: 'w-8 h-8 text-sm', icon: 'w-4 h-4' },
    md: { step: 'w-10 h-10 text-base', icon: 'w-5 h-5' },
    lg: { step: 'w-12 h-12 text-lg', icon: 'w-6 h-6' },
  };

  const getStepClasses = (index: number) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    const hasError = steps[index]?.status === 'error';
    const isPending = index > currentStep;

    const baseClasses = cn(
      'flex items-center justify-center rounded-full font-semibold transition-all duration-300 relative z-10',
      sizeClasses[size].step
    );

    if (hasError) {
      return cn(
        baseClasses,
        'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30'
      );
    }

    if (isActive) {
      return cn(
        baseClasses,
        variant === 'gradient'
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-100 dark:ring-orange-900/30'
          : variant === 'minimal'
            ? 'bg-orange-500 text-white ring-2 ring-orange-200 dark:ring-orange-800'
            : 'bg-orange-500 text-white shadow-lg'
      );
    }

    if (isCompleted) {
      return cn(
        baseClasses,
        'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
      );
    }

    return cn(
      baseClasses,
      'bg-muted text-muted-foreground border-2 border-border'
    );
  };

  const getConnectorClasses = (index: number) => {
    const isCompleted = index < currentStep;

    return cn(
      'flex-1 h-1 rounded-full transition-all duration-500',
      isCompleted
        ? variant === 'gradient'
          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
          : 'bg-green-500'
        : 'bg-muted'
    );
  };

  const getLabelClasses = (index: number) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    const hasError = steps[index]?.status === 'error';

    return cn(
      'font-medium transition-colors duration-200 text-sm',
      hasError
        ? 'text-destructive font-semibold'
        : isActive
          ? 'text-orange-600 dark:text-orange-400 font-semibold'
          : isCompleted
            ? 'text-green-600 dark:text-green-400'
            : 'text-muted-foreground'
    );
  };

  const getDescriptionClasses = (index: number) => {
    return cn(
      'text-xs transition-colors duration-200',
      index === currentStep
        ? 'text-foreground'
        : 'text-muted-foreground'
    );
  };

  const renderStepNumber = (index: number) => {
    const step = steps[index];
    const isCompleted = index < currentStep;

    if (step.status === 'error') {
      return (
        <svg className={sizeClasses[size].icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }

    if (isCompleted) {
      return <Check className={sizeClasses[size].icon} />;
    }

    return index + 1;
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 w-0.5 transition-all duration-500',
                  index < currentStep
                    ? variant === 'gradient'
                      ? 'bg-gradient-to-b from-green-500 to-emerald-500'
                      : 'bg-green-500'
                    : 'bg-muted'
                )}
                style={{
                  top: size === 'lg' ? 48 : size === 'md' ? 40 : 32,
                  height: '100%',
                  transform: 'translateX(-50%)',
                }}
              />
            )}

            <div
              className={cn(
                'flex items-start gap-4',
                isClickable && index < currentStep && 'cursor-pointer'
              )}
              onClick={() => isClickable && index < currentStep && onStepClick!(index)}
            >
              {/* Step circle */}
              <div className={cn('flex-shrink-0', getStepClasses(index))}>
                {renderStepNumber(index)}
              </div>

              {/* Step content */}
              <div className="flex-1 pt-1">
                {showLabels && (
                  <p className={getLabelClasses(index)}>{step.label}</p>
                )}
                {showDescriptions && step.description && (
                  <p className={getDescriptionClasses(index)}>{step.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step with content */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* Animated step circle */}
              <motion.div
                className={cn(
                  'relative',
                  isClickable && index < currentStep && 'cursor-pointer'
                )}
                onClick={() => isClickable && index < currentStep && onStepClick!(index)}
                whileHover={isClickable && index < currentStep ? { scale: 1.05 } : {}}
                whileTap={isClickable && index < currentStep ? { scale: 0.95 } : {}}
              >
                {/* Active pulse effect */}
                {index === currentStep && (
                  <motion.div
                    className={cn(
                      'absolute inset-0 rounded-full',
                      variant === 'gradient' ? 'bg-orange-400' : 'bg-orange-500'
                    )}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className={getStepClasses(index)}>{renderStepNumber(index)}</div>
              </motion.div>

              {/* Labels */}
              {showLabels && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={getLabelClasses(index)}
                >
                  {step.label}
                </motion.p>
              )}

              {/* Descriptions */}
              {showDescriptions && step.description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  className={getDescriptionClasses(index)}
                >
                  {step.description}
                </motion.p>
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn('flex-1 mx-2', getConnectorClasses(index))}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ========================================
// MINIMAL VARIANT COMPONENT
// ========================================

interface MinimalStepperProps {
  steps: Omit<Step, 'status'>[];
  currentStep: number;
  className?: string;
}

export const MinimalStepper: React.FC<MinimalStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentStep
                  ? 'bg-orange-500 scale-125'
                  : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-muted'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                index === currentStep
                  ? 'text-orange-600 dark:text-orange-400'
                  : index < currentStep
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// DOT INDICATOR COMPONENT
// ========================================

interface DotStepperProps {
  count: number;
  current: number;
  onDotClick?: (index: number) => void;
  className?: string;
}

export const DotStepper: React.FC<DotStepperProps> = ({
  count,
  current,
  onDotClick,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onDotClick?.(index)}
          className={cn(
            'rounded-full transition-all duration-300',
            index === current
              ? 'w-8 h-2 bg-orange-500'
              : 'w-2 h-2 bg-muted hover:bg-muted-foreground/50'
          )}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            width: index === current ? 32 : 8,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ))}
    </div>
  );
};

// ========================================
// HOOK FOR USING STEPPER
// ========================================

export const useStepper = (steps: Omit<Step, 'status'>[]) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const stepsWithStatus: Step[] = steps.map((step, index) => ({
    ...step,
    status:
      index < currentStep
        ? ('completed' as const)
        : index === currentStep
          ? ('active' as const)
          : ('pending' as const),
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return {
    currentStep,
    steps: stepsWithStatus,
    nextStep,
    prevStep,
    goToStep,
    setCurrentStep,
    isFirstStep,
    isLastStep,
    progress,
  };
};

export default ProgressStepper;

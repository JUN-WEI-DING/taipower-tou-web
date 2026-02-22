import { Zap } from '../icons';

/**
 * Animated loading component with branding
 */
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ size = 'md', text = '載入中...' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Animated logo */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
            <Zap className="text-white" size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium">{text}</p>
        <p className="text-sm text-default-400">請稍候，正在為您分析最佳電價方案</p>
      </div>
    </div>
  );
};

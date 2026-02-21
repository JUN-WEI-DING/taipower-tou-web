import React, { useState } from 'react';
import { Trophy, Medal, Award, Info, Zap } from 'lucide-react';
import type { PlanCalculationResult } from '../../types';

interface PlanCardProps {
  result: PlanCalculationResult;
  rank: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({ result, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (r === 2) return <Medal className="text-gray-400" size={24} />;
    if (r === 3) return <Award className="text-orange-600" size={24} />;
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;

  // Determine card styling based on rank
  const getCardStyles = () => {
    const baseClasses = 'ocean-card transition-all duration-300 cursor-pointer';
    const rankStyles = {
      1: 'border-2 border-[#2d8b8b] ring-2 ring-[#2d8b8b]/20',
      2: 'border-2 border-[#a8dadc]',
      3: 'border border-[#4cc9f0]',
    };
    return `${baseClasses} ${rankStyles[rank as keyof typeof rankStyles] || 'border border-[#d1eae8]'}`;
  };

  return (
    <div
      className={`${getCardStyles()} ocean-animate-in ocean-delay-${Math.min(rank, 5)}`}
      style={{ opacity: 0, animationFillMode: 'forwards' }}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsExpanded(!isExpanded);
        }
      }}
    >
      {/* Header with rank and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2d8b8b]/10 to-[#a8dadc]/10">
            {getRankIcon(rank)}
          </div>
          <div>
            <h4 className="font-bold text-[#1a2332] text-lg">{result.planName}</h4>
            <p className="text-xs text-[#4a5568] mt-0.5">
              排名第 {rank} 名
            </p>
          </div>
        </div>

        {/* Accuracy badge with enhanced styling */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            result.label.accuracy === 'accurate'
              ? 'bg-[#2d8b8b]/10 text-[#2d8b8b] border border-[#2d8b8b]/20'
              : result.label.accuracy === 'estimated'
              ? 'bg-[#ffa62b]/10 text-[#ffa62b] border border-[#ffa62b]/20'
              : 'bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/20'
          }`}
        >
          {result.label.badge}
        </span>
      </div>

      {/* Current plan indicator */}
      {isCurrentPlan && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 bg-[#4cc9f0]/10 text-[#2d8b8b] border border-[#4cc9f0]/20 text-sm font-medium">
            <Zap size={14} />
            目前使用
          </span>
        </div>
      )}

      {/* Price display with enhanced styling */}
      <div className="text-center py-6 bg-gradient-to-br from-[#f1faee] to-[#e8f4f5] rounded-lg mb-4">
        <div className="text-4xl font-bold text-[#1a2332] tracking-tight">
          ${result.charges.total.toFixed(0)}
        </div>
        <p className="text-sm text-[#4a5568] mt-2">每月預估電費</p>
        {result.seasonInfo && (
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            result.seasonInfo.isSummer
              ? 'bg-[#ff6b6b]/20 text-[#e05555] border border-[#ff6b6b]/30'
              : 'bg-[#4cc9f0]/20 text-[#2d8b8b] border border-[#4cc9f0]/30'
          }`}>
            {result.seasonInfo.isSummer ? '🌞 夏季' : '❄️ 非夏季'}
          </div>
        )}
      </div>

      {/* Expandable breakdown */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
          <div className="border-t border-[#d1eae8] pt-4 mt-4">
            <p className="text-sm font-semibold text-[#1a2332] mb-3 flex items-center gap-2">
              <Info size={16} />
              時段用電明細
            </p>
            <div className="space-y-2">
              {result.breakdown.touBreakdown.map((item, i) => {
                const periodLabel = item.period === 'peak' ? '尖峰時段' :
                                   item.period === 'semi_peak' ? '半尖峰時段' :
                                   item.period === 'off_peak' ? '離峰時段' :
                                   item.label || '其他';
                const periodColor = item.period === 'peak' ? 'text-[#ff6b6b]' :
                                    item.period === 'semi_peak' ? 'text-[#ffa62b]' :
                                    item.period === 'off_peak' ? 'text-[#2d8b8b]' :
                                    'text-[#4a5568]';
                return (
                  <div key={i} className="flex justify-between items-center py-2 px-3 bg-[#f1faee] rounded-lg">
                    <div>
                      <span className={`text-sm font-medium ${periodColor}`}>
                        {periodLabel}
                      </span>
                      <span className="text-xs text-[#4a5568] ml-2">
                        ({item.kwh.toFixed(1)} 度)
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#1a2332]">
                      ${item.charge.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
          <div className="border-t border-[#d1eae8] pt-4 mt-4">
            <p className="text-sm font-semibold text-[#1a2332] mb-3 flex items-center gap-2">
              <Info size={16} />
              累進費率明細
            </p>
            <div className="space-y-2">
              {result.breakdown.tierBreakdown.map((tier, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 bg-[#f1faee] rounded-lg">
                  <span className="text-sm font-medium text-[#1a2332]">
                    第 {tier.tier} 段
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-[#4a5568]">{tier.kwh.toFixed(1)} 度</div>
                    <div className="font-mono text-sm font-semibold text-[#1a2332]">
                      ${tier.charge.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand button */}
      <button
        className="w-full mt-3 py-2 text-xs text-[#4a5568] hover:text-[#2d8b8b] transition-colors flex items-center justify-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? '收起明細 ▲' : '檢視明細 ▼'}
      </button>

      {/* Comparison with current plan */}
      {!isCurrentPlan && result.comparison.difference !== 0 && (
        <div
          className={`mt-4 py-3 px-4 rounded-xl text-center transition-all duration-300 ${
            isPositive
              ? 'bg-gradient-to-r from-[#2d8b8b]/10 to-[#a8dadc]/10 border border-[#2d8b8b]/20'
              : 'bg-gradient-to-r from-[#ff6b6b]/10 to-[#e05555]/10 border border-[#ff6b6b]/20'
          }`}
        >
          {isPositive ? (
            <div className="flex items-center justify-center gap-2">
              <Zap size={18} className="text-[#2d8b8b]" />
              <span className="text-base font-bold text-[#2d8b8b]">
                省 ${Math.abs(result.comparison.difference).toFixed(0)}
              </span>
              <span className="text-xs text-[#4a5568] bg-white/50 px-2 py-0.5 rounded-full">
                {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-[#e05555]">
                較目前方案多 ${result.comparison.difference.toFixed(0)}
              </span>
              <span className="text-xs text-[#4a5568]">
                ({result.comparison.savingPercentage.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tooltip for estimated results */}
      {result.label.accuracy === 'estimated' && rank === 1 && (
        <div className="mt-3 p-3 bg-[#ffa62b]/10 border border-[#ffa62b]/20 rounded-lg">
          <p className="text-xs text-[#4a5568] flex items-start gap-2">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>這是最省錢的選擇！但因為是估算值，實際電費可能會有所差異。</span>
          </p>
        </div>
      )}
    </div>
  );
};

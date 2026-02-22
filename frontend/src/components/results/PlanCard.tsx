import React, { useState } from 'react';
import { Trophy, Medal, Award, Info, Zap } from '../icons';
import { Card, CardBody, Chip, Button, Badge } from '@nextui-org/react';
import { motion } from 'framer-motion';
import type { PlanCalculationResult } from '../../types';

interface PlanCardProps {
  result: PlanCalculationResult;
  rank: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({ result, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-warning" size={24} />;
    if (r === 2) return <Medal className="text-default-400" size={24} />;
    if (r === 3) return <Award className="text-default-500" size={24} />;
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;

  // Determine card styling based on rank
  const getCardStyles = () => {
    if (rank === 1) return 'border-2 border-primary shadow-lg';
    if (rank === 2) return 'border-2 border-secondary shadow-md';
    if (rank === 3) return 'border border-default-300';
    return 'border border-divider';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={`transition-all duration-300 hover:shadow-xl ${getCardStyles()}`}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
      <CardBody className="p-4">
        {/* Header with rank and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-default-100">
              {getRankIcon(rank)}
            </div>
            <div>
              <h4 className="font-bold text-foreground text-lg">{result.planName}</h4>
              <p className="text-xs text-default-500 mt-0.5">
                排名第 {rank} 名
              </p>
            </div>
          </div>

          {/* Accuracy badge */}
          <Chip
            size="sm"
            variant="flat"
            color={
              result.label.accuracy === 'accurate' ? 'success' :
              result.label.accuracy === 'estimated' ? 'warning' : 'danger'
            }
          >
            {result.label.badge}
          </Chip>
        </div>

        {/* Current plan indicator */}
        {isCurrentPlan && (
          <div className="mb-4">
            <Badge
              color="primary"
              variant="flat"
              content={<Zap size={12} />}
              placement="top-right"
            >
              <span className="text-sm font-medium">目前使用</span>
            </Badge>
          </div>
        )}

        {/* Price display */}
        <div className="text-center py-6 bg-default-50 rounded-xl mb-4">
          <div className="text-4xl font-bold text-foreground tracking-tight">
            ${result.charges.total.toFixed(0)}
          </div>
          <p className="text-sm text-default-500 mt-2">每月預估電費</p>
          {result.seasonInfo && (
            <Chip
              size="sm"
              variant="flat"
              color={result.seasonInfo.isSummer ? 'danger' : 'primary'}
              className="mt-2"
            >
              {result.seasonInfo.isSummer ? '🌞 夏季' : '❄️ 非夏季'}
            </Chip>
          )}
        </div>

        {/* Expandable breakdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
            <div className="border-t border-divider pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info size={16} />
                時段用電明細
              </p>
              <div className="space-y-2">
                {result.breakdown.touBreakdown.map((item, i) => {
                  const periodLabel = item.period === 'peak' ? '尖峰時段' :
                                     item.period === 'semi_peak' ? '半尖峰時段' :
                                     item.period === 'off_peak' ? '離峰時段' :
                                     item.label || '其他';
                  const chipColor = item.period === 'peak' ? 'danger' :
                                   item.period === 'semi_peak' ? 'warning' :
                                   item.period === 'off_peak' ? 'success' : 'default';
                  return (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-default-100 rounded-lg">
                      <div>
                        <Chip size="sm" color={chipColor} variant="flat">
                          {periodLabel}
                        </Chip>
                        <span className="text-xs text-default-500 ml-2">
                          ({item.kwh.toFixed(1)} 度)
                        </span>
                      </div>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        ${item.charge.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
            <div className="border-t border-divider pt-4 mt-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info size={16} />
                累進費率明細
              </p>
              <div className="space-y-2">
                {result.breakdown.tierBreakdown.map((tier, i) => (
                  <div key={i} className="flex justify-between items-center py-2 px-3 bg-default-100 rounded-lg">
                    <span className="text-sm font-medium text-foreground">
                      第 {tier.tier} 段
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-default-500">{tier.kwh.toFixed(1)} 度</div>
                      <div className="font-mono text-sm font-semibold text-foreground">
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
        <Button
          size="sm"
          variant="light"
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '收起明細 ▲' : '檢視明細 ▼'}
        </Button>

        {/* Comparison with current plan */}
        {!isCurrentPlan && result.comparison.difference !== 0 && (
          <div
            className={`mt-4 py-3 px-4 rounded-xl text-center transition-all duration-300 ${
              isPositive
                ? 'bg-success-50 border border-success-200'
                : 'bg-danger-50 border border-danger-200'
            }`}
          >
            {isPositive ? (
              <div className="flex items-center justify-center gap-2">
                <Zap size={18} className="text-success" />
                <span className="text-base font-bold text-success">
                  省 ${Math.abs(result.comparison.difference).toFixed(0)}
                </span>
                <Chip size="sm" color="success" variant="flat">
                  {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
                </Chip>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-danger">
                  較目前方案多 ${result.comparison.difference.toFixed(0)}
                </span>
                <span className="text-xs text-default-500">
                  ({result.comparison.savingPercentage.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tooltip for estimated results */}
        {result.label.accuracy === 'estimated' && rank === 1 && (
          <Card className="mt-3 bg-warning-50 border-warning-200">
            <CardBody className="p-3">
              <p className="text-xs text-default-600 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>這是最省錢的選擇！但因為是估算值，實際電費可能會有所差異。</span>
              </p>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
    </motion.div>
  );
};

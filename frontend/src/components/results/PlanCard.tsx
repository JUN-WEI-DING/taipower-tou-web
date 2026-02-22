import React, { useState } from 'react';
import { Trophy, Medal, Award, Info, Zap, ChevronDown, ChevronUp } from '../icons';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanCalculationResult } from '../../types';

interface PlanCardProps {
  result: PlanCalculationResult;
  rank: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({ result, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-warning" size={28} />;
    if (r === 2) return <Medal className="text-default-400" size={28} />;
    if (r === 3) return <Award className="text-default-500" size={28} />;
    return null;
  };

  const getRankBadge = (r: number) => {
    if (r === 1) return { text: '最省錢', color: 'bg-gradient-energy', textColor: 'text-white' };
    if (r === 2) return { text: '第二選擇', color: 'bg-default-100', textColor: 'text-default-700' };
    if (r === 3) return { text: '第三選擇', color: 'bg-default-50', textColor: 'text-default-600' };
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;
  const rankBadge = getRankBadge(rank);

  // Determine card styling based on rank
  const getCardStyles = () => {
    if (rank === 1) return 'border-2 border-energy-blue shadow-energy bg-gradient-to-br from-energy-blue/5 to-transparent';
    if (rank === 2) return 'border-2 border-energy-cyan/50 shadow-md bg-gradient-to-br from-energy-cyan/5 to-transparent';
    if (rank === 3) return 'border border-default-200 bg-default-50/50';
    return 'border border-divider bg-content1';
  };

  const getRankBadgeStyles = () => {
    if (rank === 1) return 'bg-gradient-energy text-white font-bold';
    if (rank === 2) return 'bg-default-200 text-default-700 font-semibold';
    if (rank === 3) return 'bg-default-100 text-default-600 font-medium';
    return 'bg-default-50 text-default-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.08 }}
      whileHover={{ y: -3 }}
      className="w-full"
    >
      <Card
        className={`transition-all duration-300 hover:shadow-energy-lg ${getCardStyles()}`}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CardBody className="p-5">
          {/* Header with rank and title */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Rank icon */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
                rank === 1 ? 'bg-gradient-energy shadow-energy' :
                rank === 2 ? 'bg-default-200' :
                rank === 3 ? 'bg-default-100' : 'bg-default-50'
              }`}>
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold text-default-400">#{rank}</span>
                )}
              </div>

              {/* Plan info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground text-lg">{result.planName}</h4>
                  {rankBadge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRankBadgeStyles()}`}>
                      {rankBadge.text}
                    </span>
                  )}
                </div>
                <p className="text-xs text-default-500">
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
              className="font-medium"
            >
              {result.label.badge}
            </Chip>
          </div>

          {/* Current plan indicator */}
          {isCurrentPlan && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
              <Zap size={14} className="text-primary" />
              <span className="text-sm font-medium text-primary">目前使用中</span>
            </div>
          )}

          {/* Price display */}
          <div className={`text-center py-6 rounded-2xl mb-4 ${
            rank === 1 ? 'bg-gradient-energy text-white' :
            rank === 2 ? 'bg-default-100' :
            'bg-default-50'
          }`}>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${
              rank === 1 ? 'text-white' : 'text-foreground'
            }`}>
              ${result.charges.total.toFixed(0)}
            </div>
            <p className={`text-sm mt-2 ${rank === 1 ? 'text-white/80' : 'text-default-500'}`}>
              每月預估電費
            </p>
            {result.seasonInfo && (
              <Chip
                size="sm"
                variant={rank === 1 ? 'solid' : 'flat'}
                color={result.seasonInfo.isSummer ? 'danger' : 'primary'}
                className="mt-3"
              >
                {result.seasonInfo.isSummer ? '🌞 夏季' : '❄️ 非夏季'}
              </Chip>
            )}
          </div>

          {/* Expandable breakdown */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
                  <div className="border-t border-divider pt-4 mt-4">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Info size={16} className="text-primary" />
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
                          <div key={i} className="flex justify-between items-center py-2.5 px-4 bg-default-50 rounded-xl">
                            <div>
                              <Chip size="sm" color={chipColor} variant="flat" className="font-medium">
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
                      <Info size={16} className="text-primary" />
                      累進費率明細
                    </p>
                    <div className="space-y-2">
                      {result.breakdown.tierBreakdown.map((tier, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 px-4 bg-default-50 rounded-xl">
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand button */}
          <Button
            size="sm"
            variant="light"
            className={`w-full mt-4 font-medium ${isExpanded ? 'text-default-600' : 'text-primary'}`}
            endContent={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '收起明細' : '檢視明細'}
          </Button>

          {/* Comparison with current plan */}
          {!isCurrentPlan && result.comparison.difference !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mt-4 py-4 px-4 rounded-2xl text-center transition-all duration-300 ${
                isPositive
                  ? 'bg-success-50 border-2 border-success-200'
                  : 'bg-danger-50 border-2 border-danger-200'
              }`}
            >
              {isPositive ? (
                <div className="flex items-center justify-center gap-2">
                  <Zap size={20} className="text-success" />
                  <span className="text-lg font-bold text-success">
                    省 ${Math.abs(result.comparison.difference).toFixed(0)}
                  </span>
                  <Chip size="sm" color="success" variant="flat" className="font-semibold">
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
            </motion.div>
          )}

          {/* Tooltip for estimated results */}
          {result.label.accuracy === 'estimated' && rank === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mt-4 bg-warning-50 border-warning-200">
                <CardBody className="p-4">
                  <p className="text-sm text-default-700 flex items-start gap-2 leading-relaxed">
                    <Info size={16} className="mt-0.5 flex-shrink-0 text-warning" />
                    <span>這是最省錢的選擇！但因為是估算值，實際電費可能會有所差異。</span>
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { Trophy, Medal, Award, Info, Zap, ChevronDown, ChevronUp, Sparkles } from '../icons';
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
    if (r === 1) return <Trophy className="text-warning-500" size={28} />;
    if (r === 2) return <Medal className="text-gray-400" size={28} />;
    if (r === 3) return <Award className="text-gray-500" size={28} />;
    return null;
  };

  const getRankBadge = (r: number) => {
    if (r === 1) return { text: '最省錢', gradient: 'bg-gradient-primary' };
    if (r === 2) return { text: '第二選擇', gradient: 'bg-gradient-to-r from-secondary-600/20 to-primary-600/20' };
    if (r === 3) return { text: '第三選擇', gradient: 'bg-gradient-to-r from-primary-500/15 to-secondary-500/15' };
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;
  const rankBadge = getRankBadge(rank);

  // Determine card styling based on rank
  const getCardStyles = () => {
    if (rank === 1) return 'border-2 border-primary-400 shadow-glow bg-gradient-to-br from-primary-50 via-secondary-50 to-transparent backdrop-blur-sm';
    if (rank === 2) return 'border-2 border-secondary-300 shadow-card bg-gradient-to-br from-secondary-50 via-primary-50 to-transparent';
    if (rank === 3) return 'border border-primary-200 shadow-sm bg-gradient-to-br from-primary-50/50 to-transparent';
    return 'border border-gray-200 bg-white shadow-card';
  };

  const getRankBadgeStyles = () => {
    if (rank === 1) return 'bg-gradient-primary text-white font-bold shadow-lg';
    if (rank === 2) return 'bg-gradient-to-r from-secondary-600/80 to-primary-600/80 text-white font-semibold shadow-md';
    if (rank === 3) return 'bg-gradient-to-r from-primary-500/70 to-secondary-500/70 text-white font-medium shadow-sm';
    return 'bg-gray-100 text-gray-500';
  };

  const getPriceSectionStyles = () => {
    if (rank === 1) return 'bg-gradient-primary text-white shadow-glow';
    if (rank === 2) return 'bg-gradient-to-br from-secondary-100 to-primary-100 border border-secondary-200';
    if (rank === 3) return 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200';
    return 'bg-gray-50 border border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="w-full"
    >
      <Card
        className={`transition-all duration-300 hover:shadow-card-hover ${getCardStyles()}`}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CardBody className="p-6">
          {/* Header with rank and title */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Rank icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: rank * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl ${
                  rank === 1 ? 'bg-gradient-primary shadow-glow' :
                  rank === 2 ? 'bg-gradient-to-br from-secondary-600 to-primary-600 shadow-md' :
                  rank === 3 ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-sm' : 'bg-gray-100'
                }`}
              >
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold text-gray-400">#{rank}</span>
                )}
              </motion.div>

              {/* Plan info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-lg">{result.planName}</h4>
                  {rankBadge && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rank * 0.08 + 0.3 }}
                      className={`text-xs px-2.5 py-1 rounded-full ${getRankBadgeStyles()}`}
                    >
                      {rankBadge.text}
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 backdrop-blur-sm rounded-full border border-primary-200"
            >
              <Zap size={14} className="text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">目前使用中</span>
            </motion.div>
          )}

          {/* Price display */}
          <div className={`text-center py-7 rounded-2xl mb-5 ${getPriceSectionStyles()}`}>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${
              rank === 1 ? 'text-white' : 'text-gray-900'
            }`}>
              ${result.charges.total.toFixed(0)}
            </div>
            <p className={`text-sm mt-2 font-medium ${rank === 1 ? 'text-white/90' : 'text-gray-600'}`}>
              每月預估電費
            </p>
            {result.seasonInfo && (
              <Chip
                size="sm"
                variant={rank === 1 ? 'solid' : 'flat'}
                color={result.seasonInfo.isSummer ? 'danger' : 'primary'}
                className="mt-4 font-medium"
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
                  <div className="border-t border-gray-200 pt-5 mt-5">
                    <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info size={18} className="text-primary-600" />
                      時段用電明細
                    </p>
                    <div className="space-y-2.5">
                      {result.breakdown.touBreakdown.map((item, i) => {
                        const periodLabel = item.period === 'peak' ? '尖峰時段' :
                                           item.period === 'semi_peak' ? '半尖峰時段' :
                                           item.period === 'off_peak' ? '離峰時段' :
                                           item.label || '其他';
                        const chipColor = item.period === 'peak' ? 'danger' :
                                         item.period === 'semi_peak' ? 'warning' :
                                         item.period === 'off_peak' ? 'success' : 'default';
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex justify-between items-center py-3 px-5 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div>
                              <Chip size="sm" color={chipColor} variant="flat" className="font-medium">
                                {periodLabel}
                              </Chip>
                              <span className="text-xs text-gray-500 ml-2">
                                ({item.kwh.toFixed(1)} 度)
                              </span>
                            </div>
                            <span className="font-mono text-sm font-bold text-gray-900">
                              ${item.charge.toFixed(1)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
                  <div className="border-t border-gray-200 pt-5 mt-5">
                    <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info size={18} className="text-primary-600" />
                      累進費率明細
                    </p>
                    <div className="space-y-2.5">
                      {result.breakdown.tierBreakdown.map((tier, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-between items-center py-3 px-5 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <span className="text-sm font-semibold text-gray-900">
                            第 {tier.tier} 段
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">{tier.kwh.toFixed(1)} 度</div>
                            <div className="font-mono text-sm font-bold text-gray-900">
                              ${tier.charge.toFixed(1)}
                            </div>
                          </div>
                        </motion.div>
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
            className={`w-full mt-5 font-medium transition-all ${isExpanded ? 'text-gray-600' : 'text-primary-600'}`}
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
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`mt-5 py-5 px-5 rounded-2xl text-center transition-all duration-300 ${
                isPositive
                  ? 'bg-success-50 border-2 border-success-200'
                  : 'bg-danger-50 border-2 border-danger-200'
              }`}
            >
              {isPositive ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Zap size={22} className="text-success-600" />
                  </motion.div>
                  <span className="text-xl font-bold text-success-700">
                    省 ${Math.abs(result.comparison.difference).toFixed(0)}
                  </span>
                  <Chip size="sm" color="success" variant="flat" className="font-bold bg-success-100">
                    {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
                  </Chip>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-sm font-bold text-danger-600">
                    較目前方案多 ${result.comparison.difference.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-500">
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
              <Card className="mt-5 bg-warning-50 border-warning-200/50 backdrop-blur-sm">
                <CardBody className="p-5">
                  <p className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
                    <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-warning-600" />
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

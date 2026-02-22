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
    if (r === 1) return <Trophy className="text-warning" size={28} />;
    if (r === 2) return <Medal className="text-default-400" size={28} />;
    if (r === 3) return <Award className="text-default-500" size={28} />;
    return null;
  };

  const getRankBadge = (r: number) => {
    if (r === 1) return { text: '最省錢', gradient: 'bg-gradient-tech' };
    if (r === 2) return { text: '第二選擇', gradient: 'bg-gradient-to-r from-tech-violet/20 to-tech-blue/20' };
    if (r === 3) return { text: '第三選擇', gradient: 'bg-gradient-to-r from-tech-cyan/15 to-tech-blue/15' };
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;
  const rankBadge = getRankBadge(rank);

  // Determine card styling based on rank with modern tech theme
  const getCardStyles = () => {
    if (rank === 1) return 'border-2 border-tech-blue/40 shadow-tech-glow bg-gradient-to-br from-tech-blue/10 via-tech-violet/5 to-transparent backdrop-blur-sm';
    if (rank === 2) return 'border-2 border-tech-violet/30 shadow-tech-card bg-gradient-to-br from-tech-violet/10 via-tech-blue/5 to-transparent';
    if (rank === 3) return 'border border-tech-cyan/20 shadow-sm bg-gradient-to-br from-tech-cyan/5 to-transparent';
    return 'border border-divider bg-content1/80 backdrop-blur-sm';
  };

  const getRankBadgeStyles = () => {
    if (rank === 1) return 'bg-gradient-tech text-white font-bold shadow-lg';
    if (rank === 2) return 'bg-gradient-to-r from-tech-violet/80 to-tech-blue/80 text-white font-semibold shadow-md';
    if (rank === 3) return 'bg-gradient-to-r from-tech-cyan/70 to-tech-blue/70 text-white font-medium shadow-sm';
    return 'bg-default-100 text-default-500';
  };

  const getPriceSectionStyles = () => {
    if (rank === 1) return 'bg-gradient-tech text-white shadow-tech-glow';
    if (rank === 2) return 'bg-gradient-to-br from-tech-violet/20 to-tech-blue/20 border border-tech-violet/20';
    if (rank === 3) return 'bg-gradient-to-br from-tech-cyan/15 to-tech-blue/15 border border-tech-cyan/20';
    return 'bg-default-50/80 border border-divider';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="w-full"
    >
      <Card
        className={`transition-all duration-300 hover:shadow-tech-card-hover ${getCardStyles()}`}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CardBody className="p-6">
          {/* Header with rank and title */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Enhanced rank icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: rank * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl ${
                  rank === 1 ? 'bg-gradient-tech shadow-tech-glow' :
                  rank === 2 ? 'bg-gradient-to-br from-tech-violet to-tech-blue shadow-md' :
                  rank === 3 ? 'bg-gradient-to-br from-tech-cyan to-tech-blue shadow-sm' : 'bg-default-100'
                }`}
              >
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold text-default-400">#{rank}</span>
                )}
              </motion.div>

              {/* Plan info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground text-lg">{result.planName}</h4>
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
                <p className="text-xs text-default-500 font-medium">
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

          {/* Enhanced current plan indicator */}
          {isCurrentPlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-tech-blue/10 backdrop-blur-sm rounded-full border border-tech-blue/30"
            >
              <Zap size={14} className="text-tech-blue" />
              <span className="text-sm font-semibold text-tech-blue">目前使用中</span>
            </motion.div>
          )}

          {/* Enhanced price display */}
          <div className={`text-center py-7 rounded-2xl mb-5 ${getPriceSectionStyles()}`}>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${
              rank === 1 ? 'text-white' : 'text-foreground'
            }`}>
              ${result.charges.total.toFixed(0)}
            </div>
            <p className={`text-sm mt-2 font-medium ${rank === 1 ? 'text-white/90' : 'text-default-500'}`}>
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
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
                  <div className="border-t border-divider pt-5 mt-5">
                    <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Info size={18} className="text-tech-blue" />
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
                            className="flex justify-between items-center py-3 px-5 bg-default-50/80 rounded-xl border border-default-100"
                          >
                            <div>
                              <Chip size="sm" color={chipColor} variant="flat" className="font-medium">
                                {periodLabel}
                              </Chip>
                              <span className="text-xs text-default-500 ml-2">
                                ({item.kwh.toFixed(1)} 度)
                              </span>
                            </div>
                            <span className="font-mono text-sm font-bold text-foreground">
                              ${item.charge.toFixed(1)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
                  <div className="border-t border-divider pt-5 mt-5">
                    <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Info size={18} className="text-tech-blue" />
                      累進費率明細
                    </p>
                    <div className="space-y-2.5">
                      {result.breakdown.tierBreakdown.map((tier, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-between items-center py-3 px-5 bg-default-50/80 rounded-xl border border-default-100"
                        >
                          <span className="text-sm font-semibold text-foreground">
                            第 {tier.tier} 段
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-default-500">{tier.kwh.toFixed(1)} 度</div>
                            <div className="font-mono text-sm font-bold text-foreground">
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

          {/* Enhanced expand button */}
          <Button
            size="sm"
            variant="light"
            className={`w-full mt-5 font-medium transition-all ${isExpanded ? 'text-default-600' : 'text-tech-blue'}`}
            endContent={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '收起明細' : '檢視明細'}
          </Button>

          {/* Enhanced comparison with current plan */}
          {!isCurrentPlan && result.comparison.difference !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`mt-5 py-5 px-5 rounded-2xl text-center transition-all duration-300 ${
                isPositive
                  ? 'bg-tech-emerald/10 border-2 border-tech-emerald/30'
                  : 'bg-danger-50 border-2 border-danger-200'
              }`}
            >
              {isPositive ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Zap size={22} className="text-tech-emerald" />
                  </motion.div>
                  <span className="text-xl font-bold text-tech-emerald">
                    省 ${Math.abs(result.comparison.difference).toFixed(0)}
                  </span>
                  <Chip size="sm" color="success" variant="flat" className="font-bold bg-tech-emerald/20">
                    {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
                  </Chip>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-sm font-bold text-danger">
                    較目前方案多 ${result.comparison.difference.toFixed(0)}
                  </span>
                  <span className="text-xs text-default-500">
                    ({result.comparison.savingPercentage.toFixed(1)}%)
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Enhanced tooltip for estimated results */}
          {result.label.accuracy === 'estimated' && rank === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mt-5 bg-warning-50 border-warning-200/50 backdrop-blur-sm">
                <CardBody className="p-5">
                  <p className="text-sm text-default-700 flex items-start gap-3 leading-relaxed">
                    <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-warning" />
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

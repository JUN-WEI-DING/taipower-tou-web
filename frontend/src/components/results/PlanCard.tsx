import React, { useState } from 'react';
import { Trophy, Medal, Award, Info, Zap, ChevronDown, ChevronUp, TrendingUp } from '../icons';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanCalculationResult } from '../../types';
import { cn } from '../../lib/utils';

interface PlanCardProps {
  result: PlanCalculationResult;
  rank: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({ result, rank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-primary" size={24} />;
    if (r === 2) return <Medal className="text-muted-foreground" size={24} />;
    if (r === 3) return <Award className="text-muted-foreground" size={24} />;
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;

  const getCardStyles = () => {
    if (rank === 1) {
      return 'border-2 border-orange-500 shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-50 to-card dark:from-orange-950/20 dark:to-card overflow-visible';
    }
    if (rank === 2) return 'border border-border shadow-sm hover:shadow-md bg-card';
    return 'border border-border bg-card';
  };

  const getRankBadge = () => {
    if (rank === 1) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md';
    if (rank === 2) return 'bg-muted text-muted-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn("w-full relative", rank === 1 && "group")}
    >
      {/* Rank 1 glow effect */}
      {rank === 1 && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-orange-400/20 rounded-xl animate-pulse-slow" />
        </>
      )}

      <Card
        className={cn(`transition-all duration-300 relative ${getCardStyles()}`)}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: rank * 0.08 + 0.15, type: "spring", stiffness: 200, damping: 15 }}
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-xl shadow-lg",
                  rank === 1
                    ? "bg-gradient-to-br from-orange-500 to-orange-600"
                    : "bg-muted"
                )}
              >
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                )}
              </motion.div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-bold",
                    rank === 1 ? "text-xl text-orange-600 dark:text-orange-400" : "text-card-foreground"
                  )}>
                    {result.planName}
                  </h4>
                  {rank <= 3 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: rank * 0.08 + 0.25, type: "spring", stiffness: 300 }}
                      className={cn("text-xs px-2.5 py-1 rounded-full font-medium", getRankBadge())}
                    >
                      {rank === 1 ? '🏆 推薦' : rank === 2 ? '🥈 次選' : '🥉 三選'}
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  排名第 {rank} 名 · {result.label.accuracy === 'accurate' ? '精確計算' : result.label.accuracy === 'estimated' ? '估算值' : '需確認'}
                </p>
              </div>
            </div>

            <Chip
              size="sm"
              variant="flat"
              className={cn(
                "font-medium",
                result.label.accuracy === 'accurate' && "bg-success-100 text-success dark:bg-success-900/30 dark:text-success-400",
                result.label.accuracy === 'estimated' && "bg-warning-100 text-warning dark:bg-warning-900/30 dark:text-warning-400",
                result.label.accuracy === 'partial_estimated' && "bg-danger-100 text-danger dark:bg-danger-900/30 dark:text-danger-400"
              )}
            >
              {result.label.badge}
            </Chip>
          </div>

          {isCurrentPlan && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-300 dark:border-orange-700"
            >
              <Zap size={14} className="text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">目前使用中</span>
            </motion.div>
          )}

          <motion.div
            className={cn(
              "text-center py-8 rounded-xl mb-4 relative overflow-hidden",
              rank === 1
                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                : "bg-muted"
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {rank === 1 && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            )}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: rank * 0.08 + 0.35, type: "spring", stiffness: 200 }}
              className={cn(
                "text-4xl md:text-5xl font-bold relative",
                rank === 1 ? "text-white" : "text-card-foreground"
              )}
            >
              ${result.charges.total.toFixed(0)}
            </motion.div>
            <p className={cn(
              "text-sm mt-2 relative",
              rank === 1 ? "text-orange-100" : "text-muted-foreground"
            )}>
              每月預估電費
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
                  <div className="border-t border-border/60 pt-4 mt-4">
                    <p className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      <Info size={16} className="text-orange-500" />
                      時段用電明細
                    </p>
                    <div className="space-y-2">
                      {result.breakdown.touBreakdown.map((item, i) => {
                        const periodLabel = item.period === 'peak' ? '尖峰時段' :
                                           item.period === 'semi_peak' ? '半尖峰時段' :
                                           item.period === 'off_peak' ? '離峰時段' : item.label || '其他';
                        const periodColor = item.period === 'peak' ? 'bg-danger/10 border-danger/30 text-danger' :
                                           item.period === 'semi_peak' ? 'bg-warning/10 border-warning/30 text-warning' :
                                           'bg-success/10 border-success/30 text-success';
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                              "flex justify-between items-center py-2.5 px-4 rounded-lg border transition-all hover:scale-[1.02]",
                              periodColor
                            )}
                          >
                            <span className="text-sm font-medium">{periodLabel}</span>
                            <span className="font-mono text-sm font-bold">
                              ${item.charge.toFixed(1)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
                  <div className="border-t border-border/60 pt-4 mt-4">
                    <p className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-orange-500" />
                      累進費率明細
                    </p>
                    <div className="space-y-2">
                      {result.breakdown.tierBreakdown.map((tier, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex justify-between items-center py-2.5 px-4 bg-muted rounded-lg hover:scale-[1.02] transition-all"
                        >
                          <span className="text-sm text-card-foreground">第 {tier.tier} 段</span>
                          <span className="font-mono text-sm font-bold text-card-foreground">
                            ${tier.charge.toFixed(1)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="sm"
            variant="light"
            className={cn(
              "w-full font-medium transition-all",
              rank === 1 && "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            )}
            endContent={
              <motion.div
                animate={isExpanded ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            }
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '收起明細' : '檢視明細'}
          </Button>

          {!isCurrentPlan && result.comparison.difference !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "mt-4 py-4 px-4 rounded-xl text-center border",
                isPositive
                  ? "bg-gradient-to-r from-success/10 to-emerald-50 border-success/30 dark:from-success/5 dark:to-emerald-950/30 dark:border-success/20"
                  : "bg-gradient-to-r from-destructive/10 to-red-50 border-destructive/30 dark:from-destructive/5 dark:to-red-950/30 dark:border-destructive/20"
              )}>
              {isPositive ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Zap size={20} className="text-success" />
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-success text-lg">省 ${Math.abs(result.comparison.difference).toFixed(0)}</span>
                    <Chip
                      size="sm"
                      className="bg-success-100 text-success border border-success-300 dark:bg-success-900/30 dark:border-success-700 font-semibold"
                    >
                      {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
                    </Chip>
                  </div>
                </div>
              ) : (
                <span className="text-sm font-medium text-destructive flex items-center justify-center gap-2">
                  <TrendingUp size={16} />
                  較目前方案多 ${result.comparison.difference.toFixed(0)}
                </span>
              )}
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

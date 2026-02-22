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
    if (r === 1) return <Trophy className="text-primary" size={24} />;
    if (r === 2) return <Medal className="text-muted-foreground" size={24} />;
    if (r === 3) return <Award className="text-muted-foreground" size={24} />;
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;

  const getCardStyles = () => {
    if (rank === 1) return 'border-2 border-primary shadow-md bg-card';
    if (rank === 2) return 'border border-border shadow-sm bg-card';
    return 'border border-border bg-card';
  };

  const getRankBadge = () => {
    if (rank === 1) return 'bg-primary text-primary-foreground';
    if (rank === 2) return 'bg-muted text-muted-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.05 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card
        className={`transition-all duration-200 hover:shadow-md ${getCardStyles()}`}
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: rank * 0.05 + 0.1 }}
                className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted"
              >
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                )}
              </motion.div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-card-foreground">{result.planName}</h4>
                  {rank <= 3 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRankBadge()}`}>
                      {rank === 1 ? '推薦' : rank === 2 ? '次選' : '三選'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  排名第 {rank} 名
                </p>
              </div>
            </div>

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

          {isCurrentPlan && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Zap size={14} className="text-primary" />
              <span className="text-sm font-medium text-primary">目前使用中</span>
            </div>
          )}

          <div className={`text-center py-6 rounded-lg mb-4 ${
            rank === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <div className={`text-3xl md:text-4xl font-bold ${
              rank === 1 ? 'text-primary-foreground' : 'text-card-foreground'
            }`}>
              ${result.charges.total.toFixed(0)}
            </div>
            <p className={`text-sm mt-2 ${
              rank === 1 ? 'text-primary-foreground/80' : 'text-muted-foreground'
            }`}>
              每月預估電費
            </p>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {result.breakdown.touBreakdown && result.breakdown.touBreakdown.length > 0 ? (
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      <Info size={16} className="text-primary" />
                      時段用電明細
                    </p>
                    <div className="space-y-2">
                      {result.breakdown.touBreakdown.map((item, i) => {
                        const periodLabel = item.period === 'peak' ? '尖峰時段' :
                                           item.period === 'semi_peak' ? '半尖峰時段' :
                                           item.period === 'off_peak' ? '離峰時段' : item.label || '其他';
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg"
                          >
                            <span className="text-sm text-card-foreground">{periodLabel}</span>
                            <span className="font-mono text-sm font-bold text-card-foreground">
                              ${item.charge.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-sm font-semibold text-card-foreground mb-3">累進費率明細</p>
                    <div className="space-y-2">
                      {result.breakdown.tierBreakdown.map((tier, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2 px-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm text-card-foreground">第 {tier.tier} 段</span>
                          <span className="font-mono text-sm font-bold text-card-foreground">
                            ${tier.charge.toFixed(1)}
                          </span>
                        </div>
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
            className="w-full"
            endContent={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '收起明細' : '檢視明細'}
          </Button>

          {!isCurrentPlan && result.comparison.difference !== 0 && (
            <div className={`mt-4 py-3 px-4 rounded-lg text-center ${
              isPositive
                ? 'bg-success/10 border border-success/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}>
              {isPositive ? (
                <div className="flex items-center justify-center gap-2">
                  <Zap size={18} className="text-success" />
                  <span className="font-bold text-success">省 ${Math.abs(result.comparison.difference).toFixed(0)}</span>
                  <Chip size="sm" color="success" variant="flat">
                    {Math.abs(result.comparison.savingPercentage).toFixed(1)}%
                  </Chip>
                </div>
              ) : (
                <span className="text-sm font-medium text-destructive">
                  較目前方案多 ${result.comparison.difference.toFixed(0)}
                </span>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

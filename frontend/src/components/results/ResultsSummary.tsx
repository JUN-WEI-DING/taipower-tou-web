import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle, Sparkles } from '../icons';
import type { PlanCalculationResult } from '../../types';

/**
 * Results Summary Component - Clean Minimal Design
 * Shows the best recommendation with simple, clean layout
 */
export const ResultsSummary: React.FC<{
  results: PlanCalculationResult[];
}> = ({ results }) => {
  if (results.length === 0) return null;

  const bestPlan = results[0];
  const currentPlan = results.find(r => r.comparison.isCurrentPlan);
  const hasCurrentPlan = currentPlan !== undefined;
  const savings = hasCurrentPlan ? currentPlan.charges.total - bestPlan.charges.total : 0;
  const savingsPercent = hasCurrentPlan && currentPlan.charges.total > 0
    ? (savings / currentPlan.charges.total) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-primary shadow-lg bg-card overflow-hidden">
        <CardBody className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Best plan info */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
              >
                <Sparkles size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">推薦方案</span>
              </motion.div>

              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-md"
                >
                  <Zap className="text-primary-foreground" size={28} />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">最佳選擇</p>
                  <p className="text-xl md:text-2xl font-bold text-card-foreground">{bestPlan.planName}</p>
                </div>
              </div>

              {bestPlan.label.accuracy === 'estimated' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-start gap-2 px-4 py-3 bg-muted rounded-lg"
                >
                  <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    基於估算用電習慣，實際電費可能有所不同
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Savings info */}
            <div className="flex-shrink-0 text-center">
              {hasCurrentPlan && savings > 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground">相比目前方案可節省</p>
                  <div className="flex items-center justify-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <TrendingUp className="text-primary" size={24} />
                    </motion.div>
                    <span className="text-4xl md:text-5xl font-bold text-card-foreground">
                      ${savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <CheckCircle size={18} className="text-primary" />
                    <span className="font-bold text-primary">
                      節省 {savingsPercent.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="py-4"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle size={18} className="text-success" />
                    <p className="font-medium text-success">
                      目前已是最佳方案
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

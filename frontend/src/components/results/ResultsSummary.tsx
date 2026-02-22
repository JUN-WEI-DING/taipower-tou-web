import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle } from '../icons';
import type { PlanCalculationResult } from '../../types';

/**
 * Results Summary Component
 * Shows the best recommendation and key insights
 */
export const ResultsSummary: React.FC<{
  results: PlanCalculationResult[];
}> = ({ results }) => {
  if (results.length === 0) return null;

  const bestPlan = results[0];
  const currentPlan = results.find(r => r.comparison.isCurrentPlan) || results[results.length - 1];
  const savings = currentPlan.charges.total - bestPlan.charges.total;
  const savingsPercent = (savings / currentPlan.charges.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Best plan info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">推薦方案</h3>
                  <p className="text-2xl font-bold text-primary">{bestPlan.planName}</p>
                </div>
              </div>

              {bestPlan.label.accuracy === 'estimated' && (
                <p className="text-sm text-default-500 mt-2">
                  * 基於估算用電習慣，實際電費可能有所不同
                </p>
              )}
            </div>

            {/* Right: Savings info */}
            <div className="flex-shrink-0 text-center">
              <p className="text-sm text-default-500 mb-1">相比目前方案</p>
              {savings > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="text-success" size={20} />
                    <span className="text-4xl font-bold text-success">
                      ${savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 rounded-full">
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-success font-semibold">
                      節省 {savingsPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg text-default-500">
                    目前已是最佳方案
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

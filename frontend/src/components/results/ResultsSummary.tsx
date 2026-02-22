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
      <Card className="bg-gradient-energy border-2 border-energy-blue shadow-energy overflow-hidden">
        <CardBody className="p-6 md:p-8">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Best plan info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-energy flex items-center justify-center">
                  <Zap className="text-energy-blue" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white/80">推薦方案</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white">{bestPlan.planName}</p>
                </div>
              </div>

              {bestPlan.label.accuracy === 'estimated' && (
                <div className="inline-flex items-start gap-2 px-4 py-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <CheckCircle size={18} className="text-white/80 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/90">
                    基於估算用電習慣，實際電費可能有所不同
                  </p>
                </div>
              )}
            </div>

            {/* Right: Savings info */}
            <div className="flex-shrink-0 text-center">
              <p className="text-sm text-white/70 mb-2">相比目前方案</p>
              {savings > 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3">
                    <TrendingUp className="text-white" size={28} />
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      ${savings.toFixed(0)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <CheckCircle size={20} className="text-white" />
                    <span className="text-xl font-bold text-white">
                      節省 {savingsPercent.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xl text-white/90 font-medium">
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

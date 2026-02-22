import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle, Sparkles } from '../icons';
import type { PlanCalculationResult } from '../../types';

/**
 * Results Summary Component - Tech Innovation Theme
 * Shows the best recommendation and key insights with neon effects
 */
export const ResultsSummary: React.FC<{
  results: PlanCalculationResult[];
}> = ({ results }) => {
  if (results.length === 0) return null;

  const bestPlan = results[0];
  const currentPlan = results.find(r => r.comparison.isCurrentPlan);
  const hasCurrentPlan = currentPlan !== undefined;
  const savings = hasCurrentPlan ? currentPlan.charges.total - bestPlan.charges.total : 0;
  const savingsPercent = hasCurrentPlan && currentPlan.charges.total > 0 ? (savings / currentPlan.charges.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-2 border-accent-400 shadow-neon overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 backdrop-blur-md">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift bg-[length:200%_100%]" />

        {/* Decorative background orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

        <CardBody className="p-6 md:p-10 relative">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left: Best plan info */}
            <div className="flex-1 space-y-5">
              {/* Winner badge with glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-neon"
              >
                <Sparkles size={16} className="text-accent-200" />
                <span className="text-sm font-bold text-white tracking-wide">推薦方案</span>
              </motion.div>

              {/* Plan name with icon */}
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md shadow-neon flex items-center justify-center border border-white/30"
                >
                  <Zap className="text-white" size={36} />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-1">最佳選擇</h3>
                  <p className="text-2xl md:text-4xl font-bold text-white tracking-tight">{bestPlan.planName}</p>
                </div>
              </div>

              {/* Accuracy notice */}
              {bestPlan.label.accuracy === 'estimated' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-start gap-3 px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                >
                  <CheckCircle size={20} className="text-accent-200 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/90 leading-relaxed">
                    基於估算用電習慣，實際電費可能有所不同
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Savings info with neon effect */}
            <div className="flex-shrink-0 text-center">
              <p className="text-sm text-white/80 mb-4 font-medium">相比目前方案可節省</p>
              {savings > 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 15 }}
                  className="space-y-5"
                >
                  {/* Main savings amount with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 blur-3xl rounded-3xl animate-pulse" />
                    <div className="relative flex items-center justify-center gap-4 bg-white/10 backdrop-blur-md rounded-3xl px-8 py-6 border border-white/20 shadow-neon">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        <TrendingUp className="text-accent-200" size={32} />
                      </motion.div>
                      <span className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                        ${savings.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Percentage badge with glow */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-neon"
                  >
                    <CheckCircle size={24} className="text-accent-200" />
                    <span className="text-2xl font-bold text-white">
                      節省 {savingsPercent.toFixed(1)}%
                    </span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <CheckCircle size={24} className="text-success-400" />
                    <p className="text-xl text-white/90 font-medium">
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

import { Card, CardBody } from '@nextui-org/react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle, Sparkles, Trophy, Award } from '../icons';
import type { PlanCalculationResult } from '../../types';
import { cn } from '../../lib/utils';

/**
 * Results Summary Component - Enhanced with Orange Theme
 * Shows the best recommendation with enhanced visual design
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

  // Animated counter hook
  const useAnimatedValue = (value: number, duration = 1.5) => {
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { duration: duration * 1000 });
    const rounded = useTransform(spring, (latest) => Math.round(latest));
    return { value: rounded, spring };
  };

  // Determine season
  const billingPeriod = bestPlan.billingPeriod || { start: new Date(), end: new Date() };
  const month = billingPeriod.start.getMonth() + 1;
  const isSummer = month >= 6 && month <= 9;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Glow effect for best plan */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-2xl blur opacity-20" />

      <Card className="border-2 border-orange-400 dark:border-orange-600 shadow-xl shadow-orange-500/20 bg-card overflow-visible relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:to-transparent pointer-events-none" />

        {/* Season indicator */}
        <div className="absolute -top-3 -right-3 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className={cn(
              "px-4 py-1.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2",
              isSummer
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            )}
          >
            {isSummer ? '🌞 夏季' : '❄️ 非夏季'}
          </motion.div>
        </div>

        <CardBody className="p-6 md:p-10 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Best plan info */}
            <div className="flex-1 space-y-5 w-full">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-950/30 rounded-full border border-orange-300 dark:border-orange-700"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={14} className="text-orange-600 dark:text-orange-400" />
                </motion.div>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">推薦方案</span>
              </motion.div>

              {/* Plan name and icon */}
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 15 }}
                  className="relative"
                >
                  {/* Glow behind icon */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/40">
                    <Trophy className="text-white" size={32} />
                  </div>
                  {/* Number 1 badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-orange-500">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">1</span>
                  </div>
                </motion.div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Award size={14} className="text-orange-500" />
                    最優選擇
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{bestPlan.planName}</p>
                  <p className="text-sm text-muted-foreground mt-1">每月預估電費 ${bestPlan.charges.total.toFixed(0)}</p>
                </div>
              </div>

              {/* Accuracy warning */}
              {bestPlan.label.accuracy === 'estimated' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800"
                >
                  <CheckCircle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    基於估算用電習慣，實際電費可能有所不同
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Savings info */}
            <div className="flex-shrink-0 text-center w-full lg:w-auto">
              {hasCurrentPlan && savings > 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="space-y-5"
                >
                  <p className="text-sm text-muted-foreground font-medium">相比目前方案可節省</p>

                  {/* Animated savings amount */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, -15, 15, -15, 0] }}
                      transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg" />
                      <TrendingUp className="text-green-600 dark:text-green-400 relative" size={32} />
                    </motion.div>

                    <motion.span
                      className={cn(
                        "text-5xl md:text-6xl font-black bg-clip-text text-transparent",
                        "bg-gradient-to-br from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                    >
                      ${savings.toFixed(0)}
                    </motion.span>
                  </div>

                  {/* Savings percentage badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-950/30 rounded-2xl border-2 border-green-400 dark:border-green-600 shadow-lg shadow-green-500/20"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">節省比例</p>
                      <p className="text-xl font-black text-green-700 dark:text-green-300">{savingsPercent.toFixed(1)}%</p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="py-6"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-950/30 rounded-2xl border-2 border-green-400 dark:border-green-600 shadow-lg">
                    <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
                    <p className="font-bold text-green-700 dark:text-green-300">
                      目前已是最佳方案
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: '比較方案數', value: results.length, icon: '📊' },
              { label: '計算精確度', value: bestPlan.label.accuracy === 'accurate' ? '精確' : '估算', icon: bestPlan.label.accuracy === 'accurate' ? '✅' : '📝' },
              { label: '季節', value: isSummer ? '夏季' : '非夏季', icon: isSummer ? '🌞' : '❄️' },
              { label: '最佳排名', value: '#1', icon: '🏆' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + index * 0.08 }}
                className="text-center p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, Sparkles } from '../icons';
import { cn } from '../../lib/utils';

// Define valid chip color types
type ChipColor = 'success' | 'warning' | 'danger' | 'default';

interface DataCompletenessBannerProps {
  billData: BillData;
}

export const DataCompletenessBanner: React.FC<DataCompletenessBannerProps> = ({
  billData,
}) => {
  const report = DataCompletenessDetector.detect(billData);
  const levelLabel = DataCompletenessDetector.getLevelLabel(report.level);
  const levelDescription = DataCompletenessDetector.getLevelDescription(report.level);

  // Calculate completeness percentage
  const getCompletenessPercentage = () => {
    switch (report.level) {
      case 'three_tier': return 100;
      case 'two_tier': return 66;
      case 'total_only': return 33;
      default: return 0;
    }
  };

  // Get styling based on completeness level
  const getLevelStyles = () => {
    switch (report.level) {
      case 'three_tier':
        return {
          color: 'success' as ChipColor,
          bgGradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30',
          borderColor: 'border-emerald-300 dark:border-emerald-700',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-green-500/30',
          icon: <CheckCircle size={22} className="text-white" />,
          accentColor: 'text-emerald-700 dark:text-emerald-300',
          progressBar: 'bg-gradient-to-r from-emerald-500 to-green-500',
        };
      case 'two_tier':
        return {
          color: 'warning' as ChipColor,
          bgGradient: 'from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30',
          borderColor: 'border-amber-300 dark:border-amber-700',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-orange-500/30',
          icon: <AlertTriangle size={22} className="text-white" />,
          accentColor: 'text-amber-700 dark:text-amber-300',
          progressBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
        };
      case 'total_only':
        return {
          color: 'danger' as ChipColor,
          bgGradient: 'from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/20 dark:to-pink-950/30',
          borderColor: 'border-red-300 dark:border-red-700',
          iconBg: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30',
          icon: <Info size={22} className="text-white" />,
          accentColor: 'text-red-700 dark:text-red-300',
          progressBar: 'bg-gradient-to-r from-red-500 to-rose-500',
        };
      default:
        return {
          color: 'default' as ChipColor,
          bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30',
          borderColor: 'border-gray-300 dark:border-gray-700',
          iconBg: 'bg-gradient-to-br from-gray-400 to-slate-500',
          icon: <Info size={22} className="text-white" />,
          accentColor: 'text-gray-700 dark:text-gray-300',
          progressBar: 'bg-gradient-to-r from-gray-400 to-slate-500',
        };
    }
  };

  const styles = getLevelStyles();
  const { color, bgGradient, borderColor, iconBg, icon, progressBar } = styles;
  const completenessPercent = getCompletenessPercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className={cn(
        "bg-gradient-to-br border-2 shadow-lg overflow-visible relative",
        bgGradient,
        borderColor
      )}>
        {/* Decorative gradient glow */}
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-20 pointer-events-none",
          report.level === 'three_tier' && 'from-emerald-400 to-green-400',
          report.level === 'two_tier' && 'from-amber-400 to-orange-400',
          report.level === 'total_only' && 'from-red-400 to-rose-400',
        )} />

        <CardBody className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start gap-5">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "p-4 rounded-2xl flex-shrink-0 relative",
                iconBg
              )}
            >
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: 'inherit' }}
              />
              <div className="relative">{icon}</div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with title and chip */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  資料完整度分析
                </h4>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                >
                  <Chip
                    size="sm"
                    color={color}
                    variant="flat"
                    className="font-bold shadow-sm"
                  >
                    {levelLabel}
                  </Chip>
                </motion.div>

                {/* Completeness badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                    report.level === 'three_tier' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                    report.level === 'two_tier' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                    report.level === 'total_only' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  )}
                >
                  <Sparkles size={12} />
                  {completenessPercent}% 完整
                </motion.div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                {levelDescription}
              </p>

              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-5"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completenessPercent}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={cn("h-full rounded-full", progressBar)}
                />
              </motion.div>

              {/* Info sections with staggered animation */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {report.canCalculateAccurately.length > 0 && (
                    <motion.div
                      key="accurate"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.6 }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30",
                        "border-emerald-200 dark:border-emerald-800"
                      )}
                    >
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex-shrink-0">
                        <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200 block mb-1">
                          可準確計算
                        </span>
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                          {report.canCalculateAccurately.join('、')}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {report.needsEstimation.length > 0 && (
                    <motion.div
                      key="estimation"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.7 }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30",
                        "border-amber-200 dark:border-amber-800"
                      )}
                    >
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex-shrink-0">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-amber-800 dark:text-amber-200 block mb-1">
                          需要估算
                        </span>
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-mono">
                          {report.needsEstimation.join('、')}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {report.needsSplit.length > 0 && (
                    <motion.div
                      key="split"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.8 }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30",
                        "border-red-200 dark:border-red-800"
                      )}
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg flex-shrink-0">
                        <Info size={18} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-red-800 dark:text-red-200 block mb-1">
                          需要拆分
                        </span>
                        <span className="text-xs text-red-700 dark:text-red-300 font-mono">
                          {report.needsSplit.join('、')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

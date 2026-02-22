import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';
import { motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle } from '../icons';

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

  // Get styling based on completeness level
  const getLevelStyles = () => {
    switch (report.level) {
      case 'three_tier':
        return {
          color: 'success' as ChipColor,
          bgGradient: 'from-success-50 to-success-100',
          borderColor: 'border-success-200',
          iconBg: 'bg-success-100',
          icon: <CheckCircle size={20} className="text-success-600" />,
        };
      case 'two_tier':
        return {
          color: 'warning' as ChipColor,
          bgGradient: 'from-warning-50 to-warning-100',
          borderColor: 'border-warning-200',
          iconBg: 'bg-warning-100',
          icon: <AlertTriangle size={20} className="text-warning-600" />,
        };
      case 'total_only':
        return {
          color: 'danger' as ChipColor,
          bgGradient: 'from-danger-50 to-danger-100',
          borderColor: 'border-danger-200',
          iconBg: 'bg-danger-100',
          icon: <Info size={20} className="text-danger-600" />,
        };
      default:
        return {
          color: 'default' as ChipColor,
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          icon: <Info size={20} className="text-gray-500" />,
        };
    }
  };

  const styles = getLevelStyles();
  const { color, bgGradient, borderColor, iconBg, icon } = styles;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${bgGradient} border-2 ${borderColor} shadow-sm`}>
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-gray-900">
                  資料完整度分析
                </h4>
                <Chip
                  size="sm"
                  color={color}
                  variant="flat"
                  className="font-medium"
                >
                  {levelLabel}
                </Chip>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {levelDescription}
              </p>

              {/* Info sections */}
              <div className="space-y-2">
                {report.canCalculateAccurately.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-success-50/80 rounded-xl border border-success-100">
                    <CheckCircle size={18} className="text-success-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-success-700 block mb-1">
                        可準確計算
                      </span>
                      <span className="text-xs text-success-700 font-mono">
                        {report.canCalculateAccurately.join('、')}
                      </span>
                    </div>
                  </div>
                )}

                {report.needsEstimation.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-warning-50/80 rounded-xl border border-warning-100">
                    <AlertTriangle size={18} className="text-warning-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-warning-700 block mb-1">
                        需要估算
                      </span>
                      <span className="text-xs text-warning-700 font-mono">
                        {report.needsEstimation.join('、')}
                      </span>
                    </div>
                  </div>
                )}

                {report.needsSplit.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-danger-50/80 rounded-xl border border-danger-100">
                    <Info size={18} className="text-danger-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-danger-700 block mb-1">
                        需要拆分
                      </span>
                      <span className="text-xs text-danger-700 font-mono">
                        {report.needsSplit.join('、')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

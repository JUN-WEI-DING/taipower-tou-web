import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';
import { motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle } from '../icons';

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
          color: 'success',
          bgGradient: 'from-success/5 to-success/10',
          borderColor: 'success/200',
          iconBg: 'success/10',
          icon: <CheckCircle size={20} className="text-success" />,
        };
      case 'two_tier':
        return {
          color: 'warning',
          bgGradient: 'from-warning/5 to-warning/10',
          borderColor: 'warning/200',
          iconBg: 'warning/10',
          icon: <AlertTriangle size={20} className="text-warning" />,
        };
      case 'total_only':
        return {
          color: 'danger',
          bgGradient: 'from-danger/5 to-danger/10',
          borderColor: 'danger/200',
          iconBg: 'danger/10',
          icon: <Info size={20} className="text-danger" />,
        };
      default:
        return {
          color: 'default',
          bgGradient: 'from-default-50 to-default-100',
          borderColor: 'default-200',
          iconBg: 'default-100',
          icon: <Info size={20} className="text-default-500" />,
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
      <Card className={`bg-gradient-to-br ${bgGradient} border-2 border-${borderColor} shadow-sm`}>
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-foreground">
                  資料完整度分析
                </h4>
                <Chip
                  size="sm"
                  color={color as any}
                  variant="flat"
                  className="font-medium"
                >
                  {levelLabel}
                </Chip>
              </div>

              <p className="text-sm text-default-600 mb-4 leading-relaxed">
                {levelDescription}
              </p>

              {/* Info sections */}
              <div className="space-y-2">
                {report.canCalculateAccurately.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-success-50/80 rounded-xl border border-success-100">
                    <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-success block mb-1">
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
                    <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-warning block mb-1">
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
                    <Info size={18} className="text-danger flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-danger block mb-1">
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

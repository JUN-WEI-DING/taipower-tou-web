import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';
import { motion } from 'framer-motion';
import { CheckCircle, Info } from '../icons';

interface DataCompletenessBannerProps {
  billData: BillData;
}

export const DataCompletenessBanner: React.FC<DataCompletenessBannerProps> = ({
  billData,
}) => {
  const report = DataCompletenessDetector.detect(billData);
  const levelLabel = DataCompletenessDetector.getLevelLabel(report.level);
  const levelDescription = DataCompletenessDetector.getLevelDescription(report.level);

  // Get color based on completeness level
  const getLevelColor = () => {
    switch (report.level) {
      case 'three_tier':
        return 'success';
      case 'two_tier':
        return 'warning';
      case 'total_only':
        return 'danger';
      default:
        return 'default';
    }
  };

  const levelColor = getLevelColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-primary-50 border border-primary-200">
        <CardBody className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-full bg-${levelColor}-100`}>
              <Info size={20} className={`text-${levelColor}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span>📊</span>
                資料完整度分析
                <Chip size="sm" color={levelColor} variant="flat">
                  {levelLabel}
                </Chip>
              </h4>
            </div>
          </div>

          <p className="text-sm text-default-700 mb-4">{levelDescription}</p>

          {/* 可準確計算 */}
          {report.canCalculateAccurately.length > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2 p-2 bg-success-50 rounded-lg">
              <CheckCircle size={16} className="text-success flex-shrink-0" />
              <span className="text-success font-medium">可準確計算：</span>
              <span className="font-mono text-success-700">
                {report.canCalculateAccurately.join('、')}
              </span>
            </div>
          )}

          {/* 需要估算 */}
          {report.needsEstimation.length > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2 p-2 bg-warning-50 rounded-lg">
              <Info size={16} className="text-warning flex-shrink-0" />
              <span className="text-warning font-medium">需估算：</span>
              <span className="font-mono text-warning-700">
                {report.needsEstimation.join('、')}
              </span>
            </div>
          )}

          {/* 需要拆分 */}
          {report.needsSplit.length > 0 && (
            <div className="flex items-center gap-2 text-sm p-2 bg-danger-50 rounded-lg">
              <Info size={16} className="text-danger flex-shrink-0" />
              <span className="text-danger font-medium">需拆分：</span>
              <span className="font-mono text-danger-700">
                {report.needsSplit.join('、')}
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

import React from 'react';
import { DataCompletenessDetector } from '../../services/data/DataCompletenessDetector';
import type { BillData } from '../../types';

interface DataCompletenessBannerProps {
  billData: BillData;
}

export const DataCompletenessBanner: React.FC<DataCompletenessBannerProps> = ({
  billData,
}) => {
  const report = DataCompletenessDetector.detect(billData);
  const levelLabel = DataCompletenessDetector.getLevelLabel(report.level);
  const levelDescription = DataCompletenessDetector.getLevelDescription(report.level);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>📊</span>
        資料完整度分析：{levelLabel}
      </h4>

      <p className="text-sm text-gray-700 mb-3">{levelDescription}</p>

      {/* 可準確計算 */}
      {report.canCalculateAccurately.length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-green-700">✅ 可準確計算：</span>
          <span className="font-mono">
            {report.canCalculateAccurately.join('、')}
          </span>
        </div>
      )}

      {/* 需要估算 */}
      {report.needsEstimation.length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-amber-700">⚠️ 需估算：</span>
          <span className="font-mono">
            {report.needsEstimation.join('、')}
          </span>
        </div>
      )}

      {/* 需要拆分 */}
      {report.needsSplit.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-orange-700">🔪 需拆分：</span>
          <span className="font-mono">{report.needsSplit.join('、')}</span>
        </div>
      )}
    </div>
  );
};

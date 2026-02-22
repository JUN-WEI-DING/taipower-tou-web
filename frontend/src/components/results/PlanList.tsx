import React from 'react';
import { PlanCard } from './PlanCard';
import { Card, CardBody, Chip } from '@nextui-org/react';
import type { PlanCalculationResult } from '../../types';

interface PlanListProps {
  results: PlanCalculationResult[];
}

export const PlanList: React.FC<PlanListProps> = ({ results }) => {
  // 找出當前方案（如果有的話）
  const currentPlan = results.find((r) => r.comparison.isCurrentPlan);

  // 空狀態處理
  if (results.length === 0) {
    return (
      <Card className="bg-default-50">
        <CardBody className="py-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">尚無計算結果</h3>
          <p className="text-default-500">請先上傳電費單並進行計算</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 標題 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground">方案比較結果</h3>
        <p className="text-sm text-default-500">
          {currentPlan
            ? `當前方案：${currentPlan.planName} - $${currentPlan.charges.total.toFixed(0)}`
            : '各種費率方案的電費比較'}
        </p>
      </div>

      {/* 排名 */}
      {results.map((result, index) => (
        <PlanCard key={result.planId} result={result} rank={index + 1} />
      ))}

      {/* 總結建議 */}
      {results.length > 1 && currentPlan && (
        (() => {
          const cheapestPlan = results[0];
          const currentPlanTotal = currentPlan.charges.total;
          const cheapestIsCurrent = cheapestPlan.planId === currentPlan.planId;
          const savings = currentPlanTotal - cheapestPlan.charges.total;

          // 只有當最便宜的方案不是當前方案時，才顯示切換建議
          if (!cheapestIsCurrent && savings > 0) {
            return (
              <Card className="bg-success-50 border-success-200">
                <CardBody className="p-4">
                  <h4 className="font-bold text-success mb-2">💰 省錢建議</h4>
                  <p className="text-sm text-success-700">
                    如果改用「{cheapestPlan.planName}」，每月可比當前方案省
                    <span className="font-bold">${savings.toFixed(0)}</span>
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    實際省多少要看您的用電時間分佈
                  </p>
                </CardBody>
              </Card>
            );
          }

          // 當前方案已經是最便宜的，顯示不同提示
          if (cheapestIsCurrent) {
            return (
              <Card className="bg-primary-50 border-primary-200">
                <CardBody className="p-4">
                  <h4 className="font-bold text-primary mb-2">✅ 您的方案很棒</h4>
                  <p className="text-sm text-primary-700">
                    根據您的用電習慣，「{currentPlan.planName}」已經是最划算的選擇！
                  </p>
                  <p className="text-xs text-primary-600 mt-2">
                    如果您的用電習慣改變（例如更多在深夜用電），時間電價可能會更省錢
                  </p>
                </CardBody>
              </Card>
            );
          }

          return null;
        })()
      )}
    </div>
  );
};

import React from 'react';
import { PlanCard } from './PlanCard';
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無計算結果</h3>
        <p className="text-gray-600">請先上傳電費單並進行計算</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 標題 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">方案比較結果</h3>
        <p className="text-sm text-gray-600">
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
      {results.length > 1 && results[0].charges.total !== results[results.length - 1].charges.total && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h4 className="font-bold text-green-900 mb-2">💰 省錢建議</h4>
          <p className="text-sm text-green-800">
            如果改用「{results[0].planName}」，每月可比當前方案省
            <span className="font-bold">
              ${Math.abs(results[0].charges.total - (currentPlan?.charges.total || 0)).toFixed(0)}
            </span>
          </p>
          <p className="text-xs text-green-700 mt-2">
            實際省多少要看您的用電時間分佈
          </p>
        </div>
      )}
    </div>
  );
};

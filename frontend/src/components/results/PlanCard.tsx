import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { PlanCalculationResult } from '../../types';

interface PlanCardProps {
  result: PlanCalculationResult;
  rank: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({ result, rank }) => {
  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (r === 2) return <Medal className="text-gray-400" size={20} />;
    if (r === 3) return <Award className="text-orange-600" size={20} />;
    return null;
  };

  const isPositive = result.comparison.difference < 0;
  const isCurrentPlan = result.comparison.isCurrentPlan;

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        rank === 1 ? 'border-green-500 shadow-md' : 'border-gray-200'
      }`}
    >
      {/* 排名與標題 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getRankIcon(rank)}
          <h4 className="font-bold text-gray-900">{result.planName}</h4>
        </div>

        {/* 準確度標籤 */}
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            result.label.accuracy === 'accurate'
              ? 'bg-green-100 text-green-800'
              : result.label.accuracy === 'estimated'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {result.label.badge}
        </span>
      </div>

      {/* 當前方案標示 */}
      {isCurrentPlan && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-md px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium">
            當前方案
          </span>
        </div>
      )}

      {/* 電費 */}
      <div className="text-center py-4">
        <div className="text-3xl font-bold text-gray-900">
          ${result.charges.total.toFixed(0)}
        </div>
        <p className="text-sm text-gray-600 mt-1">每月預估電費</p>
      </div>

      {/* 費用明細 */}
      {result.breakdown.tierBreakdown && result.breakdown.tierBreakdown.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">累進費率明細：</p>
          {result.breakdown.tierBreakdown.map((tier, i) => (
            <div key={i} className="flex justify-between text-xs py-1">
              <span className="text-gray-600">
                {tier.tier} 段 ({tier.kwh.toFixed(1)} 度)
              </span>
              <span className="font-mono">${tier.charge.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 與當前方案比較 */}
      {!isCurrentPlan && result.comparison.difference !== 0 && (
        <div
          className={`mt-3 py-2 px-3 rounded text-center text-sm ${
            isPositive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isPositive ? (
            <span>
              省 ${Math.abs(result.comparison.difference).toFixed(0)}
              <span className="ml-1">
                ({Math.abs(result.comparison.savingPercentage).toFixed(1)}%)
              </span>
            </span>
          ) : (
            <span>
              多 ${result.comparison.difference.toFixed(0)}
              <span className="ml-1">
                ({result.comparison.savingPercentage.toFixed(1)}%)
              </span>
            </span>
          )}
        </div>
      )}

      {/* 說明 */}
      {result.label.accuracy === 'estimated' && rank === 1 && (
        <p className="text-xs text-gray-500 text-center mt-2">
          💡 這個最省錢！但因為是估算，實際可能會有點差
        </p>
      )}
    </div>
  );
};

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PlanCalculationResult } from '../../types';

interface ResultChartProps {
  results: PlanCalculationResult[];
  maxCost?: number;
}

const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'];

export const ResultChart: React.FC<ResultChartProps> = ({ results, maxCost }) => {
  // 空狀態處理
  if (results.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg">尚無計算結果</p>
          <p className="text-sm mt-1">請先上傳電費單並進行計算</p>
        </div>
      </div>
    );
  }

  // 取得前 5 名
  const topResults = results.slice(0, 5);

  // 設定 Y 軸最大值（取最高的電費的 1.1 倍）
  const yAxisMax = maxCost || topResults[0].charges.total * 1.1;

  const data = topResults.map((result, index) => ({
    name: result.planName.length > 10
      ? result.planName.substring(0, 10) + '...'
      : result.planName,
    cost: result.charges.total,
    fill: COLORS[index % COLORS.length],
    planId: result.planId,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, yAxisMax]}
            tickFormatter={(value) => `$${Math.round(value)}`}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined) => typeof value === 'number' ? `$${value.toFixed(0)}` : ''}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              borderRadius: '4px',
              padding: '8px',
            }}
          />
          <Bar dataKey="cost" radius={[8, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

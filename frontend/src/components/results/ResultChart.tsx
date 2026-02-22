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
import { motion } from 'framer-motion';
import type { PlanCalculationResult } from '../../types';
import { cn } from '../../lib/utils';
import { CHART_COLORS, NEUTRAL_COLORS } from '../../lib/constants';

// Types for Recharts props
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: {
      index?: number;
    };
  }>;
  label?: string;
}

interface ResultChartProps {
  results: PlanCalculationResult[];
  maxCost?: number;
}

// Orange Theme Colors - aligned with brand (from constants)
const ORANGE_COLORS = [
  CHART_COLORS.rank1,
  CHART_COLORS.rank2,
  CHART_COLORS.rank3,
  CHART_COLORS.other,
  CHART_COLORS.dim,
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const value = data.value;
  const index = data.payload?.index ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-orange-200 dark:border-orange-800 p-4 min-w-[180px]"
    >
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">每月電費</span>
        <span className={cn(
          "text-lg font-bold",
          index === 0 ? "text-orange-500 dark:text-orange-400" : "text-orange-600 dark:text-orange-400"
        )}>
          ${Math.round(value).toLocaleString()}
        </span>
      </div>
      {index === 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">🏆 推薦方案</span>
        </div>
      )}
    </motion.div>
  );
};

export const ResultChart: React.FC<ResultChartProps> = ({ results, maxCost }) => {
  // Empty state handling
  if (!results || results.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center" role="img" aria-label="尚無計算結果圖表">
        <div className="text-center text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">尚無計算結果</p>
          <p className="text-sm mt-1">請先上傳電費單並進行計算</p>
        </div>
      </div>
    );
  }

  // Validate results
  const validResults = results.filter(r => r && r.charges && typeof r.charges.total === 'number' && r.charges.total >= 0);

  if (validResults.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center" role="img" aria-label="計算結果無效圖表">
        <div className="text-center text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium">計算結果無效</p>
          <p className="text-sm mt-1">請重新輸入資料並計算</p>
        </div>
      </div>
    );
  }

  // Get top 5
  const topResults = validResults.slice(0, 5);

  // Set Y axis max
  const maxTotal = Math.max(...topResults.map(r => r.charges.total));
  const yAxisMax = maxCost || (maxTotal * 1.1);

  const data = topResults.map((result, index) => ({
    name: result.planName?.length > 12
      ? result.planName.substring(0, 12) + '...'
      : (result.planName || `方案 ${index + 1}`),
    cost: result.charges.total || 0,
    color: ORANGE_COLORS[index % ORANGE_COLORS.length],
    planId: result.planId || `plan-${index}`,
    index,
  }));

  return (
    <div className="w-full" style={{ height: '360px' }} role="img" aria-label="電費方案比較圖表">
      {/* SVG Gradients Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient-rank1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={CHART_COLORS.rank1.gradientStart} />
            <stop offset="100%" stopColor={CHART_COLORS.rank1.gradientEnd} />
          </linearGradient>
          <linearGradient id="gradient-rank2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={CHART_COLORS.rank2.gradientStart} />
            <stop offset="100%" stopColor={CHART_COLORS.rank2.gradientEnd} />
          </linearGradient>
          <linearGradient id="gradient-rank3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={CHART_COLORS.rank3.gradientStart} />
            <stop offset="100%" stopColor={CHART_COLORS.rank3.gradientEnd} />
          </linearGradient>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={12}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke={NEUTRAL_COLORS[200]}
            strokeOpacity={0.6}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            dataKey="cost"
            domain={[0, yAxisMax]}
            tickFormatter={(value) => `$${Math.round(value)}`}
            tick={{ fontSize: 12, fill: NEUTRAL_COLORS[500] }}
            tickLine={false}
            axisLine={{ stroke: NEUTRAL_COLORS[200], strokeWidth: 1 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 13, fill: NEUTRAL_COLORS[600], fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="cost"
            radius={[0, 6, 6, 0]}
            className="focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color.stroke }}
            />
            <span className="text-xs text-muted-foreground">
              {index === 0 ? '推薦' : `#${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Cost breakdown display component */

import type { CalculationResponse } from "../../api/types";

interface CostBreakdownProps {
  result: CalculationResponse;
}

export function CostBreakdown({ result }: CostBreakdownProps) {
  const { summary, monthly_breakdown: monthlyBreakdown } = result;

  // Calculate period totals across all months
  const periodTotals = monthlyBreakdown.reduce<Record<string, { usage: number; cost: number }>>(
    (acc, month) => {
      month.by_period.forEach((period) => {
        if (!acc[period.period]) {
          acc[period.period] = { usage: 0, cost: 0 };
        }
        acc[period.period].usage += period.usage_kwh;
        acc[period.period].cost += period.cost;
      });
      return acc;
    },
    {}
  );

  // Format period name for display
  const formatPeriodName = (period: string): string => {
    const periodMap: Record<string, string> = {
      peak: "尖峰",
      off_peak: "離峰",
      semi_peak: "半尖峰",
      sunday_holiday: "週日/例假日",
    };
    return periodMap[period] || period;
  };

  return (
    <div className="cost-breakdown">
      <h2 className="text-2xl font-bold mb-4">電費計算結果</h2>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">總電費</p>
            <p className="text-3xl font-bold text-blue-600">
              NT${summary.total_cost.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">總用電量</p>
            <p className="text-2xl font-semibold">
              {summary.total_usage_kwh.toFixed(1)} kWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">平均電價</p>
            <p className="text-2xl font-semibold">
              NT${summary.average_rate.toFixed(2)}/kWh
            </p>
          </div>
        </div>
      </div>

      {/* Period Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">時段別費用</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  時段
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  用電量 (kWh)
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  費用 (NT$)
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  占比
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(periodTotals).map(([period, data]) => {
                const percentage = (data.cost / summary.total_cost) * 100;
                return (
                  <tr key={period} className="border-t">
                    <td className="px-4 py-3 text-sm">{formatPeriodName(period)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {data.usage.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {data.cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3">月份明細</h3>
        <div className="space-y-3">
          {monthlyBreakdown.map((month) => (
            <div key={month.month} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{month.month}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    month.season === "summer"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {month.season === "summer" ? "夏月" : "非夏月"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">用電量：</span>
                  <span className="font-medium">{month.usage_kwh.toFixed(1)} kWh</span>
                </div>
                <div>
                  <span className="text-gray-600">電費：</span>
                  <span className="font-medium">NT${month.energy_cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

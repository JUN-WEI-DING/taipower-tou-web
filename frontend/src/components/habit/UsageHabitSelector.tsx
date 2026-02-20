import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { UsageEstimator } from '../../services/calculation/UsageEstimator';
import type { BillData } from '../../types';

interface UsageHabitSelectorProps {
  billData: BillData;
  onConfirm: () => void;
}

export const UsageHabitSelector: React.FC<UsageHabitSelectorProps> = ({
  billData,
  onConfirm,
}) => {
  const [selectedHabit, setSelectedHabit] = useState<string>('average');
  const season = billData.billingPeriod.start.getMonth() >= 5 &&
    billData.billingPeriod.start.getMonth() <= 8
    ? 'summer'
    : 'non_summer';

  const totalConsumption = billData.consumption.usage;

  const habits = UsageEstimator.getAllHabits();

  // 計算選中的習慣
  const getEstimatedBreakdown = (habit: typeof habits[0]) => {
    if (habit.mode === 'custom') {
      return null;
    }
    const estimated = UsageEstimator.estimate(
      totalConsumption,
      habit.mode,
      season
    );

    return {
      peakOnPeak: Math.round(estimated.peakOnPeak),
      semiPeak: Math.round(estimated.semiPeak),
      offPeak: Math.round(estimated.offPeak),
      total: totalConsumption,
    };
  };

  const selectedHabitData = habits.find((h) => h.mode === selectedHabit);
  const estimatedBreakdown = selectedHabitData
    ? getEstimatedBreakdown(selectedHabitData)
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 標題 */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">
          選擇最像你家的用電習慣
        </h3>
        <p className="text-gray-600">
          你的電費單沒有時段用電資料，我們需要估算各時段的用電分配
        </p>
      </div>

      {/* 用電習慣選項 */}
      <div className="grid gap-4 md:grid-cols-2">
        {habits.map((habit) => (
          <div
            key={habit.mode}
            onClick={() => setSelectedHabit(habit.mode)}
            className={`
              cursor-pointer rounded-lg border-2 p-4 transition-all
              ${
                selectedHabit === habit.mode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* Emoji + 標題 */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{habit.emoji}</span>
              <div>
                <h4 className="font-bold text-lg">{habit.description}</h4>
                <p className="text-sm text-gray-600">{habit.whoIsItFor}</p>
              </div>
            </div>

            {/* 典型的一天 */}
            <div className="bg-gray-50 rounded p-3 mb-3 text-sm space-y-1">
              <p className="font-medium text-gray-700">典型的一天：</p>
              {selectedHabit === habit.mode
                ? UsageEstimator.getTypicalDay(habit.mode).map((line, i) => (
                    <p key={i} className="text-gray-600">
                      • {line}
                    </p>
                  ))
                : '點選檢視說明'}
            </div>

            {/* 預估分配 */}
            {selectedHabit === habit.mode && estimatedBreakdown && (
              <div className="text-sm">
                <div className="font-medium mb-2">預估分配：</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-red-600 font-bold">
                      {estimatedBreakdown.peakOnPeak} 度
                    </div>
                    <div className="text-gray-600 text-xs">傍晚晚間</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-yellow-600 font-bold">
                      {estimatedBreakdown.semiPeak} 度
                    </div>
                    <div className="text-gray-600 text-xs">部分時段</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-green-600 font-bold">
                      {estimatedBreakdown.offPeak} 度
                    </div>
                    <div className="text-gray-600 text-xs">深夜凌晨</div>
                  </div>
                </div>

                {/* 視覺化長條圖 */}
                <div className="h-4 rounded-full overflow-hidden flex mt-2">
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(estimatedBreakdown.peakOnPeak / totalConsumption) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${(estimatedBreakdown.semiPeak / totalConsumption) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(estimatedBreakdown.offPeak / totalConsumption) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 確認按鈕 */}
      <button
        onClick={onConfirm}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        使用此估算結果繼續
      </button>

      {/* 免責宣告 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-xs text-yellow-800">
          💡 這只是估算喔！實際電費會根據你真正的用電時間有所不同。
        </p>
      </div>
    </div>
  );
};

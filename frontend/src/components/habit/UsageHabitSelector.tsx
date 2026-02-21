import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { UsageEstimator } from '../../services/calculation/UsageEstimator';
import { EstimationMode } from '../../types';
import type { BillData } from '../../types';

interface UsageHabitSelectorProps {
  billData: BillData;
  onConfirm: (estimatedData: { peakOnPeak: number; semiPeak: number; offPeak: number }) => void;
}

export const UsageHabitSelector: React.FC<UsageHabitSelectorProps> = ({
  billData,
  onConfirm,
}) => {
  const [selectedHabit, setSelectedHabit] = useState<string>(EstimationMode.AVERAGE);
  const [customPercents, setCustomPercents] = useState<{
    peakOnPeak: number;
    semiPeak: number;
    offPeak: number;
  }>({ peakOnPeak: 33, semiPeak: 33, offPeak: 34 });
  const setEstimationMode = useAppStore((state) => state.setEstimationMode);
  // 正確判斷季節：夏季是6-9月（月份索引5-8），非夏季是10-5月
  const month = billData.billingPeriod.start.getMonth() + 1; // 1-12
  const season = (month >= 6 && month <= 9) ? 'summer' : 'non_summer';

  const totalConsumption = billData.consumption.usage;

  const habits = UsageEstimator.getAllHabits();

  // 計算選中的習慣
  const getEstimatedBreakdown = (habit: typeof habits[0]) => {
    if (habit.mode === 'custom') {
      // 自訂模式：使用 customPercents 計算
      if (customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak !== 100) {
        return null; // 百分比總和不是 100，不啟用按鈕
      }
      return {
        peakOnPeak: Math.round((totalConsumption * customPercents.peakOnPeak) / 100),
        semiPeak: Math.round((totalConsumption * customPercents.semiPeak) / 100),
        offPeak: Math.round((totalConsumption * customPercents.offPeak) / 100),
        total: totalConsumption,
      };
    }
    const estimated = UsageEstimator.estimate(
      totalConsumption,
      habit.mode as EstimationMode,
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

  // 當選擇改變時，更新 store
  useEffect(() => {
    setEstimationMode(selectedHabit as EstimationMode);
  }, [selectedHabit, setEstimationMode]);

  // 處理確認按鈕
  const handleConfirm = () => {
    if (estimatedBreakdown) {
      onConfirm({
        peakOnPeak: estimatedBreakdown.peakOnPeak,
        semiPeak: estimatedBreakdown.semiPeak,
        offPeak: estimatedBreakdown.offPeak,
      });
    }
  };

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
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          season === 'summer' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {season === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
        </div>
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
            {selectedHabit === habit.mode && (
              <>
                {habit.mode === 'custom' ? (
                  /* 自訂比例輸入 */
                  <div className="text-sm space-y-3">
                    <div className="font-medium">設定你的用電比例：</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <label className="text-red-600 text-xs block mb-1">傍晚晚間</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customPercents.peakOnPeak}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setCustomPercents({ ...customPercents, peakOnPeak: val });
                          }}
                          className="w-full px-2 py-1 border border-red-200 rounded text-center font-bold"
                        />
                        <div className="text-gray-600 text-xs mt-1">%</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <label className="text-yellow-600 text-xs block mb-1">部分時段</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customPercents.semiPeak}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setCustomPercents({ ...customPercents, semiPeak: val });
                          }}
                          className="w-full px-2 py-1 border border-yellow-200 rounded text-center font-bold"
                        />
                        <div className="text-gray-600 text-xs mt-1">%</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <label className="text-green-600 text-xs block mb-1">深夜凌晨</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customPercents.offPeak}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setCustomPercents({ ...customPercents, offPeak: val });
                          }}
                          className="w-full px-2 py-1 border border-green-200 rounded text-center font-bold"
                        />
                        <div className="text-gray-600 text-xs mt-1">%</div>
                      </div>
                    </div>
                    {customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak !== 100 && (
                      <div className="text-orange-600 text-xs font-medium">
                        ⚠️ 比例總和必須是 100%（目前：{customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak}%）
                      </div>
                    )}
                    {estimatedBreakdown && customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak === 100 && (
                      <div className="text-sm mt-2">
                        <div className="font-medium mb-2">預估度數：</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-red-100 rounded">
                            <div className="text-red-600 font-bold">{estimatedBreakdown.peakOnPeak} 度</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-100 rounded">
                            <div className="text-yellow-600 font-bold">{estimatedBreakdown.semiPeak} 度</div>
                          </div>
                          <div className="text-center p-2 bg-green-100 rounded">
                            <div className="text-green-600 font-bold">{estimatedBreakdown.offPeak} 度</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : estimatedBreakdown ? (
                  /* 預設模式的預估分配顯示 */
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
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>

      {/* 確認按鈕 */}
      <button
        onClick={handleConfirm}
        disabled={!estimatedBreakdown}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

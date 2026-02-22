import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { UsageEstimator } from '../../services/calculation/UsageEstimator';
import { EstimationMode } from '../../types';
import type { BillData } from '../../types';
import { Card, CardBody, Button, Input } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Info } from '../icons';

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

  // 判斷季節：夏季是6-9月，非夏季是10-5月
  const month = billData.billingPeriod.start.getMonth() + 1;
  const season = (month >= 6 && month <= 9) ? 'summer' : 'non_summer';
  const totalConsumption = billData.consumption.usage;
  const habits = UsageEstimator.getAllHabits();

  // 計算選中的習慣
  const getEstimatedBreakdown = (habit: typeof habits[0]) => {
    if (habit.mode === 'custom') {
      if (customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak !== 100) {
        return null;
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

  const percentSum = customPercents.peakOnPeak + customPercents.semiPeak + customPercents.offPeak;
  const isValidCustom = percentSum === 100;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h3 className="text-xl font-bold text-foreground">
          選擇最像你家的用電習慣
        </h3>
        <p className="text-default-500">
          你的電費單沒有時段用電資料，我們需要估算各時段的用電分配
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          season === 'summer' ? 'bg-danger-100 text-danger border border-danger-200' : 'bg-primary-100 text-primary border border-primary-200'
        }`}>
          {season === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
        </div>
      </motion.div>

      {/* 用電習慣選項 */}
      <div className="grid gap-4 md:grid-cols-2">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              isPressable
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                selectedHabit === habit.mode
                  ? 'border-2 border-primary bg-primary/50 shadow-md'
                  : 'border-2 border-divider hover:border-primary/50'
              }`}
              onPress={() => setSelectedHabit(habit.mode)}
            >
              <CardBody className="p-4">
                {/* Emoji + 標題 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{habit.emoji}</span>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{habit.description}</h4>
                    <p className="text-sm text-default-500">{habit.whoIsItFor}</p>
                  </div>
                </div>

                {/* 典型的一天 */}
                <Card className="bg-default-50 mb-3">
                  <CardBody className="p-3">
                    <p className="font-medium text-foreground text-sm mb-2">典型的一天：</p>
                    {selectedHabit === habit.mode ? (
                      <ul className="space-y-1">
                        {UsageEstimator.getTypicalDay(habit.mode).map((line, i) => (
                          <li key={i} className="text-sm text-default-500 flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-default-400">點選檢視說明</p>
                    )}
                  </CardBody>
                </Card>

                {/* 預估分配 */}
                {selectedHabit === habit.mode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {habit.mode === 'custom' ? (
                      /* 自訂比例輸入 */
                      <div className="space-y-3">
                        <p className="font-medium text-foreground text-sm">設定你的用電比例：</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            label="傍晚晚間"
                            labelPlacement="outside"
                            min="0"
                            max="100"
                            value={customPercents.peakOnPeak.toString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomPercents({ ...customPercents, peakOnPeak: Math.min(100, Math.max(0, val)) });
                            }}
                            classNames={{
                              input: 'text-center font-bold text-danger',
                              label: 'text-xs text-danger',
                            }}
                          />
                          <Input
                            type="number"
                            label="部分時段"
                            labelPlacement="outside"
                            min="0"
                            max="100"
                            value={customPercents.semiPeak.toString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomPercents({ ...customPercents, semiPeak: Math.min(100, Math.max(0, val)) });
                            }}
                            classNames={{
                              input: 'text-center font-bold text-warning',
                              label: 'text-xs text-warning',
                            }}
                          />
                          <Input
                            type="number"
                            label="深夜凌晨"
                            labelPlacement="outside"
                            min="0"
                            max="100"
                            value={customPercents.offPeak.toString()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomPercents({ ...customPercents, offPeak: Math.min(100, Math.max(0, val)) });
                            }}
                            classNames={{
                              input: 'text-center font-bold text-success',
                              label: 'text-xs text-success',
                            }}
                          />
                        </div>
                        {!isValidCustom && (
                          <div className="flex items-center gap-2 p-2 bg-warning-50 rounded-lg">
                            <Info size={16} className="text-warning flex-shrink-0" />
                            <p className="text-warning text-xs font-medium">
                              比例總和必須是 100%（目前：{percentSum}%）
                            </p>
                          </div>
                        )}
                        {isValidCustom && estimatedBreakdown && (
                          <div className="text-sm">
                            <p className="font-medium text-foreground mb-2">預估度數：</p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 bg-danger/10 rounded-lg">
                                <div className="text-danger font-bold">{estimatedBreakdown.peakOnPeak} 度</div>
                              </div>
                              <div className="text-center p-2 bg-warning/10 rounded-lg">
                                <div className="text-warning font-bold">{estimatedBreakdown.semiPeak} 度</div>
                              </div>
                              <div className="text-center p-2 bg-success/10 rounded-lg">
                                <div className="text-success font-bold">{estimatedBreakdown.offPeak} 度</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : estimatedBreakdown ? (
                      /* 預設模式的預估分配顯示 */
                      <div className="text-sm space-y-2">
                        <p className="font-medium text-foreground">預估分配：</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-danger/10 rounded-lg">
                            <div className="text-danger font-bold text-lg">{estimatedBreakdown.peakOnPeak}</div>
                            <div className="text-default-500 text-xs">度</div>
                            <div className="text-default-400 text-xs mt-1">傍晚晚間</div>
                          </div>
                          <div className="text-center p-2 bg-warning/10 rounded-lg">
                            <div className="text-warning font-bold text-lg">{estimatedBreakdown.semiPeak}</div>
                            <div className="text-default-500 text-xs">度</div>
                            <div className="text-default-400 text-xs mt-1">部分時段</div>
                          </div>
                          <div className="text-center p-2 bg-success/10 rounded-lg">
                            <div className="text-success font-bold text-lg">{estimatedBreakdown.offPeak}</div>
                            <div className="text-default-500 text-xs">度</div>
                            <div className="text-default-400 text-xs mt-1">深夜凌晨</div>
                          </div>
                        </div>

                        {/* 視覺化長條圖 */}
                        <div className="h-3 rounded-full overflow-hidden flex mt-3">
                          <motion.div
                            className="bg-danger-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(estimatedBreakdown.peakOnPeak / totalConsumption) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                          <motion.div
                            className="bg-warning-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(estimatedBreakdown.semiPeak / totalConsumption) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                          <motion.div
                            className="bg-success-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(estimatedBreakdown.offPeak / totalConsumption) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 確認按鈕 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleConfirm}
          isDisabled={!estimatedBreakdown}
          color="primary"
          size="lg"
          className="w-full"
        >
          使用此估算結果繼續
        </Button>
      </motion.div>

      {/* 免責宣告 */}
      <Card className="bg-warning-50 border-warning-200">
        <CardBody className="p-3">
          <p className="text-xs text-warning flex items-center gap-2">
            <Info size={14} />
            <span>這只是估算喔！實際電費會根據你真正的用電時間有所不同。</span>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

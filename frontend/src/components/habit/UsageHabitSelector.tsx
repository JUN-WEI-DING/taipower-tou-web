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
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h3 className="text-2xl font-bold text-foreground">
          選擇最像你家的用電習慣
        </h3>
        <p className="text-default-600 text-base">
          你的電費單沒有時段用電資料，我們需要估算各時段的用電分配
        </p>
        <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm ${
          season === 'summer' ? 'bg-danger-100 text-danger border-2 border-danger-200' : 'bg-energy-blue/10 text-energy-blue border-2 border-energy-blue/20'
        }`}>
          {season === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
        </div>
      </motion.div>

      {/* 用電習慣選項 */}
      <div className="grid gap-5 md:grid-cols-2">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card
              isPressable
              className={`transition-all duration-300 cursor-pointer ${
                selectedHabit === habit.mode
                  ? 'border-2 border-energy-blue shadow-energy bg-gradient-to-br from-energy-blue/5 to-transparent'
                  : 'border-2 border-divider hover:border-energy-blue/50 hover:shadow-md'
              }`}
              onPress={() => setSelectedHabit(habit.mode)}
            >
              <CardBody className="p-5">
                {/* Emoji + 標題 */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{habit.emoji}</span>
                  <div>
                    <h4 className="font-bold text-xl text-foreground">{habit.description}</h4>
                    <p className="text-sm text-default-500 mt-1">{habit.whoIsItFor}</p>
                  </div>
                </div>

                {/* 典型的一天 */}
                <Card className={`mb-4 ${selectedHabit === habit.mode ? 'bg-default-100' : 'bg-default-50'}`}>
                  <CardBody className="p-4">
                    <p className="font-semibold text-foreground text-sm mb-3">典型的一天：</p>
                    {selectedHabit === habit.mode ? (
                      <ul className="space-y-2">
                        {UsageEstimator.getTypicalDay(habit.mode).map((line, i) => (
                          <li key={i} className="text-sm text-default-600 flex items-start gap-2">
                            <span className="text-energy-blue mt-0.5 font-bold">•</span>
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
                      <div className="space-y-4">
                        <p className="font-semibold text-foreground">設定你的用電比例：</p>
                        <div className="grid grid-cols-3 gap-3">
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
                              input: 'text-center font-bold text-danger text-lg',
                              label: 'text-xs text-danger font-semibold',
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
                              input: 'text-center font-bold text-warning text-lg',
                              label: 'text-xs text-warning font-semibold',
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
                              input: 'text-center font-bold text-success text-lg',
                              label: 'text-xs text-success font-semibold',
                            }}
                          />
                        </div>
                        {!isValidCustom && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-warning-50 rounded-xl border border-warning-200"
                          >
                            <Info size={18} className="text-warning flex-shrink-0" />
                            <p className="text-warning text-sm font-semibold">
                              比例總和必須是 100%（目前：{percentSum}%）
                            </p>
                          </motion.div>
                        )}
                        {isValidCustom && estimatedBreakdown && (
                          <div className="text-sm">
                            <p className="font-semibold text-foreground mb-3">預估度數：</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 bg-danger/10 rounded-xl border border-danger/20">
                                <div className="text-danger font-bold text-lg">{estimatedBreakdown.peakOnPeak}</div>
                                <div className="text-default-500 text-xs mt-1">度</div>
                              </div>
                              <div className="text-center p-3 bg-warning/10 rounded-xl border border-warning/20">
                                <div className="text-warning font-bold text-lg">{estimatedBreakdown.semiPeak}</div>
                                <div className="text-default-500 text-xs mt-1">度</div>
                              </div>
                              <div className="text-center p-3 bg-success/10 rounded-xl border border-success/20">
                                <div className="text-success font-bold text-lg">{estimatedBreakdown.offPeak}</div>
                                <div className="text-default-500 text-xs mt-1">度</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : estimatedBreakdown ? (
                      /* 預設模式的預估分配顯示 */
                      <div className="text-sm space-y-3">
                        <p className="font-semibold text-foreground">預估分配：</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-4 bg-danger/5 rounded-xl border-2 border-danger/20 hover:border-danger/30 transition-colors">
                            <div className="text-danger font-bold text-xl">{estimatedBreakdown.peakOnPeak}</div>
                            <div className="text-default-500 text-xs mt-1">度</div>
                            <div className="text-default-400 text-xs mt-2">傍晚晚間</div>
                          </div>
                          <div className="text-center p-4 bg-warning/5 rounded-xl border-2 border-warning/20 hover:border-warning/30 transition-colors">
                            <div className="text-warning font-bold text-xl">{estimatedBreakdown.semiPeak}</div>
                            <div className="text-default-500 text-xs mt-1">度</div>
                            <div className="text-default-400 text-xs mt-2">部分時段</div>
                          </div>
                          <div className="text-center p-4 bg-success/5 rounded-xl border-2 border-success/20 hover:border-success/30 transition-colors">
                            <div className="text-success font-bold text-xl">{estimatedBreakdown.offPeak}</div>
                            <div className="text-default-500 text-xs mt-1">度</div>
                            <div className="text-default-400 text-xs mt-2">深夜凌晨</div>
                          </div>
                        </div>

                        {/* 視覺化長條圖 */}
                        <div className="h-4 rounded-full overflow-hidden flex shadow-sm mt-4">
                          <motion.div
                            className="bg-danger"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalConsumption > 0 ? (estimatedBreakdown.peakOnPeak / totalConsumption) * 100 : 0}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                          <motion.div
                            className="bg-warning"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalConsumption > 0 ? (estimatedBreakdown.semiPeak / totalConsumption) * 100 : 0}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                          <motion.div
                            className="bg-success"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalConsumption > 0 ? (estimatedBreakdown.offPeak / totalConsumption) * 100 : 0}%` }}
                            transition={{ duration: 0.6, delay: 0.3 }}
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
          className="h-14 text-base font-semibold shadow-energy hover:shadow-energy-lg transition-all"
        >
          使用此估算結果繼續
        </Button>
      </motion.div>

      {/* 免責宣告 */}
      <Card className="bg-gradient-subtle border border-default-200">
        <CardBody className="p-4">
          <p className="text-sm text-default-600 flex items-center gap-3">
            <Info size={20} className="text-warning flex-shrink-0" />
            <span>這只是估算喔！實際電費會根據你真正的用電時間有所不同。</span>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { UploadZone } from './components/upload/UploadZone';
import { ImagePreview } from './components/upload/ImagePreview';
import { OCRProgress } from './components/ocr/OCRProgress';
import { DataCompletenessBanner } from './components/data/DataCompletenessBanner';
import { UsageHabitSelector } from './components/habit/UsageHabitSelector';
import { BillDataEditor } from './components/confirm/BillDataEditor';
import { ManualInputForm } from './components/input/ManualInputForm';
import { PlanList } from './components/results/PlanList';
import { ResultChart } from './components/results/ResultChart';
import { PlansLoader } from './services/calculation/plans';
import { RateCalculator } from './services/calculation/RateCalculator';
import { DataCompletenessLevel } from './types';

/**
 * 主應用程式
 */
function App() {
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const stage = useAppStore((state) => state.stage);
  const uploadedImage = useAppStore((state) => state.uploadedImage);
  const billData = useAppStore((state) => state.billData);
  const results = useAppStore((state) => state.results);
  const estimationMode = useAppStore((state) => state.estimationMode);
  const setEstimationMode = useAppStore((state) => state.setEstimationMode);
  const setBillData = useAppStore((state) => state.setBillData);
  const setResults = useAppStore((state) => state.setResults);

  // 處理 OCR 識別完成後，進入確認階段
  const handleConfirmFromHabit = async (estimatedData?: { peakOnPeak: number; semiPeak: number; offPeak: number }) => {
    if (!billData) return;

    const setStage = useAppStore((state) => state.setStage);
    const setBillData = useAppStore((state) => state.setBillData);

    try {
      // 如果有估算資料，先更新 billData
      let updatedBillData = billData;
      if (estimatedData) {
        updatedBillData = {
          ...billData,
          consumption: {
            ...billData.consumption,
            peakOnPeak: estimatedData.peakOnPeak,
            semiPeak: estimatedData.semiPeak,
            offPeak: estimatedData.offPeak,
          },
          source: {
            ...billData.source,
            completenessLevel: DataCompletenessLevel.THREE_TIER,
            isEstimated: true,
          },
        };
        // 更新 store 中的 billData
        setBillData(updatedBillData);
      }

      // 載入費率資料
      const plans = await PlansLoader.getAll();

      // 建立計算引擎
      const calculator = new RateCalculator(plans);

      // 建立輸入 - 使用更新後的 billData
      const input = {
        consumption: updatedBillData.consumption.usage,
        billingPeriod: updatedBillData.billingPeriod,
        touConsumption: updatedBillData.consumption.peakOnPeak !== undefined
          ? {
              peakOnPeak: updatedBillData.consumption.peakOnPeak,
              semiPeak: updatedBillData.consumption.semiPeak || 0,
              offPeak: updatedBillData.consumption.offPeak || 0,
            }
          : undefined,
        voltageType: 'low_voltage' as const,
        phase: 'single' as const,
        estimationSettings: {
          mode: estimationMode,
          season: (updatedBillData.billingPeriod.start.getMonth() >= 5 &&
                 updatedBillData.billingPeriod.start.getMonth() <= 8
            ? 'summer'
            : 'non_summer') as 'summer' | 'non_summer',
        },
      };

      // 計算所有方案
      const calculatedResults = calculator.calculateAll(input);

      // 更新排名
      calculatedResults.forEach((result, index) => {
        result.comparison.rank = index + 1;
        result.comparison.difference = result.charges.total -
          (updatedBillData.currentPlan?.total || 0);
        result.comparison.savingPercentage = (result.comparison.difference /
          (updatedBillData.currentPlan?.total || 1)) * 100;

        // 標記當前方案
        // （這裡簡化處理，假設非時間電價是當前方案）
        if (result.planId.includes('non_tou') || result.planId === 'residential_non_tou') {
          result.comparison.isCurrentPlan = true;
        }
      });

      setResults(calculatedResults);
      setStage('result');
    } catch (error) {
      console.error('Error calculating plans:', error);
      setCalculationError('計算失敗，請重試');
    }
  };

  // 重置並回到上傳階段
  const handleReset = () => {
    useAppStore.getState().reset();
  };

  // 輸入模式狀態
  const [inputMode, setInputMode] = useState<'ocr' | 'manual'>('ocr');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        跳到主要內容
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            臺電時間電價比較
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            上傳電費單，找出最省錢的電價方案
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stage === 'upload' && (
          <div className="space-y-6">
            {/* Upload Stage */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                上傳你的電費單
              </h2>
              <p className="text-gray-600">
                選擇一種方式輸入您的用電資訊
              </p>
            </div>

            {/* 輸入方式選擇 */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setInputMode('ocr')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  inputMode === 'ocr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                📸 拍照上傳
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ⌨️ 手動輸入
              </button>
            </div>

            {/* OCR 上傳區域 */}
            {inputMode === 'ocr' && (
              <>
                <UploadZone />
                {uploadedImage && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      已上傳的圖片
                    </h3>
                    <ImagePreview />
                  </div>
                )}
                <OCRProgress />
              </>
            )}

            {/* 手動輸入區域 */}
            {inputMode === 'manual' && <ManualInputForm />}
          </div>
        )}

        {stage === 'confirm' && billData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              確認電費單資訊
            </h2>

            <DataCompletenessBanner billData={billData} />

            {/* 顯示已提取的資訊 - 使用可編輯的元件 */}
            <BillDataEditor
              billData={billData}
              onSave={(updatedData) => setBillData(updatedData)}
            />

            {/* 重新上傳按鈕 */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => useAppStore.getState().setStage('upload')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                重新上傳
              </button>
            </div>

            {/* 需要估算時顯示用電習慣選擇器 */}
            {billData.source.completenessLevel === 'total_only' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ 需要選擇用電習慣
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  時間電價方案需要知道您各時段的用電分配
                </p>
                <UsageHabitSelector
                  billData={billData}
                  onConfirm={handleConfirmFromHabit}
                />
                {calculationError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">⚠️ {calculationError}</p>
                    <button
                      onClick={() => setCalculationError(null)}
                      className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                      關閉
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {stage === 'result' && results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              方案比較結果
            </h2>

            {/* 圖表 */}
            <div className="bg-white rounded-lg shadow p-6">
              <ResultChart results={results} />
            </div>

            {/* 方案列表 */}
            <PlanList results={results} />

            {/* 重新計算 */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                🔄 比較其他電費單
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            臺電時間電價比較網站 | 純前端應用，資料不上傳伺服器
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

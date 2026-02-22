import { useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { UploadZone } from './components/upload/UploadZone';
import { ImagePreview } from './components/upload/ImagePreview';
import { OCRProgress } from './components/ocr/OCRProgress';
import { DataCompletenessBanner } from './components/data/DataCompletenessBanner';
import { UsageHabitSelector } from './components/habit/UsageHabitSelector';
import { BillDataEditor } from './components/confirm/BillDataEditor';
import { BillTypeInputForm } from './components/input';
import { PlanList } from './components/results/PlanList';
import { ResultChart } from './components/results/ResultChart';
import { ResultsSummary } from './components/results/ResultsSummary';
import { HeroSection } from './components/landing';
import { PlansLoader } from './services/calculation/plans';
import { RateCalculator } from './services/calculation/RateCalculator';
import { DataCompletenessLevel } from './types';
import type { CalculationInput } from './types';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Divider } from '@nextui-org/react';
import { Zap } from './components/icons';

/**
 * 判斷計費期間的季節
 * 臺電季節定義：夏季(6/1-9/30)、非夏季(10/1-5/31)
 */
function determineSeason(billingPeriod: { start: Date; end: Date }): 'summer' | 'non_summer' {
  const month = billingPeriod.start.getMonth() + 1; // 1-12
  // 夏季：6-9月
  return (month >= 6 && month <= 9) ? 'summer' : 'non_summer';
}

/**
 * 主應用程式
 */
function App() {
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const stage = useAppStore((state) => state.stage);
  const billType = useAppStore((state) => state.billType);
  const uploadedImage = useAppStore((state) => state.uploadedImage);
  const billData = useAppStore((state) => state.billData);
  const results = useAppStore((state) => state.results);
  const estimationMode = useAppStore((state) => state.estimationMode);
  const setBillData = useAppStore((state) => state.setBillData);
  const setResults = useAppStore((state) => state.setResults);
  const setStage = useAppStore((state) => state.setStage);
  const setBillType = useAppStore((state) => state.setBillType);

  // 處理 OCR 識別完成後，進入確認階段
  const handleConfirmFromHabit = async (estimatedData?: { peakOnPeak: number; semiPeak: number; offPeak: number }) => {
    if (!billData) return;

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
      const input: CalculationInput = {
        consumption: updatedBillData.consumption.usage,
        billingPeriod: updatedBillData.billingPeriod,
        touConsumption: updatedBillData.consumption.peakOnPeak !== undefined
          ? {
              peakOnPeak: updatedBillData.consumption.peakOnPeak,
              semiPeak: updatedBillData.consumption.semiPeak || 0,
              offPeak: updatedBillData.consumption.offPeak || 0,
            }
          : undefined,
        voltageType: 'low_voltage', // 住宅使用者都是低壓 (110V 或 220V)
        voltageV: updatedBillData.voltageType ? parseInt(updatedBillData.voltageType, 10) : 110,
        phase: (updatedBillData.phaseType === 'three' ? 'three' : 'single') as 'single' | 'three',
        contractCapacity: updatedBillData.contractCapacity,
        estimationSettings: {
          mode: estimationMode,
          season: determineSeason(updatedBillData.billingPeriod),
        },
      };

      // 計算所有方案
      const calculatedResults = calculator.calculateAll(input);

      // 找出當前方案作為 baseline
      // 優先使用 OCR 識別的方案名稱，如果沒有則使用預設邏輯
      let baselinePlan: typeof calculatedResults[0] | undefined;

      if (updatedBillData.currentPlan?.name) {
        // 使用電費單上識別的方案名稱來匹配
        const currentPlanName = updatedBillData.currentPlan.name;

        // 嘗試精確匹配方案名稱
        baselinePlan = calculatedResults.find(r => r.planName === currentPlanName);

        // 如果沒找到，嘗試模糊匹配（關鍵詞匹配）
        if (!baselinePlan) {
          baselinePlan = calculatedResults.find(r => {
            const resultName = r.planName.toLowerCase();
            const searchName = currentPlanName.toLowerCase();

            // 關鍵詞匹配：檢查是否包含重要的方案型別關鍵詞
            const bothHaveTwoTier = resultName.includes('二段式') && searchName.includes('二段式');
            const bothHaveThreeTier = resultName.includes('三段式') && searchName.includes('三段式');
            const bothHaveSimple = resultName.includes('簡易型') && searchName.includes('簡易型');
            const bothHaveStandard = resultName.includes('標準型') && searchName.includes('標準型');
            const bothHaveNonTOU = (resultName.includes('非時間電價') || resultName.includes('累進')) &&
                                  (searchName.includes('非時間電價') || searchName.includes('累進'));
            const bothHaveLowVoltage = resultName.includes('低壓電力') && searchName.includes('低壓電力');

            return bothHaveTwoTier || bothHaveThreeTier || bothHaveSimple ||
                   bothHaveStandard || bothHaveNonTOU || bothHaveLowVoltage;
          });
        }
      }

      // 如果沒有從 currentPlan 找到匹配，使用預設邏輯（非時間電價作為 baseline）
      if (!baselinePlan) {
        const knownBaselinePlanIds = [
          'residential_non_tou',           // 表燈(住商)非時間電價-住宅用
          'lighting_non_business_tiered', // 表燈(住商)非時間電價-住宅以外非營業用
          'low_voltage_power',            // 低壓電力非時間電價
        ];
        baselinePlan = calculatedResults.find(r => knownBaselinePlanIds.includes(r.planId));
      }

      // 標記當前方案並計算 baseline
      let actualBaselineTotal = 0;
      if (baselinePlan) {
        actualBaselineTotal = baselinePlan.charges.total;
        baselinePlan.comparison.isCurrentPlan = true;
      }

      // 更新排名和比較資訊
      calculatedResults.forEach((result, index) => {
        result.comparison.rank = index + 1;

        // 只有在找到 baseline 方案時才計算差異和百分比
        if (baselinePlan) {
          result.comparison.difference = result.charges.total - actualBaselineTotal;
          result.comparison.savingPercentage = actualBaselineTotal > 0
            ? ((result.charges.total - actualBaselineTotal) / actualBaselineTotal) * 100
            : 0;
        } else {
          // 沒有 baseline 方案時，不計算差異（避免錯誤標記）
          result.comparison.difference = 0;
          result.comparison.savingPercentage = 0;
        }
      });

      setResults(calculatedResults);
      setStage('result');
    } catch (error) {
      console.error('Error calculating plans:', error);
      let errorMessage = '計算失敗，請重試';

      if (error instanceof Error) {
        if (error.message.includes('Failed to load')) {
          errorMessage = '無法載入費率資料，請檢查網路連線';
        } else if (error.message.includes('Custom percentages')) {
          errorMessage = '自訂比例總和必須是 100%';
        } else if (error.message.includes('consumption')) {
          errorMessage = '用電度數無效，請重新輸入';
        } else {
          errorMessage = `計算錯誤：${error.message}`;
        }
      }

      setCalculationError(errorMessage);
    }
  };

  // 重置並回到上傳階段
  const handleReset = () => {
    useAppStore.getState().reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        跳到主要內容
      </a>

      {/* Header */}
      <Navbar maxWidth="xl" className="bg-background/70 backdrop-blur-md border-b border-divider" isBordered>
        <NavbarBrand>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center" aria-hidden="true">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                臺電時間電價比較
              </h1>
              <p className="text-xs text-foreground/70">
                上傳電費單，找出最省錢的電價方案
              </p>
            </div>
          </div>
        </NavbarBrand>
      </Navbar>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {stage === 'upload' && (
          <section aria-labelledby="upload-heading" className="space-y-6">
            {!billType ? (
              <HeroSection
                onOCRClick={() => setBillType('auto_detect')}
                onManualClick={() => setBillType('non_tou')}
              />
            ) : billType === 'auto_detect' ? (
              <>
                {/* OCR 上傳區域 */}
                <div className="text-center mb-4">
                  <Button
                    onClick={() => setBillType(null)}
                    variant="light"
                    color="default"
                    size="sm"
                    className="mb-4"
                  >
                    ← 返回選擇其他方式
                  </Button>
                  <h2 id="upload-heading" className="text-2xl font-bold text-foreground">
                    上傳電費單照片
                  </h2>
                  <p className="text-default-500 mt-1">
                    系統會自動識別電費單型別和用電資訊
                  </p>
                </div>
                <UploadZone />
                {uploadedImage && (
                  <div className="max-w-2xl mx-auto mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      已上傳的圖片
                    </h3>
                    <ImagePreview />
                  </div>
                )}
                <OCRProgress />
              </>
            ) : (
              <>
                {/* 手動輸入 - 根據電費單型別顯示對應表單 */}
                <div className="text-center mb-4">
                  <Button
                    onClick={() => setBillType(null)}
                    variant="light"
                    color="default"
                    size="sm"
                    className="mb-4"
                  >
                    ← 返回重新選擇型別
                  </Button>
                </div>
                <BillTypeInputForm billType={billType} />
              </>
            )}
          </section>
        )}

        {stage === 'confirm' && billData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
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
              <Button
                onClick={() => useAppStore.getState().setStage('upload')}
                color="default"
                variant="bordered"
              >
                重新上傳
              </Button>

              {/* 資料完整時可以直接計算 */}
              {billData.source.completenessLevel !== 'total_only' && (
                <Button
                  onClick={() => handleConfirmFromHabit()}
                  color="primary"
                >
                  開始計算
                </Button>
              )}
            </div>

            {/* 需要估算時顯示用電習慣選擇器 */}
            {billData.source.completenessLevel === 'total_only' && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <h3 className="font-semibold text-warning mb-2">
                  ⚠️ 需要選擇用電習慣
                </h3>
                <p className="text-sm text-warning-700 mb-4">
                  時間電價方案需要知道您各時段的用電分配
                </p>
                <UsageHabitSelector
                  billData={billData}
                  onConfirm={handleConfirmFromHabit}
                />
                {calculationError && (
                  <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-sm text-danger">⚠️ {calculationError}</p>
                    <Button
                      onClick={() => setCalculationError(null)}
                      size="sm"
                      variant="light"
                      color="danger"
                      className="mt-2"
                    >
                      關閉
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {stage === 'result' && results.length > 0 && (
          <section aria-labelledby="results-heading" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 id="results-heading" className="text-2xl font-bold text-foreground">
                方案比較結果
              </h2>
              {/* 季節指示器 */}
              {billData && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  determineSeason(billData.billingPeriod) === 'summer'
                    ? 'bg-danger-100 text-danger border border-danger-200'
                    : 'bg-primary-100 text-primary border border-primary-200'
                }`} role="status" aria-live="polite">
                  {determineSeason(billData.billingPeriod) === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
                </div>
              )}
            </div>

            {/* 結果摘要 */}
            <ResultsSummary results={results} />

            {/* 圖表 */}
            <div className="bg-content1 rounded-xl shadow-sm p-6 border border-divider" role="region" aria-label="方案比較圖表">
              <ResultChart results={results} />
            </div>

            <Divider className="my-4" />

            {/* 方案列表 */}
            <PlanList results={results} />

            {/* 重新計算 */}
            <div className="text-center pt-4">
              <Button
                onClick={handleReset}
                color="primary"
                size="lg"
              >
                🔄 比較其他電費單
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-default-100 border-t border-divider mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">關於本服務</h4>
              <p className="text-sm text-default-500">
                臺電時間電價比較工具幫助您找出最省錢的電價方案，根據臺灣電力公司最新費率計算。
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">功能特色</h4>
              <ul className="space-y-2 text-sm text-default-500">
                <li>• 支援 20+ 種電價方案比較</li>
                <li>• AI 智慧識別電費單</li>
                <li>• 純前端運算，資料安全</li>
              </ul>
            </div>

            {/* Privacy */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">隱私保護</h4>
              <p className="text-sm text-default-500">
                本服務為純前端應用，所有資料均在您的瀏覽器中處理，不會上傳到任何伺服器。
              </p>
            </div>
          </div>

          <Divider className="mb-6" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-default-400">
              © 2025 臺電時間電價比較網站 | 資料來源：臺灣電力公司
            </p>
            <div className="flex items-center gap-2 text-xs text-default-400">
              <Zap size={14} />
              <span>純前端應用，資料不上傳伺服器</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

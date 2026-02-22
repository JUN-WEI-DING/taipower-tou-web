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
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { StageTransition } from './components/ui/StageTransition';
import { PlansLoader } from './services/calculation/plans';
import { RateCalculator } from './services/calculation/RateCalculator';
import { DataCompletenessLevel } from './types';
import type { CalculationInput } from './types';
import { Button, Divider } from '@nextui-org/react';

/**
 * 判斷計費期間的季節
 * 臺電季節定義：夏季(6/1-9/30)、非夏季(10/1-5/31)
 * 如果計費期間的任何部分落在夏季月份，則視為夏季
 * 支援跨年度的計費期間
 */
function determineSeason(billingPeriod: { start: Date; end: Date }): 'summer' | 'non_summer' {
  const startDate = new Date(billingPeriod.start);
  const endDate = new Date(billingPeriod.end);

  // 檢查計費期間內的所有月份是否包含夏季月份 (6-9月)
  const current = new Date(startDate);

  while (current <= endDate) {
    const month = current.getMonth() + 1; // 1-12
    if (month >= 6 && month <= 9) {
      return 'summer'; // 發現夏季月份，立即返回
    }
    // 移到下個月
    current.setMonth(current.getMonth() + 1);
  }

  return 'non_summer';
}

/**
 * 主應用程式 - 橙色主題版本
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
        setBillData(updatedBillData);
      }

      const plans = await PlansLoader.getAll();
      const calculator = new RateCalculator(plans);

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
        voltageType: 'low_voltage',
        voltageV: updatedBillData.voltageType ? parseInt(updatedBillData.voltageType, 10) : 110,
        phase: (updatedBillData.phaseType === 'three' ? 'three' : 'single') as 'single' | 'three',
        contractCapacity: updatedBillData.contractCapacity,
        estimationSettings: {
          mode: estimationMode,
          season: determineSeason(updatedBillData.billingPeriod),
        },
      };

      const calculatedResults = calculator.calculateAll(input);

      let baselinePlan: typeof calculatedResults[0] | undefined;

      if (updatedBillData.currentPlan?.name) {
        const currentPlanName = updatedBillData.currentPlan.name;
        baselinePlan = calculatedResults.find(r => r.planName === currentPlanName);

        if (!baselinePlan) {
          baselinePlan = calculatedResults.find(r => {
            const resultName = r.planName.toLowerCase();
            const searchName = currentPlanName.toLowerCase();
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

      if (!baselinePlan) {
        const knownBaselinePlanIds = [
          'residential_non_tou',
          'lighting_non_business_tiered',
          'low_voltage_power',
        ];
        baselinePlan = calculatedResults.find(r => knownBaselinePlanIds.includes(r.planId));
      }

      let actualBaselineTotal = 0;
      if (baselinePlan) {
        actualBaselineTotal = baselinePlan.charges.total;
        baselinePlan.comparison.isCurrentPlan = true;
      }

      calculatedResults.forEach((result, index) => {
        result.comparison.rank = index + 1;

        if (baselinePlan) {
          result.comparison.difference = result.charges.total - actualBaselineTotal;
          result.comparison.savingPercentage = actualBaselineTotal > 0
            ? ((result.charges.total - actualBaselineTotal) / actualBaselineTotal) * 100
            : 0;
        } else {
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
        }
        // For security, don't expose internal error messages to users
        // Detailed errors are logged via console.error above
      }

      setCalculationError(errorMessage);
    }
  };

  // 重置並回到上傳階段
  const handleReset = () => {
    useAppStore.getState().reset();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-page">
      {/* Animated gradient backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl animate-float-diagonal-1" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-gradient-radial from-orange-300/15 to-transparent rounded-full blur-3xl animate-float-diagonal-2" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-radial from-amber-200/10 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern" />

      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        跳到主要內容
      </a>

      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1 relative z-10" role="main">

        <StageTransition key={stage} direction="forward">
          <div className="container py-8 md:py-12 relative z-10">
            {stage === 'upload' && (
              <>
                {!billType ? (
                  <HeroSection
                    onOCRClick={() => setBillType('auto_detect')}
                    onManualClick={() => setBillType('non_tou')}
                  />
                ) : billType === 'auto_detect' ? (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="card-orange relative backdrop-blur-sm rounded-3xl p-8 md:p-10">
                      {/* Decorative gradient glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                      <div className="relative">
                        <Button
                          onClick={() => setBillType(null)}
                          variant="light"
                          color="default"
                          size="sm"
                          className="mb-6 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          ← 返回選擇其他方式
                        </Button>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          上傳電費單照片
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          系統會自動識別電費單型別和用電資訊
                        </p>
                      </div>
                    </div>
                    <UploadZone />
                    {uploadedImage && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">
                          已上傳的圖片
                        </h3>
                        <ImagePreview />
                      </div>
                    )}
                    <OCRProgress />
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="card-orange relative backdrop-blur-sm rounded-3xl p-8 md:p-10">
                      {/* Decorative gradient glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                      <div className="relative">
                        <Button
                          onClick={() => setBillType(null)}
                          variant="light"
                          color="default"
                          size="sm"
                          className="mb-6 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          ← 返回重新選擇型別
                        </Button>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          手動輸入用電資訊
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          請填寫您的電費單資訊，系統會為您計算最適合的方案
                        </p>
                      </div>
                    </div>
                    <BillTypeInputForm billType={billType} />
                  </div>
                )}
              </>
            )}

            {stage === 'confirm' && billData && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="card-orange relative backdrop-blur-sm rounded-3xl p-8 md:p-10">
                {/* Decorative gradient glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative text-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                    確認電費單資訊
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    請確認以下資訊是否正確，可編輯修正後再進行計算
                  </p>
                </div>
              </div>

              <DataCompletenessBanner billData={billData} />

              <BillDataEditor
                billData={billData}
                onSave={(updatedData) => setBillData(updatedData)}
              />

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => useAppStore.getState().setStage('upload')}
                  color="default"
                  variant="bordered"
                  size="lg"
                >
                  重新上傳
                </Button>

                {billData.source.completenessLevel !== 'total_only' && (
                  <Button
                    onClick={() => handleConfirmFromHabit()}
                    color="primary"
                    size="lg"
                  >
                    開始計算方案
                  </Button>
                )}
              </div>

              {billData.source.completenessLevel === 'total_only' && (
                <div className="bg-muted border border-border rounded-lg p-6">
                  <h3 className="font-bold text-card-foreground mb-2 flex items-center gap-2">
                    ⚠️ 需要選擇用電習慣
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    時間電價方案需要知道您各時段的用電分配，請選擇最符合您用電習慣的選項
                  </p>
                  <UsageHabitSelector
                    billData={billData}
                    onConfirm={handleConfirmFromHabit}
                  />
                  {calculationError && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">⚠️ {calculationError}</p>
                      <Button
                        onClick={() => setCalculationError(null)}
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="mt-3"
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
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="card-orange relative backdrop-blur-sm rounded-3xl p-6 md:p-8">
                {/* Decorative gradient glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-radial from-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                      方案比較結果
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      依電費由低到高排序
                    </p>
                  </div>
                {billData && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    determineSeason(billData.billingPeriod) === 'summer'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`} role="status" aria-live="polite">
                    {determineSeason(billData.billingPeriod) === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
                  </div>
                )}
                </div>
              </div>

              <ResultsSummary results={results} />

              <div className="bg-gradient-to-br from-card to-orange-50/30 dark:to-orange-950/20 border border-border/50 rounded-xl p-6 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/15 transition-shadow">
                <ResultChart results={results} />
              </div>

              <Divider className="my-8 border-orange-200/50 dark:border-orange-700/50" />

              <PlanList results={results} />

              <div className="text-center pt-8">
                <Button
                  onClick={handleReset}
                  color="primary"
                  size="lg"
                  className="h-14 px-8 font-semibold"
                >
                  🔄 比較其他電費單
                </Button>
              </div>
            </div>
          )}
          </div>
        </StageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

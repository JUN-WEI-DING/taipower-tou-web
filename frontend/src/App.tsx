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
import { Button, Divider } from '@nextui-org/react';
import { Zap } from './components/icons';

/**
 * 判斷計費期間的季節
 * 臺電季節定義：夏季(6/1-9/30)、非夏季(10/1-5/31)
 */
function determineSeason(billingPeriod: { start: Date; end: Date }): 'summer' | 'non_summer' {
  const month = billingPeriod.start.getMonth() + 1; // 1-12
  return (month >= 6 && month <= 9) ? 'summer' : 'non_summer';
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        跳到主要內容
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="container">
          <nav className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Zap size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-card-foreground leading-tight">
                  臺電時間電價比較
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  找出最省錢的電價方案
                </p>
              </div>
            </a>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 py-8 md:py-12" role="main">
        <div className="container">
          {stage === 'upload' && (
            <div className="animate-fade-in">
              {!billType ? (
                <HeroSection
                  onOCRClick={() => setBillType('auto_detect')}
                  onManualClick={() => setBillType('non_tou')}
                />
              ) : billType === 'auto_detect' ? (
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center">
                    <Button
                      onClick={() => setBillType(null)}
                      variant="light"
                      color="default"
                      size="sm"
                      className="mb-6"
                    >
                      ← 返回選擇其他方式
                    </Button>
                    <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-3">
                      上傳電費單照片
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      系統會自動識別電費單型別和用電資訊
                    </p>
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
                  <div className="text-center">
                    <Button
                      onClick={() => setBillType(null)}
                      variant="light"
                      color="default"
                      size="sm"
                      className="mb-6"
                    >
                      ← 返回重新選擇型別
                    </Button>
                  </div>
                  <BillTypeInputForm billType={billType} />
                </div>
              )}
            </div>
          )}

          {stage === 'confirm' && billData && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-card-foreground">
                  確認電費單資訊
                </h2>
                <p className="text-lg text-muted-foreground">
                  請確認以下資訊是否正確，可編輯修正後再進行計算
                </p>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-card-foreground">
                    方案比較結果
                  </h2>
                  <p className="text-lg text-muted-foreground mt-1">
                    依電費由低到高排序
                  </p>
                </div>
                {billData && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    determineSeason(billData.billingPeriod) === 'summer'
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`} role="status" aria-live="polite">
                    {determineSeason(billData.billingPeriod) === 'summer' ? '🌞 夏季費率 (6-9月)' : '❄️ 非夏季費率 (10-5月)'}
                  </div>
                )}
              </div>

              <ResultsSummary results={results} />

              <div className="bg-card border border-border rounded-lg p-6">
                <ResultChart results={results} />
              </div>

              <Divider className="my-6" />

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
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-auto">
        <div className="container py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Zap size={20} className="text-primary-foreground" />
                </div>
                <h4 className="font-bold text-card-foreground">臺電時間電價比較</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                幫助您找出最省錢的電價方案，根據臺灣電力公司最新費率計算。
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">功能特色</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  支援 20+ 種電價方案比較
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  AI 智慧識別電費單
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  純前端運算，資料安全
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">隱私保護</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                本服務為純前端應用，所有資料均在您的瀏覽器中處理，不會上傳到任何伺服器。
              </p>
            </div>
          </div>

          <Divider className="bg-border/50" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 臺電時間電價比較網站 | 資料來源：臺灣電力公司
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border">
              <Zap size={16} className="text-primary" />
              <span>純前端應用，資料不上傳伺服器</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

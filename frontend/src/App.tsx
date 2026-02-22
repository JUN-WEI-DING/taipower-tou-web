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
import { StageTransition } from './components/ui/StageTransition';
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

      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main">
        <StageTransition key={stage} direction="forward">
          <div className="container py-8 md:py-12">
            {stage === 'upload' && (
              <>
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
              </>
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
        </StageTransition>
      </main>

      {/* Footer - Enhanced */}
      <footer className="relative bg-gradient-to-b from-muted to-background border-t border-border/50 mt-auto overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Gradient glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl pointer-events-none" />

        <div className="container relative py-16">
          {/* Main footer content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-card-foreground">臺電時間電價比較</h4>
                  <p className="text-xs text-muted-foreground">智慧省電，從這裡開始</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                幫助您找出最省錢的電價方案，根據臺灣電力公司最新費率計算。
                平均每月可節省 <span className="text-primary font-semibold">10-20%</span> 電費。
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { name: 'GitHub', url: 'https://github.com/JUN-WEI-DING/taipower-tou-web' },
                  { name: 'Email', url: 'mailto:contact@example.com' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <Zap size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Features column */}
            <div>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                功能特色
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: '⚡', text: '支援 20+ 種電價方案比較', highlight: '20+' },
                  { icon: '🤖', text: 'AI 智慧識別電費單', highlight: 'AI' },
                  { icon: '🔒', text: '純前端運算，資料安全', highlight: '安全' },
                  { icon: '⚡', text: '秒級快速分析', highlight: '秒級' },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <span>
                      {item.text.split(item.highlight).map((part, i) =>
                        i === 0 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <span key={i}>
                            <span className="font-semibold text-primary">{item.highlight}</span>
                            {item.text.slice(item.text.indexOf(item.highlight) + item.highlight.length)}
                          </span>
                        )
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy & Resources column */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                  隱私保護
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  本服務為純前端應用，所有資料均在您的瀏覽器中處理，不會上傳到任何伺服器。
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <Zap size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">資料完全本地處理</span>
                </div>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="font-bold mb-3">快速連結</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { name: '使用說明', href: '#' },
                    { name: '常見問題', href: '#' },
                    { name: '費率資料來源', href: '#' },
                    { name: '隱私權政策', href: '#' },
                  ].map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.name}
                        <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <Divider className="bg-border/50 mb-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 臺電時間電價比較網站</p>
              <span className="hidden sm:inline text-border">|</span>
              <p>資料來源：臺灣電力公司</p>
            </div>

            {/* Version & badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm text-muted-foreground shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                </span>
                <span>系統正常運作</span>
              </div>
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary">
                v2.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

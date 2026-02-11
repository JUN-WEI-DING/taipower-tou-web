/* Main App component */

import { useState, useEffect } from "react";
import { PlanSelector } from "./components/plans/PlanSelector";
import { CSVUploader } from "./components/usage/CSVUploader";
import { BillingInputsForm } from "./components/forms/BillingInputsForm";
import { CostBreakdown } from "./components/results/CostBreakdown";
import { useCalculation } from "./hooks/useCalculation";
import { usePlans } from "./hooks/usePlans";
import type { BillingInputs, PlanCategory, UsageData } from "./api/types";
import { useCalculationStore } from "./store/calculationStore";

function App() {
  // Initialize plans
  const { residentialPlans, lowVoltagePlans } = usePlans();

  // Local state
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [billingInputs, setBillingInputs] = useState<BillingInputs>({
    meter_phase: "single",
    meter_voltage_v: 110,
    meter_ampere: 10,
    billing_cycle_type: "monthly",
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>("lighting");
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const plansError = useCalculationStore((state) => state.error);

  const { calculate, isLoading } = useCalculation();

  // Set default plan when plans load
  useEffect(() => {
    if (residentialPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(residentialPlans[0].id);
    }
  }, [residentialPlans, selectedPlanId]);

  const handleCategoryChange = (category: PlanCategory) => {
    setSelectedCategory(category);
    // Select first plan in new category
    const categoryPlans =
      category === "lighting" ? residentialPlans : lowVoltagePlans;
    if (categoryPlans.length > 0) {
      setSelectedPlanId(categoryPlans[0].id);
    }
  };

  const handleCalculate = async () => {
    if (!selectedPlanId || !usageData || !usageData.data || usageData.data.length === 0) {
      setError("請選擇方案並上傳用電資料");
      return;
    }

    setError(null);

    const request = {
      plan_id: selectedPlanId,
      usage: usageData,
      inputs: billingInputs,
    };

    try {
      const result = await calculate(request);
      setCalculationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "計算失敗");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            台灣時間電價計算器
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            比較不同電價方案，找出最適合您的選擇
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Category Tabs */}
            <div>
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => handleCategoryChange("lighting")}
                    className={`${
                      selectedCategory === "lighting"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    住宅用電
                  </button>
                  <button
                    onClick={() => handleCategoryChange("low_voltage")}
                    className={`${
                      selectedCategory === "low_voltage"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    低壓電力
                  </button>
                </nav>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <PlanSelector
                selectedPlanId={selectedPlanId}
                onPlanChange={setSelectedPlanId}
                category={selectedCategory}
              />
            </div>

            {/* Billing Inputs */}
            <div className="bg-white rounded-lg shadow p-6">
              <BillingInputsForm
                category={selectedCategory}
                inputs={billingInputs}
                onInputsChange={setBillingInputs}
              />
            </div>

            {/* CSV Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">上傳用電資料</h3>
              <CSVUploader
                onDataLoaded={setUsageData}
                onError={setError}
              />
              {usageData && usageData.data && usageData.data.length > 0 && (
                <p className="mt-4 text-sm text-green-600">
                  ✓ 已載入 {usageData.data.length} 筆用電資料 (頻率: {usageData.freq === "15min" ? "15分鐘" : usageData.freq === "1h" ? "1小時" : "1天"})
                </p>
              )}
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isLoading || !selectedPlanId || !usageData || !usageData.data || usageData.data.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isLoading || !selectedPlanId || !usageData || !usageData.data || usageData.data.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "計算中..." : "開始計算"}
            </button>

            {/* Error Display */}
            {(error || plansError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error || plansError}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            {calculationResult ? (
              <div className="bg-white rounded-lg shadow p-6">
                <CostBreakdown result={calculationResult} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500">
                  選擇方案並上傳用電資料後，計算結果將顯示在此處
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            台灣時間電價計算器 | 資料來源：台灣電力公司
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

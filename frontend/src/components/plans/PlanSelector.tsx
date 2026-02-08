/* Plan selector component */

import { useCalculationStore } from "../../store/calculationStore";
import type { PlanCategory } from "../../api/types";

interface PlanSelectorProps {
  selectedPlanId: string | null;
  onPlanChange: (planId: string) => void;
  category?: PlanCategory;
}

export function PlanSelector({
  selectedPlanId,
  onPlanChange,
  category,
}: PlanSelectorProps) {
  const { plans } = useCalculationStore();

  // Filter plans by category if specified
  const filteredPlans = category
    ? plans.filter((p) => p.category === category)
    : plans;

  // Group plans by category
  const lightingPlans = plans.filter((p) => p.category === "lighting");
  const lowVoltagePlans = plans.filter((p) => p.category === "low_voltage");

  return (
    <div className="plan-selector">
      <label htmlFor="plan-select" className="block text-sm font-medium mb-2">
        選擇電價方案
      </label>
      <select
        id="plan-select"
        value={selectedPlanId || ""}
        onChange={(e) => onPlanChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- 請選擇方案 --</option>

        {lightingPlans.length > 0 && (
          <optgroup label="住宅用电 (表燈)">
            {lightingPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
                {plan.rate_structure === "tou" ? " (時間電價)" : " (分段電價)"}
              </option>
            ))}
          </optgroup>
        )}

        {lowVoltagePlans.length > 0 && (
          <optgroup label="低壓電力">
            {lowVoltagePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
                {plan.rate_structure === "tou" ? " (時間電價)" : " (非時間)"}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {selectedPlanId && (
        <p className="mt-2 text-sm text-gray-600">
          已選擇：{" "}
          {filteredPlans.find((p) => p.id === selectedPlanId)?.name ||
            selectedPlanId}
        </p>
      )}
    </div>
  );
}

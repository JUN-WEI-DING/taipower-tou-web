/* Zustand store for calculation state */

import { create } from "zustand";
import type {
  PlanSummary,
  CalculationResponse,
  ComparisonResponse,
  UsageData,
  BillingInputs,
} from "../api/types";

interface CalculationState {
  // Current state
  selectedPlanId: string | null;
  usageData: UsageData | null;
  billingInputs: BillingInputs | null;
  calculationResult: CalculationResponse | null;
  comparisonResult: ComparisonResponse | null;

  // UI state
  isCalculating: boolean;
  isComparing: boolean;
  error: string | null;

  // Plans cache
  plans: PlanSummary[];

  // Actions
  setSelectedPlanId: (planId: string | null) => void;
  setUsageData: (data: UsageData | null) => void;
  setBillingInputs: (inputs: BillingInputs | null) => void;
  setPlans: (plans: PlanSummary[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCalculationStore = create<CalculationState>((set) => ({
  // Initial state
  selectedPlanId: null,
  usageData: null,
  billingInputs: null,
  calculationResult: null,
  comparisonResult: null,
  isCalculating: false,
  isComparing: false,
  error: null,
  plans: [],

  // Actions
  setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),

  setUsageData: (data) => set({ usageData: data }),

  setBillingInputs: (inputs) => set({ billingInputs: inputs }),

  setPlans: (plans) => set({ plans }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      selectedPlanId: null,
      usageData: null,
      billingInputs: null,
      calculationResult: null,
      comparisonResult: null,
      isCalculating: false,
      isComparing: false,
      error: null,
    }),
}));

/* Hook for fetching and managing plans */

import { useEffect } from "react";
import { plansApi } from "../api/client";
import type { PlanCategory } from "../api/types";
import { useCalculationStore } from "../store/calculationStore";

interface UsePlansOptions {
  category?: PlanCategory;
  enabled?: boolean;
}

export function usePlans(options: UsePlansOptions = {}) {
  const { category, enabled = true } = options;
  const { plans, setPlans, setError } = useCalculationStore();

  useEffect(() => {
    if (!enabled) return;

    const fetchPlans = async () => {
      try {
        const allPlans = await plansApi.list();

        let filteredPlans = allPlans;
        if (category) {
          filteredPlans = allPlans.filter((p) => p.category === category);
        }

        // For MVP, only show residential and low_voltage plans
        const mvpPlans = filteredPlans.filter(
          (p) => p.category === "lighting" || p.category === "low_voltage"
        );

        setPlans(mvpPlans);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPlans([]);
        setError("無法載入電價方案，請檢查後端連線");
      }
    };

    fetchPlans();
  }, [category, enabled, setPlans, setError]);

  return {
    plans,
    residentialPlans: plans.filter((p) => p.category === "lighting"),
    lowVoltagePlans: plans.filter((p) => p.category === "low_voltage"),
  };
}

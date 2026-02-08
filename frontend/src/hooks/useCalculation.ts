/* Hook for performing calculations */

import { useState } from "react";
import { calculationsApi, getErrorMessage } from "../api/client";
import type { CalculateRequest, CompareRequest } from "../api/types";

export function useCalculation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (request: CalculateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await calculationsApi.calculate(request);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const compare = async (request: CompareRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await calculationsApi.compare(request);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calculate,
    compare,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

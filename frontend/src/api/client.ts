/* API client for communicating with FastAPI backend */

import axios, { AxiosError } from "axios";
import type {
  CalculationResponse,
  CalculateRequest,
  CompareRequest,
  ComparisonResponse,
  PlanDetails,
  PlanSummary,
  CSVParseResult,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Plans API
export const plansApi = {
  list: async (): Promise<PlanSummary[]> => {
    const response = await api.get<{ plans: PlanSummary[] }>("/api/v1/plans");
    return response.data.plans;
  },

  getDetails: async (planId: string): Promise<PlanDetails> => {
    const response = await api.get<PlanDetails>(`/api/v1/plans/${planId}`);
    return response.data;
  },

  getRequirements: async (planId: string) => {
    const response = await api.get(`/api/v1/plans/${planId}/requirements`);
    return response.data;
  },
};

// Calculations API
export const calculationsApi = {
  calculate: async (request: CalculateRequest): Promise<CalculationResponse> => {
    const response = await api.post<CalculationResponse>(
      "/api/v1/calculate/simple",
      request
    );
    return response.data;
  },

  compare: async (request: CompareRequest): Promise<ComparisonResponse> => {
    const response = await api.post<ComparisonResponse>(
      "/api/v1/calculate/compare",
      request
    );
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadCSV: async (file: File): Promise<CSVParseResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<CSVParseResult>(
      "/api/v1/upload/csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  validateCSV: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/v1/upload/validate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

// Error handling helper
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    return axiosError.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

export default api;

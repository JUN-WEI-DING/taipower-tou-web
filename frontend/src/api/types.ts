/* API types matching backend Pydantic models */

export type PeriodType = "peak" | "off_peak" | "semi_peak" | "sunday_holiday";
export type SeasonType = "summer" | "non_summer";
export type BillingCycleType = "monthly" | "odd_month" | "even_month";
export type PlanCategory = "lighting" | "low_voltage" | "high_voltage" | "extra_high_voltage";
export type RateStructure = "tou" | "tiered";
export type TimeFreq = "15min" | "1h" | "1D";
export type DataFormat = "list" | "dict" | "csv";

// Plan types
export interface PlanSummary {
  id: string;
  name: string;
  category: PlanCategory;
  rate_structure: RateStructure;
  requires_contract_capacity: boolean;
  requires_meter_spec: boolean;
}

export interface PlanRequirements {
  plan_id: string;
  requires_contract_capacity: boolean;
  requires_meter_spec: boolean;
  valid_basic_fee_labels: string[];
  uses_basic_fee_formula: boolean;
  formula_type: string | null;
}

export interface PlanDetails {
  id: string;
  name: string;
  category: PlanCategory;
  rate_structure: RateStructure;
  requirements: PlanRequirements;
  description: string | null;
}

// Usage data types
export interface UsageData {
  format: DataFormat;
  data: number[] | Record<string, number> | null;
  start: string | null;
  freq: TimeFreq;
}

// Billing inputs
export interface BillingInputs {
  meter_phase?: string | null;
  meter_voltage_v?: number | null;
  meter_ampere?: number | null;
  contract_capacity_kw?: number | null;
  contract_capacities?: Record<string, number> | null;
  power_factor?: number | null;
  demand_kw?: number[] | null;
  billing_cycle_type?: BillingCycleType;
}

// Calculation results
export interface PeriodCostBreakdown {
  period: string;
  usage_kwh: number;
  cost: number;
}

export interface MonthlyBreakdown {
  month: string;
  season: SeasonType;
  usage_kwh: number;
  energy_cost: number;
  by_period: PeriodCostBreakdown[];
}

export interface CalculationSummary {
  total_cost: number;
  total_usage_kwh: number;
  average_rate: number;
  period_start: string | null;
  period_end: string | null;
}

export interface CalculationResponse {
  request_id: string;
  plan: PlanSummary;
  summary: CalculationSummary;
  monthly_breakdown: MonthlyBreakdown[];
}

// Comparison types
export interface FailedPlan {
  plan_id: string;
  error_type: string;
  error_message: string;
}

export interface PlanComparisonResult {
  plan_id: string;
  name: string;
  total_cost: number;
  total_usage_kwh: number;
  average_rate: number;
  rank: number;
}

export interface ComparisonResponse {
  comparison: PlanComparisonResult[];
  cheapest_plan_id: string;
  savings_vs_most_expensive: number;
  failed_plans: FailedPlan[];
}

// API request types
export interface CalculateRequest {
  plan_id: string;
  usage: UsageData;
  inputs?: BillingInputs;
}

export interface CompareRequest {
  plan_ids: string[];
  usage: UsageData;
  shared_inputs?: BillingInputs;
}

// API error type
export interface APIError {
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

// CSV upload types
export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview: {
    columns: string[];
    rows: Record<string, unknown>[];
  } | null;
}

export interface CSVParseResult {
  file_id: string;
  original_filename: string;
  parsed: {
    data: number[];
    start: string;
    freq: TimeFreq;
    record_count: number;
    date_range: {
      start: string;
      end: string;
    };
    statistics: {
      total_usage_kwh: number;
      average_hourly: number;
      peak_hourly: number;
    };
  };
  validation: CSVValidationResult;
}

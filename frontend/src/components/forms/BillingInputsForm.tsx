/* Billing inputs form component */

import type { BillingInputs, PlanCategory } from "../../api/types";

interface BillingInputsFormProps {
  category: PlanCategory;
  inputs: BillingInputs;
  onInputsChange: (inputs: BillingInputs) => void;
}

export function BillingInputsForm({
  category,
  inputs,
  onInputsChange,
}: BillingInputsFormProps) {
  const updateField = <K extends keyof BillingInputs>(
    field: K,
    value: BillingInputs[K]
  ) => {
    onInputsChange({ ...inputs, [field]: value });
  };

  return (
    <div className="billing-inputs-form space-y-4">
      <h3 className="text-lg font-semibold">計費設定</h3>

      {/* Meter Specification for residential plans */}
      {(category === "lighting" || !inputs.contract_capacity_kw) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">電力種類</label>
            <select
              value={inputs.meter_phase || "single"}
              onChange={(e) => updateField("meter_phase", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">單相</option>
              <option value="three">三相</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">電壓 (V)</label>
            <select
              value={inputs.meter_voltage_v || 110}
              onChange={(e) => updateField("meter_voltage_v", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={110}>110V</option>
              <option value={220}>220V</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">安培數 (A)</label>
            <select
              value={inputs.meter_ampere || 10}
              onChange={(e) => updateField("meter_ampere", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10A</option>
              <option value={15}>15A</option>
              <option value={20}>20A</option>
              <option value={30}>30A</option>
              <option value={40}>40A</option>
              <option value={50}>50A</option>
              <option value={60}>60A</option>
            </select>
          </div>
        </div>
      )}

      {/* Contract capacity for low voltage plans */}
      {category === "low_voltage" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            契約容量 (kW)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputs.contract_capacity_kw || ""}
            onChange={(e) =>
              updateField(
                "contract_capacity_kw",
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            placeholder="例如：10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Billing cycle type */}
      <div>
        <label className="block text-sm font-medium mb-1">結算週期</label>
        <select
          value={inputs.billing_cycle_type || "monthly"}
          onChange={(e) => updateField("billing_cycle_type", e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">每月</option>
          <option value="odd_month">單月 (雙月結算)</option>
          <option value="even_month">雙月 (雙月結算)</option>
        </select>
      </div>
    </div>
  );
}

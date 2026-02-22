### Findings

1. **Low – Breakdown label is now potentially inaccurate for non-2000 thresholds**  
   - **File:** `frontend/src/services/calculation/RateCalculator.ts:400`, `frontend/src/services/calculation/RateCalculator.ts:570`  
   - Logic correctly switched to `surchargeRule.threshold_kwh`, but label is still hardcoded as `超過2000度附加費`.  
   - If a plan defines a different threshold, UI/reporting text will be misleading.
   - **Suggestion:** Build the label from the rule, e.g. `` `超過${surchargeRule.threshold_kwh}度附加費` ``.

2. **Low – Missing defensive validation on surcharge rule numeric fields**  
   - **File:** `frontend/src/services/calculation/RateCalculator.ts:379-381`, `frontend/src/services/calculation/RateCalculator.ts:550-552`  
   - Calculation assumes `threshold_kwh` and `cost_per_kwh` are finite numbers. If malformed plan data slips in (e.g. `null`, string, `NaN`), surcharge can silently become incorrect.
   - **Suggestion:** Add a finite-number guard before arithmetic (or validate/normalize in `PlansLoader`).

### Notes

- The core fix (`plan.billingRules` access + threshold-based surcharge) looks correct and removes the prior camelCase/snake_case access bug.
- No direct security issues observed in these changes.

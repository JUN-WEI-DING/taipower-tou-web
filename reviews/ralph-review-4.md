### Findings

1. **Medium: Surcharge rule precedence can silently override valid `billing_rules` data**
   - **Where:** `frontend/src/services/calculation/plans.ts:269`
   - **Issue:** `raw.over_2000_kwh_surcharge` currently overwrites `billing_rules.over_2000_kwh_surcharge` unconditionally.  
     If both are present and differ, the `billing_rules` threshold/cost is ignored. If top-level value is malformed (`null`), it can also replace a valid nested rule and effectively disable surcharge.
   - **Suggestion:** Treat `billing_rules.over_2000_kwh_surcharge` as primary source; only backfill from top-level when nested rule is absent. Add numeric validation before writing merged rule.

2. **Low: Validation checks finiteness but not value range**
   - **Where:** `frontend/src/services/calculation/RateCalculator.ts:379`, `frontend/src/services/calculation/RateCalculator.ts:553`
   - **Issue:** `Number.isFinite(...)` allows negative values. A negative `cost_per_kwh` would reduce total bill (negative surcharge), and negative threshold creates unexpected overage math.
   - **Suggestion:** Add bounds checks (`threshold_kwh >= 0`, `cost_per_kwh >= 0`) before applying surcharge; otherwise skip rule and optionally log a warning.

### Missing Edge-Case Tests

- Add tests for surcharge rule normalization in `PlansLoader`:
  - both top-level and nested rules present (precedence behavior),
  - malformed top-level value with valid nested fallback.
- Add tests for `RateCalculator` 2-tier and 3-tier paths with invalid surcharge values (negative/NaN/null) to confirm surcharge is ignored safely.

### Security

- No direct security issue found in these changes.

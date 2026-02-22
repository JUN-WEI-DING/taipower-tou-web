## Findings

1. **High – Tooling is now picking up an unintended nested app and breaking quality gates.**  
`frontend/frontend/my-app` appears to be an accidentally scaffolded Next.js app inside the Vite app. `npm --prefix frontend run lint` and `npm --prefix frontend run test -- --run` are both polluted by files under this folder (including generated/dependency tests).  
References: `frontend/frontend/my-app/app/layout.tsx:15`, `frontend/eslint.config.js:9`, `frontend/vite.config.ts:68`  
Action: remove `frontend/frontend/my-app` from this repo, or fully isolate it (separate workspace + explicit excludes like `**/node_modules/**`, `**/.next/**`, `frontend/my-app/**` in lint/test config).

2. **High – Current lint is failing in app code from this iteration.**  
At minimum, there are unresolved lint errors in touched code.  
References: `frontend/src/App.tsx:18`, `frontend/src/components/data/DataCompletenessBanner.tsx:82`  
Action: remove unused imports and replace `as any` with a proper union type for `Chip` color.

3. **Medium – Date editing can shift by one day due to UTC conversion.**  
Using `toISOString().split('T')[0]` for a local date input can render the previous/next day depending on timezone.  
Reference: `frontend/src/components/confirm/BillDataEditor.tsx:120`  
Action: format the date in local time (not UTC) before binding to `<input type="date">`.

4. **Medium – Division-by-zero / NaN edge cases in UI calculations.**  
If usage or baseline total is `0`, percentages and width styles can become `NaN`/`Infinity`.  
References: `frontend/src/components/habit/UsageHabitSelector.tsx:273`, `frontend/src/components/results/ResultsSummary.tsx:19`  
Action: guard denominators (`> 0`) and provide fallback values (`0%`, width `0%`).

5. **Medium – File picker targeting is fragile and can hit the wrong input.**  
Global `document.querySelector(...)` is used for file inputs; this can select unrelated inputs when multiple exist.  
References: `frontend/src/components/upload/UploadZone.tsx:139`, `frontend/src/components/upload/UploadZone.tsx:281`  
Action: use `useRef<HTMLInputElement>()` per input and click the ref directly.

6. **Medium – No enforced file-size/type validation before OCR processing.**  
UI text says “<10MB”, but logic does not enforce it before processing; this risks large-memory uploads and poor UX.  
Reference: `frontend/src/components/upload/UploadZone.tsx:117`  
Action: validate `file.type` and `file.size` in `handleDrop`/`handleFileSelect` before `processImage`.

7. **Low – Dynamic Tailwind class likely won’t be statically detected.**  
`border-${borderColor}` is runtime-composed and may not generate CSS in Tailwind build.  
Reference: `frontend/src/components/data/DataCompletenessBanner.tsx:66`  
Action: map to full literal class strings (e.g., `'border-success/200'`) instead of string concatenation.

8. **Low – Review artifact file contains session metadata and should not be committed.**  
`reviews/ralph-review-1.md.err` includes tool/session internals.  
Reference: `reviews/ralph-review-1.md.err:1`  
Action: remove the file or add a rule to ignore `reviews/*.err`.

## Open Question

1. Is `frontend/frontend/my-app` intentional as a second frontend target, or accidental scaffolding? The answer changes whether we should delete it or isolate it with workspace-level boundaries.

## Verification Notes

- `npm --prefix frontend run lint` fails.
- `npm --prefix frontend run build` passes.
- `npm --prefix frontend run test -- --run` fails due tests discovered under nested `frontend/frontend/my-app/node_modules`.

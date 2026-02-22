### Findings

1. **Medium – Invalid date state when date input is cleared**
   - **File:** `frontend/src/components/confirm/BillDataEditor.tsx:38`, `frontend/src/components/confirm/BillDataEditor.tsx:136`
   - `parseDateFromInput('')` produces `Invalid Date` (`new Date(NaN)`), and that value is written into `editedData.billingPeriod`.
   - This can happen if the user clears the date field before selecting a new date.
   - **Suggestion:** Guard empty/invalid input before updating state, e.g. return early when `!value` or when parsed parts are not finite.

2. **Medium – File type validation is too strict and may reject valid user images**
   - **File:** `frontend/src/components/upload/UploadZone.tsx:32`
   - Validation only accepts exact MIME types (`image/jpeg`, `image/jpg`, `image/png`, `image/webp`). In some browsers/devices, `file.type` can be empty or a different image MIME (notably mobile camera formats), causing false rejection.
   - **Suggestion:** Add extension fallback (`.jpg/.jpeg/.png/.webp`) when MIME is missing, and consider whether HEIC/HEIF should be supported or explicitly communicated.

3. **Low – UI copy is inconsistent with implemented validation**
   - **File:** `frontend/src/components/upload/UploadZone.tsx:253`
   - UI says “支援 JPG、PNG 格式” but code accepts WebP too.
   - **Suggestion:** Update text to include WebP (or remove WebP from allowed types for consistency).

### Open Questions / Assumptions

1. If camera capture on target devices produces HEIC, should that be supported or intentionally blocked?
2. Should invalid file selection also update OCR status (e.g. to `error`) for consistent global state behavior?

### Brief Summary

Iteration 2 fixed several prior issues (type safety, division-by-zero guards, input refs). The main remaining risks are edge-case handling in date parsing and robustness/usability of upload file validation.

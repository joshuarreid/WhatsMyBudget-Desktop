# Changelog

## [2026-06-10] - API v2 + Session Auth Migration

### Added
- Login flow at app startup via `POST /auth/login`.
- Session auth persistence in `sessionStorage` using `src/lib/authSession.js`.
- Auth service in `src/services/AuthService.js`.
- Login UI in `src/screens/LoginScreen/LoginScreen.jsx`.

### Changed
- `src/lib/apiClient.js` now adds `Authorization: Bearer <token>` for `/api/v2/**` requests.
- `src/App.js` now gates the main app behind an authenticated session.
- Service endpoints migrated to v2:
  - `src/services/BudgetTransactionService.js` -> `/api/v2/transactions`
  - `src/services/ProjectedTransactionService.js` -> `/api/v2/projected-transactions`
  - `src/services/StatementPeriodService.js` -> `/api/v2/statements`
  - `src/services/PaymentSummaryService.js` -> `/api/v2/payment-summary`
  - `src/services/LocalCacheService.js` -> `/api/v2/cache`

### Security/Auth behavior
- Token persistence is per-session only (no `localStorage` persistence).
- Auto logout occurs when:
  - token is locally expired, or
  - backend responds with `401` on `/api/v2/**`.

### Notes
- Build validated on migration day with `npm run build`.
- Existing JSDoc comments in some services still mention legacy v1 paths and should be cleaned up in a follow-up docs pass.


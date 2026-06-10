# ADR-001: Force API v2 with Session-Scoped JWT Authentication

## Status
Accepted

## Date
2026-06-10

## Context
The backend is decommissioning all API v1 endpoints. Frontend traffic must move to `/api/v2/**`, and v2 endpoints require JWT bearer authentication from `POST /auth/login`.

Team constraints for the first migration cut:
- Token persistence must be session-only.
- Automatic logout should occur only when token is expired or invalid.
- Frontend should force v2 usage rather than dual-stack v1/v2 toggling.

## Decision
1. Enforce authentication at app entry and require login before rendering the main routed app.
2. Store JWT session in `sessionStorage` with explicit `expiresAtMs` metadata.
3. Inject `Authorization: Bearer <token>` in `apiClient` for `/api/v2/**` requests.
4. Auto-clear auth session only when:
   - local expiry is reached, or
   - `/api/v2/**` receives `401`.
5. Migrate service resource paths to v2 endpoints immediately.

## Alternatives Considered

### 1) Keep v1/v2 feature flag during migration
- Pros: easier rollback if partial backend parity issues appear.
- Cons: increases code complexity and risks endpoint drift while v1 is being removed.
- Rejected: backend decommission timeline favors forced cutover.

### 2) Persist token in `localStorage`
- Pros: better user convenience across browser restarts.
- Cons: larger persistence window for compromised session data.
- Rejected: requirement is session-only persistence.

### 3) Logout on any API error
- Pros: simple implementation.
- Cons: poor UX and unnecessary sign-outs on non-auth failures (500/network).
- Rejected: requirement is logout only on invalid/expired token conditions.

## Consequences
- Users must authenticate each new browser session.
- v2 endpoint parity becomes a hard dependency for all screens.
- API failures not related to auth no longer force logouts.
- Some service comments still reference legacy paths and require follow-up documentation cleanup.

## Implementation References
- `src/lib/authSession.js`
- `src/services/AuthService.js`
- `src/lib/apiClient.js`
- `src/App.js`
- `src/screens/LoginScreen/LoginScreen.jsx`
- `src/services/BudgetTransactionService.js`
- `src/services/ProjectedTransactionService.js`
- `src/services/StatementPeriodService.js`
- `src/services/PaymentSummaryService.js`
- `src/services/LocalCacheService.js`


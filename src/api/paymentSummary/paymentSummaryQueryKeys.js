/**
 * Query keys for payment summary TanStack Query.
 * Canonical keys for cache safety and uniformity.
 */

/**
 * Top-level key for all paymentSummary queries.
 * @constant
 * @type {Array}
 */
export const PAYMENT_SUMMARY = ['paymentSummary'];

/**
 * Canonical query/mutation keys for payment summary.
 */
export const paymentSummaryKeys = {
    all: PAYMENT_SUMMARY,

    lists: () => [...paymentSummaryKeys.all, 'lists'],

    list: (filters = {}) => [...paymentSummaryKeys.lists(), { filters }],

    summary: (accounts, statementPeriod) =>
        [...paymentSummaryKeys.all, 'summary', { accounts, statementPeriod }],

    detail: (accountId, statementPeriod) =>
        [...paymentSummaryKeys.all, 'detail', { accountId, statementPeriod }],
};
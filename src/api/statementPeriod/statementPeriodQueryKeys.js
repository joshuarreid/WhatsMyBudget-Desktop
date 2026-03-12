/**
 * Query keys for statement period TanStack queries & mutations.
 * Canonical keys for cache safety and uniformity.
 */

/**
 * Top-level key for all statementPeriod queries.
 * @constant
 * @type {Array}
 */
export const STATEMENT_PERIOD = ['statementPeriod'];

/**
 * Canonical query/mutation keys for statement periods.
 */
export const statementPeriodKeys = {
    all: STATEMENT_PERIOD,

    lists: () => [...STATEMENT_PERIOD, 'lists'],

    list: (filters = {}) => [...statementPeriodKeys.lists(), { filters }],

    detail: (statementPeriodId) => [...STATEMENT_PERIOD, 'detail', statementPeriodId],

    options: () => [...STATEMENT_PERIOD, 'options'],
};
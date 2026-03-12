/**
 * Query keys for budget transaction-related TanStack queries and mutations.
 * Follows canonical key patterns for cache safety and uniformity.
 */

/**
 * Top-level key for all budgetTransaction queries.
 * @constant
 * @type {Array}
 */
export const BUDGET_TRANSACTION = ['budgetTransaction'];

/**
 * Canonical query/mutation keys for budget transactions.
 */
export const budgetTransactionKeys = {
    all: BUDGET_TRANSACTION,

    lists: () => [...budgetTransactionKeys.all, 'lists'],

    list: (filters = {}) => [...budgetTransactionKeys.lists(), { filters }],

    detail: (transactionId) => [...budgetTransactionKeys.all, 'detail', transactionId],

    create: () => [...budgetTransactionKeys.all, 'create'],

    update: (transactionId) => [...budgetTransactionKeys.detail(transactionId), 'update'],

    remove: (transactionId) => [...budgetTransactionKeys.detail(transactionId), 'remove'],

    upload: () => [...budgetTransactionKeys.all, 'upload'],

    uploadStatement: () => [...budgetTransactionKeys.all, 'upload-statement'],

    account: (filters = {}) => [...budgetTransactionKeys.all, 'account', { filters }],

    budgetForAccount: (filters = {}) => [...budgetTransactionKeys.all, 'account', 'budget', { filters }],
};
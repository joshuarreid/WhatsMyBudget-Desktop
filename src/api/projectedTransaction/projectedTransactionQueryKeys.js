/**
 * Query keys for projected transaction TanStack queries and mutations.
 * Canonical keys for cache safety and uniformity.
 */

/**
 * Top-level key for all projectedTransaction queries.
 * @constant
 * @type {Array}
 */
export const PROJECTED_TRANSACTION = ['projectedTransaction'];

/**
 * Canonical query/mutation keys for projected transactions.
 */
export const projectedTransactionKeys = {
    all: PROJECTED_TRANSACTION,

    lists: () => [...projectedTransactionKeys.all, 'lists'],

    list: (filters = {}) => [...projectedTransactionKeys.lists(), { filters }],

    detail: (transactionId) => [...projectedTransactionKeys.all, 'detail', transactionId],

    create: () => [...projectedTransactionKeys.all, 'create'],

    update: (transactionId) => [...projectedTransactionKeys.detail(transactionId), 'update'],

    remove: (transactionId) => [...projectedTransactionKeys.detail(transactionId), 'remove'],

    account: (filters = {}) => [...projectedTransactionKeys.all, 'account', { filters }],
};
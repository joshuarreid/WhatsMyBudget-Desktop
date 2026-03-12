import ProjectedTransactionApiClient from './projectedTransactionApiClient.js';

/**
 * Singleton instance of ProjectedTransactionApiClient.
 * @constant
 * @type {ProjectedTransactionApiClient}
 */
const apiClient = new ProjectedTransactionApiClient();

/**
 * Logger for projectedTransaction module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[projectedTransaction]', ...args),
    error: (...args) => console.error('[projectedTransaction]', ...args),
};

/**
 * Fetches list of projected transactions with optional filters.
 * @async
 * @function getTransactions
 * @param {Object} [filters={}] - Supported: statementPeriod, account, category, criticality, paymentMethod.
 * @returns {Promise<Object>} ProjectedTransactionList.
 * @throws {Error} On request failure.
 */
export async function getTransactions(filters = {}) {
    logger.info('getTransactions called', { filters });
    try {
        const response = await apiClient.getTransactions(filters);
        logger.info('getTransactions success', {
            count: response?.data?.count ?? 0,
            total: response?.data?.total ?? 0,
        });
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactions failed', error);
        throw error;
    }
}

/**
 * Fetches a single projected transaction by id.
 * @async
 * @function getTransactionById
 * @param {number|string} id - Required transaction id.
 * @returns {Promise<Object>} ProjectedTransaction object.
 * @throws {Error} On request failure or if id missing.
 */
export async function getTransactionById(id) {
    logger.info('getTransactionById called', { id });
    try {
        const response = await apiClient.getTransactionById(id);
        logger.info('getTransactionById success', { transaction: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactionById failed', error);
        throw error;
    }
}

/**
 * Fetches projected transactions for an account with personal/joint split.
 * @async
 * @function getTransactionsForAccount
 * @param {Object} params - { account, statementPeriod, category, criticality, paymentMethod }
 * @returns {Promise<Object>} AccountProjectedTransactionList
 * @throws {Error} On request failure or if account missing.
 */
export async function getTransactionsForAccount(params = {}) {
    logger.info('getTransactionsForAccount called', params);
    try {
        const response = await apiClient.getTransactionsForAccount(params);
        logger.info('getTransactionsForAccount success', {
            personalCount: response?.data?.personalTransactions?.count ?? 0,
            jointCount: response?.data?.jointTransactions?.count ?? 0,
            personalTotal: response?.data?.personalTotal,
            jointTotal: response?.data?.jointTotal,
        });
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactionsForAccount failed', error);
        throw error;
    }
}

/**
 * Creates a new projected transaction.
 * @async
 * @function createTransaction
 * @param {Object} transaction - ProjectedTransaction payload.
 * @returns {Promise<Object>} Created projected transaction object.
 * @throws {Error} On request failure.
 */
export async function createTransaction(transaction) {
    logger.info('createTransaction called', {
        transactionPreview: transaction
            ? { name: transaction.name, amount: transaction.amount, statementPeriod: transaction.statementPeriod }
            : null,
    });
    try {
        const response = await apiClient.createTransaction(transaction);
        logger.info('createTransaction success', { created: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('createTransaction failed', error);
        throw error;
    }
}

/**
 * Updates an existing projected transaction.
 * @async
 * @function updateTransaction
 * @param {number|string} id - Transaction id (required).
 * @param {Object} transaction - Updated transaction payload.
 * @returns {Promise<Object>} Updated projected transaction object.
 * @throws {Error} On request failure or if id missing.
 */
export async function updateTransaction(id, transaction) {
    logger.info('updateTransaction called', {
        id,
        transactionPreview: transaction ? { name: transaction.name, amount: transaction.amount } : null,
    });
    try {
        const response = await apiClient.updateTransaction(id, transaction);
        logger.info('updateTransaction success', { updated: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('updateTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes a projected transaction by id.
 * @async
 * @function deleteTransaction
 * @param {number|string} id - Required transaction id.
 * @returns {Promise<Object>} Response.
 * @throws {Error} On request failure or if id missing.
 */
export async function deleteTransaction(id) {
    logger.info('deleteTransaction called', { id });
    try {
        const response = await apiClient.deleteTransaction(id);
        logger.info('deleteTransaction success', { status: response?.status });
        return response?.data || null;
    } catch (error) {
        logger.error('deleteTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes all projected transactions.
 * @async
 * @function deleteAllTransactions
 * @returns {Promise<Object>} Server response, e.g. { deletedCount }
 * @throws {Error} On request failure.
 */
export async function deleteAllTransactions() {
    logger.info('deleteAllTransactions called');
    try {
        const response = await apiClient.deleteAllTransactions();
        logger.info('deleteAllTransactions success', { deletedCount: response?.data?.deletedCount });
        return response?.data || null;
    } catch (error) {
        logger.error('deleteAllTransactions failed', error);
        throw error;
    }
}
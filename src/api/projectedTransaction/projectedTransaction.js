import ProjectedTransactionApiClient from './projectedTransactionApiClient.js';

/**
 * Singleton instance of ProjectedTransactionApiClient.
 * Ensures all projected transaction API requests use centralized client.
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
 * Fetches a list of projected transactions with optional filters.
 *
 * @async
 * @function getProjectedTransactions
 * @param {Object} [filters={}] - Supported filters: statementPeriod, account, category, criticality, paymentMethod.
 * @returns {Promise<Object>} ProjectedTransactionList.
 * @throws {Error} If the request fails.
 */
export async function getProjectedTransactions(filters = {}) {
    logger.info('getProjectedTransactions called', { filters });
    try {
        const response = await apiClient.getTransactions(filters);
        logger.info('getProjectedTransactions success', {
            count: response?.data?.count ?? 0,
            total: response?.data?.total ?? 0,
        });
        return response?.data || null;
    } catch (error) {
        logger.error('getProjectedTransactions failed', error);
        throw error;
    }
}

/**
 * Fetches a single projected transaction by ID.
 *
 * @async
 * @function getProjectedTransactionById
 * @param {number|string} projectedTransactionId - The projected transaction ID.
 * @returns {Promise<Object>} ProjectedTransaction object.
 * @throws {Error} If not found or request fails.
 */
export async function getProjectedTransactionById(projectedTransactionId) {
    logger.info('getProjectedTransactionById called', { projectedTransactionId });
    try {
        const response = await apiClient.getTransactionById(projectedTransactionId);
        logger.info('getProjectedTransactionById success', { projectedTransaction: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('getProjectedTransactionById failed', error);
        throw error;
    }
}

/**
 * Fetches projected transactions for an account, grouped by personal/joint.
 *
 * @async
 * @function getProjectedTransactionsForAccount
 * @param {Object} filters - Must include at least { account }, optionally statementPeriod, category, criticality, paymentMethod.
 * @returns {Promise<Object>} AccountProjectedTransactionList
 * @throws {Error} If request fails or account is missing.
 */
export async function getProjectedTransactionsForAccount(filters = {}) {
    logger.info('getProjectedTransactionsForAccount called', filters);
    try {
        const response = await apiClient.getTransactionsForAccount(filters);
        logger.info('getProjectedTransactionsForAccount success', {
            personalCount: response?.data?.personalTransactions?.count ?? 0,
            jointCount: response?.data?.jointTransactions?.count ?? 0,
            personalTotal: response?.data?.personalTotal,
            jointTotal: response?.data?.jointTotal,
        });
        return response?.data || null;
    } catch (error) {
        logger.error('getProjectedTransactionsForAccount failed', error);
        throw error;
    }
}

/**
 * Creates a new projected transaction.
 *
 * @async
 * @function createProjectedTransaction
 * @param {Object} projectedTransaction - ProjectedTransaction payload.
 * @returns {Promise<Object>} Created projected transaction object.
 * @throws {Error} If request fails.
 */
export async function createProjectedTransaction(projectedTransaction) {
    logger.info('createProjectedTransaction called', {
        transactionPreview: projectedTransaction
            ? { name: projectedTransaction.name, amount: projectedTransaction.amount, statementPeriod: projectedTransaction.statementPeriod }
            : null,
    });
    try {
        const response = await apiClient.createTransaction(projectedTransaction);
        logger.info('createProjectedTransaction success', { created: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('createProjectedTransaction failed', error);
        throw error;
    }
}

/**
 * Updates an existing projected transaction.
 *
 * @async
 * @function updateProjectedTransaction
 * @param {number|string} projectedTransactionId - The projected transaction ID.
 * @param {Object} projectedTransaction - The updated projected transaction payload.
 * @returns {Promise<Object>} Updated projected transaction object.
 * @throws {Error} If request fails or ID is missing.
 */
export async function updateProjectedTransaction(projectedTransactionId, projectedTransaction) {
    logger.info('updateProjectedTransaction called', {
        projectedTransactionId,
        transactionPreview: projectedTransaction ? { name: projectedTransaction.name, amount: projectedTransaction.amount } : null,
    });
    try {
        const response = await apiClient.updateTransaction(projectedTransactionId, projectedTransaction);
        logger.info('updateProjectedTransaction success', { updated: response?.data });
        return response?.data || null;
    } catch (error) {
        logger.error('updateProjectedTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes a projected transaction by ID.
 *
 * @async
 * @function deleteProjectedTransaction
 * @param {number|string} projectedTransactionId - The projected transaction ID.
 * @returns {Promise<Object>} API response.
 * @throws {Error} If request fails or ID is missing.
 */
export async function deleteProjectedTransaction(projectedTransactionId) {
    logger.info('deleteProjectedTransaction called', { projectedTransactionId });
    try {
        const response = await apiClient.deleteTransaction(projectedTransactionId);
        logger.info('deleteProjectedTransaction success', { status: response?.status });
        return response?.data || null;
    } catch (error) {
        logger.error('deleteProjectedTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes all projected transactions.
 *
 * @async
 * @function deleteAllProjectedTransactions
 * @returns {Promise<Object>} API response (e.g. { deletedCount })
 * @throws {Error} If request fails.
 */
export async function deleteAllProjectedTransactions() {
    logger.info('deleteAllProjectedTransactions called');
    try {
        const response = await apiClient.deleteAllTransactions();
        logger.info('deleteAllProjectedTransactions success', { deletedCount: response?.data?.deletedCount });
        return response?.data || null;
    } catch (error) {
        logger.error('deleteAllProjectedTransactions failed', error);
        throw error;
    }
}
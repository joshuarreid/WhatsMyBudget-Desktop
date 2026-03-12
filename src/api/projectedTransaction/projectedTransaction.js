import ProjectedTransactionApiClient from "./projectedTransactionApiClient";

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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} ProjectedTransactionList.
 * @throws {Error} On request failure.
 */
export async function getTransactions(filters = {}, transactionId) {
    logger.info('getTransactions called', { filters, transactionId });
    const config = transactionId
        ? { params: filters, headers: { 'X-Transaction-ID': transactionId } }
        : { params: filters };
    try {
        const response = await apiClient.get('/', config.params, { headers: config.headers });
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} ProjectedTransaction object.
 * @throws {Error} On request failure or if id missing.
 */
export async function getTransactionById(id, transactionId) {
    logger.info('getTransactionById called', { id, transactionId });
    if (!id) throw new Error('Transaction ID required');
    const config = transactionId ? { headers: { 'X-Transaction-ID': transactionId } } : {};
    try {
        const response = await apiClient.get(`/${encodeURIComponent(id)}`, {}, config);
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} AccountProjectedTransactionList
 * @throws {Error} On request failure or if account missing.
 */
export async function getTransactionsForAccount(params = {}, transactionId) {
    logger.info('getTransactionsForAccount called', { ...params, transactionId });
    if (!params.account) throw new Error('Account is required');
    const config = transactionId
        ? { headers: { 'X-Transaction-ID': transactionId } }
        : {};
    try {
        const response = await apiClient.get('/account', params, config);
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} Created projected transaction object.
 * @throws {Error} On request failure.
 */
export async function createTransaction(transaction, transactionId) {
    logger.info('createTransaction called', {
        transactionPreview: transaction
            ? { name: transaction.name, amount: transaction.amount, statementPeriod: transaction.statementPeriod }
            : null,
        transactionId
    });
    const config = transactionId ? { headers: { 'X-Transaction-ID': transactionId } } : {};
    try {
        const response = await apiClient.post('/', transaction, config);
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} Updated projected transaction object.
 * @throws {Error} On request failure or if id missing.
 */
export async function updateTransaction(id, transaction, transactionId) {
    logger.info('updateTransaction called', {
        id,
        transactionPreview: transaction ? { name: transaction.name, amount: transaction.amount } : null,
        transactionId
    });
    if (!id) throw new Error('Transaction ID required');
    const config = transactionId ? { headers: { 'X-Transaction-ID': transactionId } } : {};
    try {
        const response = await apiClient.put(`/${encodeURIComponent(id)}`, transaction, config);
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} Response.
 * @throws {Error} On request failure or if id missing.
 */
export async function deleteTransaction(id, transactionId) {
    logger.info('deleteTransaction called', { id, transactionId });
    if (!id) throw new Error('Transaction ID required');
    const config = transactionId ? { headers: { 'X-Transaction-ID': transactionId } } : {};
    try {
        const response = await apiClient.delete(`/${encodeURIComponent(id)}`, {}, config);
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
 * @param {string} [transactionId] - Optional X-Transaction-ID.
 * @returns {Promise<Object>} Server response, e.g. { deletedCount }
 * @throws {Error} On request failure.
 */
export async function deleteAllTransactions(transactionId) {
    logger.info('deleteAllTransactions called', { transactionId });
    const config = transactionId ? { headers: { 'X-Transaction-ID': transactionId } } : {};
    try {
        const response = await apiClient.delete('/', {}, config);
        logger.info('deleteAllTransactions success', { deletedCount: response?.data?.deletedCount });
        return response?.data || null;
    } catch (error) {
        logger.error('deleteAllTransactions failed', error);
        throw error;
    }
}
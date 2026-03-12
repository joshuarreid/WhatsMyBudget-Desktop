import BudgetTransactionApiClient from './budgetTransactionApiClient.js';

/**
 * Singleton instance of BudgetTransactionApiClient.
 * Ensures all transaction API requests go through preconfigured client.
 * @constant
 * @type {BudgetTransactionApiClient}
 */
const apiClient = new BudgetTransactionApiClient();

/**
 * Logger for budgetTransaction module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[budgetTransaction]', ...args),
    error: (...args) => console.error('[budgetTransaction]', ...args),
};

/**
 * Fetches all transactions (with optional filters).
 * @async
 * @function getTransactions
 * @param {Object} [filters={}] - Filter params.
 * @returns {Promise<Object>} - BudgetTransactionList: { transactions, count, total }
 * @throws {Error} If the request fails.
 */
export async function getTransactions(filters = {}) {
    logger.info('getTransactions called', { filters });
    try {
        const response = await apiClient.get('/', filters);
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactions failed', error);
        throw error;
    }
}

/**
 * Fetches a transaction by ID.
 * @async
 * @function getTransactionById
 * @param {string|number} id - Transaction ID.
 * @returns {Promise<Object>} - Transaction object.
 * @throws {Error} If not found or request fails.
 */
export async function getTransactionById(id) {
    logger.info('getTransactionById called', { id });
    try {
        const response = await apiClient.get(`/${encodeURIComponent(id)}`);
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactionById failed', error);
        throw error;
    }
}

/**
 * Creates a transaction.
 * @async
 * @function createTransaction
 * @param {Object} transaction - Transaction payload.
 * @returns {Promise<Object>} - Created transaction.
 * @throws {Error} If request fails.
 */
export async function createTransaction(transaction) {
    logger.info('createTransaction called', { transaction });
    try {
        const response = await apiClient.post('/', transaction);
        return response?.data || null;
    } catch (error) {
        logger.error('createTransaction failed', error);
        throw error;
    }
}

/**
 * Updates a transaction by ID.
 * @async
 * @function updateTransaction
 * @param {string|number} id
 * @param {Object} transaction
 * @returns {Promise<Object>} Updated transaction
 * @throws {Error} If not found or request fails
 */
export async function updateTransaction(id, transaction) {
    logger.info('updateTransaction called', { id });
    try {
        const response = await apiClient.put(`/${encodeURIComponent(id)}`, transaction);
        return response?.data || null;
    } catch (error) {
        logger.error('updateTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes a transaction by ID.
 * @async
 * @function deleteTransaction
 * @param {string|number} id
 * @returns {Promise<void>} Resolves on success.
 * @throws {Error} If not found or request fails.
 */
export async function deleteTransaction(id) {
    logger.info('deleteTransaction called', { id });
    try {
        await apiClient.delete(`/${encodeURIComponent(id)}`);
    } catch (error) {
        logger.error('deleteTransaction failed', error);
        throw error;
    }
}

/**
 * Deletes all transactions.
 * @async
 * @function deleteAllTransactions
 * @returns {Promise<Object>} API response.
 * @throws {Error} If request fails.
 */
export async function deleteAllTransactions() {
    logger.info('deleteAllTransactions called');
    try {
        const response = await apiClient.delete('/');
        return response?.data || null;
    } catch (error) {
        logger.error('deleteAllTransactions failed', error);
        throw error;
    }
}

/**
 * Uploads transactions via CSV file (bulk upload).
 * @async
 * @function uploadTransactions
 * @param {File|Blob} file
 * @param {string} statementPeriod
 * @returns {Promise<Object>} API response.
 * @throws {Error} If upload fails.
 */
export async function uploadTransactions(file, statementPeriod) {
    logger.info('uploadTransactions called', { fileName: file?.name, statementPeriod });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('statementPeriod', statementPeriod);

    try {
        const response = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response?.data || null;
    } catch (error) {
        logger.error('uploadTransactions failed', error);
        throw error;
    }
}

/**
 * Fetches transactions for an account (by filters).
 * @async
 * @function getTransactionsForAccount
 * @param {Object} filters - { account, statementPeriod, category, criticality, paymentMethod }
 * @returns {Promise<Object>} BudgetTransactionList
 * @throws {Error} If request fails.
 */
export async function getTransactionsForAccount(filters) {
    logger.info('getTransactionsForAccount called', filters);
    try {
        const response = await apiClient.get('/account', filters);
        return response?.data || null;
    } catch (error) {
        logger.error('getTransactionsForAccount failed', error);
        throw error;
    }
}

/**
 * Uploads a credit card statement (CSV file) for bulk import.
 * @async
 * @function uploadCreditCardStatement
 * @param {Object} params
 * @param {File|Blob} params.file
 * @param {string} params.bank
 * @param {string} params.statementPeriod
 * @param {string} params.account
 * @param {string} params.paymentMethod
 * @returns {Promise<Object>} Upload results: {insertedCount, duplicateCount, errors}
 * @throws {Error} If any param is missing or request/upload fails.
 */
export async function uploadCreditCardStatement({ file, bank, statementPeriod, account, paymentMethod }) {
    logger.info('uploadCreditCardStatement called', {
        fileName: file?.name, bank, statementPeriod, account, paymentMethod
    });

    if (!file || !bank || !statementPeriod || !account || !paymentMethod) {
        logger.error('uploadCreditCardStatement missing params', { file, bank, statementPeriod, account, paymentMethod });
        throw new Error('All parameters (file, bank, statementPeriod, account, paymentMethod) are required');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bank', bank);
    formData.append('statementPeriod', statementPeriod);
    formData.append('account', account);
    formData.append('paymentMethod', paymentMethod);

    try {
        // Large timeout for uploads
        const response = await apiClient.post('/upload-statement', formData, {
            headers: { 'Content-Type': undefined },
            timeout: 300000,
        });
        return response?.data || null;
    } catch (error) {
        logger.error('uploadCreditCardStatement failed', error);
        throw error;
    }
}

/**
 * Fetches budget transactions for an account (with filters).
 * @async
 * @function getBudgetTransactionsForAccount
 * @param {Object} filters - { account, statementPeriod, category, criticality, paymentMethod }
 * @returns {Promise<Object>} BudgetTransactionList
 * @throws {Error} If request fails.
 */
export async function getBudgetTransactionsForAccount(filters) {
    logger.info('getBudgetTransactionsForAccount called', filters);
    try {
        const response = await apiClient.get('/account/budget', filters);
        return response?.data || null;
    } catch (error) {
        logger.error('getBudgetTransactionsForAccount failed', error);
        throw error;
    }
}
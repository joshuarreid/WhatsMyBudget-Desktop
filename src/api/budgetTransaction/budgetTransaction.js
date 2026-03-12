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
 * Fetches all transactions with optional filters.
 * @async
 * @function getTransactions
 * @param {Object} [filters={}] - Filter parameters (statementPeriod, account, etc.).
 * @returns {Promise<Object>} BudgetTransactionList: { transactions, count, total }
 * @throws {Error} If the request fails.
 */
export async function getTransactions(filters = {}) {
    logger.info('getTransactions called', { filters });
    try {
        const response = await apiClient.getTransactions(filters);
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
 * @returns {Promise<Object>} Transaction object.
 * @throws {Error} If not found or request fails.
 */
export async function getTransactionById(id) {
    logger.info('getTransactionById called', { id });
    try {
        const response = await apiClient.getTransactionById(id);
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
 * @returns {Promise<Object>} Created transaction object.
 * @throws {Error} If request fails.
 */
export async function createTransaction(transaction) {
    logger.info('createTransaction called', { transaction });
    try {
        const response = await apiClient.createTransaction(transaction);
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
 * @param {string|number} id - Transaction ID.
 * @param {Object} transaction - Updated transaction payload.
 * @returns {Promise<Object>} Updated transaction object.
 * @throws {Error} If not found or request fails.
 */
export async function updateTransaction(id, transaction) {
    logger.info('updateTransaction called', { id });
    try {
        const response = await apiClient.updateTransaction(id, transaction);
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
 * @param {string|number} id - Transaction ID.
 * @returns {Promise<void>} Resolves on success.
 * @throws {Error} If not found or request fails.
 */
export async function deleteTransaction(id) {
    logger.info('deleteTransaction called', { id });
    try {
        await apiClient.deleteTransaction(id);
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
        const response = await apiClient.deleteAllTransactions();
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
 * @param {File|Blob} file - CSV file.
 * @param {string} statementPeriod - Statement period.
 * @returns {Promise<Object>} API response.
 * @throws {Error} If upload fails.
 */
export async function uploadTransactions(file, statementPeriod) {
    logger.info('uploadTransactions called', { fileName: file?.name, statementPeriod });
    try {
        const response = await apiClient.uploadTransactions(file, statementPeriod);
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
 * @returns {Promise<Object>} BudgetTransactionList.
 * @throws {Error} If request fails.
 */
export async function getTransactionsForAccount(filters) {
    logger.info('getTransactionsForAccount called', filters);
    try {
        const response = await apiClient.getTransactionsForAccount(filters);
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
 * @param {Object} params - { file, bank, statementPeriod, account, paymentMethod }
 * @returns {Promise<Object>} Upload results: { insertedCount, duplicateCount, errors }
 * @throws {Error} If any param is missing or request/upload fails.
 */
export async function uploadCreditCardStatement(params) {
    logger.info('uploadCreditCardStatement called', {
        fileName: params?.file?.name, bank: params?.bank, statementPeriod: params?.statementPeriod, account: params?.account, paymentMethod: params?.paymentMethod
    });

    if (!params?.file || !params.bank || !params.statementPeriod || !params.account || !params.paymentMethod) {
        logger.error('uploadCreditCardStatement missing params', params);
        throw new Error('All parameters (file, bank, statementPeriod, account, paymentMethod) are required');
    }

    try {
        const response = await apiClient.uploadCreditCardStatement(params);
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
 * @returns {Promise<Object>} BudgetTransactionList.
 * @throws {Error} If request fails.
 */
export async function getBudgetTransactionsForAccount(filters) {
    logger.info('getBudgetTransactionsForAccount called', filters);
    try {
        const response = await apiClient.getBudgetTransactionsForAccount(filters);
        return response?.data || null;
    } catch (error) {
        logger.error('getBudgetTransactionsForAccount failed', error);
        throw error;
    }
}
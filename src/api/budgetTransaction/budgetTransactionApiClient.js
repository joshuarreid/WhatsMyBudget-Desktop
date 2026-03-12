import ApiClient from '../ApiClient.js';

/**
 * Logger for BudgetTransactionApiClient.
 * @constant
 * @type {{info: Function, error: Function}}
 */
const logger = {
    info: (...args) => console.log('[BudgetTransactionApiClient]', ...args),
    error: (...args) => console.error('[BudgetTransactionApiClient]', ...args),
};

/**
 * BudgetTransactionApiClient
 * - Specialized API client for /api/transactions endpoints.
 * - Implements transaction CRUD, CSV upload, and account-related fetches.
 *
 * @class
 * @extends ApiClient
 */
export default class BudgetTransactionApiClient extends ApiClient {
    /**
     * Creates an instance of BudgetTransactionApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - API base URL.
     * @param {number} [options.timeout=10000] - Request timeout (ms).
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/transactions' });
        logger.info('BudgetTransactionApiClient initialized');
    }

    /**
     * Fetches all transactions.
     * @async
     * @param {Object} [filters={}] - Query filters.
     * @returns {Promise<Object>} BudgetTransactionList (transactions, count, total)
     * @throws {Error}
     */
    async getTransactions(filters = {}) {
        logger.info('getTransactions called', { filters });
        return this.get('/', filters);
    }

    /**
     * Fetches transaction by ID.
     * @async
     * @param {string|number} id - Transaction ID.
     * @returns {Promise<Object>} Transaction object
     * @throws {Error}
     */
    async getTransactionById(id) {
        logger.info('getTransactionById called', { id });
        return this.get(`/${encodeURIComponent(id)}`);
    }

    /**
     * Creates a transaction.
     * @async
     * @param {Object} transaction - Transaction payload.
     * @returns {Promise<Object>} Created transaction object
     * @throws {Error}
     */
    async createTransaction(transaction) {
        logger.info('createTransaction called', { transaction });
        return this.post('/', transaction);
    }

    /**
     * Updates a transaction by ID.
     * @async
     * @param {string|number} id
     * @param {Object} transaction
     * @returns {Promise<Object>} Updated transaction object
     * @throws {Error}
     */
    async updateTransaction(id, transaction) {
        logger.info('updateTransaction called', { id });
        return this.put(`/${encodeURIComponent(id)}`, transaction);
    }

    /**
     * Deletes a transaction by ID.
     * @async
     * @param {string|number} id
     * @returns {Promise<Object>} API response
     * @throws {Error}
     */
    async deleteTransaction(id) {
        logger.info('deleteTransaction called', { id });
        return this.delete(`/${encodeURIComponent(id)}`);
    }

    /**
     * Deletes all transactions.
     * @async
     * @returns {Promise<Object>} API response
     * @throws {Error}
     */
    async deleteAllTransactions() {
        logger.info('deleteAllTransactions called');
        return this.delete('/');
    }

    /**
     * Uploads transactions via CSV file (bulk upload).
     * @async
     * @param {File|Blob} file
     * @param {string} statementPeriod
     * @returns {Promise<Object>} API response
     * @throws {Error}
     */
    async uploadTransactions(file, statementPeriod) {
        logger.info('uploadTransactions called', { fileName: file?.name, statementPeriod });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('statementPeriod', statementPeriod);
        return this.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    /**
     * Fetches transactions for an account.
     * @async
     * @param {Object} filters - { account, statementPeriod, category, criticality, paymentMethod }
     * @returns {Promise<Object>} BudgetTransactionList
     * @throws {Error}
     */
    async getTransactionsForAccount(filters = {}) {
        logger.info('getTransactionsForAccount called', filters);
        return this.get('/account', filters);
    }

    /**
     * Uploads a credit card statement CSV file for bulk import.
     * @async
     * @param {Object} params
     * @param {File|Blob} params.file
     * @param {string} params.bank
     * @param {string} params.statementPeriod
     * @param {string} params.account
     * @param {string} params.paymentMethod
     * @returns {Promise<Object>} Upload results
     * @throws {Error}
     */
    async uploadCreditCardStatement({ file, bank, statementPeriod, account, paymentMethod }) {
        logger.info('uploadCreditCardStatement called', {
            fileName: file?.name, bank, statementPeriod, account, paymentMethod
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bank', bank);
        formData.append('statementPeriod', statementPeriod);
        formData.append('account', account);
        formData.append('paymentMethod', paymentMethod);
        return this.post('/upload-statement', formData, {
            headers: { 'Content-Type': undefined },
            timeout: 300000,
        });
    }

    /**
     * Fetches budget transactions for an account (with filters).
     * @async
     * @param {Object} filters - { account, statementPeriod, category, criticality, paymentMethod }
     * @returns {Promise<Object>} BudgetTransactionList
     * @throws {Error}
     */
    async getBudgetTransactionsForAccount(filters = {}) {
        logger.info('getBudgetTransactionsForAccount called', filters);
        return this.get('/account/budget', filters);
    }
}
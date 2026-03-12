import ApiClient from '../ApiClient.js';

/**
 * Logger for ProjectedTransactionApiClient.
 * @constant
 * @type {{info: Function, error: Function}}
 */
const logger = {
    info: (...args) => console.log('[ProjectedTransactionApiClient]', ...args),
    error: (...args) => console.error('[ProjectedTransactionApiClient]', ...args),
};

/**
 * ProjectedTransactionApiClient
 * - Specialized API client for /api/projections endpoints.
 * - Implements CRUD and account-scoped splits for projected transactions.
 *
 * @class
 * @extends ApiClient
 */
export default class ProjectedTransactionApiClient extends ApiClient {
    /**
     * Creates an instance of ProjectedTransactionApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - API base URL.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/projections' });
        logger.info('ProjectedTransactionApiClient initialized');
    }

    /**
     * Fetches list of projected transactions.
     * @async
     * @param {Object} [filters={}] - Supported: statementPeriod, account, category, criticality, paymentMethod
     * @returns {Promise<Object>} ProjectedTransactionList.
     * @throws {Error}
     */
    async getTransactions(filters = {}) {
        logger.info('getTransactions called', { filters });
        return this.get('/', filters);
    }

    /**
     * Fetches a projected transaction by ID.
     * @async
     * @param {number|string} id
     * @returns {Promise<Object>} ProjectedTransaction object.
     * @throws {Error}
     */
    async getTransactionById(id) {
        if (!id) throw new Error('Transaction ID required');
        logger.info('getTransactionById called', { id });
        return this.get(`/${encodeURIComponent(id)}`);
    }

    /**
     * Fetches projected transactions for an account with personal/joint splits.
     * @async
     * @param {Object} params - { account, statementPeriod, category, criticality, paymentMethod }
     * @returns {Promise<Object>} AccountProjectedTransactionList.
     * @throws {Error}
     */
    async getTransactionsForAccount(params = {}) {
        if (!params.account) throw new Error('Account is required');
        logger.info('getTransactionsForAccount called', params);
        return this.get('/account', params);
    }

    /**
     * Creates a new projected transaction.
     * @async
     * @param {Object} transaction - ProjectedTransaction payload.
     * @returns {Promise<Object>} Created transaction object.
     * @throws {Error}
     */
    async createTransaction(transaction) {
        logger.info('createTransaction called', { transaction });
        return this.post('/', transaction);
    }

    /**
     * Updates a projected transaction.
     * @async
     * @param {number|string} id
     * @param {Object} transaction
     * @returns {Promise<Object>} Updated transaction object.
     * @throws {Error}
     */
    async updateTransaction(id, transaction) {
        if (!id) throw new Error('Transaction ID required');
        logger.info('updateTransaction called', { id });
        return this.put(`/${encodeURIComponent(id)}`, transaction);
    }

    /**
     * Deletes a projected transaction by ID.
     * @async
     * @param {number|string} id
     * @returns {Promise<Object>} API response.
     * @throws {Error}
     */
    async deleteTransaction(id) {
        if (!id) throw new Error('Transaction ID required');
        logger.info('deleteTransaction called', { id });
        return this.delete(`/${encodeURIComponent(id)}`);
    }

    /**
     * Deletes all projected transactions.
     * @async
     * @returns {Promise<Object>} API response (e.g. { deletedCount }).
     * @throws {Error}
     */
    async deleteAllTransactions() {
        logger.info('deleteAllTransactions called');
        return this.delete('/');
    }
}
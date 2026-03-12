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
 * BudgetTransactionApiClient class – specialized API client for transaction endpoints.
 * @class
 * @extends ApiClient
 */
export default class BudgetTransactionApiClient extends ApiClient {
    /**
     * Creates a new BudgetTransactionApiClient instance.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - Override for API root.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/transactions' });
        logger.info('BudgetTransactionApiClient initialized');
    }
}
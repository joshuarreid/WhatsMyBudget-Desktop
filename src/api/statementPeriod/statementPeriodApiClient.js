import ApiClient from '../ApiClient.js';

/**
 * Logger for StatementPeriodApiClient.
 * @constant
 * @type {{info: Function, error: Function}}
 */
const logger = {
    info: (...args) => console.log('[StatementPeriodApiClient]', ...args),
    error: (...args) => console.error('[StatementPeriodApiClient]', ...args),
};

/**
 * StatementPeriodApiClient
 * Specialized API client for /api/statement-periods endpoints.
 * Implements fetching of all statement periods.
 *
 * @class
 * @extends ApiClient
 */
export default class StatementPeriodApiClient extends ApiClient {
    /**
     * Creates an instance of StatementPeriodApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - Optional API root override.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/statement-periods' });
        logger.info('StatementPeriodApiClient initialized');
    }

    /**
     * Fetches all statement periods from the backend.
     * GET /api/statement-periods
     *
     * @async
     * @function getAllStatementPeriods
     * @returns {Promise<Array<Object>>} Array of statement period objects.
     * @throws {Error} If the request fails.
     */
    async getAllStatementPeriods() {
        logger.info('getAllStatementPeriods called');
        return this.get('/');
    }
}
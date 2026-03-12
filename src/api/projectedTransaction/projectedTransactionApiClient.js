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
 * Specialized client for /api/projections endpoints.
 * @class
 * @extends ApiClient
 */
export default class ProjectedTransactionApiClient extends ApiClient {
    /**
     * Creates an instance of ProjectedTransactionApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - Optional API root override.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/projections' });
        logger.info('ProjectedTransactionApiClient initialized');
    }
}
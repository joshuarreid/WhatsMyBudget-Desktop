import ApiClient from '../ApiClient.js';

/**
 * Logger for LocalCacheApiClient.
 * @constant
 * @type {{info: Function, error: Function}}
 */
const logger = {
    info: (...args) => console.log('[LocalCacheApiClient]', ...args),
    error: (...args) => console.error('[LocalCacheApiClient]', ...args),
};

/**
 * LocalCacheApiClient - Specialized API client for /api/cache endpoints.
 * @class
 * @extends ApiClient
 */
export default class LocalCacheApiClient extends ApiClient {
    /**
     * Creates an instance of LocalCacheApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - Override for API root.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/cache' });
        logger.info('LocalCacheApiClient initialized');
    }
}
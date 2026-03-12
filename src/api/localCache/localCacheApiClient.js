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
 * LocalCacheApiClient
 * - Specialized API client for /api/cache endpoints.
 * - Implements key/value CRUD operations for cache.
 *
 * @class
 * @extends ApiClient
 */
export default class LocalCacheApiClient extends ApiClient {
    /**
     * Creates an instance of LocalCacheApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - API base URL.
     * @param {number} [options.timeout=10000] - Request timeout in ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/cache' });
        logger.info('LocalCacheApiClient initialized');
    }

    /**
     * Gets a cache value by key.
     * @async
     * @param {string} cacheKey
     * @returns {Promise<object>} data object
     * @throws {Error}
     */
    async getCache(cacheKey) {
        if (!cacheKey) throw new Error('cacheKey required');
        logger.info('getCache called', { cacheKey });
        return this.get(`/${encodeURIComponent(cacheKey)}`);
    }

    /**
     * Sets a cache value by key.
     * @async
     * @param {string} cacheKey
     * @param {string} cacheValue
     * @returns {Promise<object>} API response
     * @throws {Error}
     */
    async setCache(cacheKey, cacheValue) {
        if (!cacheKey) throw new Error('cacheKey required');
        logger.info('setCache called', { cacheKey, cacheValue });
        return this.post('/', null, {
            params: { cacheKey, cacheValue: String(cacheValue) },
        });
    }

    /**
     * Deletes a cache value by key.
     * @async
     * @param {string} cacheKey
     * @returns {Promise<object>} API response
     * @throws {Error}
     */
    async deleteCache(cacheKey) {
        if (!cacheKey) throw new Error('cacheKey required');
        logger.info('deleteCache called', { cacheKey });
        return this.delete(`/${encodeURIComponent(cacheKey)}`);
    }

    /**
     * Deletes all cache entries.
     * @async
     * @returns {Promise<object>} API response
     * @throws {Error}
     */
    async deleteAllCache() {
        logger.info('deleteAllCache called');
        return this.delete('/');
    }
}
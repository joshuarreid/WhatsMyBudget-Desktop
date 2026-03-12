import LocalCacheApiClient from './localCacheApiClient.js';

/**
 * Singleton instance of LocalCacheApiClient.
 * Ensures all cache API requests go through a preconfigured client.
 * @constant
 * @type {LocalCacheApiClient}
 */
const apiClient = new LocalCacheApiClient();

/**
 * Logger for localCache module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[localCache]', ...args),
    error: (...args) => console.error('[localCache]', ...args),
};

/**
 * Gets cache value by key.
 * @async
 * @function getCache
 * @param {string} cacheKey
 * @returns {Promise<object>} response.data
 * @throws {Error} If request fails.
 */
export async function getCache(cacheKey) {
    logger.info('getCache called', { cacheKey });
    try {
        const response = await apiClient.getCache(cacheKey);
        return response?.data || null;
    } catch (error) {
        logger.error('getCache failed', { cacheKey, error });
        throw error;
    }
}

/**
 * Sets cache value by key.
 * @async
 * @function setCache
 * @param {string} cacheKey
 * @param {string} cacheValue
 * @returns {Promise<object>} response.data
 * @throws {Error} If request fails.
 */
export async function setCache(cacheKey, cacheValue) {
    logger.info('setCache called', { cacheKey, cacheValue });
    try {
        const response = await apiClient.setCache(cacheKey, cacheValue);
        return response?.data || null;
    } catch (error) {
        logger.error('setCache failed', { cacheKey, error });
        throw error;
    }
}

/**
 * Deletes cache value by key.
 * @async
 * @function deleteCache
 * @param {string} cacheKey
 * @returns {Promise<object>} response.data
 * @throws {Error} If request fails.
 */
export async function deleteCache(cacheKey) {
    logger.info('deleteCache called', { cacheKey });
    try {
        const response = await apiClient.deleteCache(cacheKey);
        return response?.data || null;
    } catch (error) {
        logger.error('deleteCache failed', { cacheKey, error });
        throw error;
    }
}

/**
 * Deletes all cache values.
 * @async
 * @function deleteAllCache
 * @returns {Promise<object>} response.data
 * @throws {Error} If request fails.
 */
export async function deleteAllCache() {
    logger.info('deleteAllCache called');
    try {
        const response = await apiClient.deleteAllCache();
        return response?.data || null;
    } catch (error) {
        logger.error('deleteAllCache failed', error);
        throw error;
    }
}
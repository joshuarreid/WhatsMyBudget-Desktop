/**
 * Query keys for local cache-related TanStack queries and mutations.
 * Follows canonical key patterns for cache safety and uniformity.
 */

/**
 * Top-level key for all localCache queries.
 * @constant
 * @type {Array}
 */
export const LOCAL_CACHE = ['localCache'];

/**
 * Canonical query/mutation keys for local cache.
 */
export const localCacheKeys = {
    all: LOCAL_CACHE,

    lists: () => [...localCacheKeys.all, 'lists'],

    list: (filters = {}) => [...localCacheKeys.lists(), { filters }],

    detail: (cacheKey) => [...localCacheKeys.all, 'detail', cacheKey],

    set: (cacheKey) => [...localCacheKeys.detail(cacheKey), 'set'],

    remove: (cacheKey) => [...localCacheKeys.detail(cacheKey), 'remove'],

    deleteAll: () => [...localCacheKeys.all, 'deleteAll'],
};
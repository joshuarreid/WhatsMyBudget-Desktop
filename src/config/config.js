/**
 * Minimal centralized config accessor with lightweight logging.
 * - Loads wmbservice-config.json via Electron IPC (window.electronAPI.readConfig).
 * - Exposes get(), setOverrides(), and helpers such as mapping default payment method to users/accounts.
 *
 * @module config
 */

/**
 * Standardized logger for config module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[config]', ...args),
    error: (...args) => console.error('[config]', ...args),
};

/**
 * Helper to safely get env variable from possible locations.
 * @function getEnv
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
function getEnv(key, fallback) {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
        return import.meta.env[key];
    }
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env[key] !== undefined) {
        return window.process.env[key];
    }
    return fallback;
}

/**
 * Parse and return JSON from env variable.
 * @function parseJSONEnv
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
function parseJSONEnv(key, fallback) {
    try {
        const val = getEnv(key);
        if (!val) return fallback;
        return JSON.parse(val);
    } catch {
        return fallback;
    }
}

/**
 * Parse and return string-array from env variable.
 * @function parseArrayEnv
 * @param {string} key
 * @param {any} fallback
 * @returns {string[]}
 */
function parseArrayEnv(key, fallback) {
    const val = getEnv(key);
    if (!val) return fallback;
    return val.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Central application config object, merged from env variables.
 * @constant
 */
const mergedConfig = {
    baseUrl: getEnv('REACT_APP_BASE_URL', getEnv('BASE_URL', '')),
    defaultHeaders: parseJSONEnv('REACT_APP_DEFAULT_HEADERS', parseJSONEnv('DEFAULT_HEADERS', {"Content-Type":"application/json"})),
    user1: {
        name: getEnv('REACT_APP_USER1_NAME', getEnv('USER1_NAME', '')),
        filter: getEnv('REACT_APP_USER1_FILTER', getEnv('USER1_FILTER', '')),
        paymentMethod: getEnv('REACT_APP_USER1_PAYMENT_METHOD', getEnv('USER1_PAYMENT_METHOD', '')),
    },
    user2: {
        name: getEnv('REACT_APP_USER2_NAME', getEnv('USER2_NAME', '')),
        filter: getEnv('REACT_APP_USER2_FILTER', getEnv('USER2_FILTER', '')),
        paymentMethod: getEnv('REACT_APP_USER2_PAYMENT_METHOD', getEnv('USER2_PAYMENT_METHOD', '')),
    },
    joint: {
        name: getEnv('REACT_APP_JOINT_NAME', getEnv('JOINT_NAME', '')),
        filter: getEnv('REACT_APP_JOINT_FILTER', getEnv('JOINT_FILTER', '')),
        paymentMethod: getEnv('REACT_APP_JOINT_PAYMENT_METHOD', getEnv('JOINT_PAYMENT_METHOD', '')),
    },
    criticalityOptions: parseArrayEnv('REACT_APP_CRITICALITY_OPTIONS', parseArrayEnv('CRITICALITY_OPTIONS', [])),
    statementPeriodPrevMonths: Number(getEnv('REACT_APP_STATEMENT_PERIOD_PREV_MONTHS', getEnv('STATEMENT_PERIOD_PREV_MONTHS', 3))),
    statementPeriodForwardMonths: Number(getEnv('REACT_APP_STATEMENT_PERIOD_FORWARD_MONTHS', getEnv('STATEMENT_PERIOD_FORWARD_MONTHS', 5))),
    statementPeriodCacheKey: getEnv('REACT_APP_STATEMENT_PERIOD_CACHE_KEY', getEnv('STATEMENT_PERIOD_CACHE_KEY', 'currentStatementPeriod')),
    categories: parseArrayEnv('REACT_APP_CATEGORIES', parseArrayEnv('CATEGORIES', [])),
    paymentMethods: parseArrayEnv('REACT_APP_PAYMENT_METHODS', parseArrayEnv('PAYMENT_METHODS', [])),
    accounts: parseArrayEnv('REACT_APP_ACCOUNTS', parseArrayEnv('ACCOUNTS', [])),
    defaultCriticalityMap: parseJSONEnv('REACT_APP_DEFAULT_CRITICALITY_MAP', parseJSONEnv('DEFAULT_CRITICALITY_MAP', {})),
    defaultPaymentMethodMap: parseJSONEnv('REACT_APP_DEFAULT_PAYMENT_METHOD_MAP', parseJSONEnv('DEFAULT_PAYMENT_METHOD_MAP', {})),
    /** @type {Record<string, string>} Bank for payment method mappings (e.g., {Sapphire: "Chase", Amex: "Amex"}) */
    bankPaymentMethodMap: parseJSONEnv('REACT_BANK_PAYMENT_METHOD_MAP', {}),
};

/**
 * Returns the value at the specified dot path in config with fallback.
 * @function get
 * @param {string} path
 * @param {any} [fallback]
 * @returns {any}
 */
export function get(path, fallback) {
    if (!path) return fallback;
    const parts = String(path).split('.');
    let cur = mergedConfig;
    for (const p of parts) {
        if (cur == null) return fallback;
        cur = cur[p];
    }
    if (cur === undefined) return fallback;
    try {
        logger.info('config.get', { path, valuePreview: typeof cur === 'object' ? { ...cur } : cur });
        if (path === 'baseUrl') {
            logger.info('config.get: baseUrl', { value: cur });
        }
    } catch {
        // ignore logging errors
    }
    return cur;
}

/**
 * Returns categories from config.
 * @function getCategories
 * @returns {string[]}
 */
export function getCategories() {
    try {
        const val = mergedConfig.categories;
        if (Array.isArray(val)) {
            const filtered = val.filter(v => typeof v === 'string').map(String);
            logger.info('getCategories', { count: filtered.length, sample: filtered.slice(0, 5) });
            return filtered;
        }
        logger.info('getCategories: missing or invalid; returning empty list');
        return [];
    } catch (err) {
        logger.error('getCategories failed', err);
        return [];
    }
}

/**
 * Returns payment methods from config.
 * @function getPaymentMethods
 * @returns {string[]}
 */
export function getPaymentMethods() {
    try {
        const val = mergedConfig.paymentMethods;
        if (Array.isArray(val)) {
            const filtered = val.filter(v => typeof v === 'string').map(String);
            logger.info('getPaymentMethods', { count: filtered.length, sample: filtered.slice(0, 5) });
            return filtered;
        }
        logger.info('getPaymentMethods: missing or invalid; returning empty list');
        return [];
    } catch (err) {
        logger.error('getPaymentMethods failed', err);
        return [];
    }
}

/**
 * Returns account names from config.
 * @function getAccounts
 * @returns {string[]}
 */
export function getAccounts() {
    try {
        const val = mergedConfig.accounts;
        if (Array.isArray(val)) {
            const filtered = val.filter(v => typeof v === 'string').map(String);
            logger.info('getAccounts', { count: filtered.length, sample: filtered.slice(0, 5) });
            return filtered;
        }
        logger.info('getAccounts: missing or invalid; returning empty list');
        return [];
    } catch (err) {
        logger.error('getAccounts failed', err);
        return [];
    }
}

/**
 * Returns criticality for a given category, or fallback.
 * @function getCriticalityForCategory
 * @param {string} [category]
 * @returns {string}
 */
export function getCriticalityForCategory(category) {
    try {
        const map = getCriticalityMap();
        if (!category) {
            const fallback = mergedConfig.criticalityOptions?.[0] ?? 'Essential';
            logger.info('getCriticalityForCategory: no category provided, using fallback', { fallback });
            return fallback;
        }

        if (map[category]) {
            logger.info('getCriticalityForCategory: exact match', { category, criticality: map[category] });
            return map[category];
        }

        const lower = category.toLowerCase();
        for (const [k, v] of Object.entries(map)) {
            if (k.toLowerCase() === lower) {
                logger.info('getCriticalityForCategory: case-insensitive match', { category, keyMatched: k, criticality: v });
                return v;
            }
        }

        const fallback = mergedConfig.criticalityOptions?.[0] ?? 'Essential';
        logger.info('getCriticalityForCategory: not found, using fallback', { category, fallback });
        return fallback;
    } catch (err) {
        logger.error('getCriticalityForCategory failed', err);
        return mergedConfig.criticalityOptions?.[0] ?? 'Essential';
    }
}

/**
 * Returns the criticality map from config.
 * @function getCriticalityMap
 * @returns {Record<string, string>}
 */
export function getCriticalityMap() {
    try {
        const val = mergedConfig.defaultCriticalityMap;
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const out = {};
            for (const [k, v] of Object.entries(val)) {
                if (typeof v === 'string') out[k] = v;
            }
            logger.info('getCriticalityMap', { count: Object.keys(out).length, sample: Object.entries(out).slice(0, 5) });
            return out;
        }
        logger.info('getCriticalityMap: missing or invalid; returning empty map');
        return {};
    } catch (err) {
        logger.error('getCriticalityMap failed', err);
        return {};
    }
}

/**
 * Returns the default payment method map from config.
 * @function getDefaultPaymentMethodMap
 * @returns {Record<string, string>}
 */
export function getDefaultPaymentMethodMap() {
    try {
        const val = mergedConfig.defaultPaymentMethodMap;
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const out = {};
            for (const [k, v] of Object.entries(val)) {
                if (typeof v === 'string') out[k] = v;
            }
            logger.info('getDefaultPaymentMethodMap', { count: Object.keys(out).length, sample: Object.entries(out).slice(0, 5) });
            return out;
        }
        logger.info('getDefaultPaymentMethodMap: missing or invalid; returning empty map');
        return {};
    } catch (err) {
        logger.error('getDefaultPaymentMethodMap failed', err);
        return {};
    }
}

/**
 * Returns a mapping of payment method => bank.
 * @function getBankPaymentMethodMap
 * @returns {Record<string, string>}
 */
export function getBankPaymentMethodMap() {
    try {
        const val = mergedConfig.bankPaymentMethodMap;
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            logger.info('getBankPaymentMethodMap', { map: val });
            return val;
        }
        logger.info('getBankPaymentMethodMap: missing or invalid; returning empty map');
        return {};
    } catch (err) {
        logger.error('getBankPaymentMethodMap failed', err);
        return {};
    }
}

/**
 * Given a payment method, return the most likely default bank (from config mapping).
 * @function getBankForPaymentMethod
 * @param {string} paymentMethod
 * @returns {string|undefined}
 */
export function getBankForPaymentMethod(paymentMethod) {
    try {
        if (!paymentMethod) return undefined;
        const map = getBankPaymentMethodMap();
        // exact match
        if (map[paymentMethod]) return map[paymentMethod];
        // case-insensitive match
        const key = Object.keys(map).find(
            (k) => k.toLowerCase() === paymentMethod.toLowerCase()
        );
        if (key) return map[key];
        logger.info('getBankForPaymentMethod: no mapping found for', paymentMethod);
        return undefined;
    } catch (err) {
        logger.error('getBankForPaymentMethod failed', err);
        return undefined;
    }
}

/**
 * Resolves a given account identifier (e.g., "josh", "anna", "joint") to a user key in config.
 * @function resolveAccountToUserKey
 * @param {string} [account]
 * @returns {string|undefined}
 */
function resolveAccountToUserKey(account) {
    if (!account) return undefined;
    try {
        const acctLower = String(account).toLowerCase();
        const userKeys = ['user1', 'user2', 'joint'];
        for (const key of userKeys) {
            const userObj = mergedConfig[key];
            if (!userObj || typeof userObj !== 'object') continue;
            const filter = String(userObj.filter ?? '').toLowerCase();
            const name = String(userObj.name ?? '').toLowerCase();
            if (filter === acctLower || name === acctLower) {
                logger.info('resolveAccountToUserKey: matched account to userKey', { account, userKey: key });
                return key;
            }
        }
        logger.info('resolveAccountToUserKey: no userKey match found for account', { account });
        return undefined;
    } catch (err) {
        logger.error('resolveAccountToUserKey failed', err);
        return undefined;
    }
}

/**
 * Given an account identifier, return the default payment method for that account (user-mapping, custom map, or fallback).
 * @function getDefaultPaymentMethodForAccount
 * @param {string} [account]
 * @returns {string|undefined}
 */
export function getDefaultPaymentMethodForAccount(account) {
    try {
        if (!account) {
            const fallback = getPaymentMethods()[0];
            logger.info('getDefaultPaymentMethodForAccount: no account provided, using fallback', { fallback });
            return fallback;
        }

        // 1) resolve to user key and check user.paymentMethod
        const userKey = resolveAccountToUserKey(account);
        if (userKey) {
            const userObj = mergedConfig[userKey];
            const pm = userObj && typeof userObj === 'object' ? userObj.paymentMethod : undefined;
            if (pm && typeof pm === 'string') {
                logger.info('getDefaultPaymentMethodForAccount: found paymentMethod on user object', { account, userKey, paymentMethod: pm });
                return pm;
            }
        }

        // 2) fallback to defaultPaymentMethodMap
        const map = getDefaultPaymentMethodMap();
        if (map[account]) {
            logger.info('getDefaultPaymentMethodForAccount: found exact match in defaultPaymentMethodMap', { account, paymentMethod: map[account] });
            return map[account];
        }
        const acctLower = account.toLowerCase();
        for (const [k, v] of Object.entries(map)) {
            if (k.toLowerCase() === acctLower) {
                logger.info('getDefaultPaymentMethodForAccount: case-insensitive match in map', { account, keyMatched: k, paymentMethod: v });
                return v;
            }
        }

        // 3) fallback to first payment method
        const fallback = getPaymentMethods()[0];
        logger.info('getDefaultPaymentMethodForAccount: not found, using fallback', { account, fallback });
        return fallback;
    } catch (err) {
        logger.error('getDefaultPaymentMethodForAccount failed', err);
        return getPaymentMethods()[0];
    }
}

export default mergedConfig;

// Diagnostics for debug startup
logger.info('REACT_APP env dump', Object.keys(process.env || {}).filter(k => k.startsWith('REACT_APP_')).reduce((acc, k) => { acc[k] = process.env[k]; return acc; }, {}));
logger.info('config.js: baseUrl at startup', { baseUrl: mergedConfig.baseUrl });
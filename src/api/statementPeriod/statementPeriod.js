import StatementPeriodApiClient from './statementPeriodApiClient.js';

/**
 * Singleton instance of StatementPeriodApiClient.
 * Used for all statement period API requests.
 * @constant
 * @type {StatementPeriodApiClient}
 */
const apiClient = new StatementPeriodApiClient();

/**
 * Logger for statementPeriod module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[statementPeriod]', ...args),
    error: (...args) => console.error('[statementPeriod]', ...args),
};

/**
 * Generates a list of month-year options surrounding the anchor date.
 *
 * @function generateOptions
 * @param {Object} [params={}]
 * @param {Date} [params.anchor=new Date()] - Anchor date for the options.
 * @param {number} [params.prev=1] - Number of months before anchor to include.
 * @param {number} [params.forward=5] - Number of months after anchor to include.
 * @returns {Array<{label: string, value: string, iso: string, offset: number}>} Array of statement period options.
 */
export function generateOptions({ anchor = new Date(), prev = 1, forward = 5 } = {}) {
    try {
        const options = [];
        for (let i = -prev; i <= forward; i += 1) {
            const d = new Date(anchor.getTime());
            d.setMonth(d.getMonth() + i, 1);
            const monthName = d.toLocaleString('en-US', { month: 'long' }).toUpperCase();
            const year = d.getFullYear();
            const label = monthName;
            const value = `${monthName}${year}`;
            const iso = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
            options.push({ label, value, iso, offset: i });
        }
        logger.info('generateOptions produced', { count: options.length, anchor: anchor.toISOString() });
        return options;
    } catch (err) {
        logger.error('generateOptions failed', err);
        return [];
    }
}

/**
 * Finds the currently anchored option (offset === 0), or defaults to the middle option.
 *
 * @function getCurrentOption
 * @param {Array} options - Options array from generateOptions.
 * @returns {Object|null} Current option object, or null if not found.
 */
export function getCurrentOption(options = []) {
    if (!Array.isArray(options) || options.length === 0) return null;
    return options.find((o) => o.offset === 0) || options[Math.floor(options.length / 2)];
}

/**
 * Fetches all statement periods from the server.
 *
 * @async
 * @function getAllStatementPeriods
 * @returns {Promise<Array<Object>>} Array of statement period objects.
 * @throws {Error} If the request fails.
 */
export async function getAllStatementPeriods() {
    logger.info('getAllStatementPeriods called');
    try {
        const response = await apiClient.getAllStatementPeriods();
        logger.info('getAllStatementPeriods success', { count: Array.isArray(response?.data) ? response.data.length : 0 });
        return response?.data || [];
    } catch (error) {
        logger.error('getAllStatementPeriods failed', error);
        throw error;
    }
}
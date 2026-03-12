import ApiClient from '../ApiClient.js';

/**
 * Logger for PaymentSummaryApiClient.
 * @constant
 * @type {{info: Function, error: Function}}
 */
const logger = {
    info: (...args) => console.log('[PaymentSummaryApiClient]', ...args),
    error: (...args) => console.error('[PaymentSummaryApiClient]', ...args),
};

/**
 * PaymentSummaryApiClient
 * - Specialized API client for /api/payment-summary endpoints.
 * - Implements fetching payment summaries for accounts/periods.
 *
 * @class
 * @extends ApiClient
 */
export default class PaymentSummaryApiClient extends ApiClient {
    /**
     * Creates an instance of PaymentSummaryApiClient.
     * @param {Object} [options={}]
     * @param {string} [options.baseURL] - Optional override for API root.
     * @param {number} [options.timeout=10000] - Request timeout, ms.
     */
    constructor({ baseURL, timeout = 10000 } = {}) {
        super({ baseURL, timeout, apiPath: '/api/payment-summary' });
        logger.info('PaymentSummaryApiClient initialized');
    }

    /**
     * Fetches payment summary for given accounts and statementPeriod.
     * @async
     * @param {Array<string>} accounts - Account identifiers.
     * @param {string} statementPeriod - Statement period.
     * @param {string} [transactionId] - Optional X-Transaction-ID for tracing.
     * @returns {Promise<Object[]>} Array of PaymentSummaryResponse objects.
     * @throws {Error}
     */
    async getPaymentSummary(accounts, statementPeriod, transactionId) {
        if (!Array.isArray(accounts) || accounts.length === 0) {
            throw new Error('Accounts array required.');
        }
        if (!statementPeriod || typeof statementPeriod !== 'string') {
            throw new Error('statementPeriod required.');
        }
        const params = {
            accounts: accounts.join(','),
            statementPeriod,
        };
        const headers = {};
        if (transactionId) {
            headers['X-Transaction-ID'] = transactionId;
        }
        logger.info('getPaymentSummary called', { accounts, statementPeriod, transactionId });
        return this.get('/', params, { headers });
    }
}
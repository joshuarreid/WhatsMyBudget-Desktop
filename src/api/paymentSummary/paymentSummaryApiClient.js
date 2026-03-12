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
 * Specialized API client for /api/payment-summary endpoints.
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
}
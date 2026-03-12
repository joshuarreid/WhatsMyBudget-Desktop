import PaymentSummaryApiClient from './paymentSummaryApiClient.js';

/**
 * Singleton instance of PaymentSummaryApiClient.
 * Ensures all payment summary API requests use centralized client.
 * @constant
 * @type {PaymentSummaryApiClient}
 */
const apiClient = new PaymentSummaryApiClient();

/**
 * Logger for paymentSummary module.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[paymentSummary]', ...args),
    error: (...args) => console.error('[paymentSummary]', ...args),
};

/**
 * Fetches payment summary for the given accounts and statement period.
 * Calls /api/payment-summary endpoint.
 * @async
 * @function getPaymentSummary
 * @param {Object} params
 * @param {Array<string>} params.accounts - List of account identifiers.
 * @param {string} params.statementPeriod - Required statement period.
 * @param {string} [params.transactionId] - Optional transaction ID for tracing/logging.
 * @returns {Promise<Array<Object>>} Array of PaymentSummaryResponse objects.
 * @throws {Error} If the request fails or parameters are missing.
 */
export async function getPaymentSummary({ accounts, statementPeriod, transactionId }) {
    logger.info('getPaymentSummary called', { accounts, statementPeriod, transactionId });
    try {
        const response = await apiClient.getPaymentSummary(accounts, statementPeriod, transactionId);
        logger.info('getPaymentSummary success', {
            count: Array.isArray(response?.data) ? response.data.length : 0,
            sample: Array.isArray(response?.data) ? response.data[0] : response.data,
        });
        return response?.data || [];
    } catch (error) {
        logger.error('getPaymentSummary failed', error);
        throw error;
    }
}
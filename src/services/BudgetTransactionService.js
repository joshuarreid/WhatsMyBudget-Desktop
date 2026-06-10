/**
 * budgetTransactionService - Service for backend REST API calls (Spring Boot), using a shared apiClient.
 * Uses config.baseUrl (API root). All endpoints use explicit resource paths like /api/transactions.
 * Robust logging and X-Transaction-ID handled by apiClient.
 */

const logger = {
    info: (...args) => console.log('[BudgetTransactionService]', ...args),
    error: (...args) => console.error('[BudgetTransactionService]', ...args),
};

import { getApiClient } from '../lib/apiClient'; // centralized axios instance

const RESOURCE = '/api/v2/transactions';

const CRITICALITY_ID_BY_NAME = {
    essential: 1,
    nonessential: 2,
    planned: 3,
};

function toWritePayload(transaction = {}) {
    const payload = { ...(transaction || {}) };
    if ((payload.criticality_id == null || payload.criticality_id === '') && payload.criticality != null) {
        const mappedId = CRITICALITY_ID_BY_NAME[String(payload.criticality).trim().toLowerCase()];
        if (mappedId != null) payload.criticality_id = mappedId;
    }
    if (payload.criticality_id != null && payload.criticality_id !== '') {
        payload.criticality_id = Number(payload.criticality_id);
    }
    delete payload.criticality;
    return payload;
}

const budgetTransactionService = {
    /**
     * GET /api/transactions (list, with optional filters)
     * @param {Object} filters - { statementPeriod, account, category, paymentMethod, criticality }
     * @returns {Object} BudgetTransactionList { transactions, count, total }
     */
    async getTransactions(filters = {}) {
        logger.info('getTransactions entry', { filters });
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.get(RESOURCE, { params: filters });
            logger.info('getTransactions success', {
                count: response.data && typeof response.data.count === 'number' ? response.data.count : 0,
                total: response.data && response.data.total ? response.data.total : 0,
            });
            return response.data;
        } catch (err) {
            logger.error('getTransactions error', err);
            throw err;
        }
    },

    /**
     * GET /api/transactions/{id}
     */
    async getTransaction(id) {
        logger.info('getTransaction entry', { id });
        if (!id) throw new Error('Transaction ID required');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.get(`${RESOURCE}/${encodeURIComponent(id)}`);
            logger.info('getTransaction success', { transaction: response.data });
            return response.data;
        } catch (err) {
            logger.error('getTransaction error', err);
            throw err;
        }
    },

    /**
     * POST /api/transactions
     */
    async createTransaction(transaction) {
        logger.info('createTransaction entry', { transaction });
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.post(RESOURCE, toWritePayload(transaction));
            logger.info('createTransaction success', { created: response.data });
            return response.data;
        } catch (err) {
            logger.error('createTransaction error', err);
            throw err;
        }
    },

    /**
     * PUT /api/transactions/{id}
     */
    async updateTransaction(id, transaction) {
        logger.info('updateTransaction entry', { id, transaction });
        if (!id) throw new Error('Transaction ID required');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.put(`${RESOURCE}/${encodeURIComponent(id)}`, toWritePayload(transaction));
            logger.info('updateTransaction success', { updated: response.data });
            return response.data;
        } catch (err) {
            logger.error('updateTransaction error', err);
            throw err;
        }
    },

    /**
     * DELETE /api/transactions/{id}
     */
    async deleteTransaction(id) {
        logger.info('deleteTransaction entry', { id });
        if (!id) throw new Error('Transaction ID required');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.delete(`${RESOURCE}/${encodeURIComponent(id)}`);
            logger.info('deleteTransaction success', { status: response.status });
            return response.data;
        } catch (err) {
            logger.error('deleteTransaction error', err);
            throw err;
        }
    },

    /**
     * DELETE /api/transactions (delete all)
     */
    async deleteAllTransactions() {
        logger.info('deleteAllTransactions entry');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.delete(RESOURCE);
            logger.info('deleteAllTransactions success', { deletedCount: response.data?.deletedCount });
            return response.data;
        } catch (err) {
            logger.error('deleteAllTransactions error', err);
            throw err;
        }
    },

    /**
     * POST /api/transactions/upload (CSV upload)
     * @param {File|Blob} file
     * @param {String} statementPeriod
     */
    async uploadTransactions(file, statementPeriod) {
        logger.info('uploadTransactions entry', { fileName: file?.name, statementPeriod });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('statementPeriod', statementPeriod);
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.post(`${RESOURCE}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            logger.info('uploadTransactions success', { result: response.data });
            return response.data;
        } catch (err) {
            logger.error('uploadTransactions error', err);
            throw err;
        }
    },

    /**
     * GET /api/transactions/account
     */
    async getTransactionsForAccount({ account, statementPeriod, category, criticality, criticality_id, paymentMethod }) {
        logger.info('getTransactionsForAccount entry', { account, statementPeriod, category, criticality, criticality_id, paymentMethod });
        if (!account) throw new Error('Account is required');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.get(`${RESOURCE}/account`, {
                params: {
                    account,
                    statementPeriod,
                    category,
                    criticality,
                    criticality_id,
                    paymentMethod,
                },
            });
            logger.info('getTransactionsForAccount success', {
                count: response.data && typeof response.data.count === 'number' ? response.data.count : 0,
                total: response.data && response.data.total ? response.data.total : 0,
            });
            return response.data;
        } catch (err) {
            logger.error('getTransactionsForAccount error', err);
            throw err;
        }
    },

    /**
     * POST /api/transactions/upload-statement
     * Uploads a credit card statement CSV file for bulk import.
     * @param {File|Blob} file - File to upload (CSV)
     * @param {string} bank - The originating bank (e.g., 'CHASE', 'AMEX')
     * @param {string} statementPeriod - Statement period for associating the transactions
     * @param {string} account - The account associated with the uploaded transactions
     * @param {string} paymentMethod - The payment method associated with the uploaded transactions
     * @returns {Promise<Object>} - { insertedCount, duplicateCount, errors }
     */
    async uploadCreditCardStatement({ file, bank, statementPeriod, account, paymentMethod }) {
        logger.info('uploadCreditCardStatement entry', {
            fileName: file?.name,
            bank,
            statementPeriod,
            account,
            paymentMethod
        });

        // Robust input validation with clear logs
        if (!file || !bank || !statementPeriod || !account || !paymentMethod) {
            logger.error('Missing required params for uploadCreditCardStatement', {
                hasFile: !!file, bank, statementPeriod, account, paymentMethod
            });
            throw new Error('All parameters (file, bank, statementPeriod, account, paymentMethod) are required');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bank', bank);
        formData.append('statementPeriod', statementPeriod);
        formData.append('account', account);
        formData.append('paymentMethod', paymentMethod);

        try {
            const apiClient = await getApiClient();

            // Set timeout to 5 minutes (300,000 ms) for long-running uploads
            const UPLOAD_TIMEOUT_MS = 300000;

            // Ensure correct request and timeout for file uploads
            logger.info('Initiating statement upload via apiClient', {
                url: `${RESOURCE}/upload-statement`,
                timeoutMs: UPLOAD_TIMEOUT_MS,
                fileName: file?.name
            });

            const response = await apiClient.post(
                `${RESOURCE}/upload-statement`,
                formData,
                {
                    headers: { 'Content-Type': undefined },
                    timeout: UPLOAD_TIMEOUT_MS
                }
            );

            logger.info('uploadCreditCardStatement success', { result: response.data });

            // Handle any post-upload UI reset in the calling component, e.g.:
            // modal should close, file input should be reset/cleared, state reset
            return response.data;
        } catch (err) {
            // Axios timeout errors are coded as ECONNABORTED
            if (err.code === 'ECONNABORTED') {
                logger.error('uploadCreditCardStatement timeout', {
                    message: err.message,
                    timeoutMs: err.config?.timeout,
                    fileName: file?.name
                });
                throw new Error("Upload timed out. Please try uploading a smaller file or check your connection.");
            }
            logger.error('uploadCreditCardStatement error', err);
            throw err;
        }
    },

    /**
     * GET /api/transactions/account/budget
     * Fetches only budget transactions for a given account and filters.
     * @async
     * @function getBudgetTransactionsForAccount
     * @param {Object} filters - { account, statementPeriod, category, criticality, paymentMethod }
     * @returns {Object} BudgetTransactionList { transactions, count, total }
     * @throws {Error} If the request fails.
     */
    async getBudgetTransactionsForAccount({ account, statementPeriod, category, criticality, criticality_id, paymentMethod }) {
        logger.info('getBudgetTransactionsForAccount entry', { account, statementPeriod, category, criticality, criticality_id, paymentMethod });
        if (!account) throw new Error('Account is required');
        try {
            const apiClient = await getApiClient();
            const response = await apiClient.get(`${RESOURCE}/account/budget`, {
                params: {
                    account,
                    statementPeriod,
                    category,
                    criticality,
                    criticality_id,
                    paymentMethod,
                },
            });
            logger.info('getBudgetTransactionsForAccount success', {
                count: response.data && typeof response.data.count === 'number' ? response.data.count : 0,
                total: response.data && response.data.total ? response.data.total : 0,
            });
            return response.data;
        } catch (err) {
            logger.error('getBudgetTransactionsForAccount error', err);
            throw err;
        }
    }
};

export default budgetTransactionService;
import { useEffect, useState, useCallback, useRef } from 'react';
import budgetTransactionService from '../services/BudgetTransactionService';
import { subscribe as subscribeTransactionEvents } from '../services/TransactionEvents';
import { normalizeCriticalityPair } from '../features/transactionTable/utils/constants';

/**
 * useTransactions - fetches transactions for given filters.
 * Returns { data, loading, error, refetch }.
 */

export default function useTransactions(filters) {
            const normalizeListResponse = useCallback((result) => {
                if (!result || !Array.isArray(result.transactions)) return result;
                return {
                    ...result,
                    transactions: result.transactions.map((tx) => ({ ...(tx || {}), ...normalizeCriticalityPair(tx || {}) })),
                };
            }, []);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchData = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);

        try {
            console.log("[useTransactions] fetchData called with filters", currentFilters);
            const transactions = await budgetTransactionService.getTransactions(currentFilters);
            setData(normalizeListResponse(transactions));
        } catch (err) {
            console.error("[useTransactions] Error fetching transactions", err);
            setError('Error: ' + (err && err.message ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    }, [normalizeListResponse]);

    useEffect(() => {
        fetchData(filters);
    }, [filters, fetchData]);

    // Subscribe to transaction change events so we refetch when other parts of the app publish changes
    useEffect(() => {
        const unsub = subscribeTransactionEvents(() => {
            try {
                fetchData(filters);
            } catch (err) {
                console.error('[useTransactions] refetch on event failed', err);
            }
        });
        return unsub;
    }, [fetchData, filters]);

    const refetch = useCallback(() => fetchData(filters), [fetchData, filters]);
    return { data, loading, error, refetch };
}

/**
 * useBudgetAndProjectedTransactionsForAccount - fetches transactions for a specific account (and optional filters).
 * Returns { personalTransactions, jointTransactions, personalTotal, jointTotal, total, loading, error, refetch }.
 * @param {Object} filters - Must include account.
 */
export function useBudgetAndProjectedTransactionsForAccount(filters) {
            const normalizeAccountSplit = useCallback((result = {}) => {
                const normalizeList = (list = {}) => ({
                    ...list,
                    transactions: Array.isArray(list.transactions)
                        ? list.transactions.map((tx) => ({ ...(tx || {}), ...normalizeCriticalityPair(tx || {}) }))
                        : [],
                });

                return {
                    personalTransactions: normalizeList(result.personalTransactions || { transactions: [], count: 0, total: 0 }),
                    jointTransactions: normalizeList(result.jointTransactions || { transactions: [], count: 0, total: 0 }),
                    personalTotal: result.personalTotal || 0,
                    jointTotal: result.jointTotal || 0,
                    total: result.total || 0,
                };
            }, []);

    const [data, setData] = useState({
        personalTransactions: { transactions: [], count: 0, total: 0 },
        jointTransactions: { transactions: [], count: 0, total: 0 },
        personalTotal: 0,
        jointTotal: 0,
        total: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track latest requested statementPeriod
    const latestPeriodRef = useRef(filters?.statementPeriod);

    const fetchData = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        latestPeriodRef.current = currentFilters?.statementPeriod;
        try {
            console.log("[useTransactionsForAccount] fetchData called with filters", currentFilters);
            const result = await budgetTransactionService.getTransactionsForAccount(currentFilters);
            // Only set data if the period matches the latest
            if (currentFilters?.statementPeriod === latestPeriodRef.current) {
                setData(normalizeAccountSplit(result));
            } else {
                // Ignore stale response
                console.log("[useTransactionsForAccount] Ignored stale data for period", currentFilters?.statementPeriod);
            }
        } catch (err) {
            console.error("[useTransactionsForAccount] Error fetching transactions", err);
            setError('Error: ' + (err && err.message ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    }, [normalizeAccountSplit]);

    useEffect(() => {
        fetchData(filters);
    }, [filters, fetchData]);

    // Subscribe to transaction change events so account-specific consumers refetch when transactions change
    useEffect(() => {
        const unsub = subscribeTransactionEvents(() => {
            try {
                fetchData(filters);
            } catch (err) {
                console.error('[useTransactionsForAccount] refetch on event failed', err);
            }
        });
        return unsub;
    }, [fetchData, filters]);

    const refetch = useCallback(() => fetchData(filters), [fetchData, filters]);
    return { ...data, loading, error, refetch };
}

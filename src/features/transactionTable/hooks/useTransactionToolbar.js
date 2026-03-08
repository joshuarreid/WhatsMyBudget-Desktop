/**
 * useTransactionToolbar.js
 *
 * Hook that encapsulates toolbar logic for TransactionTable feature.
 * Responsibilities:
 *  - Orchestrate actions: add transaction, add projection, import file, delete selected.
 *  - Manages loading, file input interactions, selection count, and total display.
 *  - Handles the file import flow with a confirmation modal for account, statement period, and bank.
 *  - Standardizes logging for traceability.
 *
 * @module useTransactionToolbar
 */

import { useCallback, useState } from 'react';
import budgetTransactionService from '../../../services/BudgetTransactionService';

/**
 * Logger for useTransactionToolbar.
 */
const logger = {
    info: (...args) => console.log('[useTransactionToolbar]', ...args),
    error: (...args) => console.error('[useTransactionToolbar]', ...args),
};

/**
 * useTransactionToolbar
 * Encapsulates toolbar logic for transaction table actions and file import flow.
 *
 * @function useTransactionToolbar
 * @param {Object} params - Parameters for toolbar actions and state.
 * @param {Function} params.onAdd - Handler for adding a budget transaction.
 * @param {Function} params.onAddProjection - Handler for adding a projected transaction.
 * @param {Function} params.onImport - Handler for import completion (optional, called with result).
 * @param {Function} params.onDelete - Handler for deleting selected transactions.
 * @param {number} params.selectedCount - Number of selected items.
 * @param {Object} params.fileInputRef - Ref for hidden file input.
 * @param {Function} params.onFileChange - Handler for file change event (optional).
 * @param {boolean} params.loading - Flag for loading state.
 * @param {string|number} params.total - Formatted total string for display.
 * @param {Function} params.getCurrentAccount - Returns current account for autopopulation.
 * @param {Function} params.getCurrentStatementPeriod - Returns current statement period for autopopulation.
 * @param {Function} params.getCurrentBank - Returns current bank for autopopulation.
 * @returns {Object} API surface for TransactionTableToolbar
 */
export function useTransactionToolbar({
                                          onAdd,
                                          onAddProjection,
                                          onImport,
                                          onDelete,
                                          selectedCount,
                                          fileInputRef,
                                          onFileChange,
                                          loading = false,
                                          total,
                                          getCurrentAccount,
                                          getCurrentStatementPeriod,
                                          getCurrentBank,
                                      }) {
    // State for file import modal
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    logger.info('useTransactionToolbar hook initialized', {
        selectedCount,
        loading,
        total,
    });

    /**
     * Handles add transaction click.
     */
    const handleAdd = useCallback(() => {
        logger.info('Add Transaction clicked');
        onAdd?.();
    }, [onAdd]);

    /**
     * Handles add projection click.
     */
    const handleAddProjection = useCallback(() => {
        logger.info('Add Projection clicked');
        onAddProjection?.();
    }, [onAddProjection]);

    /**
     * Handles file import trigger (opens picker).
     */
    const handleImport = useCallback(() => {
        logger.info('Import Transactions clicked (open file picker)');
        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset for repeat selection of same file
            fileInputRef.current.click();
        }
    }, [fileInputRef]);

    /**
     * Handles file input change: opens modal for field confirmation.
     */
    const handleFileChange = useCallback(
        (event) => {
            const file = event.target?.files?.[0];
            logger.info('File input changed', { file: file?.name });
            if (file) {
                setPendingFile(file);
                setImportModalOpen(true);
            }
            if (onFileChange) onFileChange(event);
        },
        [onFileChange]
    );

    /**
     * Opens the hidden file picker input.
     */
    const openFilePicker = useCallback(() => {
        handleImport();
    }, [handleImport]);

    /**
     * Handles modal close: resets file and closes modal.
     */
    const handleModalClose = useCallback(() => {
        logger.info('Import Modal closed');
        setImportModalOpen(false);
        setPendingFile(null);
    }, []);

    /**
     * Handles modal confirm: sends file and parameters to backend.
     */
    const handleModalConfirm = useCallback(
        async ({ account, statementPeriod, bank, paymentMethod, file }) => {
            logger.info('Import Modal confirmed', {
                account, statementPeriod, bank, paymentMethod, file: file?.name,
            });

            if (!account || !statementPeriod || !bank || !file) {
                logger.error('Import parameters missing', {
                    account, statementPeriod, bank, file,
                });
                alert("All fields and a file are required for import.");
                return;
            }

            try {
                const result = await budgetTransactionService.uploadCreditCardStatement({
                    file,
                    bank,
                    statementPeriod,
                    account,
                    paymentMethod
                });
                logger.info('Import successful', result);
                if (onImport) onImport(result);
            } catch (err) {
                logger.error('Import error', err);
                alert("Import failed: " + (err.message || String(err)));
            } finally {
                handleModalClose();
            }
        },
        [onImport, handleModalClose]
    );

    /**
     * Handles delete selected click.
     */
    const handleDelete = useCallback(() => {
        logger.info('Delete Selected clicked', { selectedCount });
        onDelete?.();
    }, [onDelete, selectedCount]);

    // Prefill account/period/bank from context functions (match project convention)
    const initialAccount = getCurrentAccount?.() || "";
    const initialPeriod = getCurrentStatementPeriod?.() || "";
    const initialBank = getCurrentBank?.() || "";

    return {
        handleAdd,
        handleAddProjection,
        handleImport,
        handleDelete,
        handleFileChange,
        openFilePicker,
        selectedCount,
        loading,
        total,
        fileInputRef,
        // Modal
        importModalOpen,
        pendingFile,
        handleModalClose,
        handleModalConfirm,
        initialAccount,
        initialPeriod,
        initialBank,
    };
}

export default useTransactionToolbar;
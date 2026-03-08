import { useCallback, useState } from 'react';
import budgetTransactionService from "../../../services/BudgetTransactionService";

const logger = {
    info: (...args) => console.log('[useTransactionToolbar]', ...args),
    error: (...args) => console.error('[useTransactionToolbar]', ...args),
};

/**
 * useTransactionToolbar
 * Provides toolbar logic for TransactionTable.
 * Populates the import modal with the current account and statement period from context.
 *
 * @param {Object} params
 * @param {string} params.currentAccount - Current account visible in the table/filter.
 * @param {string} params.currentStatementPeriod - Current statement period from context.
 * @param {string} params.currentBank - Current bank (optional).
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
                                          currentAccount = "",
                                          currentStatementPeriod = "",
                                          currentBank = "",
                                      }) {
    // Modal context (object with current info for this import)
    const [importModalContext, setImportModalContext] = useState(null);

    logger.info('useTransactionToolbar hook initialized', {
        selectedCount,
        loading,
        total,
        currentAccount,
        currentStatementPeriod,
        currentBank,
    });

    const handleAdd = useCallback(() => {
        logger.info('Add Transaction clicked');
        onAdd?.();
    }, [onAdd]);

    const handleAddProjection = useCallback(() => {
        logger.info('Add Projection clicked');
        onAddProjection?.();
    }, [onAddProjection]);

    const handleImport = useCallback(() => {
        logger.info('Import Transactions clicked (open file picker)');
        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    }, [fileInputRef]);

    /**
     * When the user selects a file, capture the *latest* account/period context.
     */
    const handleFileChange = useCallback(
        (event) => {
            const file = event.target?.files?.[0];
            logger.info('File input changed', { file: file?.name });
            if (file) {
                logger.info('Populating import modal context', {
                    currentAccount,
                    currentStatementPeriod,
                    currentBank,
                    fileName: file.name
                });
                setImportModalContext({
                    initialAccount: currentAccount,
                    initialPeriod: currentStatementPeriod,
                    initialBank: currentBank,
                    file,
                });
            }
            if (onFileChange) onFileChange(event);
        },
        [onFileChange, currentAccount, currentStatementPeriod, currentBank]
    );

    const openFilePicker = useCallback(() => {
        handleImport();
    }, [handleImport]);

    const handleModalClose = useCallback(() => {
        logger.info('Import Modal closed');
        setImportModalContext(null);
    }, []);

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

    const handleDelete = useCallback(() => {
        logger.info('Delete Selected clicked', { selectedCount });
        onDelete?.();
    }, [onDelete, selectedCount]);

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
        // Expose modal context as a single object (null if closed)
        importModalOpen: !!importModalContext,
        handleModalClose,
        handleModalConfirm,
        initialAccount: importModalContext ? importModalContext.initialAccount : "",
        initialPeriod: importModalContext ? importModalContext.initialPeriod : "",
        initialBank: importModalContext ? importModalContext.initialBank : "",
        pendingFile: importModalContext ? importModalContext.file : null,
    };
}

export default useTransactionToolbar;
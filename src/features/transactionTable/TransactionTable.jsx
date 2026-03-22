/**
 * TransactionTable
 * - Main table UI for displaying, editing, managing, and filtering transactions.
 * - UI wiring: payment method filter checkboxes, rows washed out when unchecked.
 * - Uses useTransactionTable for all business/data logic.
 *
 * @module TransactionTable
 * @param {Object} props
 * @param {Object} props.filters - Account and other filter criteria
 * @returns {JSX.Element}
 */
import React from 'react';
import { useTransactionTable } from './hooks/useTransactionTable';
import { useStatementPeriodContext } from '../../context/StatementPeriodProvider';
import { getPaymentMethods } from '../../config/config.js';
import './TransactionTable.css';
import BalanceWidget from './components/BalanceWidget/BalanceWidget';
import TransactionTableToolbar from './components/TransactionTableToolbar/TransactionTableToolbar';
import TransactionTableHeader from './components/TransactionTableHeader/TransactionTableHeader';
import TransactionTableRow from './components/TransactionTableRow/TransactionTableRow';

/**
 * Logger for TransactionTable.
 * @constant
 */
const logger = {
    info: (...args) => console.log('[TransactionTable]', ...args),
    error: (...args) => console.error('[TransactionTable]', ...args),
};

/**
 * @constant
 * @type {Intl.NumberFormat}
 * Formats USD amounts for display.
 */
const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

/**
 * TransactionTable implementation.
 * @param {Object} props
 * @returns {JSX.Element}
 */
export default function TransactionTable(props) {
    logger.info('TransactionTable initialized', { props });

    const { isLoaded: isStatementPeriodLoaded, statementPeriod } = useStatementPeriodContext();

    const filters = props && Object.keys(props).length > 0 ? (props.filters ?? props) : undefined;

    const {
        localTx,
        loading,
        error,
        selectedIds,
        editing,
        editValueRef,
        fileInputRef,
        total,
        jointBalance,
        personalBalance,
        projectedTotal,
        isAllSelected,
        toggleSelect,
        toggleSelectAll,
        handleCellDoubleClick,
        handleEditKey,
        handleSaveEdit,
        handleSaveRow,
        handleCancelRow,
        toInputDate,
        toggleCleared,
        setEditing,
        savingIds,
        saveErrors,
        startEditingRow,
        toolbar,
        openFilePicker,
    } = useTransactionTable(filters);

    /**
     * Controls the list of payment methods (for filters) and which are active.
     * By default, all are active. When unchecked in toolbar, rows with that method are washed out.
     */
    const allPaymentMethods = React.useMemo(() => {
        // Prefer using config if available, otherwise derive from localTx
        try {
            const fromConfig = getPaymentMethods?.();
            if (Array.isArray(fromConfig) && fromConfig.length > 0) {
                return fromConfig.map((s) => s.toLowerCase());
            }
        } catch (err) {
            logger.error('Failed to read payment methods from config', err);
        }
        // Fallback: scan loaded rows
        return Array.from(new Set(localTx.map((tx) => (tx.paymentMethod || '').toLowerCase()))).filter(Boolean);
    }, [localTx]);
    /**
     * State: which payment methods are shown (not greyed out).
     * Always starts with all enabled.
     */
    const [activePaymentMethodFilters, setActivePaymentMethodFilters] = React.useState(new Set(allPaymentMethods));

    /**
     * Keeps filters in sync if payment methods change.
     */
    React.useEffect(() => {
        setActivePaymentMethodFilters(new Set(allPaymentMethods));
    }, [allPaymentMethods.join(',')]); // .join() = stable key for useEffect

    /**
     * Error during fetch
     */
    if (error) {
        logger.error('TransactionTable error', error);
        return (
            <div className="tt-empty">
                Error: {error.message || String(error)}
            </div>
        );
    }

    /**
     * Missing required filter (e.g. account)
     */
    if (!filters || !filters.account) {
        logger.error('TransactionTable missing account filter');
        return (
            <div className="tt-empty">
                Error: Account is required to display transactions.
            </div>
        );
    }

    /**
     * While the statement period is not loaded, shell UX remains (empty/zero rows).
     */
    if (!isStatementPeriodLoaded || statementPeriod === undefined) {
        logger.info('TransactionTable waiting for statement period context');
        return (
            <div className="tt-card">
                <BalanceWidget
                    total={0}
                    joint={0}
                    personal={0}
                    projected={0}
                />
                <TransactionTableToolbar
                    toolbar={{
                        ...toolbar,
                        total: fmt.format(0),
                        loading: true,
                    }}
                    paymentMethods={allPaymentMethods}
                    activePaymentMethodFilters={activePaymentMethodFilters}
                    onPaymentMethodFilterChange={setActivePaymentMethodFilters}
                />
                <TransactionTableHeader isAllSelected={false} toggleSelectAll={() => {}} />
                <div className="tt-body">
                    <div className="tt-empty"></div>
                </div>
            </div>
        );
    }

    /**
     * Empty state handling (no transactions).
     */
    if (!localTx || localTx.length === 0) {
        logger.info('TransactionTable empty state', { loading });
        return (
            <div className="tt-card">
                <BalanceWidget
                    total={total}
                    joint={jointBalance}
                    personal={personalBalance}
                    projected={projectedTotal}
                />
                <TransactionTableToolbar
                    toolbar={{
                        ...toolbar,
                        total: fmt.format(total),
                    }}
                    paymentMethods={allPaymentMethods}
                    activePaymentMethodFilters={activePaymentMethodFilters}
                    onPaymentMethodFilterChange={setActivePaymentMethodFilters}
                />
                <TransactionTableHeader isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll} />
                <div className="tt-body">
                    <div className="tt-empty"></div>
                </div>
            </div>
        );
    }

    /**
     * Main table rendering: always keep shell visible, load rows as data arrives.
     */
    return (
        <div className="tt-card">
            <BalanceWidget
                total={total}
                joint={jointBalance}
                personal={personalBalance}
                projected={projectedTotal}
            />
            <TransactionTableToolbar
                toolbar={{
                    ...toolbar,
                    total: fmt.format(total),
                }}
                paymentMethods={allPaymentMethods}
                activePaymentMethodFilters={activePaymentMethodFilters}
                onPaymentMethodFilterChange={setActivePaymentMethodFilters}
            />
            <TransactionTableHeader isAllSelected={isAllSelected} toggleSelectAll={toggleSelectAll} />
            <div className="tt-body">
                {localTx.map((tx) => (
                    <TransactionTableRow
                        key={tx.id}
                        tx={tx}
                        selected={selectedIds.has(tx.id)}
                        onSelect={() => toggleSelect(tx.id)}
                        editing={editing}
                        editValueRef={editValueRef}
                        onCellDoubleClick={handleCellDoubleClick}
                        onEditKey={handleEditKey}
                        onSaveEdit={handleSaveEdit}
                        onSaveRow={handleSaveRow}
                        onCancelRow={handleCancelRow}
                        toInputDate={toInputDate}
                        onToggleCleared={toggleCleared}
                        setEditing={setEditing}
                        savingIds={savingIds}
                        saveErrors={saveErrors}
                        startEditingRow={startEditingRow}
                        activePaymentMethodFilters={activePaymentMethodFilters}
                    />
                ))}
            </div>
        </div>
    );
}
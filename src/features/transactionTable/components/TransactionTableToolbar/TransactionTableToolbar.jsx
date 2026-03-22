import React, { useMemo } from "react";
import PropTypes from "prop-types";
import styles from "./TransactionTableToolbar.module.css";
import StatementPeriodDropdown from "../../../../components/statementPeriodDropdown/StatementPeriodDropdown";
import TransactionFileImportModal from "../TransactionFileImportModal/TransactionFileImportModal";

/**
 * Logger for TransactionTableToolbar
 * @constant
 */
const logger = {
    info: (...args) => console.log("[TransactionTableToolbar]", ...args),
    error: (...args) => console.error("[TransactionTableToolbar]", ...args),
};

/**
 * TransactionTableToolbar
 * Presentational toolbar for transaction actions and payment method filters.
 * Uses Bulletproof React conventions: UI only, logic in hooks.
 *
 * @param {Object} props
 * @param {Object} props.toolbar - toolbar logic object from useTransactionToolbar
 * @param {Array<string>} props.paymentMethods - All payment method keys
 * @param {Object} props.activePaymentMethodFilters - Set<String> of currently enabled payment methods
 * @param {Function} props.onPaymentMethodFilterChange - (new Set) => void, handles toggling a method
 * @returns {JSX.Element}
 */
export default function TransactionTableToolbar({
                                                    toolbar,
                                                    paymentMethods,
                                                    activePaymentMethodFilters,
                                                    onPaymentMethodFilterChange,
                                                }) {
    logger.info("render", {
        selectedCount: toolbar.selectedCount,
        loading: toolbar.loading,
        paymentMethods,
        activePaymentMethodFilters: Array.from(activePaymentMethodFilters || []),
    });

    const handleCheckboxChange = (paymentMethod) => (e) => {
        // Use a new Set to avoid mutation bugs for React state usage:
        const newSet = new Set(activePaymentMethodFilters);
        if (e.target.checked) {
            newSet.add(paymentMethod);
        } else {
            newSet.delete(paymentMethod);
        }
        onPaymentMethodFilterChange(newSet);
    };

    // Memo render of payment method filter checkboxes
    const filters = useMemo(() => (
        <div className={styles.filterGroup} role="group" aria-label="Payment method filters">
            {paymentMethods.map((method) => (
                <label key={method} className={styles.filterCheckboxLabel}>
                    <input
                        type="checkbox"
                        checked={activePaymentMethodFilters.has(method)}
                        onChange={handleCheckboxChange(method)}
                        className={styles.filterCheckbox}
                    />
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
            ))}
        </div>
    ), [paymentMethods, activePaymentMethodFilters]);

    return (
        <div className={styles.toolbar} role="toolbar" aria-label="Transaction actions">
            <div className={styles.left}>
                {filters}
                <button
                    className={styles.linkBtn}
                    onClick={toolbar.handleAdd}
                    disabled={toolbar.loading}
                >
                    <span className={styles.icon}>＋</span> Add Transaction
                </button>
                <button
                    className={styles.linkBtn}
                    onClick={toolbar.handleAddProjection}
                    disabled={toolbar.loading}
                >
                    <span className={styles.icon}>＋</span> Add Projection
                </button>
                <button
                    className={styles.linkBtn}
                    onClick={toolbar.handleImport}
                    disabled={toolbar.loading}
                >
                    <span className={styles.icon}>📁</span> File Import
                </button>
                <input
                    ref={toolbar.fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={toolbar.handleFileChange}
                />
                <button
                    className={styles.linkBtn}
                    onClick={toolbar.handleDelete}
                    disabled={toolbar.selectedCount === 0 || toolbar.loading}
                >
                    <span className={styles.icon}>🗑️</span> Delete Selected
                </button>
                <StatementPeriodDropdown />
            </div>
            <div className={styles.right}>
                <div className={styles.totals}>Total: {toolbar.total}</div>
            </div>
            <TransactionFileImportModal
                open={toolbar.importModalOpen}
                onClose={toolbar.handleModalClose}
                onConfirm={toolbar.handleModalConfirm}
                initialAccount={toolbar.initialAccount}
                initialPeriod={toolbar.initialPeriod}
                initialBank={toolbar.initialBank}
                file={toolbar.pendingFile}
            />
        </div>
    );
}

TransactionTableToolbar.propTypes = {
    toolbar: PropTypes.shape({
        handleAdd: PropTypes.func.isRequired,
        handleAddProjection: PropTypes.func.isRequired,
        handleImport: PropTypes.func.isRequired,
        handleDelete: PropTypes.func.isRequired,
        selectedCount: PropTypes.number.isRequired,
        fileInputRef: PropTypes.object.isRequired,
        handleFileChange: PropTypes.func.isRequired,
        loading: PropTypes.bool,
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        importModalOpen: PropTypes.bool,
        pendingFile: PropTypes.object,
        handleModalClose: PropTypes.func,
        handleModalConfirm: PropTypes.func,
        initialAccount: PropTypes.string,
        initialPeriod: PropTypes.string,
        initialBank: PropTypes.string,
    }).isRequired,
    paymentMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
    activePaymentMethodFilters: PropTypes.instanceOf(Set).isRequired,
    onPaymentMethodFilterChange: PropTypes.func.isRequired,
};
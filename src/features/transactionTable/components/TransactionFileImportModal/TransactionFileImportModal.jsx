import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./TransactionFileImportModal.module.css";
import { getAccounts, getPaymentMethods } from "../../../../config/config";
import { generateOptions } from "../../../../services/StatementPeriodService";

const logger = {
    info: (...args) => console.log('[TransactionFileImportModal]', ...args),
    error: (...args) => console.error('[TransactionFileImportModal]', ...args),
};

/**
 * Modal for confirming and inputting import details before uploading transactions.
 *
 * Props:
 * - open: modal open state
 * - initialAccount: default/pre-filled account value
 * - initialPeriod: default/pre-filled statement period value
 * - initialBank: default/pre-filled bank value
 * - file: file to import
 * - onClose: called when modal closes
 * - onConfirm: called with ({account, statementPeriod, bank, paymentMethod, file}) on import confirmation
 */
export default function TransactionFileImportModal({
                                                       open,
                                                       initialAccount,
                                                       initialPeriod,
                                                       initialBank,
                                                       file,
                                                       onClose,
                                                       onConfirm
                                                   }) {
    // Get dropdown options from config/services
    const accountOptions = getAccounts() || [];
    const paymentMethodOptions = getPaymentMethods() || [];
    const periodOptions = generateOptions();

    // Local state for fields
    const [account, setAccount] = useState(initialAccount || (accountOptions[0] || ""));
    const [statementPeriod, setStatementPeriod] = useState(initialPeriod || (periodOptions[0]?.value || ""));
    const [bank, setBank] = useState(initialBank || "");
    const [paymentMethod, setPaymentMethod] = useState(paymentMethodOptions[0] || "");
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState("");

    // Only reset form fields when opening the modal from closed state
    const prevOpen = useRef(open);
    useEffect(() => {
        if (open && !prevOpen.current) {
            logger.info('TransactionFileImportModal opened', {
                initialAccount, initialPeriod, initialBank, file: file?.name,
                accountOptions, periodOptions, paymentMethodOptions
            });
            setAccount(initialAccount || (accountOptions[0] || ""));
            const defaultPeriod = (initialPeriod && periodOptions.find(p => p.value === initialPeriod))
                ? initialPeriod
                : (periodOptions[0]?.value || "");
            setStatementPeriod(defaultPeriod);
            setBank(initialBank || "");
            setPaymentMethod(paymentMethodOptions[0] || "");
        }
        prevOpen.current = open;
        // DO NOT reset when options arrays change!
    }, [open, initialAccount, initialPeriod, initialBank, file]);

    if (!open) return null;

    const disabledAccount = accountOptions.length === 0;
    const disabledPeriod = periodOptions.length === 0;
    const disabledPaymentMethod = paymentMethodOptions.length === 0;

    if (disabledAccount) logger.error("No account options available for dropdown!");
    if (disabledPeriod) logger.error("No statement period options available for dropdown!");
    if (disabledPaymentMethod) logger.error("No payment method options available for dropdown!");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!account || !statementPeriod || !bank || !file) {
            setError("All fields and a file are required.");
            logger.error('TransactionFileImportModal: Validation failed', { account, statementPeriod, bank, paymentMethod, file });
            return;
        }
        setInProgress(true);
        try {
            onConfirm({ account, statementPeriod, bank, paymentMethod, file });
        } catch (err) {
            setError(err.message || "Import failed");
            logger.error('TransactionFileImportModal: Import exception', err);
        } finally {
            setInProgress(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Import Transactions</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Account
                        <select
                            value={account}
                            onChange={e => setAccount(e.target.value)}
                            required
                            disabled={disabledAccount}
                        >
                            <option value="">--select--</option>
                            {accountOptions.map(acc => (
                                <option value={acc} key={acc}>{acc}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Statement Period
                        <select
                            value={statementPeriod}
                            onChange={e => setStatementPeriod(e.target.value)}
                            required
                            disabled={disabledPeriod}
                        >
                            <option value="">--select--</option>
                            {periodOptions.map(opt => (
                                <option value={opt.value} key={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Bank
                        <select value={bank} onChange={e => setBank(e.target.value)} required>
                            <option value="">--select--</option>
                            <option value="CHASE">Chase</option>
                            <option value="AMEX">Amex</option>
                            {/* Add more banks as needed */}
                        </select>
                    </label>
                    <label>
                        Payment Method (optional)
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            disabled={disabledPaymentMethod}
                        >
                            {paymentMethodOptions.map(pm => (
                                <option value={pm} key={pm}>{pm}</option>
                            ))}
                        </select>
                    </label>
                    <div>
                        <strong>File:</strong> {file ? file.name : "No file selected"}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.buttons}>
                        <button type="button" onClick={onClose} disabled={inProgress}>Cancel</button>
                        <button type="submit" disabled={inProgress}>Import</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

TransactionFileImportModal.propTypes = {
    open: PropTypes.bool.isRequired,
    initialAccount: PropTypes.string,
    initialPeriod: PropTypes.string,
    initialBank: PropTypes.string,
    file: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};
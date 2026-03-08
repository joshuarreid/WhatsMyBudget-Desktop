import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./TransactionFileImportModal.module.css";

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
    const [account, setAccount] = useState(initialAccount || "");
    const [statementPeriod, setStatementPeriod] = useState(initialPeriod || "");
    const [bank, setBank] = useState(initialBank || "");
    const [paymentMethod, setPaymentMethod] = useState(""); // Optionally, prefill or infer
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!account || !statementPeriod || !bank || !file) {
            setError("All fields and a file are required.");
            return;
        }
        setInProgress(true);
        try {
            onConfirm({ account, statementPeriod, bank, paymentMethod, file });
        } catch (err) {
            setError(err.message || "Import failed");
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
                        <input value={account} onChange={e => setAccount(e.target.value)} required />
                    </label>
                    <label>
                        Statement Period
                        <input value={statementPeriod} onChange={e => setStatementPeriod(e.target.value)} required />
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
                        <input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} />
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
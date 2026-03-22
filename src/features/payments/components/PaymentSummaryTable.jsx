/**
 * PaymentSummaryTable
 * - Table transposed: Each user is now a row, each card is a column (plus totals).
 * - Row header = username. Shows what each user owes per card, card totals per column, and a grand total column.
 * - UX: maintains skeleton, loading, and error states.
 *
 * @module PaymentSummaryTable
 * @param {Object} props
 * @param {Array<string>} props.cards - Array of card names (lowercase)
 * @param {Array<string>} props.users - Array of user names (lowercase)
 * @param {Object} props.payments - payments[card][user]: amount
 * @param {boolean} [props.loading] - Show loading spinner
 * @param {Error|null} [props.error] - Error object if data fetch failed
 * @returns {JSX.Element}
 */
import React from "react";
import styles from "../styles/PaymentSummaryTable.module.css";

/**
 * Logger for PaymentSummaryTable.
 * Logs key render and error events for traceability.
 * @constant
 */
const logger = {
    info: (...args) => console.log("[PaymentSummaryTable]", ...args),
    error: (...args) => console.error("[PaymentSummaryTable]", ...args),
};

/**
 * Calculates total for each user across all cards.
 * @param {Array<string>} cards
 * @param {Object} payments
 * @returns {Object<string, number>}
 */
const getUserTotals = (cards, users, payments) =>
    users.reduce((acc, user) => {
        acc[user] = cards.reduce(
            (sum, card) => sum + (payments?.[card]?.[user] || 0),
            0
        );
        return acc;
    }, {});

/**
 * Calculates total for each card across all users.
 * @param {Array<string>} users
 * @param {Object} payments
 * @returns {Object<string, number>}
 */
const getCardTotals = (cards, users, payments) =>
    cards.reduce((acc, card) => {
        acc[card] = users.reduce(
            (sum, user) => sum + (payments?.[card]?.[user] || 0),
            0
        );
        return acc;
    }, {});

/**
 * Computes grand total amount across all users and cards.
 * @param {Object<string, number>} userTotals
 * @returns {number}
 */
const getGrandTotal = (userTotals) =>
    Object.values(userTotals).reduce((sum, val) => sum + val, 0);

export default function PaymentSummaryTable({
                                                cards,
                                                users,
                                                payments,
                                                loading = false,
                                                error = null,
                                            }) {
    /**
     * Totals by user and by card, and overall grand total.
     */
    const userTotals = getUserTotals(cards, users, payments);
    const cardTotals = getCardTotals(cards, users, payments);
    const grandTotal = getGrandTotal(userTotals);

    logger.info("Rendering PaymentSummaryTable (transposed)", {
        cards,
        users,
        payments,
        userTotals,
        cardTotals,
        grandTotal,
        loading,
        error,
    });

    return (
        <div className={styles.summaryTableWrapper}>
            <div className={styles.summaryTableCard}>
                <table className={styles.summaryTable}>
                    <thead>
                    <tr>
                        <th>User</th>
                        {cards.map((card) => (
                            <th key={card}>
                                {card.charAt(0).toUpperCase() + card.slice(1)}'s Payment
                            </th>
                        ))}
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={cards.length + 2} style={{ textAlign: "center", color: "var(--muted, #b1bcc6)" }}>
                                No users found.
                            </td>
                        </tr>
                    )}
                    {users.map((user) => (
                        <tr key={user}>
                            <td>
                                {user.charAt(0).toUpperCase() + user.slice(1)}
                            </td>
                            {cards.map((card) => (
                                <td key={card}>
                                    {payments?.[card]?.[user] !== undefined
                                        ? `$${Number(payments[card][user]).toFixed(2)}`
                                        : "$0.00"}
                                </td>
                            ))}
                            <td>
                                <strong>${userTotals[user].toFixed(2)}</strong>
                            </td>
                        </tr>
                    ))}
                    {/* Totals row */}
                    <tr>
                        <td>
                            <strong>Total</strong>
                        </td>
                        {cards.map((card) => (
                            <td key={card}>
                                <strong>${cardTotals[card].toFixed(2)}</strong>
                            </td>
                        ))}
                        <td>
                            <strong>${grandTotal.toFixed(2)}</strong>
                        </td>
                    </tr>
                    </tbody>
                </table>
                {loading && <div className={styles.loading}>Loading payments…</div>}
                {error && (
                    <div className={styles.error}>
                        Error: {error.message || String(error)}
                    </div>
                )}
            </div>
        </div>
    );
}
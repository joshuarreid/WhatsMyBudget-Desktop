import React, { useEffect, useMemo, useState } from 'react';
import AuthService from '../../services/AuthService';
import styles from './LoginScreen.module.css';

const logger = {
    info: (...args) => console.log('[LoginScreen]', ...args),
    error: (...args) => console.error('[LoginScreen]', ...args),
};

function formatRetry(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min > 0) return `${min}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
}

export default function LoginScreen({ onLoginSuccess }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);

    useEffect(() => {
        if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds <= 0) return undefined;
        const id = setInterval(() => {
            setRetryAfterSeconds((prev) => {
                if (!Number.isFinite(prev)) return null;
                if (prev <= 1) return null;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [retryAfterSeconds]);

    const disabled = loading || (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0);
    const retryLabel = useMemo(() => formatRetry(retryAfterSeconds), [retryAfterSeconds]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await AuthService.login(password);
            setPassword('');
            logger.info('login success');
            if (typeof onLoginSuccess === 'function') onLoginSuccess();
        } catch (err) {
            logger.error('login error', err);
            if (err?.status === 429) {
                setRetryAfterSeconds(Number(err?.retryAfterSeconds || 0));
                setError(err?.message || 'Too many login attempts. Please wait and try again.');
            } else if (err?.status === 401) {
                setError('Incorrect password. Please try again.');
            } else {
                setError(err?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <section className={styles.card} aria-labelledby="login-title">
                <h1 id="login-title" className={styles.title}>WhatsMyBudget Login</h1>
                <p className={styles.subtitle}>Enter your service password to access API v2 data.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input
                        id="password"
                        className={styles.input}
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={disabled}
                    />

                    <button type="submit" className={styles.button} disabled={disabled || !password.trim()}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {retryLabel && (
                    <p className={styles.info} role="status" aria-live="polite">
                        Try again in {retryLabel}.
                    </p>
                )}
                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}
            </section>
        </main>
    );
}


const AUTH_SESSION_KEY = 'wmb.auth.session.v1';

const logger = {
    info: (...args) => console.log('[authSession]', ...args),
    error: (...args) => console.error('[authSession]', ...args),
};

const listeners = new Set();

function nowMs() {
    return Date.now();
}

function toExpiresAtMs(issuedAtMs, expiresInSeconds) {
    const ttlMs = Number(expiresInSeconds) * 1000;
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) return 0;
    return issuedAtMs + ttlMs;
}

function readRawSession() {
    try {
        const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        logger.error('readRawSession failed', err);
        return null;
    }
}

function writeRawSession(session) {
    try {
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch (err) {
        logger.error('writeRawSession failed', err);
    }
}

function notify(event) {
    for (const fn of listeners) {
        try {
            fn(event);
        } catch (err) {
            logger.error('listener failed', err);
        }
    }
}

export function subscribeAuthSession(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function setAuthSession({ accessToken, expiresIn }) {
    const issuedAtMs = nowMs();
    const expiresAtMs = toExpiresAtMs(issuedAtMs, expiresIn);
    const session = {
        accessToken: String(accessToken || ''),
        expiresIn: Number(expiresIn || 0),
        issuedAtMs,
        expiresAtMs,
    };
    writeRawSession(session);
    notify({ type: 'session:set', session });
    return session;
}

export function clearAuthSession(reason = 'manual') {
    try {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (err) {
        logger.error('clearAuthSession failed', err);
    }
    notify({ type: 'session:cleared', reason });
}

export function getAuthSession() {
    const session = readRawSession();
    if (!session || !session.accessToken) return null;
    if (!session.expiresAtMs || nowMs() >= Number(session.expiresAtMs)) {
        clearAuthSession('expired');
        return null;
    }
    return session;
}

export function getAccessToken() {
    const session = getAuthSession();
    return session?.accessToken || null;
}

export function isAuthenticated() {
    return !!getAccessToken();
}


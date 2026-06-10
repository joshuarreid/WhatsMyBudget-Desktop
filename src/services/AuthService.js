import { getApiClient } from '../lib/apiClient';
import { clearAuthSession, setAuthSession } from '../lib/authSession';

const logger = {
    info: (...args) => console.log('[AuthService]', ...args),
    error: (...args) => console.error('[AuthService]', ...args),
};

const LOGIN_RESOURCE = '/auth/login';

const AuthService = {
    async login(password) {
        logger.info('login entry');
        if (!password || !String(password).trim()) {
            throw new Error('Password is required');
        }

        try {
            const apiClient = await getApiClient();
            const response = await apiClient.post(LOGIN_RESOURCE, { password: String(password) });
            const token = response?.data?.accessToken;
            const expiresIn = response?.data?.expiresIn;
            if (!token) throw new Error('Missing access token in login response');
            setAuthSession({ accessToken: token, expiresIn });
            return response.data;
        } catch (err) {
            const retryAfterRaw = err?.response?.headers?.['retry-after'];
            const retryAfterSeconds = retryAfterRaw != null ? Number(retryAfterRaw) : null;
            logger.error('login failed', {
                status: err?.response?.status,
                message: err?.response?.data?.message || err?.message,
                retryAfterSeconds,
            });
            throw {
                status: err?.response?.status,
                message: err?.response?.data?.message || err?.message || 'Login failed',
                retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
                raw: err,
            };
        }
    },

    logout(reason = 'manual') {
        logger.info('logout', { reason });
        clearAuthSession(reason);
    },
};

export default AuthService;


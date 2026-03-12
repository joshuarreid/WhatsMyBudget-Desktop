import axios from "axios";
import config from "../config/config.js";

/**
 * logger
 * Standardized logger for apiClient module.
 * @constant
 */
const logger = {
    info: (...args) => console.log("[apiClient]", ...args),
    error: (...args) => console.error("[apiClient]", ...args),
};

/**
 * generateTransactionId
 * Generates a reasonably unique request ID for traceability.
 *
 * @returns {string} Transaction ID string.
 */
function generateTransactionId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Simple fallback UUID v4-like
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Singleton instance of Axios for API calls.
 * @type {import("axios").AxiosInstance|null}
 * @private
 */
let apiClientInstance = null;

/**
 * getApiClient
 * Returns a singleton instance of the preconfigured API client (Axios).
 * Sets up interceptors for logging, transaction ID, and standard error handling.
 *
 * @async
 * @function getApiClient
 * @returns {Promise<import("axios").AxiosInstance>} Pre-configured Axios client instance.
 */
export async function getApiClient() {
    if (!apiClientInstance) {
        const BASE_URL = config.baseUrl || "";
        if (!BASE_URL) {
            logger.error("API Client initialized with empty baseURL! Check config.baseUrl.");
        }
        apiClientInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                "Content-Type": "application/json",
                ...(config.defaultHeaders || {}),
            },
            timeout: 10000,
        });

        logger.info("API Client initialized", {
            baseURL: BASE_URL,
            headers: { "Content-Type": "application/json", ...config.defaultHeaders },
        });

        // Request interceptor: add Transaction ID and log
        apiClientInstance.interceptors.request.use(
            (request) => {
                const tx = generateTransactionId();
                request.headers = request.headers || {};
                request.headers["X-Transaction-ID"] = tx;

                logger.info("request", {
                    url: request.baseURL ? request.baseURL + (request.url || "") : request.url,
                    method: request.method,
                    contentType: request.headers["Content-Type"],
                    params: request.params,
                    // Only log type or brief summary, never sensitive or large payloads
                    dataType:
                        request.data && typeof request.data === "object"
                            ? "[object]"
                            : typeof request.data,
                    transactionId: tx,
                });
                return request;
            },
            (err) => {
                logger.error("request error", err);
                return Promise.reject(err);
            }
        );

        // Response interceptor: log response and normalize errors.
        apiClientInstance.interceptors.response.use(
            (resp) => {
                logger.info("response", {
                    url: resp.config?.url,
                    status: resp.status,
                    // Only log type or brief summary, never sensitive or large payloads
                    dataType:
                        resp.data && typeof resp.data === "object" ? "[object]" : typeof resp.data,
                });
                return resp;
            },
            (err) => {
                const status = err?.response?.status;
                const url = err?.config?.url;
                const message = err?.response?.data?.message || err.message;
                logger.error("response error", { url, status, message, raw: err });
                return Promise.reject(err);
            }
        );
    }
    return apiClientInstance;
}

export default getApiClient;
import axios from "axios";
import Cookies from "js-cookie";

const createApiInstance = (baseURL) => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Helper function to check if token is expired or about to expire
    const isTokenExpiredOrExpiringSoon = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const timeUntilExpiry = exp - now;
            // Refresh if token expires in less than 10 seconds
            return timeUntilExpiry < 10000;
        } catch (e) {
            return true;
        }
    };

    api.interceptors.request.use(
        async (config) => {
            const token = Cookies.get("accessToken");
            
            // Proactive refresh: Check if token is expired or about to expire
            if (token && isTokenExpiredOrExpiringSoon(token)) {
                const refreshToken = Cookies.get("refreshToken");
                if (refreshToken) {
                    try {
                        console.log('[Token Refresh] Proactive refresh: token expiring soon');
                        const { refreshAccessToken } = await import('./auth.js');
                        const newAccessToken = await refreshAccessToken();
                        config.headers.Authorization = `Bearer ${newAccessToken}`;
                        console.log('[Token Refresh] Successfully refreshed token');
                        return config;
                    } catch (refreshError) {
                        console.error('[Token Refresh] Failed to refresh token:', refreshError);
                        // Continue with old token, let response interceptor handle 401
                    }
                }
            }
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Danh sách các endpoint công khai không cần Token
    const PUBLIC_401_ALLOWLIST = [
        "/v1/teacher/auth/login",
        "/v1/teacher/auth/register",
        "/v1/teacher/auth/forgotPassword",
        "/v1/teacher/auth/verifyOtp",
        "/v1/teacher/auth/updatePassword",
        "/v1/teacher/auth/refresh",
        "/v1/teacher/auth/logout",
        "/eureka",
    ];

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error?.config;
            const status = error?.response?.status;

            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const reqUrl = originalRequest?.url || "";
                const isPublicEndpoint = PUBLIC_401_ALLOWLIST.some((p) => reqUrl.includes(p));
                const onAuthPage = ["/login", "/auth", "/forgot", "/verify-otp", "/reset-password"]
                    .some((p) => window.location.pathname.startsWith(p));

                if (isPublicEndpoint || onAuthPage) {
                    return Promise.reject(error);
                }

                console.log('[Token Refresh] Received 401, attempting to refresh token');
                try {
                    const { refreshAccessToken } = await import('./auth.js');
                    const newAccessToken = await refreshAccessToken();
                    console.log('[Token Refresh] Successfully refreshed token, retrying request');

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('[Token Refresh] Failed to refresh token:', refreshError);
                    // Refresh thất bại -> logout và redirect
                    const { logout } = await import('./auth.js');
                    await logout();
                    const current = window.location.pathname + window.location.search;
                    window.location.href = `/login?from=${encodeURIComponent(current)}`;
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );

    return api;
};

export default createApiInstance;
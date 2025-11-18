import axios from "axios";
import Cookies from "js-cookie";

const createApiInstance = (baseURL) => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

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
        "/ws"
    ];

    const isTokenExpiredOrExpiringSoon = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const timeUntilExpiry = exp - now;
            return timeUntilExpiry < 10000;
        } catch (e) {
            return true;
        }
    };

    api.interceptors.request.use(
        async (config) => {
            const token = Cookies.get("accessToken");
            const allCookies = Cookies.get(); // Debug: xem tất cả cookies
            
            // Debug: Log token status
            if (!token) {
                // console.warn('[API Request] No accessToken found in cookies for:', config.url);
                // console.warn('[API Request] All cookies:', allCookies);
                // console.warn('[API Request] Full URL:', config.baseURL + config.url);
            }
            
            // Proactive refresh: Check if token is expired or about to expire
            // Bỏ qua nếu đang gọi endpoint refresh hoặc logout
            const reqUrl = config.url || "";
            if (!reqUrl.includes("/refresh") && !reqUrl.includes("/logout")) {
                if (token && isTokenExpiredOrExpiringSoon(token)) {
                    const refreshToken = Cookies.get("refreshToken");
                    if (refreshToken) {
                        try {
                            const { refreshAccessToken } = await import('./auth.js');
                            const newAccessToken = await refreshAccessToken();
                            config.headers.Authorization = `Bearer ${newAccessToken}`;
                            config.withCredentials = true;
                            console.log('[Token Refresh] Successfully refreshed token');
                            return config;
                        } catch (refreshError) {
                            // console.error('[Token Refresh] Failed to refresh token:', refreshError);
                            // Continue with old token, let response interceptor handle 401
                        }
                    } else {
                        // console.warn('[Token Refresh] No refreshToken available for proactive refresh');
                    }
                }
            }
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // console.log('[API Request] Token found, setting Authorization header for:', config.url);
            } else {
                // console.warn('[API Request] No token available for:', config.url);
                // Nếu không có token và không phải public endpoint, có thể cần redirect
                const isPublicEndpoint = PUBLIC_401_ALLOWLIST.some((p) => (config.baseURL + reqUrl).includes(p));
                if (!isPublicEndpoint) {
                    // console.error('[API Request] Missing token for protected endpoint:', config.url);
                }
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

                // Không refresh nếu đang gọi endpoint refresh hoặc logout
                if (reqUrl.includes("/refresh") || reqUrl.includes("/logout")) {
                    return Promise.reject(error);
                }

                if (isPublicEndpoint || onAuthPage) {
                    return Promise.reject(error);
                }
                // console.log('[Token Refresh] Received 401, attempting to refresh token');
                // console.log('[Token Refresh] Original request URL:', originalRequest.url);
                // console.log('[Token Refresh] Original request baseURL:', originalRequest.baseURL);
                // console.log('[Token Refresh] Original request method:', originalRequest.method);
                
                try {
                    const { refreshAccessToken } = await import('./auth.js');
                    const newAccessToken = await refreshAccessToken();
                    // console.log('[Token Refresh] Successfully refreshed token, retrying request');
                    // console.log('[Token Refresh] New token (first 20 chars):', newAccessToken?.substring(0, 20) + '...');

                    // Đảm bảo headers tồn tại
                    if (!originalRequest.headers) {
                        originalRequest.headers = {};
                    }
                    
                    // Cập nhật token trong originalRequest
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    originalRequest.withCredentials = true;
                    
                    // Xóa flag _retry để có thể retry lại nếu cần (nhưng không nên xảy ra)
                    // Giữ nguyên tất cả config khác, chỉ cập nhật token
                    
                    // Sử dụng api.request() để đảm bảo axios xử lý đúng baseURL và URL
                    // console.log('[Token Refresh] Retrying with method:', originalRequest.method, 'URL:', originalRequest.url || '', 'baseURL:', originalRequest.baseURL || '');
                    
                    return api.request(originalRequest);
                } catch (refreshError) {
                    // console.error('[Token Refresh] Failed to refresh token:', refreshError);
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
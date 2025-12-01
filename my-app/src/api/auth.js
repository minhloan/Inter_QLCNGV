import Cookies from "js-cookie";
import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/auth";
const api = createApiInstance(API_URL);

const normalizeBase64 = (segment) => {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
    return base64 + '='.repeat(padding);
};

const decodePayload = () => {
    const token = getToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
        const decodedBinary = atob(normalizeBase64(parts[1]));
        let jsonString;

        if (typeof TextDecoder !== 'undefined') {
            const bytes = Uint8Array.from(decodedBinary, (char) => char.charCodeAt(0));
            jsonString = new TextDecoder().decode(bytes);
        } else {
            jsonString = decodeURIComponent(
                Array.from(decodedBinary)
                    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
                    .join('')
            );
        }

        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
};

export const login = async (data) => {
    const response = await api.post("/login", data);
    const accessToken = response.data.access || response.data.token;
    const refreshToken = response.data.refresh || response.data.refreshToken;

    // Lưu accessToken trong cookie
    Cookies.set("accessToken", accessToken, {
        expires: 1, // 1 ngày
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });

    // Lưu refreshToken trong cookie
    if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
            expires: 7, // 7 ngày
            path: '/',
            sameSite: 'lax',
            secure: window.location.protocol === 'https:'
        });
    }

    return response.data;
};

export const getToken = () => {
    return Cookies.get("accessToken") || null;
};

export const getRefreshToken = () => {
    return Cookies.get("refreshToken") || null;
};

let isRefreshing = false;
let refreshPromise = null;

export const refreshAccessToken = async () => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {

            // Gọi API refresh - cookie sẽ được gửi tự động
            const response = await api.post("/refresh", {}, {
                withCredentials: true // Quan trọng: gửi cookie
            });

            const accessToken = response.data.access || response.data.token;
            const newRefreshToken = response.data.refresh || response.data.refreshToken;

            if (!accessToken) {
                throw new Error("No access token in refresh response");
            }

            // Cập nhật accessToken từ cookie
            Cookies.set("accessToken", accessToken, {
                expires: 1,
                path: '/',
                sameSite: 'lax',
                secure: window.location.protocol === 'https:'
            });

            if (newRefreshToken && newRefreshToken !== refreshToken) {
                Cookies.set("refreshToken", newRefreshToken, {
                    expires: 7,
                    path: '/',
                    sameSite: 'lax',
                    secure: window.location.protocol === 'https:'
                });
            }
            return accessToken;
        } catch (error) {
            // Nếu refresh thất bại, xóa cả 2 token
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

export const logout = async () => {
    try {
        await api.post("/logout", {}, {
            withCredentials: true
        });
    } catch (error) {
    } finally {
        // Xóa cookies ở frontend
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    }
};

export const getUserRole = () => {
    const payload = decodePayload();
    if (!payload) return [];

    try {
        let roles = [];
        if (Array.isArray(payload.roles)) {
            roles = payload.roles;
        } else if (Array.isArray(payload.authorities)) {
            roles = payload.authorities;
        } else if (payload.role) {
            roles = [payload.role];
        }

        return [...new Set(
            roles
                .filter(Boolean)
                .map(String)
                .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r.toUpperCase()}`)
        )];
    } catch (error) {
        return [];
    }
};

/**
 * Lấy primary role từ token và map sang format frontend
 * ROLE_MANAGE -> Manage-Leader
 * ROLE_TEACHER -> Teacher
 */
export const getPrimaryRole = () => {
    const roles = getUserRole();
    if (roles.length === 0) return null;

    // Ưu tiên MANAGE nếu có
    if (roles.some(r => r === 'ROLE_MANAGE' || r.includes('MANAGE'))) {
        return 'Manage-Leader';
    }

    // Nếu có TEACHER
    if (roles.some(r => r === 'ROLE_TEACHER' || r.includes('TEACHER'))) {
        return 'Teacher';
    }

    // Fallback: lấy role đầu tiên và normalize
    const firstRole = roles[0];
    if (firstRole.includes('MANAGE')) {
        return 'Manage-Leader';
    }
    if (firstRole.includes('TEACHER')) {
        return 'Teacher';
    }

    return null;
};

/**
 * Lấy thông tin user từ token (email, userId)
 */
export const getUserInfo = () => {
    const payload = decodePayload();
    if (!payload) return null;

    return {
        email: payload.sub || payload.email,
        username: payload.username,
        userId: payload.userId,
        roles: getUserRole()
    };
};

// Forgot Password API
export const forgotPassword = async (email) => {
    const response = await api.post("/forgotPassword", { email });
    return response.data;
};


// Verify OTP API
export const verifyOtp = async (email, otp) => {
    const response = await api.post("/verifyOtp", { email, otp });
    return response.data;
};

// Update Password API
export const updatePassword = async (email, newPassword, otp = null) => {
    const response = await api.post("/updatePassword", { email, newPassword, otp });
    return response.data;
};

export const googleLogin = async (token) => {
    const response = await api.post("/google-login", { token });
    const accessToken = response.data.access || response.data.token;
    const refreshToken = response.data.refresh || response.data.refreshToken;

    // Lưu accessToken trong cookie
    Cookies.set("accessToken", accessToken, {
        expires: 1, // 1 ngày
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });

    // Lưu refreshToken trong cookie
    if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
            expires: 7, // 7 ngày
            path: '/',
            sameSite: 'lax',
            secure: window.location.protocol === 'https:'
        });
    }

    return response.data;
};
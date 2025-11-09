import Cookies from "js-cookie";
import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/auth";

const api = createApiInstance(API_URL);


export const login = async (data) => {
    const response = await api.post("/login", data);
    const accessToken = response.data.accessToken || response.data.token;
    const refreshToken = response.data.refreshToken;

    // Lưu accessToken trong cookie
    Cookies.set("accessToken", accessToken, {
        expires: 1, // 1 ngày (token thực tế chỉ có 1 giờ)
        path: '/',
        sameSite: 'strict',
        secure: window.location.protocol === 'https:'
    });

    // Lưu refreshToken trong cookie
    if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
            expires: 7, // 7 ngày
            path: '/',
            sameSite: 'strict',
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

export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await api.post("/refresh", { refreshToken });
        const accessToken = response.data.accessToken || response.data.token;
        const newRefreshToken = response.data.refreshToken;

        // Cập nhật accessToken
        Cookies.set("accessToken", accessToken, {
            expires: 1,
            path: '/',
            sameSite: 'strict',
            secure: window.location.protocol === 'https:'
        });

        // Cập nhật refreshToken nếu có (trong trường hợp rotate token)
        if (newRefreshToken && newRefreshToken !== refreshToken) {
            Cookies.set("refreshToken", newRefreshToken, {
                expires: 7,
                path: '/',
                sameSite: 'strict',
                secure: window.location.protocol === 'https:'
            });
        }

        return accessToken;
    } catch (error) {
        // Nếu refresh thất bại, xóa cả 2 token
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        throw error;
    }
};

export const logout = async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
        try {
            await api.post("/logout", { refreshToken });
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
};

export const getUserRole = () => {
    const token = getToken();
    if (!token) return [];

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        let roles = [];
        if (Array.isArray(payload.roles)) {
            roles = payload.roles;
        } else if (Array.isArray(payload.authorities)) {
            roles = payload.authorities;
        } else if (payload.role) {
            roles = [payload.role];
        }

        const normalized = [...new Set(
            roles
                .filter(Boolean)
                .map(String)
                .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r.toUpperCase()}`)
        )];

        return normalized;
    } catch (error) {
        console.error("Error decoding token:", error);
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
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub || payload.email,
            userId: payload.userId,
            roles: getUserRole()
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const isAuthenticated = () => {
    return !!getToken();
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
// OTP có thể là null - backend sẽ kiểm tra cờ verified thay vì verify OTP lại
export const updatePassword = async (email, newPassword, otp = null) => {
    const response = await api.post("/updatePassword", { email, newPassword, otp });
    return response.data;
};
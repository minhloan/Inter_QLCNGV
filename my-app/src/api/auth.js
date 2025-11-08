import Cookies from "js-cookie";
import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/auth";

const api = createApiInstance(API_URL);


export const login = async (data) => {
    const response = await api.post("/login", data);
    const { token } = response.data;
    // Lưu token vào cookie với cấu hình an toàn
    Cookies.set("accessToken", token, { 
        expires: 7, // 7 ngày
        path: '/', // Có sẵn trên toàn bộ domain
        sameSite: 'strict', // Chống CSRF
        secure: window.location.protocol === 'https:' // Chỉ gửi qua HTTPS nếu đang dùng HTTPS
    });
    return response.data;
};

export const getToken = () => {
    return Cookies.get("accessToken") || null;
};

export const logout = () => {
    Cookies.remove("accessToken");
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
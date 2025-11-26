import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/aptech-exam";
const api = createApiInstance(API_URL);

const buildQueryString = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}`.trim() !== "") {
            query.append(key, value);
        }
    });
    const qs = query.toString();
    return qs ? `?${qs}` : "";
};

// =======================
// TEACHER APIs
// =======================

// 1. Lấy danh sách kỳ thi của giáo viên hiện tại
export const getTeacherAptechExams = async () => {
    const response = await api.get("");
    return response.data;
};

// 1b. Admin / reviewer: lấy danh sách kỳ thi Aptech của một giáo viên bất kỳ
//    (dùng để hiển thị chứng nhận & bằng trên màn quản lý/trial, phân công, v.v.)
export const getAptechExamsByTeacherForAdmin = async (teacherId) => {
    if (!teacherId) return [];
    const adminApi = createApiInstance(`${API_URL}/admin`);
    const response = await adminApi.get(`/teacher/${teacherId}`);
    return response.data;
};

export const getExamById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

// 2. Lấy lịch sử thi theo môn
export const getExamHistory = async (subjectId) => {
    const response = await api.get(`/history/${subjectId}`);
    return response.data;
};

// 3. Upload chứng nhận thi để đọc OCR điểm
export const uploadExamProof = async (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/${examId}/exam-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data; // Return OCR results
};

// 3b. Upload bằng Aptech chính thức (khi đã đủ điều kiện)
export const uploadFinalCertificate = async (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/${examId}/certificate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

// 4. Download/View chứng chỉ
export const viewCertificate = async (examId) => {
    const response = await api.get(`/${examId}/certificate`, {
        responseType: "blob"
    });
    return response.data;
};

// 5. Đăng ký thi
export const registerAptechExam = async (sessionId, subjectId) => {
    const response = await api.post("/register", { sessionId, subjectId });
    return response.data;
};

// =======================
// ADMIN APIs
// =======================

// 1. Lấy tất cả kỳ thi (admin)
export const getAllAptechExams = async () => {
    const adminApi = createApiInstance(`${API_URL}/all`);
    const response = await adminApi.get("");
    return response.data;
};

// 2. Lấy tất cả session (admin)
export const getAptechExamSessions = async () => {
    const sessionApi = createApiInstance('/v1/teacher/aptech-exam-session');
    const response = await sessionApi.get("");
    return response.data;
};

export const getUpcomingAptechExamSessions = async (params = {}) => {
    const sessionApi = createApiInstance('/v1/teacher/aptech-exam-session');
    const query = buildQueryString(params);
    const response = await sessionApi.get(`/upcoming${query}`);
    return response.data;
};

// 4. Tạo / quản lý phiên thi (admin) - tạo phiên thi mới
export const createAptechExamSession = async (payload) => {
    const sessionApi = createApiInstance('/v1/teacher/aptech-exam-session');
    const response = await sessionApi.post('', payload);
    return response.data;
};

// 3. Admin upload chứng chỉ cho bất kỳ exam
export const adminUploadCertificate = async (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const adminApi = createApiInstance(`${API_URL}/admin`);
    const response = await adminApi.post(`/${examId}/certificate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

// 4. Admin download chứng chỉ
export const adminDownloadCertificate = async (examId) => {
    const adminApi = createApiInstance(`${API_URL}/admin`);
    const response = await adminApi.get(`/${examId}/certificate`, {
        responseType: "blob"
    });
    return response;
};

//5. Cập nhật điểm
export const updateExamScore = async (id, score, result) => {
    const payload = { score, result };
    const response = await api.put(`/${id}/score`, payload);
    return response.data;
};

// Admin: update aptech exam status (PENDING/APPROVED/REJECTED)
export const adminUpdateExamStatus = async (id, status) => {
    const adminApi = createApiInstance(`${API_URL}/admin`);
    const response = await adminApi.put(`/${id}/status`, { status });
    return response.data;
};

// Export endpoints (server-generated documents)
export const exportSummary = async (options = {}) => {
    const adminApi = createApiInstance(`${API_URL}`);
    const query = buildQueryString(options);
    return adminApi.get(`/export/summary${query}`, { responseType: 'blob' });
};

export const exportList = async (options = {}) => {
    const adminApi = createApiInstance(`${API_URL}`);
    const query = buildQueryString(options);
    return adminApi.get(`/export/list${query}`, { responseType: 'blob' });
};

export const exportStats = async (options = {}) => {
    const adminApi = createApiInstance(`${API_URL}`);
    const query = buildQueryString(options);
    return adminApi.get(`/export/stats${query}`, { responseType: 'blob' });
};

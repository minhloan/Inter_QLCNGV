import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/aptech-exam";
const api = createApiInstance(API_URL);

// =======================
// TEACHER APIs
// =======================

// 1. Lấy danh sách kỳ thi của giáo viên hiện tại
export const getTeacherAptechExams = async () => {
    const response = await api.get("");
    return response.data;
};

// 2. Lấy lịch sử thi theo môn
export const getExamHistory = async (subjectId) => {
    const response = await api.get(`/history/${subjectId}`);
    return response.data;
};

// 3. Upload chứng chỉ cho kỳ thi
export const uploadCertificate = async (examId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/${examId}/certificate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
};

// 4. Download chứng chỉ
export const downloadCertificate = async (examId) => {
    const response = await api.get(`/${examId}/certificate`, {
        responseType: "blob"
    });
    return response;
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



import createApiInstance from "./createApiInstance";

const API_URL = "/v1/teacher/teachingAssignment";
const api = createApiInstance(API_URL);

export const getAllTeachingAssignments = async ({
    page = 0,
    size = 10,
    keyword,
    status,
    semester,
} = {}) => {
    const res = await api.get("", {
        params: {
            page,
            size,
            keyword: keyword || undefined,
            status: status || undefined,
            semester: semester || undefined,
        },
    });
    return res.data;
};

export const createTeachingAssignment = async (payload) => {
    const res = await api.post("", payload);
    return res.data;
};

export const checkTeachingEligibility = async (teacherId, subjectId) => {
    const res = await api.get("/eligibility", {
        params: { teacherId, subjectId },
    });
    return res.data;
};

export const getTeachingAssignmentById = async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
};

// Dành cho giáo viên đang đăng nhập: lấy danh sách phân công của chính mình
export const getMyTeachingAssignments = async ({
    page = 0,
    size = 10,
    keyword,
    status,
    year,
} = {}) => {
    const res = await api.get("/my", {
        params: {
            page,
            size,
            keyword: keyword || undefined,
            status: status || undefined,
            year: year || undefined,
        },
    });
    return res.data;
};

// Cập nhật trạng thái phân công giảng dạy (COMPLETED / NOT_COMPLETED, kèm ghi chú/lý do)
export const updateTeachingAssignmentStatus = async (id, payload) => {
    const res = await api.patch(`/${id}/status`, payload);
    return res.data;
};
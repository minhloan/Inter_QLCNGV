import createApiInstance from "./createApiInstance";

// Base API
const api = createApiInstance("/v1/teacher/subject-systems");

// ======================
// LẤY TẤT CẢ SUBJECT SYSTEM
// ======================
export const getAllSubjectSystems = async () => {
    const res = await api.get("/getAll");
    return res.data;
};

// ======================
// LẤY SUBJECT SYSTEM ĐANG HOẠT ĐỘNG
// ⭐ Dùng cho dropdown thêm/sửa môn học
// ======================
export const listActiveSystems = async () => {
    const res = await api.get("/active");
    return res.data;
};

export const getSubjectSystemById = async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
};

// ======================
// TẠO MỚI
// ======================
export const createSubjectSystem = async (payload) => {
    const res = await api.post("/create", payload);
    return res.data;
};

// ======================
// CẬP NHẬT
// ======================
export const updateSubjectSystem = async (payload) => {
    const res = await api.put("/update", payload);
    return res.data;
};

// ======================
// XÓA
// ======================
export const deleteSubjectSystem = async (id) => {
    const res = await api.delete(`/delete/${id}`);
    return res.data;
};
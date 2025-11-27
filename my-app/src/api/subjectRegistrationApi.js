// src/api/subjectRegistrationApi.js
import createApiInstance from "./createApiInstance.js";


// Base URL trùng với @RequestMapping trong Controller
const api = createApiInstance("/v1/teacher/subject-registrations");

// Gọi API để đăng ký môn học
export const registerSubject = async (body = {}) => {
    const res = await api.post("/register", body);
    return res.data;
};
/**
 * Lấy tất cả đăng ký
 * GET /v1/teacher/subject-registrations
 */
export const listAllSubjectRegistrations = async () => {
    const res = await api.get("/getAll");
    return res.data;
};

export const filterSubjectRegistrations = async (body = {}) => {
    const res = await api.post("/filter", body);
    return res.data; // Danh such SubjectRegistrationsDto
};

export const carryOverSubject = async (registrationId, payload) => {
    const res = await api.post(`/${registrationId}/carry-over`, payload);
    return res.data;
};

export const exportPlanByYear = async (year) => {
    return api.get("/plan/export", {
        params: { year },
        responseType: "blob",
    });
};

export const importPlanByYear = async (year, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/plan/import", formData, {
        params: { year },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data; // ImportPlanResultDto
};
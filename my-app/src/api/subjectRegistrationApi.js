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








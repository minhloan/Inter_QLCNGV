import createApiInstance from "./createApiInstance.js";

const api = createApiInstance("/v1/teacher/admin/subject-registrations");

export const getAllRegistrationsForAdmin = async () => {
    const res = await api.get("/getAll");
    return res.data;
};

export const updateRegistrationStatus = async (id, status) => {
    const res = await api.put(`/update-status/${id}`, { status });
    return res.data;
};
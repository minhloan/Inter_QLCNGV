import createApiInstance from "./createApiInstance";

const api = createApiInstance("/v1/teacher/subject-assignments");

export const getAssignmentsBySystem = async (systemId, params = {}) => {
    const res = await api.get(`/system/${systemId}`, { params });
    return res.data;
};

export const upsertAssignment = async (payload) => {
    const res = await api.post("", payload);
    return res.data;
};

export const deleteAssignment = async (assignmentId) => {
    const res = await api.delete(`/${assignmentId}`);
    return res.data;
};


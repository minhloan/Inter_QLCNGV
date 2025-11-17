import createApiInstance from "./createApiInstance";

const API_URL = "/v1/teacher/teachingAssignment";
const api = createApiInstance(API_URL);

export const getAllTeachingAssignments = async () => {
    const res = await api.get("");
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
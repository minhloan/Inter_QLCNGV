import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/subjects";

const api = createApiInstance(API_URL);

export const listAllSubjects = async () => {
    const res = await api.get("");
    return res.data;
};

export const searchSubjects = async (keyword) => {
    try {
        const response = await api.get(`/search`, { params: { q: keyword } });
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        throw error;
    }
};

export const getAllSubjectsByTrial = async () => {
    try {
        const response = await api.get("/getAllByTrial");
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        throw error;
    }
};
import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/subjects";

const api = createApiInstance(API_URL);

export const listAllSubjects = async () => {
    const res = await api.get("");
    return res.data;
};
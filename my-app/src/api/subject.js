import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/subjects";

const api = createApiInstance(API_URL);

export const listAllSubjects = async () => {
    const res = await api.get("");
    return res.data;
};

export const searchSubjectsByTrial = async (keyword) => {
    try {
        const response = await api.get(`/searchByTrial`, { params: { q: keyword } });
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

export const saveSubject = async (subjectData) => {
    const payload = {
        subjectCode: subjectData.subjectCode,
        subjectName: subjectData.subjectName,
        credit: subjectData.credit,
        description: subjectData.description || null,
        system: subjectData.system,
        isActive: subjectData.isActive,
        imageFileId: subjectData.imageFileId || null
    };

    const response = await api.post("/save", payload);
    return response.data;
};

export const getAllSubjects = async () => {
    const response = await api.get("/getAll");
    return response.data;
};

export const searchSubjects = async (keyword, system, isActive) => {
    const response = await api.get("/search", {
        params: {
            keyword,
            system,
            isActive
        },
    });
    return response.data;
};

export const getSubjectById = async (subjectId) => {
    const response = await api.get(`/getById/${subjectId}`);
    return response.data;
};

export const updateSubject = async (subjectData) => {
    const payload = {
        id: subjectData.id,
        subjectName: subjectData.subjectName || null,
        credit: subjectData.credit ?? null,
        description: subjectData.description || null,
        system: subjectData.system || null,
        isActive: subjectData.isActive,

        imageFileId: subjectData.imageFileId,
    };

    const response = await api.put("/update", payload);
    return response.data;
};

export const deleteSubject = async (subjectId) => {
    const response = await api.delete(`/deleteById/${subjectId}`);
    return response.data;
};
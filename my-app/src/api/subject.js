import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/subjects";
const api = createApiInstance(API_URL);

export const listAllSubjects = async () => {
    const res = await api.get("");
    return res.data;
};

export const getAllSubjects = async () => {
    const res = await api.get("");
    return res.data;
};

export const searchSubjectsByTrial = async (keyword) => {
    const response = await api.get(`/searchByTrial`, { params: { q: keyword } });
    return response.data;
};

export const getAllSubjectsByTrial = async () => {
    const response = await api.get("/getAllByTrial");
    return response.data;
};

export const saveSubject = async (subjectData) => {
    const payload = {
        subjectCode: subjectData.subjectCode,
        subjectName: subjectData.subjectName,
        hours:
            subjectData.hours === "" || subjectData.hours === null
                ? null
                : Number(subjectData.hours),
        semester:
            subjectData.semester === "" || subjectData.semester === null
                ? null
                : subjectData.semester,
        description: subjectData.description || null,
        systemId: subjectData.systemId || null,
        isActive: subjectData.isActive,
        imageFileId: subjectData.imageFileId || null,
    };

    const response = await api.post("/save", payload);
    return response.data;
};
export const searchSubjects = async ({
                                         keyword = "",
                                         system,
                                         isActive,
                                         semester,                                            // ⭐ thêm filter học kỳ
                                     } = {}) => {
    const response = await api.get("/search", {
        params: {
            keyword,
            systemId: system,
            isActive,
            semester,                                     // ⭐ new
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
        subjectCode:
            subjectData.subjectCode === undefined || subjectData.subjectCode === null
                ? null
                : subjectData.subjectCode,
        subjectName: subjectData.subjectName || null,
        hours:
            subjectData.hours === "" || subjectData.hours === null
                ? null
                : Number(subjectData.hours),
        semester:
            subjectData.semester === "" || subjectData.semester === null
                ? null
                : subjectData.semester,
        description: subjectData.description || null,
        systemId: subjectData.systemId || null,
        isActive: subjectData.isActive,
        imageFileId: subjectData.imageFileId || null,
    };

    const response = await api.put("/update", payload);
    return response.data;
};

export const deleteSubject = async (subjectId) => {
    const response = await api.delete(`/deleteById/${subjectId}`);
    return response.data;
};
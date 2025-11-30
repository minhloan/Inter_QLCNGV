import createApiInstance from "./createApiInstance.js";

const api = createApiInstance("/v1/teacher/skill");

// Get all skills
export const getAllSkills = async () => {
    const response = await api.get("");
    return response.data;
};

// Create new skill
export const createSkill = async (skillData) => {
    const response = await api.post("", skillData);
    return response.data;
};

// Update skill
export const updateSkill = async (id, skillData) => {
    const response = await api.put(`/${id}`, skillData);
    return response.data;
};

// Delete skill
export const deleteSkill = async (id) => {
    await api.delete(`/${id}`);
};

// Toggle isNew flag
export const toggleSkillNew = async (id, isNew) => {
    const response = await api.patch(`/${id}/toggle-new`, { isNew });
    return response.data;
};

// Get skill by ID
export const getSkillById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

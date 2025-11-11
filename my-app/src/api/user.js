import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/user";

const api = createApiInstance(API_URL);

export const saveUser = async (userData) => {
  const response = await api.post("/save", userData);
  return response.data;
};
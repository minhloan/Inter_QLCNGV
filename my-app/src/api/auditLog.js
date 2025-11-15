import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/audit-logs";

const api = createApiInstance(API_URL);

export const getAuditLogs = async (page = 0, size = 20, keyword = null) => {
  const params = { page, size };
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }
  const response = await api.get("", { params });
  return response.data;
};


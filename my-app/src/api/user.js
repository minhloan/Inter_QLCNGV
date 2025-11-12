import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/user";

const api = createApiInstance(API_URL);

export const saveUser = async (userData) => {
  const response = await api.post("/save", userData);
  return response.data;
};

export const getAllUsers = async (pageNo = 1, pageSize = 10) => {
  const response = await api.get("/getAllUsers", {
    params: { pageNo, pageSize }
  });
  return response.data;
};

export const searchUsers = async (keyword, pageNo = 1, pageSize = 10) => {
  const response = await api.get("/search", {
    params: { keyword, pageNo, pageSize }
  });
  return response.data;
};

export const updateUser = async (userData, file = null) => {
  const formData = new FormData();
  
  // Tạo request object
  const request = {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    password: userData.password || null,
    userDetails: {
      phoneNumber: userData.phone,
      address: userData.address || null,
      aboutMe: userData.notes || null
    }
  };
  
  // Thêm request vào formData
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  
  // Thêm file nếu có
  if (file) {
    formData.append('file', file);
  }
  
  const response = await api.put("/update", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/deleteUserById/${userId}`);
  return response.data;
};
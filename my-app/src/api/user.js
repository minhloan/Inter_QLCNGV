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

export const getUserByIdForAdmin = async (userId) => {
  const response = await api.get(`/getUserForAdminByUserId/${userId}`);
  return response.data;
};

export const getCurrentUserInfo = async () => {
  const response = await api.get("/information");
  return response.data;
};

export const updateUserById = async (userData) => {
  const formData = new FormData();

  const request = {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    password: userData.password || null,
    status: userData.status || null,
    userDetails: {
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      phoneNumber: userData.phoneNumber || null,
      gender: userData.gender || null,
      aboutMe: userData.aboutMe || userData.notes || null,
      birthDate: userData.birthDate || null,
      country: userData.country || null,
      province: userData.province || null,
      district: userData.district || null,
      ward: userData.ward || null,
      house_number: userData.house_number || null,
      qualification: userData.qualification || null,
      skills: userData.skills || null
    }
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" })
  );

  if (userData.file) {
    formData.append("file", userData.file);
  }

  const response = await api.put("/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/deleteUserById/${userId}`);
  return response.data;
};
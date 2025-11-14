import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/file";

const api = createApiInstance(API_URL);

export const getFile = async (fileId) => {
  try {
    const response = await api.get(`/get/${fileId}`, {
      responseType: 'blob' // Important: get as blob
    });
    
    // Create blob URL from response
    const blob = new Blob([response.data]);
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    // Only log non-404 errors (404 means file doesn't exist, which is fine)
    if (error.response?.status !== 404) {
      console.error('Error getting file:', error);
    }
    throw error;
  }
};

export const getFileAsDataUrl = async (fileId) => {
  try {
    const response = await api.get(`/get/${fileId}`, {
      responseType: 'blob'
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error('Error getting file as data URL:', error);
    throw error;
  }
};
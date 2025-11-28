import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/file";

const api = createApiInstance(API_URL);

export const getFile = async (fileId) => {
  try {
    const response = await api.get(`/get/${fileId}`, {
      responseType: 'blob'
    });

    // Axios trả về trực tiếp Blob với đúng content-type từ server,
    // dùng luôn blob này để giữ nguyên metadata (image/jpeg, application/pdf, ...)
    const blob = response.data;
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

export const downloadTrialReport = async (fileId, trialId, format = 'pdf') => {
    try {
        const response = await api.get(`/download-trial-report/${fileId}`, {
            params: { format },
            responseType: 'blob'
        });

        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = `trial_report_${trialId}.${format}`; // default with format
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (filenameMatch && filenameMatch[1]) {
                let serverFilename = filenameMatch[1];
                // Ensure the filename has the correct extension
                if (!serverFilename.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
                    // Remove any existing extension and add the correct one
                    serverFilename = serverFilename.replace(/\.[^/.]+$/, "") + `.${format}`;
                }
                filename = serverFilename;
            }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return filename;
    } catch (error) {
        console.error('Error downloading trial report:', error);
        throw new Error('Download failed');
    }
};

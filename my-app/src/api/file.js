import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/file";
const api = createApiInstance(API_URL);

// ===================================================================
// LẤY FILE DƯỚI DẠNG BLOB → TRẢ VỀ BLOB URL
// ===================================================================
export const getFile = async (fileId) => {
  try {
    const response = await api.get(`/get/${fileId}`, {
      responseType: 'blob'
    });

    const blob = response.data;
    return URL.createObjectURL(blob);
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error('Error getting file:', error);
    }
    throw error;
  }
};

// ===================================================================
// LẤY FILE DƯỚI DẠNG DATA URL (Base64)
// ===================================================================
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

// ===================================================================
// DOWNLOAD TRIAL REPORT (.pdf, .docx hoặc format khác)
// ===================================================================
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

    // Lấy filename từ header
    const contentDisposition = response.headers['content-disposition'];
    let filename = `trial_report_${trialId}.${format}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        let serverFilename = match[1];
        if (!serverFilename.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
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

// ===================================================================
// DOWNLOAD EVIDENCE FILE (ảnh hoặc PDF)
// ===================================================================
export const downloadEvidenceFile = async (fileId, evidenceId, filename) => {
  try {
    const response = await api.get(`/get/${fileId}`, {
      responseType: 'blob'
    });

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Nếu không truyền filename → tự detect từ content-type
    let downloadFilename = filename;

    if (!downloadFilename) {
      downloadFilename = `evidence_${evidenceId || fileId}`;
      const contentType = response.headers['content-type'];

      if (contentType) {
        if (contentType.includes('pdf')) downloadFilename += '.pdf';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) downloadFilename += '.jpg';
        else if (contentType.includes('png')) downloadFilename += '.png';
      }
    }

    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return downloadFilename;

  } catch (error) {
    console.error('Error downloading evidence file:', error);
    throw new Error('Download failed');
  }
};

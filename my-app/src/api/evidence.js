import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/evidence";

const api = createApiInstance(API_URL);

/**
 * Upload evidence file with OCR processing
 * @param {File} file - The file to upload (PDF or Image)
 * @param {string} teacherId - Teacher ID
 * @param {string} subjectId - Subject ID (optional)
 * @param {string} submittedDate - Submitted date in format "yyyy-MM-dd" (optional)
 * @returns {Promise<Object>} Evidence response
 */
export const uploadEvidence = async (file, teacherId, subjectId = null, submittedDate = null) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("teacherId", teacherId);
        if (subjectId) {
            formData.append("subjectId", subjectId);
        }
        if (submittedDate) {
            formData.append("submittedDate", submittedDate);
        }

        const response = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading evidence:", error);
        throw error;
    }
};

/**
 * Get evidence by ID
 * @param {string} id - Evidence ID
 * @returns {Promise<Object>} Evidence response
 */
export const getEvidenceById = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching evidence:", error);
        throw error;
    }
};

/**
 * Get all evidences by teacher ID
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} List of evidences
 */
export const getEvidencesByTeacher = async (teacherId) => {
    try {
        const response = await api.get(`/teacher/${teacherId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching evidences by teacher:", error);
        throw error;
    }
};

/**
 * Get all evidences by status
 * @param {string} status - Status (PENDING, VERIFIED, REJECTED)
 * @returns {Promise<Array>} List of evidences
 */
export const getEvidencesByStatus = async (status) => {
    try {
        const response = await api.get(`/status/${status}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching evidences by status:", error);
        throw error;
    }
};

/**
 * Get all evidences
 * @returns {Promise<Array>} List of all evidences
 */
export const getAllEvidences = async () => {
    try {
        const response = await api.get("");
        return response.data;
    } catch (error) {
        console.error("Error fetching all evidences:", error);
        throw error;
    }
};

/**
 * Update OCR text manually
 * @param {string} id - Evidence ID
 * @param {Object} ocrData - OCR data {ocrText, ocrFullName, ocrEvaluator}
 * @returns {Promise<Object>} Updated evidence
 */
export const updateOCRText = async (id, ocrData) => {
    try {
        const response = await api.put(`/${id}/ocr-text`, ocrData);
        return response.data;
    } catch (error) {
        console.error("Error updating OCR text:", error);
        throw error;
    }
};

/**
 * Verify evidence (approve or reject)
 * @param {string} id - Evidence ID
 * @param {string} verifiedById - Verifier user ID
 * @param {boolean} approved - true for approve, false for reject
 * @returns {Promise<Object>} Updated evidence
 */
export const verifyEvidence = async (id, verifiedById, approved) => {
    try {
        const formData = new FormData();
        formData.append("verifiedById", verifiedById);
        formData.append("approved", approved);

        const response = await api.post(`/${id}/verify`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying evidence:", error);
        throw error;
    }
};

/**
 * Reprocess OCR for an evidence
 * @param {string} id - Evidence ID
 * @returns {Promise<string>} Success message
 */
export const reprocessOCR = async (id) => {
    try {
        const response = await api.post(`/${id}/reprocess-ocr`);
        return response.data;
    } catch (error) {
        console.error("Error reprocessing OCR:", error);
        throw error;
    }
};


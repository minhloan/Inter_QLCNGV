import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/trial";

const api = createApiInstance(API_URL);

// Trial Teaching APIs
export const createTrial = async (trialData) => {
    const response = await api.post("", trialData);
    console.log()
    return response.data;
};

export const getAllTrials = async () => {
    const response = await api.get("");
    return response.data;
};

export const getMyTrials = async () => {
    const response = await api.get("/my");
    return response.data;
};

export const getTrialById = async (trialId) => {
    const response = await api.get(`/${trialId}`);
    return response.data;
};

export const updateTrialStatus = async (trialId, status) => {
    const response = await api.patch(`/${trialId}/status`, null, {
        params: { status }
    });
    return response.data;
};

// Trial Evaluation APIs
export const evaluateTrial = async (evaluationData) => {
    const response = await api.post("/evaluate", evaluationData);
    return response.data;
};

export const getTrialEvaluation = async (trialId) => {
    const response = await api.get(`/evaluation/${trialId}`);
    return response.data;
};

// Trial Attendee APIs
export const addAttendee = async (attendeeData) => {
    const response = await api.post("/attendee", attendeeData);
    return response.data;
};

export const getTrialAttendees = async (trialId) => {
    const response = await api.get(`/attendee/${trialId}`);
    return response.data;
};

export const removeAttendee = async (attendeeId) => {
    const response = await api.delete(`/attendee/${attendeeId}`);
    return response.data;
};

// File Upload API (assuming there's a file service)
export const uploadTrialReport = async (file, trialId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('trialId', trialId);

    const fileApi = createApiInstance("/v1/teacher/file");
    const response = await fileApi.post("/upload-trial-report", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const downloadTrialReport = async (fileId) => {
    const fileApi = createApiInstance("/v1/teacher/file");
    const response = await fileApi.get(`/download-trial-report/${fileId}`, {
        responseType: 'blob'
    });
    return response.data;
};

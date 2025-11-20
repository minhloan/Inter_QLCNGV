import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/reports";

const api = createApiInstance(API_URL);

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get reports (admin)
export const getReports = async (params = {}) => {
  try {
    const response = await api.get('', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Generate report (admin)
export const generateReport = async (reportRequest) => {
  try {
    const response = await api.post('/generate', reportRequest);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Download report
export const downloadReport = async (reportId, format) => {
  try {
    const response = await api.get(`/download/${reportId}?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// Personal reports (teacher)
export const getPersonalReports = async () => {
  try {
    const response = await api.get('/personal');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal reports:', error);
    throw error;
  }
};

// Generate personal report (teacher)
export const generatePersonalReport = async (reportRequest) => {
  try {
    const response = await api.post('/personal/generate', reportRequest);
    return response.data;
  } catch (error) {
    console.error('Error generating personal report:', error);
    throw error;
  }
};

// Personal subjects taught
export const getPersonalSubjects = async () => {
  try {
    const response = await api.get('/personal/subjects');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal subjects:', error);
    throw error;
  }
};

// Personal pass rates
export const getPersonalPassRates = async () => {
  try {
    const response = await api.get('/personal/pass-rates');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal pass rates:', error);
    throw error;
  }
};

// Personal evidence
export const getPersonalEvidence = async () => {
  try {
    const response = await api.get('/personal/evidence');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal evidence:', error);
    throw error;
  }
};

// Personal exams participated
export const getPersonalExams = async () => {
  try {
    const response = await api.get('/personal/exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal exams:', error);
    throw error;
  }
};

// Personal trials participated
export const getPersonalTrials = async () => {
  try {
    const response = await api.get('/personal/trials');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal trials:', error);
    throw error;
  }
};

// Personal assignments
export const getPersonalAssignments = async () => {
  try {
    const response = await api.get('/personal/assignments');
    return response.data;
  } catch (error) {
    console.error('Error fetching personal assignments:', error);
    throw error;
  }
};

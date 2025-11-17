import createApiInstance from "./createApiInstance";

const API_URL = "/v1/teacher/teachingAssignment";
const api = createApiInstance(API_URL);

/**
 * GET /v1/teacher/teachingAssignment
 * return: TeachingAssignmentListItemResponse[]
 */
export const getAllTeachingAssignments = async () => {
    const res = await api.get("");
    return res.data;
};

/**
 * POST /v1/teacher/teachingAssignment
 * body: { teacherId, subjectId, year, quarter, notes }
 * return: TeachingAssignmentDetailResponse
 */
export const createTeachingAssignment = async (payload) => {
    const res = await api.post("", payload);
    return res.data;
};

/**
 * GET /v1/teacher/teachingAssignment/eligibility?teacherId=&subjectId=
 * return: TeachingEligibilityResponse
 */
export const checkTeachingEligibility = async (teacherId, subjectId) => {
    const res = await api.get("/eligibility", {
        params: { teacherId, subjectId },
    });
    return res.data;
};

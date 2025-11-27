import createApiInstance from "./createApiInstance.js";

// Instance riêng cho Excel API
const excelApi = createApiInstance("/v1/teacher/subject-excel");

// IMPORT FILE EXCEL
export const importSubjectsExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await excelApi.post("/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const exportSubjectsExcel = () => {
    return excelApi.get("/export", {
        responseType: "blob",
    });
};

export const exportAllSkillsExcel = () => {
    return excelApi.get("/export-all-skill", {
        responseType: "blob",
    });
};
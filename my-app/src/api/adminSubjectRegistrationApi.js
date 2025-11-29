import createApiInstance from "./createApiInstance.js";

const api = createApiInstance("/v1/teacher/admin/subject-registrations");

export const getAllRegistrationsForAdmin = async () => {
    const res = await api.get("/getAll");
    return res.data;
};

export const updateRegistrationStatus = async (id, status) => {
    const res = await api.put(`/update-status/${id}`, { status });
    return res.data;
};

export const getRegistrationDetailForAdmin = async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
};

export const exportRegistrationsExcel = (status = "ALL", teacher = "") => {
    let url = `/export?status=${status}`;

    if (teacher) {
        url += `&teacher=${encodeURIComponent(teacher)}`;
    }

    window.location.href = url;
};


export const importRegistrationsExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/import", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};

// =================== PLAN EXPORT/IMPORT ===================

export const exportPlanExcel = async (teacherId, year) => {
    let url = `/plan/export`;
    const params = {};
    if (teacherId) params.teacherId = teacherId;
    if (year) params.year = year;

    try {
        const response = await api.get(url, {
            params,
            responseType: 'blob', // Important for file download
        });

        // Check if the response is actually a JSON error (sometimes blob response hides this)
        if (response.data.type === 'application/json') {
            const text = await response.data.text();
            const json = JSON.parse(text);
            throw new Error(json.message || json.error || 'Export failed');
        }

        const blob = response.data;
        // Check for small blob size which might indicate an error text
        if (blob.size < 100) {
            const text = await blob.text();
            if (!text.startsWith('PK')) { // Excel files start with PK
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || json.error || text);
                } catch (e) {
                    throw new Error(text || "File generated is invalid");
                }
            }
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const filename = teacherId
            ? `ke_hoach_chuyen_mon_${teacherId}_${year || new Date().getFullYear()}.xlsx`
            : `ke_hoach_tong_hop_${year || new Date().getFullYear()}.xlsx`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        return true; // Success
    } catch (error) {
        console.error("Export error:", error);
        throw error; // Re-throw for caller to handle
    }
};

export const importPlanExcel = async (teacherId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/plan/import?teacherId=${teacherId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};

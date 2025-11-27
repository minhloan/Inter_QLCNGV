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
    let url = `http://localhost:8000/v1/teacher/admin/subject-registrations/export?status=${status}`;

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

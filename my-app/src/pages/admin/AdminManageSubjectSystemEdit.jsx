import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import {
    getSubjectSystemById,
    updateSubjectSystem,
} from "../../api/subjectSystem";

const AdminManageSubjectSystemEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(
            () => setToast((prev) => ({ ...prev, show: false })),
            3000
        );
    }, []);

    // ===================== FORM =====================
    const [formData, setFormData] = useState({
        id: "",
        systemCode: "",
        systemName: "",
        isActive: true,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStatusChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            isActive: e.target.value === "active",
        }));
    };

    // ===================== LOAD DATA =====================
    useEffect(() => {
        const fetchSystem = async () => {
            try {
                setLoading(true);

                const data = await getSubjectSystemById(id);

                setFormData({
                    id: data.id,
                    systemCode: data.systemCode || "",
                    systemName: data.systemName || "",
                    isActive:
                        data.isActive !== undefined ? data.isActive : true,
                });
            } catch (error) {
                console.error(error);
                showToast(
                    "Lỗi",
                    error.response?.data?.message ||
                    "Không thể tải dữ liệu hệ đào tạo",
                    "danger"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSystem();
    }, [id, showToast]);

    // ===================== SAVE =====================
    const handleSave = async () => {
        if (!formData.systemCode.trim()) {
            return showToast("Lỗi", "Mã hệ thống không được để trống", "danger");
        }
        if (!formData.systemName.trim()) {
            return showToast("Lỗi", "Tên hệ thống không được để trống", "danger");
        }

        try {
            setSaving(true);

            const payload = {
                id: formData.id,
                systemCode: formData.systemCode.trim(),
                systemName: formData.systemName.trim(),
                isActive: formData.isActive,
            };

            await updateSubjectSystem(payload);

            showToast("Thành công", "Cập nhật hệ đào tạo thành công", "success");

            navigate(`/manage-subject-systems`);
        } catch (error) {
            console.error(error);
            showToast(
                "Lỗi",
                error.response?.data?.message ||
                "Không thể cập nhật hệ đào tạo",
                "danger"
            );
        } finally {
            setSaving(false);
        }
    };

    // ===================== LOADING =====================
    if (loading) {
        return (
            <Loading fullscreen={true} message="Đang tải dữ liệu hệ đào tạo..." />
        );
    }

    if (!formData.id) {
        return (
            <MainLayout>
                <div className="content-header">
                    <div className="content-title">
                        <button
                            className="back-button"
                            onClick={() => navigate(-1)}
                        >
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Sửa hệ đào tạo</h1>
                    </div>
                </div>

                <div className="empty-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>Không tìm thấy hệ đào tạo</p>
                </div>
            </MainLayout>
        );
    }

    // ===================== UI =====================
    return (
        <MainLayout>
            {/* Header */}
            <div className="content-header">
                <div className="content-title">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="page-title">Sửa hệ đào tạo</h1>
                </div>
            </div>

            {/* Body */}
            <div className="edit-profile-container">
                <div className="edit-profile-content">
                    {/* FORM */}
                    <div className="edit-profile-main">
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN HỆ ĐÀO TẠO</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã hệ</label>
                                    <input
                                        className="form-control"
                                        name="systemCode"
                                        value={formData.systemCode}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tên hệ</label>
                                    <input
                                        className="form-control"
                                        name="systemName"
                                        value={formData.systemName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Trạng thái</label>
                                <select
                                    className="form-control"
                                    value={formData.isActive ? "active" : "inactive"}
                                    onChange={handleStatusChange}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                </select>
                            </div>
                        </div>

                        {/* Save */}
                        <div className="save-button-container">
                            <button
                                className="btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "SAVE"}
                            </button>
                        </div>
                    </div>

                    {/* Không có hình ảnh → giữ layout trống */}
                    <div className="edit-profile-sidebar">
                        <div className="image-upload-section">
                            <h3 className="section-title">HỆ ĐÀO TẠO</h3>
                            <div
                                className="image-placeholder"
                                style={{
                                    width: "100%",
                                    height: "200px",
                                    borderRadius: "8px",
                                    border: "1px dashed #ccc",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <i className="bi bi-diagram-3" style={{ fontSize: 48 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                />
            )}
        </MainLayout>
    );
};

export default AdminManageSubjectSystemEdit;

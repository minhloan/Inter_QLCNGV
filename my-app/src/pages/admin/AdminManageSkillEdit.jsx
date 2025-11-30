import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getSkillById, updateSkill } from "../../api/skill";

const AdminManageSkillEdit = () => {
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
        skillCode: "",
        skillName: "",
        isActive: true,
        isNew: false,
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

    const handleNewChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            isNew: e.target.value === "true",
        }));
    };

    // ===================== LOAD DATA =====================
    useEffect(() => {
        const fetchSkill = async () => {
            try {
                setLoading(true);

                const data = await getSkillById(id);

                setFormData({
                    id: data.id,
                    skillCode: data.skillCode || "",
                    skillName: data.skillName || "",
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    isNew: data.isNew !== undefined ? data.isNew : false,
                });
            } catch (error) {
                console.error(error);
                showToast(
                    "Lỗi",
                    error.response?.data?.message ||
                    "Không thể tải dữ liệu Skill",
                    "danger"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSkill();
    }, [id, showToast]);

    // ===================== SAVE =====================
    const handleSave = async () => {
        if (!formData.skillCode.trim()) {
            return showToast("Lỗi", "Mã Skill không được để trống", "danger");
        }
        if (!formData.skillName.trim()) {
            return showToast("Lỗi", "Tên Skill không được để trống", "danger");
        }

        try {
            setSaving(true);

            const payload = {
                id: formData.id,
                skillCode: formData.skillCode.trim(),
                skillName: formData.skillName.trim(),
                isActive: formData.isActive,
                isNew: formData.isNew,
            };

            await updateSkill(formData.id, payload);

            showToast("Thành công", "Cập nhật Skill thành công", "success");

            // Navigate back after short delay
            setTimeout(() => {
                navigate(`/manage-skills`);
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast(
                "Lỗi",
                error.response?.data?.message ||
                "Không thể cập nhật Skill",
                "danger"
            );
        } finally {
            setSaving(false);
        }
    };

    // ===================== LOADING =====================
    if (loading) {
        return (
            <Loading fullscreen={true} message="Đang tải dữ liệu Skill..." />
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
                        <h1 className="page-title">Sửa Skill</h1>
                    </div>
                </div>

                <div className="empty-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>Không tìm thấy Skill</p>
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
                    <h1 className="page-title">Sửa Skill</h1>
                </div>
            </div>

            {/* Body */}
            <div className="edit-profile-container">
                <div className="edit-profile-content">
                    {/* FORM */}
                    <div className="edit-profile-main">
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN SKILL</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Skill No (Mã)</label>
                                    <input
                                        className="form-control"
                                        name="skillCode"
                                        value={formData.skillCode}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Skill Name (Tên)</label>
                                    <input
                                        className="form-control"
                                        name="skillName"
                                        value={formData.skillName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
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

                                <div className="form-group">
                                    <label className="form-label">Đánh dấu mới</label>
                                    <select
                                        className="form-control"
                                        value={formData.isNew ? "true" : "false"}
                                        onChange={handleNewChange}
                                    >
                                        <option value="true">Skill Mới (NEW)</option>
                                        <option value="false">Skill Cũ</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Save */}
                        <div className="save-button-container">
                            <button
                                className="btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Image Placeholder */}
                    <div className="edit-profile-sidebar">
                        <div className="image-upload-section">
                            <h3 className="section-title">SKILL</h3>
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
                                    backgroundColor: "#f8f9fa"
                                }}
                            >
                                <i className="bi bi-lightning-charge" style={{ fontSize: 48, color: "#adb5bd" }}></i>
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

export default AdminManageSkillEdit;

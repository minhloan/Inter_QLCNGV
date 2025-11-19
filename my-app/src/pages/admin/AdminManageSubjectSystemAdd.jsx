import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

import {
    createSubjectSystem,
    updateSubjectSystem,
    getSubjectSystemById
} from '../../api/subjectSystem';

const AdminManageSubjectSystemAdd = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const editingId = params.get("id");
    const mode = params.get("mode");
    const isEditMode = mode === "edit" && !!editingId;

    const [form, setForm] = useState({
        systemCode: "",
        systemName: "",
        isActive: "active"
    });

    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, title: "", message: "", type: "info" });
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.systemCode.trim()) newErrors.systemCode = "Vui lòng nhập mã hệ đào tạo";
        if (!form.systemName.trim()) newErrors.systemName = "Vui lòng nhập tên hệ đào tạo";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return Object.keys(newErrors)[0];
        }
        return null;
    };

    const scrollToErr = (field) => {
        setTimeout(() => {
            const el =
                document.getElementById(field) ||
                document.querySelector(`[name="${field}"]`);
            if (!el) return;

            const parent = el.closest(".form-group") || el;
            parent.scrollIntoView({ behavior: "smooth", block: "center" });
            if (
                ["INPUT", "SELECT", "TEXTAREA"].includes(
                    el.tagName
                )
            ) {
                el.focus();
            }
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const firstError = validate();
        if (firstError) return scrollToErr(firstError);

        try {
            setLoading(true);
            setLoadingMessage(
                isEditMode ? "Đang cập nhật hệ đào tạo..." : "Đang thêm hệ đào tạo..."
            );

            const payload = {
                systemCode: form.systemCode.trim(),
                systemName: form.systemName.trim(),
                isActive: form.isActive === "active"
            };

            if (isEditMode) {
                payload.id = editingId;
                await updateSubjectSystem(payload);
                showToast("Thành công", "Cập nhật hệ đào tạo thành công!", "success");
            } else {
                await createSubjectSystem(payload);
                showToast("Thành công", "Thêm hệ đào tạo thành công!", "success");
            }

            setTimeout(() => navigate("/manage-subject-systems"), 1500);

        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Lỗi xử lý yêu cầu";
            showToast("Lỗi", msg, "danger");
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    // Load data when editing
    useEffect(() => {
        if (!isEditMode) return;

        const loadDetail = async () => {
            try {
                setLoading(true);
                setLoadingMessage("Đang tải chi tiết hệ đào tạo...");

                const ss = await getSubjectSystemById(editingId);

                setForm({
                    systemCode: ss.systemCode || "",
                    systemName: ss.systemName || "",
                    isActive: ss.isActive ? "active" : "inactive"
                });
            } catch (err) {
                showToast("Lỗi", "Không thể tải thông tin hệ đào tạo", "danger");
            } finally {
                setLoading(false);
                setLoadingMessage("");
            }
        };

        loadDetail();
    }, [isEditMode, editingId, showToast]);

    if (loading) {
        return <Loading fullscreen={true} message={loadingMessage} />;
    }

    return (
        <MainLayout>
            <div className="page-admin-add-subject">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">
                            {isEditMode ? "Cập nhật Hệ đào tạo" : "Thêm Hệ đào tạo"}
                        </h1>
                    </div>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit} noValidate>
                        {/* CODE + NAME */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Mã hệ đào tạo <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="systemCode"
                                        name="systemCode"
                                        className={`form-control ${errors.systemCode ? "is-invalid" : ""}`}
                                        value={form.systemCode}
                                        onChange={handleChange}
                                        placeholder="Nhập mã hệ"
                                        disabled={isEditMode}
                                    />
                                    {errors.systemCode && (
                                        <div className="invalid-feedback">{errors.systemCode}</div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Tên hệ đào tạo <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="systemName"
                                        name="systemName"
                                        className={`form-control ${errors.systemName ? "is-invalid" : ""}`}
                                        value={form.systemName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên hệ"
                                    />
                                    {errors.systemName && (
                                        <div className="invalid-feedback">{errors.systemName}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STATUS */}
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select
                                        id="isActive"
                                        name="isActive"
                                        className="form-select"
                                        value={form.isActive}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/manage-subject-systems')}
                            >
                                <i className="bi bi-x-circle"></i> Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-check-circle"></i>
                                {isEditMode ? "Cập nhật" : "Lưu"}
                            </button>
                        </div>
                    </form>
                </div>

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default AdminManageSubjectSystemAdd;

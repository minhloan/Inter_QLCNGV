import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

import { saveSubject, getSubjectById, updateSubject } from '../../api/subject';
import { listActiveSystems } from '../../api/subjectSystem';
import { getFile } from '../../api/file';
import createApiInstance from '../../api/createApiInstance';

const fileApi = createApiInstance('/v1/teacher/file');

const AdminManageSubjectAdd = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const editingId = searchParams.get('id');
    const mode = searchParams.get('mode');
    const isEditMode = mode === 'edit' && !!editingId;

    const [formData, setFormData] = useState({
        subjectCode: '',
        subjectName: '',
        hours: '',
        semester: '',
        description: '',
        systemId: '',
        status: 'active'
    });

    const [systemOptions, setSystemOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageFileId, setExistingImageFileId] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);


    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.subjectCode.trim()) newErrors.subjectCode = 'Vui lòng nhập mã môn học';
        if (!formData.subjectName.trim()) newErrors.subjectName = 'Vui lòng nhập tên môn học';

        // HOURS
        if (formData.hours && (isNaN(Number(formData.hours)) || Number(formData.hours) <= 0)) {
            newErrors.hours = 'Số giờ phải là số dương';
        }

        if (!formData.systemId) newErrors.systemId = 'Vui lòng chọn hệ đào tạo';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return Object.keys(newErrors)[0];
        return null;
    };

    useEffect(() => {
        const loadSystems = async () => {
            try {
                const list = await listActiveSystems();
                setSystemOptions(list);
            } catch { }
        };
        loadSystems();
    }, []);

    const scrollToErrorField = (fieldName) => {
        setTimeout(() => {
            const el = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
            if (el) {
                const group = el.closest('.form-group');
                (group || el).scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) el.focus();
            }
        }, 150);
    };

    const uploadImage = async (file) => {
        if (!file) return null;
        const fd = new FormData();
        fd.append('image', file);

        const res = await fileApi.post('/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const firstError = validate();
        if (firstError) return scrollToErrorField(firstError);

        try {
            setLoading(true);
            setLoadingMessage(isEditMode ? "Đang cập nhật môn học..." : "Đang lưu môn học...");

            if (isEditMode) {
                let payload = {
                    id: editingId,
                    subjectName: formData.subjectName.trim(),
                    hours: Number(formData.hours),
                    semester: formData.semester,
                    description: formData.description?.trim() || null,
                    systemId: formData.systemId,
                    isActive: formData.status === "active"
                };

                // IMAGE HANDLING
                if (imageRemoved) payload.imageFileId = "";
                else if (imageFile) payload.imageFileId = await uploadImage(imageFile);

                await updateSubject(payload);
                showToast("Thành công", "Cập nhật môn học thành công!", "success");

            } else {

                let imgId = null;
                if (imageFile) imgId = await uploadImage(imageFile);

                const payload = {
                    subjectCode: formData.subjectCode.trim(),
                    subjectName: formData.subjectName.trim(),
                    hours: Number(formData.hours),
                    semester: formData.semester,
                    description: formData.description?.trim() || null,
                    systemId: formData.systemId,
                    isActive: formData.status === "active",
                    imageFileId: imgId
                };

                await saveSubject(payload);
                showToast("Thành công", "Môn học đã được thêm thành công!", "success");
            }

            setTimeout(() => navigate("/manage-subjects"), 1500);

        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể xử lý yêu cầu";
            showToast("Lỗi", msg, "danger");
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    // ====================================================
    // FILE CHANGE
    // ====================================================
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        setImageRemoved(false);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (isEditMode && existingImageFileId) setImageRemoved(true);
    };

    useEffect(() => {
        const loadSubject = async () => {
            if (!isEditMode) return;

            try {
                setLoading(true);
                setLoadingMessage("Đang tải thông tin môn học...");

                const subject = await getSubjectById(editingId);

                setFormData({
                    subjectCode: subject.subjectCode || "",
                    subjectName: subject.subjectName || "",
                    hours: subject.hours ?? "",
                    semester: subject.semester ?? "",
                    description: subject.description || "",
                    systemId: subject.systemId || "",
                    status: subject.isActive ? "active" : "inactive"
                });

                const fileId = subject.imageFileId || null;
                setExistingImageFileId(fileId);

                if (fileId) {
                    try {
                        setImagePreview(await getFile(fileId));
                    } catch {
                        setImagePreview(null);
                    }
                }
            } catch {
                showToast("Lỗi", "Không thể tải môn học", "danger");
            } finally {
                setLoading(false);
                setLoadingMessage("");
            }
        };

        loadSubject();
    }, [isEditMode, editingId]);


    if (loading) {
        return <Loading fullscreen={true} message={loadingMessage || "Đang xử lý..."} />;
    }

    const formSectionWidth = '1200px';

    return (
        <MainLayout>
            <div
                className="page-admin-add-subject page-align-with-form"
                style={{ '--page-section-width': formSectionWidth }}
            >

                {/* HEADER */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate('/manage-subjects')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>

                        <div className="content-title-text">
                            <h1 className="page-title">
                                {isEditMode ? "Cập nhật Môn học" : "Thêm Môn học"}
                            </h1>
                            <p className="page-subtitle">
                                {isEditMode ? "Chỉnh sửa thông tin môn học" : "Tạo mới môn học trong hệ thống"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div
                    className="form-container"
                >
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN MÔN HỌC</h3>

                            {/* subjectCode + subjectName */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã môn học *</label>
                                    <input
                                        type="text"
                                        id="subjectCode"
                                        name="subjectCode"
                                        className={`form-control ${errors.subjectCode ? "is-invalid" : ""}`}
                                        value={formData.subjectCode}
                                        onChange={handleChange}
                                        placeholder="Nhập mã môn học"
                                    />
                                    {errors.subjectCode && <div className="invalid-feedback">{errors.subjectCode}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tên môn học *</label>
                                    <input
                                        type="text"
                                        id="subjectName"
                                        name="subjectName"
                                        className={`form-control ${errors.subjectName ? "is-invalid" : ""}`}
                                        value={formData.subjectName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên môn học"
                                    />
                                    {errors.subjectName && <div className="invalid-feedback">{errors.subjectName}</div>}
                                </div>
                            </div>

                            {/* HOURS + SYSTEM + STATUS */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Số giờ</label>
                                    <input
                                        type="number"
                                        id="hours"
                                        name="hours"
                                        className={`form-control ${errors.hours ? "is-invalid" : ""}`}
                                        value={formData.hours ?? ""}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                hours: e.target.value === "" ? null : e.target.value
                                            }))
                                        }
                                        placeholder="Không bắt buộc"
                                    />
                                    {errors.hours && <div className="invalid-feedback">{errors.hours}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Học kỳ</label>
                                    <select
                                        id="semester"
                                        name="semester"
                                        className="form-select"
                                        value={formData.semester ?? ""}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                semester: e.target.value === "" ? null : e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Chọn học kỳ</option>
                                        <option value="SEMESTER_1">Học kỳ 1</option>
                                        <option value="SEMESTER_2">Học kỳ 2</option>
                                        <option value="SEMESTER_3">Học kỳ 3</option>
                                        <option value="SEMESTER_4">Học kỳ 4</option>
                                    </select>
                                    {errors.semester && <div className="invalid-feedback">{errors.semester}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Hệ đào tạo *</label>
                                    <select
                                        id="systemId"
                                        name="systemId"
                                        className={`form-select ${errors.systemId ? "is-invalid" : ""}`}
                                        value={formData.systemId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Chọn hệ đào tạo</option>
                                        {systemOptions.map((sys) => (
                                            <option key={sys.id} value={sys.id}>
                                                {sys.systemName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.systemId && <div className="invalid-feedback">{errors.systemId}</div>}
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Nhập mô tả môn học..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/manage-subjects')}
                            >
                                <i className="bi bi-x-circle" /> Hủy
                            </button>

                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-check-circle" />
                                {isEditMode ? "Cập nhật" : "Lưu"}
                            </button>
                        </div>
                    </form>

                    {/* IMAGE UPLOAD SECTION */}
                    <div style={{
                        backgroundColor: 'var(--bg-white)',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow)',
                        marginTop: '20px'
                    }}>
                        <h3 className="section-title">ẢNH MÔN HỌC</h3>

                        <div style={{
                            display: 'flex',
                            gap: '30px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap'
                        }}>
                            <div className="image-placeholder profile-picture-placeholder" style={{
                                width: '200px',
                                height: '200px',
                                flexShrink: 0
                            }}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt=""
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "8px"
                                        }}
                                    />
                                ) : (
                                    <i className="bi bi-book" style={{ fontSize: 40 }}></i>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div className="image-upload-actions" style={{ marginBottom: '12px' }}>
                                    <label htmlFor="subject-image-upload-add" className="btn btn-primary">
                                        <i className="bi bi-cloud-upload"></i> Chọn ảnh
                                    </label>

                                    {imagePreview && (
                                        <button type="button" className="btn btn-danger" onClick={handleRemoveImage}>
                                            <i className="bi bi-x-circle"></i> Xóa ảnh
                                        </button>
                                    )}
                                </div>

                                <input
                                    id="subject-image-upload-add"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />

                                <small className="form-text text-muted">
                                    Ảnh không bắt buộc. Kích thước đề xuất: 400x400px
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    toast.show && (
                        <Toast
                            title={toast.title}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast(prev => ({ ...prev, show: false }))}
                        />
                    )
                }
            </div >
        </MainLayout >
    );
};

export default AdminManageSubjectAdd;

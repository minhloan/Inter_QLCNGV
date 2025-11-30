import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

import { getSubjectById, updateSubject } from '../../api/subject';
import { getFile } from '../../api/file';
import { getAllSubjectSystems } from '../../api/subjectSystem';
import createApiInstance from '../../api/createApiInstance';

const fileApi = createApiInstance('/v1/teacher/file');

const AdminManageSubjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [systems, setSystems] = useState([]);

    const [toast, setToast] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
    });

    const [formData, setFormData] = useState({
        id: '',
        subjectCode: '',
        subjectName: '',
        hours: '',            // ⭐ đổi từ credit → hours
        semester: '',         // ⭐ thêm học kỳ
        description: '',
        systemId: '',
        isActive: true,
        imageFileId: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const [originalSubjectCode, setOriginalSubjectCode] = useState('');

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // ================== LOAD SYSTEM LIST ==================
    useEffect(() => {
        const loadSystems = async () => {
            try {
                const res = await getAllSubjectSystems();
                setSystems(res || []);
            } catch {
                showToast("Lỗi", "Không thể tải danh sách hệ đào tạo", "danger");
            }
        };

        loadSystems();
    }, []);

    // ================== UPLOAD ẢNH ==================
    const uploadImage = async (file) => {
        if (!file) return null;
        const fd = new FormData();
        fd.append('image', file);

        const res = await fileApi.post('/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return res.data.id ?? res.data.fileId ?? res.data;
    };

    // ================== LOAD SUBJECT ==================
    useEffect(() => {
        const loadSubject = async () => {
            try {
                setLoading(true);

                const data = await getSubjectById(id);

                const fileId =
                    data.imageFileId ||
                    data.image_subject?.id ||
                    null;

                setFormData({
                    id: data.id,
                    subjectCode: data.subjectCode || '',
                    subjectName: data.subjectName || '',

                    hours: data.hours != null ? String(data.hours) : "",

                    semester: data.semester ?? "",      // ⭐ thêm

                    description: data.description || '',
                    systemId: data.systemId || '',
                    isActive: data.isActive,
                    imageFileId: fileId,
                });

                // Track original skill code to detect changes
                setOriginalSubjectCode(data.subjectCode || '');

                if (fileId) {
                    try {
                        const blobUrl = await getFile(fileId);
                        setImagePreview(blobUrl);
                    } catch { }
                }
            } catch {
                showToast("Lỗi", "Không thể tải dữ liệu môn học", "danger");
            } finally {
                setLoading(false);
            }
        };

        loadSubject();
    }, [id]);

    // ================== INPUT CHANGE ==================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ================== IMAGE ==================
    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageRemoved(true);
        setFormData(prev => ({ ...prev, imageFileId: "__DELETE__" }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        setImageFile(file);
        setImageRemoved(false);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    // ================== SAVE ==================
    const handleSave = async () => {
        if (!formData.subjectCode.trim()) {
            return showToast("Lỗi", "Mã môn học không được để trống", "danger");
        }

        if (!formData.subjectName.trim()) {
            return showToast("Lỗi", "Tên môn học không được để trống", "danger");
        }

        if (formData.hours && Number(formData.hours) <= 0) {
            return showToast("Lỗi", "Số giờ phải là số dương", "danger");
        }

        // 🆕 Validate: Nếu thay đổi Skill Code, bắt buộc phải nhập description
        if (formData.subjectCode.trim() !== originalSubjectCode.trim()) {
            if (!formData.description || !formData.description.trim()) {
                return showToast(
                    "Lỗi",
                    "Mô tả (Description) là bắt buộc khi thêm Skill Code mới",
                    "danger"
                );
            }
        }

        try {
            setSaving(true);

            let newFileId = null;
            if (imageFile) newFileId = await uploadImage(imageFile);

            const payload = {
                id: formData.id,
                subjectCode: formData.subjectCode.trim(),
                subjectName: formData.subjectName.trim(),
                hours:
                    formData.hours === "" || formData.hours === null
                        ? null
                        : Number(formData.hours),
                semester:
                    formData.semester === "" || formData.semester === null
                        ? null
                        : formData.semester,
                description: formData.description || null,
                systemId: formData.systemId || null,
                isActive: formData.isActive,
            };

            if (imageRemoved) payload.imageFileId = "__DELETE__";
            else if (newFileId) payload.imageFileId = newFileId;

            await updateSubject(payload);

            showToast("Thành công", "Cập nhật môn học thành công", "success");
            navigate(`/manage-subject-detail/${formData.id}`);

        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể cập nhật môn học", "danger");
        } finally {
            setSaving(false);
        }
    };

    // ================== UI ==================
    if (loading) return <Loading fullscreen message="Đang tải dữ liệu môn học..." />;

    const formSectionWidth = '1200px';

    return (
        <MainLayout>
            <div
                className="page-admin-edit-subject page-align-with-form"
                style={{ '--page-section-width': formSectionWidth }}
            >
                {/* HEADER */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div className="content-title-text">
                            <h1 className="page-title">Sửa môn học</h1>
                            <p className="page-subtitle">Chỉnh sửa thông tin môn học</p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="form-container">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN MÔN HỌC</h3>

                            {/* CODE + NAME */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã môn học</label>
                                    <input
                                        className="form-control"
                                        name="subjectCode"
                                        value={formData.subjectCode}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mã môn học (Skill No)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tên môn học</label>
                                    <input
                                        className="form-control"
                                        name="subjectName"
                                        value={formData.subjectName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* HOURS + SEMESTER */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Số giờ</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="hours"
                                        value={formData.hours}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Học kỳ </label>
                                    <select
                                        className="form-control"
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Chọn học kỳ</option>
                                        <option value="SEMESTER_1">Học kỳ 1</option>
                                        <option value="SEMESTER_2">Học kỳ 2</option>
                                        <option value="SEMESTER_3">Học kỳ 3</option>
                                        <option value="SEMESTER_4">Học kỳ 4</option>
                                    </select>
                                </div>
                            </div>

                            {/* SYSTEM */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Hệ đào tạo *</label>
                                    <select
                                        className="form-control"
                                        name="systemId"
                                        value={formData.systemId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Chọn hệ đào tạo</option>
                                        {systems.map(sys => (
                                            <option key={sys.id} value={sys.id}>
                                                {sys.systemName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select
                                        className="form-control"
                                        name="isActive"
                                        value={formData.isActive ? "active" : "inactive"}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                isActive: e.target.value === "active",
                                            }))
                                        }
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                <i className="bi bi-x-circle" /> Hủy
                            </button>

                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <i className="bi bi-check-circle" />
                                {saving ? 'Đang lưu...' : 'Cập nhật'}
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
                                            borderRadius: "8px",
                                        }}
                                    />
                                ) : (
                                    <i className="bi bi-book" style={{ fontSize: 40 }}></i>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div className="image-upload-actions" style={{ marginBottom: '12px' }}>
                                    <label htmlFor="subject-image-upload-edit" className="btn btn-primary">
                                        <i className="bi bi-cloud-upload"></i> Chọn ảnh
                                    </label>

                                    {(formData.imageFileId || imagePreview) && (
                                        <button type="button" className="btn btn-danger" onClick={handleClearImage}>
                                            <i className="bi bi-x-circle"></i> Xóa ảnh
                                        </button>
                                    )}
                                </div>

                                <input
                                    id="subject-image-upload-edit"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />

                                <small className="form-text text-muted">
                                    Ảnh không bắt buộc. Kích thước đề xuất: 400x400px
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast title={toast.title} message={toast.message} type={toast.type} />
            )}
        </MainLayout>
    );
};

export default AdminManageSubjectEdit;

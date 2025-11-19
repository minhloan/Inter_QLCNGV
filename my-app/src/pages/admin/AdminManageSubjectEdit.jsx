import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

import { getSubjectById, updateSubject } from '../../api/subject';
import { getFile } from '../../api/file';
import { getAllSubjectSystems } from '../../api/subjectSystem';
import createApiInstance from '../../api/createApiInstance';

// instance upload ảnh
const fileApi = createApiInstance('/v1/teacher/file');

const AdminManageSubjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [systems, setSystems] = useState([]); // ⭐ danh sách hệ đào tạo

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
        credit: '',
        description: '',
        systemId: '',          // ⭐ sửa từ system →
        isActive: true,
        imageFileId: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // ================== LOAD LIST SUBJECT SYSTEM ==================
    useEffect(() => {
        const loadSystems = async () => {
            try {
                const res = await getAllSubjectSystems();
                setSystems(res || []);
            } catch (err) {
                console.error(err);
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
            headers: { 'Content-Type': 'multipart/form-data' }
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
                    credit: data.credit != null ? String(data.credit) : '',
                    description: data.description || '',

                    // ⭐ FIX CHUẨN NHẤT
                    systemId: data.systemId || data.system?.id || '',

                    isActive: data.isActive,
                    imageFileId: fileId
                });

                if (fileId) {
                    try {
                        const blobUrl = await getFile(fileId);
                        setImagePreview(blobUrl);
                    } catch (e) {
                        console.error(e);
                    }
                }

            } catch (err) {
                console.error(err);
                showToast("Lỗi", "Không thể tải dữ liệu môn học", "danger");
            } finally {
                setLoading(false);
            }
        };

        loadSubject();
    }, [id, showToast]);

    // ================== INPUT CHANGE ==================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // chọn system
    const handleSystemChange = (e) => {
        setFormData(prev => ({ ...prev, systemId: e.target.value }));
    };

    // trạng thái
    const handleStatusChange = (e) => {
        setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }));
    };

    // ================== IMAGE ==================
    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageRemoved(true);
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
        if (!formData.subjectName.trim()) {
            return showToast("Lỗi", "Tên môn học không được để trống", "danger");
        }

        try {
            setSaving(true);

            let newFileId = null;
            if (imageFile) newFileId = await uploadImage(imageFile);

            const payload = {
                id: formData.id,
                subjectName: formData.subjectName.trim(),
                credit: parseInt(formData.credit, 10) || null,
                description: formData.description || null,
                systemId: formData.systemId || null, // ⭐ gửi lên đúng field backend cần
                isActive: formData.isActive
            };

            if (imageRemoved) payload.imageFileId = "";
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

    return (
        <MainLayout>

            {/* HEADER */}
            <div className="content-header">
                <div className="content-title">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="page-title">Sửa môn học</h1>
                </div>
            </div>

            {/* BODY */}
            <div className="edit-profile-container">
                <div className="edit-profile-content">

                    {/* LEFT FORM */}
                    <div className="edit-profile-main">
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN MÔN HỌC</h3>

                            {/* CODE + NAME */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã môn học</label>
                                    <input className="form-control" value={formData.subjectCode} disabled />
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

                            {/* CREDIT + SYSTEM */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Số tín chỉ</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="credit"
                                        value={formData.credit}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Hệ đào tạo</label>
                                    <select
                                        className="form-control"
                                        value={formData.systemId}
                                        onChange={handleSystemChange}
                                    >
                                        <option value="">Chọn hệ đào tạo</option>

                                        {systems.map(sys => (
                                            <option key={sys.id} value={sys.id}>
                                                {sys.systemName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* STATUS */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select
                                        className="form-control"
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={handleStatusChange}
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

                        {/* SAVE BUTTON */}
                        <div className="save-button-container">
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'SAVE'}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="edit-profile-sidebar">
                        <div className="image-upload-section">
                            <h3 className="section-title">ẢNH MÔN HỌC</h3>

                            <div className="image-placeholder profile-picture-placeholder">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt=""
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                ) : (
                                    <i className="bi bi-book" style={{ fontSize: 40 }}></i>
                                )}
                            </div>

                            <div className="image-upload-actions">
                                <label htmlFor="subject-image-upload-edit" className="btn btn-primary">
                                    <i className="bi bi-cloud-upload"></i> Chọn ảnh
                                </label>

                                {(formData.imageFileId || imagePreview) && (
                                    <button className="btn btn-danger" onClick={handleClearImage}>
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
                        </div>
                    </div>

                </div>
            </div>

            {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} />}

        </MainLayout>
    );
};

export default AdminManageSubjectEdit;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { saveSubject, getSubjectById, updateSubject } from '../../api/subject';
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
        credit: '',
        description: '',
        system: '',
        status: 'active'
    });

    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);               // file mới chọn
    const [imagePreview, setImagePreview] = useState(null);         // preview
    const [existingImageFileId, setExistingImageFileId] = useState(null); // fileId hiện tại khi edit
    const [imageRemoved, setImageRemoved] = useState(false);        // user muốn xóa ảnh

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.subjectCode.trim()) {
            newErrors.subjectCode = 'Vui lòng nhập mã môn học';
        }

        if (!formData.subjectName.trim()) {
            newErrors.subjectName = 'Vui lòng nhập tên môn học';
        }

        if (!formData.credit.toString().trim()) {
            newErrors.credit = 'Vui lòng nhập số tín chỉ';
        } else if (isNaN(Number(formData.credit)) || Number(formData.credit) <= 0) {
            newErrors.credit = 'Số tín chỉ phải là số dương';
        }

        if (!formData.system) {
            newErrors.system = 'Vui lòng chọn hệ thống';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return Object.keys(newErrors)[0];
        }
        return null;
    };

    const scrollToErrorField = (fieldName) => {
        setTimeout(() => {
            const errorElement = document.getElementById(fieldName) ||
                document.querySelector(`[name="${fieldName}"]`);
            if (errorElement) {
                const formGroup = errorElement.closest('.form-group');
                const targetElement = formGroup || errorElement;
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                if (['INPUT', 'SELECT', 'TEXTAREA'].includes(errorElement.tagName)) {
                    errorElement.focus();
                }
            }
        }, 100);
    };

    const uploadImage = async (file) => {
        if (!file) return null;
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const res = await fileApi.post('/upload', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data; // fileId
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const firstErrorField = validate();
        if (firstErrorField) {
            scrollToErrorField(firstErrorField);
            return;
        }

        try {
            setLoading(true);
            setLoadingMessage(isEditMode ? 'Đang cập nhật môn học...' : 'Đang lưu môn học...');

            let imageFileIdToSend;

            if (isEditMode) {
                // EDIT
                const payload = {
                    id: editingId,
                    subjectName: formData.subjectName.trim(),
                    credit: Number(formData.credit),
                    description: formData.description.trim() || null,
                    system: formData.system,
                    isActive: formData.status === 'active'
                };

                // Xử lý ảnh:
                if (imageRemoved) {
                    // xóa ảnh
                    payload.imageFileId = '';
                } else if (imageFile) {
                    // upload ảnh mới
                    const newFileId = await uploadImage(imageFile);
                    payload.imageFileId = newFileId;
                }
                // nếu không remove, không chọn file mới => không gửi imageFileId => backend không đổi ảnh

                await updateSubject(payload);
                showToast('Thành công', 'Cập nhật môn học thành công!', 'success');
            } else {
                // CREATE
                if (imageFile) {
                    imageFileIdToSend = await uploadImage(imageFile);
                }

                const payload = {
                    subjectCode: formData.subjectCode.trim(),
                    subjectName: formData.subjectName.trim(),
                    credit: Number(formData.credit),
                    description: formData.description.trim() || null,
                    system: formData.system,
                    isActive: formData.status === 'active',
                    imageFileId: imageFileIdToSend || null
                };

                await saveSubject(payload);
                showToast('Thành công', 'Môn học đã được thêm thành công!', 'success');
            }

            setTimeout(() => {
                navigate('/manage-subjects');
            }, 1500);
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Không thể xử lý yêu cầu';
            showToast('Lỗi', errorMessage, 'danger');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        setImageRemoved(false); // chọn file mới => không coi là xóa
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (isEditMode && existingImageFileId) {
            setImageRemoved(true); // đánh dấu xóa
        }
    };

    // Load khi edit
    useEffect(() => {
        const fetchSubjectDetails = async () => {
            if (!isEditMode) return;

            try {
                setLoading(true);
                setLoadingMessage('Đang tải thông tin môn học...');
                const subject = await getSubjectById(editingId);

                setFormData(prev => ({
                    ...prev,
                    subjectCode: subject.subjectCode || '',
                    subjectName: subject.subjectName || '',
                    credit: subject.credit ?? '',
                    description: subject.description || '',
                    system: subject.system || '',
                    status: subject.isActive ? 'active' : 'inactive'
                }));

                const fileId = subject.image_subject?.id || null;
                setExistingImageFileId(fileId);

                if (fileId) {
                    try {
                        const blobUrl = await getFile(fileId);
                        setImagePreview(blobUrl);
                    } catch (error) {
                        if (error.response?.status !== 404) {
                            console.error('Error loading subject image:', error);
                        }
                        setImagePreview(null);
                    }
                } else {
                    setImagePreview(null);
                }
            } catch (error) {
                const message = error.response?.data?.message || 'Không thể tải thông tin môn học';
                showToast('Lỗi', message, 'danger');
            } finally {
                setLoading(false);
                setLoadingMessage('');
            }
        };

        fetchSubjectDetails();
    }, [editingId, isEditMode, showToast]);

    // Cleanup blob URLs nếu dùng URL.createObjectURL (ở đây mình dùng base64 nên không cần, nhưng để sẵn nếu sau đổi)
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    if (loading) {
        return <Loading fullscreen={true} message={loadingMessage || 'Đang xử lý...'} />;
    }

    return (
        <MainLayout>
            <div className="page-admin-add-subject">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate('/manage-subjects')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">
                            {isEditMode ? 'Cập nhật Môn học' : 'Thêm Môn học'}
                        </h1>
                    </div>
                </div>

                <div className="form-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Mã môn học
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.subjectCode ? 'is-invalid' : ''}`}
                                        id="subjectCode"
                                        name="subjectCode"
                                        value={formData.subjectCode}
                                        onChange={handleChange}
                                        placeholder="Nhập mã môn học"
                                        disabled={isEditMode} // thường không cho đổi mã
                                    />
                                    {errors.subjectCode && (
                                        <div className="invalid-feedback">{errors.subjectCode}</div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Tên môn học
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.subjectName ? 'is-invalid' : ''}`}
                                        id="subjectName"
                                        name="subjectName"
                                        value={formData.subjectName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên môn học"
                                    />
                                    {errors.subjectName && (
                                        <div className="invalid-feedback">{errors.subjectName}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Số tín chỉ
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.credit ? 'is-invalid' : ''}`}
                                        id="credit"
                                        name="credit"
                                        value={formData.credit}
                                        onChange={handleChange}
                                        placeholder="Nhập số tín chỉ"
                                        min="1"
                                    />
                                    {errors.credit && (
                                        <div className="invalid-feedback">{errors.credit}</div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Hệ thống
                                        <span className="required">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.system ? 'is-invalid' : ''}`}
                                        id="system"
                                        name="system"
                                        value={formData.system}
                                        onChange={handleChange}
                                    >
                                        <option value="">Chọn hệ thống</option>

                                        <option value="ACN_PRO_OV7096">ACN Pro OV 7096</option>
                                        <option value="ARENA_OV6899">Skill Arena OV 6899</option>
                                        <option value="APTECH_OV7091">Skill Aptech OV 7091</option>
                                        <option value="APTECH_OV7195">Skill Aptech OV 7195</option>
                                    </select>

                                    {errors.system && (
                                        <div className="invalid-feedback">{errors.system}</div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Trạng thái
                                        <span className="required">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="4"
                                placeholder="Nhập mô tả môn học..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Ảnh môn học */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Ảnh môn học</label>
                                    <div className="image-upload-section">
                                        <div className="image-placeholder" style={{ width: '100%', height: '200px', border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Subject"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        console.error('Failed to load image preview');
                                                        e.target.style.display = 'none';
                                                        setImagePreview(null);
                                                    }}
                                                />
                                            ) : (
                                                <i className="bi bi-image" style={{ fontSize: '40px', color: '#bbb' }}></i>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                            <label
                                                htmlFor="subject-image-upload"
                                                className="btn btn-outline-primary"
                                                style={{ cursor: 'pointer', flex: 1 }}
                                            >
                                                <i className="bi bi-cloud-upload"></i> Chọn ảnh
                                            </label>
                                            { (isEditMode && (existingImageFileId || imagePreview)) && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    style={{ flex: 1 }}
                                                    onClick={handleRemoveImage}
                                                >
                                                    <i className="bi bi-trash"></i> Xóa ảnh
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            id="subject-image-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                        <small
                                            className="form-text text-muted"
                                            style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}
                                        >
                                            Chọn ảnh đại diện cho môn học (không bắt buộc)
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/manage-subjects')}
                                disabled={loading}
                            >
                                <i className="bi bi-x-circle"></i>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <i className="bi bi-check-circle"></i>
                                {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default AdminManageSubjectAdd;
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

import { getSubjectById, updateSubject } from '../../api/subject';
import { getFile } from '../../api/file';
import createApiInstance from '../../api/createApiInstance';

// 👉 dùng riêng instance cho file giống bên Add
const fileApi = createApiInstance('/v1/teacher/file');

const AdminManageSubjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    system: '',
    isActive: true,
    imageFileId: null, // id file hiện tại (nếu có)
  });

  const [imagePreview, setImagePreview] = useState(null); // URL hiện ảnh
  const [imageFile, setImageFile] = useState(null);       // file mới chọn
  const [imageRemoved, setImageRemoved] = useState(false);// đánh dấu user muốn xóa ảnh

  const formSectionWidth = '1400px';
  const showImageRemoveButton =
    Boolean(imagePreview) || Boolean(imageFile) || (!imageRemoved && Boolean(formData.imageFileId));

  const showToast = useCallback((title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  }, []);

  // ================== HÀM UPLOAD ẢNH (giống bên Add) ==================
  const uploadImage = async (file) => {
    if (!file) return null;
    const formDataUpload = new FormData();
    // ⚠️ dùng cùng tên field với backend và với trang Add
    formDataUpload.append('image', file);

    const res = await fileApi.post('/upload', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // backend thường trả { id: '...' } -> lấy id đó
    return res.data.id ?? res.data.fileId ?? res.data;
  };

  // ================== LOAD DỮ LIỆU MÔN HỌC ==================
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const data = await getSubjectById(id);

        const imageFileId =
          data.imageFileId ||
          data.image_subject?.id ||
          null;

        setFormData({
          id: data.id,
          subjectCode: data.subjectCode || '',
          subjectName: data.subjectName || '',
          credit: data.credit != null ? String(data.credit) : '',
          description: data.description || '',
          system: data.system || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          imageFileId: imageFileId,
        });

        setImageFile(null);
        setImageRemoved(false);

        if (imageFileId) {
          try {
            const blobUrl = await getFile(imageFileId);
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
        console.error('Error loading subject for edit:', error);
        showToast(
          'Lỗi',
          error.response?.data?.message || 'Không thể tải dữ liệu môn học',
          'danger'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
  }, [id, showToast]);

  // ================== HANDLER FORM ==================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSystemChange = (e) => {
    const value = e.target.value || '';
    setFormData((prev) => ({
      ...prev,
      system: value || '', // APTECH/ARENA
    }));
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      isActive: value === 'active',
    }));
  };

  // ================== ẢNH: XOÁ ẢNH ==================
  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (formData.imageFileId) {
      setImageRemoved(true); // user muốn xóa ảnh hiện tại
    } else {
      setImageRemoved(false);
    }
  };

  // ================== ẢNH: CHỌN ẢNH MỚI ==================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImageRemoved(false); // chọn ảnh mới => không còn trạng thái "xóa"

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ================== SAVE ==================
  const handleSave = async () => {
    if (!formData.id) {
      showToast('Lỗi', 'Thiếu ID môn học', 'danger');
      return;
    }

    if (!formData.subjectName.trim()) {
      showToast('Lỗi', 'Tên môn học không được để trống', 'danger');
      return;
    }

    try {
      setSaving(true);

      // Parse credit
      let creditValue = null;
      if (formData.credit !== '') {
        const parsed = parseInt(formData.credit, 10);
        if (!isNaN(parsed)) {
          creditValue = parsed;
        }
      }

      // Base payload
      const payload = {
        id: formData.id,
        subjectName: formData.subjectName.trim(),
        credit: creditValue,
        description: formData.description || null,
        system: formData.system || null,
        isActive: formData.isActive,
        // imageFileId sẽ xử lý phía dưới
      };

      // Xử lý ảnh:
      if (imageRemoved) {
        // user bấm "Xóa ảnh"
        payload.imageFileId = ''; // backend hiểu là xoá ảnh
      } else if (imageFile) {
        // user chọn ảnh mới -> upload rồi set id mới
        const newFileId = await uploadImage(imageFile);
        if (!newFileId) {
          showToast('Lỗi', 'Không lấy được ID ảnh mới', 'danger');
        } else {
          payload.imageFileId = newFileId;
        }
      }
      // Nếu không imageRemoved, không imageFile => không set imageFileId
      // -> backend KHÔNG đụng tới ảnh hiện tại

      await updateSubject(payload);
      showToast('Thành công', 'Cập nhật môn học thành công', 'success');

      navigate(`/manage-subject-detail/${formData.id}`);
    } catch (error) {
      console.error('Error updating subject:', error);
      showToast(
        'Lỗi',
        error.response?.data?.message || 'Không thể cập nhật môn học',
        'danger'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  // ================== RENDER ==================
  if (loading) {
    return <Loading fullscreen={true} message="Đang tải dữ liệu môn học..." />;
  }

  if (!formData.id) {
    return (
      <MainLayout>
        <div
          className="page-admin-add-subject page-align-with-form"
          style={{ '--page-section-width': formSectionWidth }}
        >
          <div className="content-header">
            <div className="content-title">
              <button className="back-button" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <h1 className="page-title">Sửa môn học</h1>
            </div>
          </div>
          <div className="empty-state">
            <i className="bi bi-exclamation-circle"></i>
            <p>Không tìm thấy môn học</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div
        className="page-admin-add-subject page-align-with-form"
        style={{ '--page-section-width': formSectionWidth }}
      >
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Sửa môn học</h1>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row gy-4 align-items-start">
              <div className="col-12 col-xl-8">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Mã môn học</label>
                      <input
                        type="text"
                        name="subjectCode"
                        className="form-control"
                        value={formData.subjectCode}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Tên môn học</label>
                      <input
                        type="text"
                        name="subjectName"
                        className="form-control"
                        value={formData.subjectName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Số tín chỉ</label>
                      <input
                        type="number"
                        name="credit"
                        className="form-control"
                        value={formData.credit}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Hệ thống</label>
                      <select
                        name="system"
                        className="form-control"
                        value={formData.system || ''}
                        onChange={handleSystemChange}
                      >
                        <option value="">Chọn hệ thống</option>

                        <option value="ACN_PRO_OV7096">ACN Pro OV 7096</option>
                        <option value="ARENA_OV6899">Skill Arena OV 6899</option>
                        <option value="APTECH_OV7091">Skill Aptech OV 7091</option>
                        <option value="APTECH_OV7195">Skill Aptech OV 7195</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
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
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="form-group">
                  <label className="form-label">Ảnh môn học</label>
                  <div className="image-upload-section">
                    <div
                      className="image-placeholder"
                      style={{
                        width: '100%',
                        height: '260px',
                        border: '1px dashed #ccc',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt={formData.subjectName || formData.subjectCode}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Failed to load subject image:', imagePreview);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className="bi bi-book" style={{ fontSize: '48px', color: '#bbb' }}></i>
                      )}
                    </div>

                    <div className="image-upload-actions">
                      <label
                        htmlFor="subject-image-upload-edit"
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-cloud-upload"></i> Chọn ảnh
                      </label>

                      {showImageRemoveButton && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={handleClearImage}
                        >
                          <i className="bi bi-trash"></i> Xóa ảnh
                        </button>
                      )}
                    </div>

                    <input
                      id="subject-image-upload-edit"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />

                    {!formData.imageFileId && !imagePreview && (
                      <p
                        style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        Hiện chưa có ảnh. Chọn một ảnh để tải lên cho môn học này.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                <i className="bi bi-x-circle"></i>
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <i className="bi bi-check-circle"></i>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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

export default AdminManageSubjectEdit;

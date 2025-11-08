import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';

const AddTeacher = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    status: 'active',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã giáo viên';
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      console.log('Submitting teacher data:', {
        ...formData,
        user_id: formData.user_id ? parseInt(formData.user_id) : null
      });
      
      showToast('Thành công', 'Giáo viên đã được thêm thành công!', 'success');
      
      setTimeout(() => {
        navigate('/manage-teacher');
      }, 1500);
    } catch (error) {
      showToast('Lỗi', 'Không thể thêm giáo viên', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  if (loading) {
    return <Loading fullscreen={true} message="Đang lưu thông tin giáo viên..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate('/manage-teacher')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Thêm Giáo viên</h1>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Mã Giáo viên
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                  id="teacherCode"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
                {errors.code && <div className="invalid-feedback">{errors.code}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">User ID (nếu có)</label>
                <input
                  type="number"
                  className="form-control"
                  id="userId"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  placeholder="ID người dùng"
                />
                <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666' }}>
                  Liên kết với tài khoản người dùng
                </small>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Họ và Tên
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                  id="fullName"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
                {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Email
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Số điện thoại
                  <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10,11}"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>
            <div className="col-md-6">
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
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              rows="3"
              placeholder="Nhập địa chỉ..."
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              rows="4"
              placeholder="Nhập ghi chú..."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/manage-teacher')}
              disabled={loading}
            >
              <i className="bi bi-x-circle"></i>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <i className="bi bi-check-circle"></i>
              {loading ? 'Đang lưu...' : 'Lưu'}
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
    </MainLayout>
  );
};

export default AddTeacher;


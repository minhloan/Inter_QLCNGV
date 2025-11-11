import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';
import { saveUser } from '../api/user';

const AddTeacher = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username:'',
    email: '',
    password:'',
    status: 'active',
    gender:'',
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

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 6) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 6 ký tự';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số';
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
      
      // Chuẩn bị dữ liệu gửi lên API (chỉ gửi các trường mà RegisterRequest yêu cầu)
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        status: formData.status,
        gender: formData.gender || null,
        address: formData.address.trim() || null
      };

      await saveUser(userData);

      showToast('Thành công', 'Người dùng đã được thêm thành công!', 'success');

      setTimeout(() => {
        navigate('/manage-teacher');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm người dùng';
      showToast('Lỗi', errorMessage, 'danger');
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
                  Tên đăng nhập
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập (tối thiểu 6 ký tự)"
                  required
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
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
                  placeholder="Nhập email"
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
                  Mật khẩu
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu (tối thiểu 8 ký tự, có chữ và số)"
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666' }}>
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số
                </small>
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
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <select
                  className="form-select"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
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


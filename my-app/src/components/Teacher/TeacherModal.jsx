import { useState, useEffect } from 'react';

const TeacherModal = ({ teacher, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    status: 'active',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        code: teacher.code || teacher.id || '',
        user_id: teacher.user_id || teacher.id || '',
        full_name: teacher.full_name || teacher.username || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        status: teacher.status || 'active',
        notes: teacher.notes || ''
      });
    } else {
      // Reset form when no teacher (add new)
      setFormData({
        code: '',
        user_id: '',
        full_name: '',
        email: '',
        phone: '',
        status: 'active',
        notes: ''
      });
    }
  }, [teacher]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        user_id: formData.user_id ? parseInt(formData.user_id) : null
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ backgroundColor: 'var(--orange-primary)', color: 'white' }}>
          <h5 className="modal-title">
            <i className={`bi ${teacher ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
            {teacher ? 'Sửa Giáo viên' : 'Thêm Giáo viên'}
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="teacherCode" className="form-label">
                  Mã Giáo viên <span className="text-danger">*</span>
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
              <div className="col-md-6">
                <label htmlFor="userId" className="form-label">User ID (nếu có)</label>
                <input
                  type="number"
                  className="form-control"
                  id="userId"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  placeholder="ID người dùng"
                />
                <small className="form-text text-muted">Liên kết với tài khoản người dùng</small>
              </div>
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label">
                  Họ và Tên <span className="text-danger">*</span>
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
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
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
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại <span className="text-danger">*</span>
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
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">
                  Trạng thái <span className="text-danger">*</span>
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
              <div className="col-12">
                <label htmlFor="notes" className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i>Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-circle me-1"></i>Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;


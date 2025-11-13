import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';

const ManageSubjectAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    course: '',
    term: '',
    credits: '',
    hours: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

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
      newErrors.code = 'Vui lòng nhập mã môn học';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên môn học';
    }
    if (!formData.course) {
      newErrors.course = 'Vui lòng chọn khóa học';
    }
    if (!formData.term) {
      newErrors.term = 'Vui lòng chọn term';
    }
    if (!formData.credits) {
      newErrors.credits = 'Vui lòng nhập số tín chỉ';
    }
    if (!formData.hours) {
      newErrors.hours = 'Vui lòng nhập số giờ học';
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
      // Simulate API call
      console.log('Submitting form data:', formData);
      
      showToast('Thành công', 'Môn học đã được thêm thành công!', 'success');
      
      setTimeout(() => {
        navigate('/manage-subjects');
      }, 1500);
    } catch (error) {
      showToast('Lỗi', 'Không thể thêm môn học', 'danger');
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <MainLayout>
      <div className="page-admin-add-teacher">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate('/manage-subjects')}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Thêm Môn Học</h1>
          </div>
        </div>

        <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Mã Môn Học
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                  id="subjectCode"
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
                <label className="form-label">
                  Tên Môn Học
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="subjectName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Khóa Học
                  <span className="required">*</span>
                </label>
                <select
                  className={`form-select ${errors.course ? 'is-invalid' : ''}`}
                  id="courseSelect"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn khóa học</option>
                  <option value="DISM">DISM</option>
                  <option value="ADSE">ADSE</option>
                  <option value="HDSE">HDSE</option>
                </select>
                {errors.course && <div className="invalid-feedback">{errors.course}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Term
                  <span className="required">*</span>
                </label>
                <select
                  className={`form-select ${errors.term ? 'is-invalid' : ''}`}
                  id="termSelect"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn term</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                  <option value="3">Term 3</option>
                  <option value="4">Term 4</option>
                </select>
                {errors.term && <div className="invalid-feedback">{errors.term}</div>}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Số Tín Chỉ
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.credits ? 'is-invalid' : ''}`}
                  id="credits"
                  name="credits"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                />
                {errors.credits && <div className="invalid-feedback">{errors.credits}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Số Giờ Học
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.hours ? 'is-invalid' : ''}`}
                  id="hours"
                  name="hours"
                  min="1"
                  value={formData.hours}
                  onChange={handleChange}
                  required
                />
                {errors.hours && <div className="invalid-feedback">{errors.hours}</div>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="4"
              placeholder="Nhập mô tả về môn học..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">
              Trạng Thái
              <span className="required">*</span>
            </label>
            <select
              className="form-select"
              id="statusSelect"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/manage-subjects')}
            >
              <i className="bi bi-x-circle"></i>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-circle"></i>
              Lưu
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

export default ManageSubjectAdd;


import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';
import { saveUser, getUserByIdForAdmin, updateUserById } from '../api/user';

// Danh sách mã quốc gia
const countryCodes = [
  { code: '+84', country: 'VN', name: 'Việt Nam', flag: '🇻🇳' },
  { code: '+1', country: 'US', name: 'Hoa Kỳ', flag: '🇺🇸' },
  { code: '+44', country: 'GB', name: 'Anh', flag: '🇬🇧' },
  { code: '+86', country: 'CN', name: 'Trung Quốc', flag: '🇨🇳' },
  { code: '+81', country: 'JP', name: 'Nhật Bản', flag: '🇯🇵' },
  { code: '+82', country: 'KR', name: 'Hàn Quốc', flag: '🇰🇷' },
  { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'TH', name: 'Thái Lan', flag: '🇹🇭' },
  { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: '+61', country: 'AU', name: 'Úc', flag: '🇦🇺' },
  { code: '+33', country: 'FR', name: 'Pháp', flag: '🇫🇷' },
  { code: '+49', country: 'DE', name: 'Đức', flag: '🇩🇪' },
  { code: '+39', country: 'IT', name: 'Ý', flag: '🇮🇹' },
  { code: '+34', country: 'ES', name: 'Tây Ban Nha', flag: '🇪🇸' },
  { code: '+7', country: 'RU', name: 'Nga', flag: '🇷🇺' },
  { code: '+91', country: 'IN', name: 'Ấn Độ', flag: '🇮🇳' },
  { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

const AddTeacher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const editingId = searchParams.get('id');
  const mode = searchParams.get('mode');
  const isEditMode = mode === 'edit' && !!editingId;

  const [formData, setFormData] = useState({
    username:'',
    email: '',
    password:'',
    status: 'active',
    countryCode: '+84',
    phoneNumber:'',
    gender:'',
    address: '',
    notes: '',
    firstName: '',
    lastName: '',
    aboutMe: '',
    birthDate: '',
    academicRank: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, phoneNumber: value }));
    if (errors.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
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

    if (!isEditMode) {
      if (!formData.password.trim()) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
        newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số';
      }
    } else if (formData.password.trim() && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số';
    }

    // Validate số điện thoại nếu có nhập
    if (formData.phoneNumber.trim()) {
      const phoneRegex = /^[0-9]{8,15}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Số điện thoại phải có từ 8-15 chữ số';
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return Object.keys(newErrors)[0];
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstErrorField = validate();
    if (firstErrorField) {
      setTimeout(() => {
        const errorElement = document.getElementById(firstErrorField) || 
                           document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          const formGroup = errorElement.closest('.form-group');
          const targetElement = formGroup || errorElement;
          
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'SELECT' || errorElement.tagName === 'TEXTAREA') {
            errorElement.focus();
          }
        }
      }, 100);
      return;
    }

    try {
      setLoadingMessage(isEditMode ? 'Đang cập nhật thông tin giáo viên...' : 'Đang lưu thông tin giáo viên...');
      setLoading(true);

      // Kết hợp mã quốc gia với số điện thoại
      const fullPhoneNumber = formData.phoneNumber.trim() 
        ? `${formData.countryCode}${formData.phoneNumber.trim()}` 
        : null;

      if (isEditMode) {
        await updateUserById({
          id: editingId,
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password?.trim() || null,
          status: formData.status,
          phoneNumber: fullPhoneNumber,
          gender: formData.gender || null,
          address: formData.address.trim() || null,
          notes: formData.notes.trim() || null,
          firstName: formData.firstName.trim() || null,
          lastName: formData.lastName.trim() || null,
          aboutMe: formData.aboutMe.trim() || null,
          birthDate: formData.birthDate || null,
          academicRank: formData.academicRank.trim() || null,
          file: profileImage
        });
        showToast('Thành công', 'Cập nhật giáo viên thành công!', 'success');
      } else {
        const userData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: fullPhoneNumber,
          status: formData.status,
          gender: formData.gender || null,
          address: formData.address.trim() || null
        };

        await saveUser(userData);

        showToast('Thành công', 'Người dùng đã được thêm thành công!', 'success');
      }

      setTimeout(() => {
        navigate('/manage-teacher');
      }, 1500);
    } catch (error) {
      const serverErrors = error.response?.data;
      let errorMessage = error.message || 'Không thể xử lý yêu cầu';

      if (serverErrors && typeof serverErrors === 'object' && !Array.isArray(serverErrors)) {
        const mappedErrors = {};
        Object.entries(serverErrors).forEach(([field, message]) => {
          if (['username', 'email', 'password', 'phoneNumber', 'status'].includes(field)) {
            mappedErrors[field] = message;
          }
        });

        if (Object.keys(mappedErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...mappedErrors }));
        }

        errorMessage = serverErrors.error || serverErrors.message || Object.values(serverErrors)[0] || errorMessage;
      } else if (typeof serverErrors === 'string') {
        errorMessage = serverErrors;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showToast('Lỗi', errorMessage, 'danger');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const showToast = useCallback((title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isEditMode) {
        return;
      }

      try {
        setLoadingMessage('Đang tải thông tin giáo viên...');
        setLoading(true);
        const user = await getUserByIdForAdmin(editingId);

        const parsedPhone = (() => {
          if (!user.phoneNumber) {
            return { code: '+84', number: '' };
          }
          const match = user.phoneNumber.match(/^(\+\d{1,3})(\d{6,})$/);
          if (match) {
            return { code: match[1], number: match[2] };
          }
          return { code: '+84', number: user.phoneNumber.replace(/\D/g, '') };
        })();

        // Format birthDate nếu có
        let formattedBirthDate = '';
        if (user.birthDate) {
          try {
            // Nếu birthDate là string dạng "yyyy-MM-dd" hoặc Date object
            const date = new Date(user.birthDate);
            if (!isNaN(date.getTime())) {
              formattedBirthDate = date.toISOString().split('T')[0];
            }
          } catch (e) {
            formattedBirthDate = user.birthDate;
          }
        }

        setFormData((prev) => ({
          ...prev,
          username: user.username || '',
          email: user.email || '',
          password: '',
          status: (user.active || '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
          countryCode: parsedPhone.code,
          phoneNumber: parsedPhone.number,
          gender: user.gender || '',
          address: user.address || '',
          notes: user.aboutMe || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          aboutMe: user.aboutMe || '',
          birthDate: formattedBirthDate,
          academicRank: user.academic_rank || ''
        }));
      } catch (error) {
        const message = error.response?.data?.message || 'Không thể tải thông tin giáo viên';
        showToast('Lỗi', message, 'danger');
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    };

    fetchUserDetails();
  }, [editingId, isEditMode, showToast]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
  };

  if (loading) {
    return <Loading fullscreen={true} message={loadingMessage || 'Đang xử lý...'} />;
  }

  return (
    <MainLayout>
      <div className="page-admin-add-teacher">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate('/manage-teacher')}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">{isEditMode ? 'Cập nhật Giáo viên' : 'Thêm Giáo viên'}</h1>
          </div>
        </div>

        <div className="form-container">
        <form onSubmit={handleSubmit} noValidate>
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
                  {isEditMode ? 'Mật khẩu mới (tùy chọn)' : 'Mật khẩu'}
                  {!isEditMode && <span className="required">*</span>}
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditMode ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu (tối thiểu 8 ký tự, có chữ và số)'}
                  required={!isEditMode}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666' }}>
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số {isEditMode && '(để trống nếu giữ nguyên)'}
                </small>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <div 
                  className={`input-group ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  style={{ 
                    display: 'flex',
                    border: errors.phoneNumber ? '1px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '0.375rem',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                  }}
                >
                  <div 
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRight: '1px solid #ced4da',
                      padding: '0 6px 0 10px',
                      minWidth: '140px',
                      cursor: 'pointer'
                    }}
                  >
                    <select
                      className="form-select"
                      style={{ 
                        border: 'none',
                        backgroundColor: 'transparent',
                        padding: '0.375rem 24px 0.375rem 4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        appearance: 'none',
                        backgroundImage: 'none',
                        outline: 'none',
                        flex: 1,
                        color: '#212529'
                      }}
                      value={formData.countryCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} {country.code}
                        </option>
                      ))}
                    </select>
                    <span 
                      style={{ 
                        position: 'absolute',
                        right: '10px',
                        fontSize: '10px',
                        color: '#6c757d',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    >
                      ▼
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Nhập số điện thoại (8-15 chữ số)"
                    maxLength={15}
                    style={{ 
                      border: 'none',
                      borderLeft: 'none',
                      flex: 1,
                      paddingLeft: '12px'
                    }}
                  />
                </div>
                {errors.phoneNumber && <div className="invalid-feedback d-block">{errors.phoneNumber}</div>}
                <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                  Ví dụ: {formData.countryCode}912345678
                </small>
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

          {isEditMode && (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Họ</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Nhập họ"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Nhập tên"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthDate"
                      value={formData.birthDate || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Học hàm / học vị</label>
                    <input
                      type="text"
                      className="form-control"
                      name="academicRank"
                      value={formData.academicRank}
                      onChange={handleChange}
                      placeholder="Ví dụ: Thạc sĩ, Tiến sĩ..."
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Ảnh đại diện</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666' }}>
                      Tải ảnh mới nếu muốn cập nhật
                    </small>
                  </div>
                </div>
              </div>
            </>
          )}

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
              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu')}
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

export default AddTeacher;


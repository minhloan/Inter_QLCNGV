import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';
import { saveUser, getUserByIdForAdmin, updateUserById } from '../api/user';
import { getFile } from '../api/file';

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
  const formSectionWidth = isEditMode ? '1400px' : '1200px';

  const [formData, setFormData] = useState({
    username:'',
    email: '',
    password:'',
    status: 'active',
    countryCode: '+84',
    phoneNumber:'',
    gender:'',
    country: '',
    province: '',
    district: '',
    ward: '',
    house_number: '',
    notes: '',
    firstName: '',
    lastName: '',
    aboutMe: '',
    birthDate: '',
    qualification: '',
    skills: []
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [newSkill, setNewSkill] = useState('');

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
          country: formData.country.trim() || null,
          province: formData.province.trim() || null,
          district: formData.district.trim() || null,
          ward: formData.ward.trim() || null,
          house_number: formData.house_number.trim() || null,
          notes: formData.notes.trim() || null,
          firstName: formData.firstName.trim() || null,
          lastName: formData.lastName.trim() || null,
          aboutMe: formData.aboutMe.trim() || null,
          birthDate: formData.birthDate || null,
          qualification: formData.qualification || null,
          skills: formData.skills.length > 0 ? formData.skills : null,
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
          gender: formData.gender || null
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
          country: user.country || '',
          province: user.province || '',
          district: user.district || '',
          ward: user.ward || '',
          house_number: user.house_number || '',
          notes: user.aboutMe || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          aboutMe: user.aboutMe || '',
          birthDate: formattedBirthDate,
          qualification: user.qualification || '',
          skills: user.skills || []
        }));

        // Load profile image if available
        if (user.imageUrl) {
          if (user.imageUrl.startsWith('http')) {
            setProfileImagePreview(user.imageUrl);
          } else {
            try {
              const blobUrl = await getFile(user.imageUrl);
              setProfileImagePreview(blobUrl);
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error('Error loading profile image:', error);
              }
              setProfileImagePreview(null);
            }
          }
        } else {
          setProfileImagePreview(null);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Không thể tải thông tin giáo viên';
        showToast('Lỗi', message, 'danger');
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    };

    fetchUserDetails().then(r => r);
  }, [editingId, isEditMode, showToast]);

  // Cleanup blob URLs when component unmounts or profileImagePreview changes
  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim() && formData.skills.length < 3) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <Loading fullscreen={true} message={loadingMessage || 'Đang xử lý...'} />;
  }

  return (
    <MainLayout>
      <div
        className="page-admin-add-teacher page-align-with-form"
        style={{ '--page-section-width': formSectionWidth }}
      >
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate('/manage-teacher')}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">{isEditMode ? 'Cập nhật Giáo viên' : 'Thêm Giáo viên'}</h1>
          </div>
        </div>

        <div
          className="form-container"
          style={isEditMode ? { display: 'flex', gap: '30px' } : undefined}
        >
          <div className={isEditMode ? 'edit-profile-main' : ''} style={isEditMode ? { flex: 1 } : {}}>
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  Họ và Tên
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
                  {isEditMode ? 'Mật khẩu mới' : 'Mật khẩu'}
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
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số {isEditMode}
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
                    <label className="form-label">Trình độ học vấn</label>
                    <select
                      className="form-select"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                    >
                      <option value="">Chọn trình độ</option>
                      <option value="bachelor">Cử nhân</option>
                      <option value="master">Thạc sĩ</option>
                      <option value="phd">Tiến sĩ</option>
                      <option value="assistant_professor">Phó giáo sư</option>
                      <option value="professor">Giáo sư</option>
                      <option value="specialist">Chuyên viên</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Kỹ năng</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập kỹ năng và nhấn Enter (tối đa 3 kỹ năng)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleAddSkill}
                      disabled={formData.skills.length >= 3}
                    />
                    {formData.skills.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              borderRadius: '16px',
                              fontSize: '13px',
                              gap: '6px'
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(index)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#1976d2',
                                cursor: 'pointer',
                                padding: '0',
                                marginLeft: '4px',
                                fontSize: '14px',
                                lineHeight: '1'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                      {formData.skills.length}/3 kỹ năng
                    </small>
                  </div>
                </div>
              </div>
            </>
          )}

          {isEditMode && (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Quốc gia</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Nhập quốc gia"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      className="form-control"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      placeholder="Nhập tỉnh/thành phố"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Quận/Huyện</label>
                    <input
                      type="text"
                      className="form-control"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Nhập quận/huyện"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Phường/Xã</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      placeholder="Nhập phường/xã"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Số nhà</label>
                    <input
                      type="text"
                      className="form-control"
                      name="house_number"
                      value={formData.house_number}
                      onChange={handleChange}
                      placeholder="Nhập số nhà"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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

          {isEditMode && (
            <div className="edit-profile-sidebar">
              <div className="image-upload-section">
                <h3 className="section-title">ẢNH ĐẠI DIỆN</h3>
                <div className="image-placeholder profile-picture-placeholder">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => {
                        console.error('Failed to load image:', profileImagePreview);
                        e.target.style.display = 'none';
                        setProfileImagePreview(null);
                      }}
                    />
                  ) : (
                    <i className="bi bi-person"></i>
                  )}
                </div>
                <label htmlFor="profile-image-upload" className="btn-upload" style={{ cursor: 'pointer' }}>
                  <i className="bi bi-cloud-upload"></i>
                  CẬP NHẬT ẢNH
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                  Tải ảnh mới nếu muốn cập nhật
                </small>
              </div>
            </div>
          )}
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';
import { getCurrentUserInfo, updateUserById } from '../api/user';
import { getUserInfo } from '../api/auth';
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

const EditProfile = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    studentId: '',
    firstName: '',
    username: '',
    lastName: '',
    dob: '',
    email: '',
    emailVerified: false,
    country: '',
    province: '',
    district: '',
    ward: '',
    house_number: '',
    countryCode: '+84',
    phoneNumber: '',
    bio: '',
    qualification: '',
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');

  // Format date from yyyy-MM-dd to DD/MM/YYYY
  const formatDateForDisplay = (dateString) => {
    if (!dateString || dateString === 'null') return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return '';
    }
  };

  // Format date from DD/MM/YYYY to yyyy-MM-dd
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoadingData(true);
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.userId) {
          showToast('Lỗi', 'Không thể lấy thông tin người dùng', 'danger');
          navigate('/login');
          return;
        }

        const data = await getCurrentUserInfo();
        
        const parsedPhone = (() => {
          if (!data.phoneNumber) {
            return { code: '+84', number: '' };
          }
          const match = data.phoneNumber.match(/^(\+\d{1,3})(\d{6,})$/);
          if (match) {
            return { code: match[1], number: match[2] };
          }
          return { code: '+84', number: data.phoneNumber.replace(/\D/g, '') };
        })();
        
        setFormData({
          id: data.id || '',
          studentId: data.id || '',
          firstName: data.firstName || '',
          username: data.username || '',
          lastName: data.lastName || '',
          dob: formatDateForDisplay(data.birthDate),
          email: data.email || '',
          emailVerified: true,
          country: data.country || '',
          province: data.province || '',
          district: data.district || '',
          ward: data.ward || '',
          house_number: data.house_number || '',
          countryCode: parsedPhone.code,
          phoneNumber: parsedPhone.number,
          bio: data.aboutMe || '',
          qualification: data.qualification || '',
          skills: data.skills || []
        });

        if (data.imageUrl) {
          if (data.imageUrl.startsWith('http')) {
            setProfileImage(data.imageUrl);
          } else {
            try {
              const blobUrl = await getFile(data.imageUrl);
              setProfileImage(blobUrl);
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error('Error loading profile image:', error);
              }
              setProfileImage(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Lỗi', error.response?.data?.message || 'Không thể tải thông tin người dùng', 'danger');
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setFormData(prev => ({
        ...prev,
        bio: value
      }));
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

  const handleVerifyEmail = () => {
    showToast('Thông báo', 'Email verification link has been sent to your email', 'info');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!formData.id) {
        showToast('Lỗi', 'Không tìm thấy ID người dùng', 'danger');
        return;
      }

      const fullPhoneNumber = formData.phoneNumber.trim()
        ? `${formData.countryCode}${formData.phoneNumber.trim()}` 
        : null;

      const updateData = {
        id: formData.id,
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: fullPhoneNumber,
        birthDate: formatDateForAPI(formData.dob),
        country: formData.country,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        house_number: formData.house_number,
        aboutMe: formData.bio,
        qualification: formData.qualification,
        skills: formData.skills,
        file: profileImageFile
      };

      await updateUserById(updateData);
      showToast('Thành công', 'Cập nhật thông tin thành công', 'success');
      
      const data = await getCurrentUserInfo();
      console.log('User data after update:', data);
      console.log('imageUrl from API:', data.imageUrl);
      
      const parsedPhone = (() => {
        if (!data.phoneNumber) {
          return { code: '+84', number: '' };
        }
        const match = data.phoneNumber.match(/^(\+\d{1,3})(\d{6,})$/);
        if (match) {
          return { code: match[1], number: match[2] };
        }
        return { code: '+84', number: data.phoneNumber.replace(/\D/g, '') };
      })();
      
      setFormData(prev => ({
        ...prev,
        bio: data.aboutMe || prev.bio,
        qualification: data.qualification || prev.qualification,
        skills: data.skills || prev.skills,
        countryCode: parsedPhone.code,
        phoneNumber: parsedPhone.number
      }));
      
      if (data.imageUrl) {
        if (data.imageUrl.startsWith('http')) {
          console.log('Setting profile image URL:', data.imageUrl);
          setProfileImage(data.imageUrl);
          setProfileImageFile(null);
        } else {
          try {
            const blobUrl = await getFile(data.imageUrl);
            console.log('Setting profile image blob URL:', blobUrl);
            setProfileImage(blobUrl);
            setProfileImageFile(null);
          } catch (error) {
            console.error('Error loading profile image after update:', error);
            if (profileImage?.startsWith('data:')) {
              console.warn('Failed to load image from server, keeping preview');
            } else {
              setProfileImage(null);
              setProfileImageFile(null);
            }
          }
        }
      } else {
        if (profileImage?.startsWith('data:')) {
          console.warn('No imageUrl from server, keeping preview');
        } else {
          setProfileImage(null);
          setProfileImageFile(null);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  if (loadingData) {
    return <Loading fullscreen={true} message="Đang tải thông tin..." />;
  }

  if (loading) {
    return <Loading fullscreen={true} message="Đang lưu thông tin..." />;
  }

  return (
    <MainLayout>
      <div className="edit-profile-container">
        <div className="edit-profile-content">
          <div className="edit-profile-main">
            {/*<h2 className="student-id-title">Teacher Id: {formData.studentId}</h2>*/}

            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">BASIC INFORMATION</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                  <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          value={formData.lastName}
                          onChange={handleInputChange}
                      />
                  </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                          type="text"
                          name="username"
                          className="form-control"
                          value={formData.username}
                          onChange={handleInputChange}
                      />
                  </div>
                <div className="form-group">
                  <label className="form-label">DOB (DD/MM/YYYY)</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <div 
                          className="input-group"
                          style={{ 
                            display: 'flex',
                            border: '1px solid #ced4da',
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
                        <small className="form-text text-muted" style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                          Ví dụ: {formData.countryCode}912345678
                        </small>
                    </div>
                </div>

            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3 className="section-title">CONTACT INFORMATION</h3>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="email-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {!formData.emailVerified && (
                    <i className="bi bi-exclamation-circle email-warning-icon"></i>
                  )}
                </div>
                {!formData.emailVerified && (
                  <button 
                    type="button" 
                    className="verify-email-link"
                    onClick={handleVerifyEmail}
                  >
                    Verify Email
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Nhập quốc gia"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    name="province"
                    className="form-control"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Nhập tỉnh/thành phố"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quận/Huyện</label>
                  <input
                    type="text"
                    name="district"
                    className="form-control"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Nhập quận/huyện"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phường/Xã</label>
                  <input
                    type="text"
                    name="ward"
                    className="form-control"
                    value={formData.ward}
                    onChange={handleInputChange}
                    placeholder="Nhập phường/xã"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Số nhà</label>
                  <input
                    type="text"
                    name="house_number"
                    className="form-control"
                    value={formData.house_number}
                    onChange={handleInputChange}
                    placeholder="Nhập số nhà"
                  />
                </div>
              </div>
            </div>
              <div className="form-section">
                  <h3 className="section-title">Trình độ học vấn</h3>
                  <div className="form-row">
                      <div className="form-group">
                          <label className="form-label">Trình độ học vấn</label>
                          <div className="select-wrapper">
                              <select
                                  name="qualification"
                                  className="form-control qualification-select"
                                  value={formData.qualification}
                                  onChange={handleInputChange}
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
                              <i className="bi bi-chevron-down select-arrow"></i>
                          </div>
                      </div>
                  </div>
              </div>


              {/* About Me */}
            <div className="form-section">
              <h3 className="section-title">ABOUT ME</h3>
              <div className="form-group bio-group">
                <label className="form-label">Bio</label>
                <div className="bio-wrapper">
                  <textarea
                    name="bio"
                    className="form-control bio-textarea"
                    value={formData.bio}
                    onChange={handleBioChange}
                    placeholder="Bio"
                    rows="4"
                  />
                  <div className="char-count">{formData.bio.length}/50</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="form-section">
              <h3 className="section-title">Skills</h3>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your skill and press Enter (Upto 3 skills)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleAddSkill}
                  disabled={formData.skills.length >= 3}
                />
                {formData.skills.length > 0 && (
                  <div className="skills-tags">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          className="skill-remove"
                          onClick={() => handleRemoveSkill(index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="save-button-container">
              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'SAVE'}
              </button>
            </div>
          </div>

          {/* Right Sidebar - Image Uploads */}
          <div className="edit-profile-sidebar">
            {/* Profile Picture */}
            <div className="image-upload-section">
              <h3 className="section-title">PROFILE PICTURE</h3>
              <div className="image-placeholder profile-picture-placeholder">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => {
                      console.error('Failed to load image:', profileImage);
                      e.target.style.display = 'none';
                      setProfileImage(null);
                    }}
                  />
                ) : (
                  <i className="bi bi-person"></i>
                )}
              </div>
              <label htmlFor="profile-image-upload" className="btn-upload" style={{ cursor: 'pointer' }}>
                <i className="bi bi-cloud-upload"></i>
                UPLOAD
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
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

export default EditProfile;


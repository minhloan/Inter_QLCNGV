import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Toast from '../components/Common/Toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: 'Student1517996',
    firstName: 'THUAN',
    middleName: '',
    lastName: 'NGUYEN TRUNG',
    dob: '26/04/2005',
    email: 'ntthuana23127@cusc.ctu.edu.vn',
    emailVerified: false,
    address: 'VINH QUANG, RACH GIA, KIEN GIANG',
    country: 'VIETNAM',
    state: 'CAN THO',
    city: 'CAN THO',
    pinCode: '',
    bio: '',
    qualification: '',
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Thành công', 'Profile updated successfully', 'success');
    } catch (error) {
      showToast('Lỗi', 'Failed to update profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <MainLayout>
      <div className="edit-profile-container">
        <div className="edit-profile-content">
          <div className="edit-profile-main">
            <h2 className="student-id-title">Student Id: {formData.studentId}</h2>

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
                  <label className="form-label">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    className="form-control"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
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
                <div className="form-group">
                  <label className="form-label">DOB (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    name="dob"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                  />
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
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PinCode</label>
                  <input
                    type="text"
                    name="pinCode"
                    className="form-control"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                  />
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

            {/* Current Qualifications */}
            <div className="form-section">
              <h3 className="section-title">CURRENT QUALIFICATIONS</h3>
              <div className="form-group">
                <div className="select-wrapper">
                  <select
                    name="qualification"
                    className="form-control qualification-select"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  >
                    <option value="">Please select</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                  <i className="bi bi-chevron-down select-arrow"></i>
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
                <i className="bi bi-person"></i>
              </div>
              <button className="btn-upload">
                <i className="bi bi-cloud-upload"></i>
                UPLOAD
              </button>
            </div>

            {/* Cover Image */}
            <div className="image-upload-section">
              <h3 className="section-title">COVER IMAGE</h3>
              <div className="image-placeholder cover-image-placeholder">
                <span>1920 x 1080</span>
              </div>
              <button className="btn-upload">
                <i className="bi bi-cloud-upload"></i>
                UPLOAD
              </button>
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


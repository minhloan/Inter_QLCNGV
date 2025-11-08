import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../api/auth';
import Loading from '../components/Common/Loading';
import '../assets/styles/Login.css';
import '../assets/styles/Common.css';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy email từ sessionStorage (không cần OTP vì đã được verify ở bước trước)
    const savedEmail = sessionStorage.getItem('forgotPasswordEmail');
    
    if (!savedEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);

    try {
      // Không gửi OTP, backend sẽ kiểm tra cờ verified đã được set sau khi verify OTP
      const response = await updatePassword(email, formData.newPassword, null);
      
      if (response.ok) {
        // Xóa dữ liệu tạm
        sessionStorage.removeItem('forgotPasswordEmail');
        sessionStorage.removeItem('verifiedOtp');
        
        // Chuyển đến trang login với thông báo thành công
        navigate('/login', { 
          state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' }
        });
      } else {
        setError(response.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Update password error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Không thể cập nhật mật khẩu. Mã OTP có thể đã hết hạn. Vui lòng thử lại từ đầu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang cập nhật mật khẩu..." />;
  }

  return (
    <div className="login-page-container">
      {/* Left Column - Help Section */}
      <div className="login-left-column">
        <div className="help-content">
          <div className="help-header">
            <div className="phone-illustration">
              <i className="bi bi-lock"></i>
            </div>
            <h1 className="form-welcome">Đặt lại mật khẩu</h1>
          </div>
          <p className="help-description">
            Vui lòng nhập mật khẩu mới của bạn. Mật khẩu phải có ít nhất 8 ký tự.
          </p>
        </div>
      </div>

      {/* Right Column - Update Password Form */}
      <div className="login-right-column">
        <div className="login-form-container">
          <button 
            className="back-button"
            onClick={() => navigate('/verify-otp')}
            type="button"
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          
          <div className="login-form-header">
            <div className="form-logo">
              <div className="logo-circle-form">
                <span>CUSC</span>
              </div>
              <span className="logo-name-form">AptechCanTho</span>
            </div>
            <h2 className="form-welcome">Đặt lại mật khẩu</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-link password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100 mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang cập nhật...
                </>
              ) : (
                'CẬP NHẬT MẬT KHẨU'
              )}
            </button>

            <div className="text-center">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="faqs-link">
                Quay lại đăng nhập
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;


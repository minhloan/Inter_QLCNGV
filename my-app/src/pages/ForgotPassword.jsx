import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import Loading from '../components/Common/Loading';
import '../assets/styles/Login.css';
import '../assets/styles/Common.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.ok) {
        // Lưu email vào sessionStorage để dùng ở các trang sau
        sessionStorage.setItem('forgotPasswordEmail', email);
        navigate('/verify-otp');
      } else {
        setError(response.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang gửi mã OTP..." />;
  }

  return (
    <div className="login-page-container">
      {/* Left Column - Help Section */}
      <div className="login-left-column">
        <div className="help-content">
          <div className="help-header">
            <div className="phone-illustration">
              <i className="bi bi-key"></i>
            </div>
            <h1 className="form-welcome">Quên mật khẩu?</h1>
          </div>
          <p className="help-description">
            Đừng lo lắng! Chúng tôi sẽ gửi mã OTP đến email của bạn để bạn có thể đặt lại mật khẩu.
          </p>
        </div>
      </div>

      {/* Right Column - Forgot Password Form */}
      <div className="login-right-column">
        <div className="login-form-container">
          <button 
            className="back-button"
            onClick={() => navigate('/login')}
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
            <h2 className="form-welcome">Quên mật khẩu?</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                autoFocus
                placeholder="Nhập email của bạn"
              />
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
                  Đang gửi...
                </>
              ) : (
                'GỬI MÃ OTP'
              )}
            </button>

            <div className="text-center">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="faqs-link">
                Nhớ mật khẩu? Đăng nhập
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


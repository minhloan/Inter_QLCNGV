import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, forgotPassword } from '../api/auth';
import Loading from '../components/Common/Loading';
import '../assets/styles/Login.css';
import '../assets/styles/Common.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Lấy email từ sessionStorage
    const savedEmail = sessionStorage.getItem('forgotPasswordEmail');
    if (!savedEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  useEffect(() => {
    // Focus vào input đầu tiên khi component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Countdown cho resend
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index, value) => {
    // Chỉ cho phép số
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtp(email, otpString);
      if (response.ok) {
        // OTP đã được verify, backend đã set cờ verified
        // Không cần lưu OTP vì UpdatePassword sẽ dùng cờ verified
        navigate('/update-password');
      } else {
        setError(response.message || 'Mã OTP không đúng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.ok) {
        setResendCountdown(60); // 60 giây
        setOtp(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Không thể gửi lại mã OTP. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang xác thực mã OTP..." />;
  }

  return (
    <div className="login-page-container">
      {/* Left Column - Help Section */}
      <div className="login-left-column">
        <div className="help-content">
          <div className="help-header">
            <div className="phone-illustration">
              <i className="bi bi-shield-check"></i>
            </div>
            <h1 className="form-welcome">Xác thực OTP</h1>
          </div>
          <p className="help-description">
            Vui lòng nhập mã OTP 6 chữ số đã được gửi đến email của bạn để xác thực.
          </p>
        </div>
      </div>

      {/* Right Column - Verify OTP Form */}
      <div className="login-right-column">
        <div className="login-form-container">
          <button 
            className="back-button"
            onClick={() => navigate('/forgot-password')}
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
            <h2 className="form-welcome">Xác thực</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                Vui lòng nhập mã 6 chữ số đã được gửi đến <strong>{email}</strong>
              </p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="form-control form-control-lg"
                    style={{
                      width: '50px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                  />
                ))}
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
                  Đang xác thực...
                </>
              ) : (
                'XÁC THỰC'
              )}
            </button>

            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  Không nhận được mã? Gửi lại sau {resendCountdown}s
                </p>
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); handleResendOtp(); }} className="faqs-link">
                  Không nhận được mã? Gửi lại
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;


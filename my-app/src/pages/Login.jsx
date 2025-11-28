import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin, getPrimaryRole, getUserInfo, googleLogin } from '../api/auth';
import { GoogleLogin } from '@react-oauth/google';
import Loading from '../components/Common/Loading';
import '../assets/styles/Login.css';
import '../assets/styles/Common.css';
import logo2 from '../assets/images/logo2.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.background = '';
    document.body.style.color = '';
    document.body.style.overflow = '';

    // Kiểm tra thông báo thành công từ location state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Xóa state để không hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }

    if (isAuthenticated && user) {
      const userRole = user.role;
      if (userRole === 'Manage-Leader' || userRole === 'admin') {
        navigate('/module-selection');
      } else if (userRole === 'Teacher' || userRole === 'teacher') {
        navigate('/module-selection');
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    // Check for remembered credentials
    const remembered = localStorage.getItem('rememberMe');
    if (remembered === 'true') {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API login
      const response = await apiLogin({
        email: formData.email,
        password: formData.password
      });

      const token = response.token;

      if (!token) {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      // Lấy role từ token
      const role = getPrimaryRole();
      const userInfo = getUserInfo();

      if (!role) {
        setError('Không thể xác định quyền truy cập. Vui lòng liên hệ quản trị viên.');
        setIsLoading(false);
        return;
      }

      const fullName =
        userInfo?.full_name ||
        response.full_name ||
        response.fullName ||
        response.name ||
        null;

      // Save remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }

      // Login vào context
      login(token, role, userInfo?.email || formData.email, {
        id: userInfo?.userId,
        email: userInfo?.email || formData.email,
        roles: userInfo?.roles || [],
        full_name: fullName
      });

      // Redirect based on role
      if (role === 'Manage-Leader' || role === 'admin') {
        navigate('/module-selection');
      } else if (role === 'Teacher' || role === 'teacher') {
        navigate('/module-selection');
      } else {
        setError('Bạn không có quyền truy cập vào hệ thống.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Google Credential Response:', credentialResponse);

      const response = await googleLogin(credentialResponse.credential);

      const token = response.token;
      const role = getPrimaryRole();
      const userInfo = getUserInfo();

      if (!role) {
        setError('Không thể xác định quyền truy cập. Vui lòng liên hệ quản trị viên.');
        setIsLoading(false);
        return;
      }

      const fullName =
        userInfo?.full_name ||
        response.full_name ||
        response.fullName ||
        response.name ||
        null;

      login(token, role, userInfo?.email, {
        id: userInfo?.userId,
        email: userInfo?.email,
        roles: userInfo?.roles || [],
        full_name: fullName
      });

      if (role === 'Manage-Leader' || role === 'admin') {
        navigate('/module-selection');
      } else if (role === 'Teacher' || role === 'teacher') {
        navigate('/module-selection');
      } else {
        setError('Bạn không có quyền truy cập vào hệ thống.');
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Google Login error:', error);
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập Google thất bại. Email có thể chưa được đăng ký.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang xử lý đăng nhập..." />;
  }

  return (
    <div className="login-page-container">
      {/* Left Column - Help Section */}
      <div className="login-left-column">
        <div className="help-content">
          <div className="help-header">
            <div className="phone-illustration">
              <i className="bi bi-phone"></i>
            </div>
            <h1 className="form-welcome">Cần trợ giúp đăng nhập?</h1>
          </div>
          <p className="help-description">
            Đừng lo lắng! Video hướng dẫn này sẽ hướng dẫn bạn quy trình đăng nhập và giúp bạn bắt đầu chỉ trong vòng một phút.
          </p>

          {/* Video Player */}
          <div className="video-container">
            <div className="video-wrapper">
              {/* <div className="video-placeholder">
                <div className="video-content">
                  <div className="video-header">
                    <div className="video-logo">
                      <div className="logo-circle-small">
                        <span>CUSC</span>
                      </div>
                      <span className="logo-name-small">AptechCanTho</span>
                    </div>
                  </div>
                  <div className="video-body">
                    <h2 className="video-title">Tạo ra kỹ thuật số</h2>
                    <p className="video-subtitle">Trao quyền cho người sáng tạo, thể hiện sự xuất sắc.</p>
                    <button className="video-login-btn">Đăng nhập</button>
                  </div>
                  <div className="video-footer">
                    <span className="video-footer-left">Quản lý bởi CUSC</span>
                    <span className="video-footer-right">ĐIỀU KHOẢN & ĐIỀU KIỆN</span>
                  </div>
                </div>
                <div className="video-controls">
                  <button className="control-btn"><i className="bi bi-play-fill"></i></button>
                  <span className="video-time">0:00 / 0:30</span>
                  <div className="control-right">
                    <button className="control-btn"><i className="bi bi-volume-up"></i></button>
                    <button className="control-btn"><i className="bi bi-arrows-fullscreen"></i></button>
                    <button className="control-btn"><i className="bi bi-three-dots"></i></button>
                  </div>
                </div>
              </div> */}
              <iframe
                src="https://www.youtube.com/embed/LLdL5n-P3Mw"
                title="Hướng dẫn đăng nhập"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="login-tutorial">
            <h3 className="tutorial-title">Hướng dẫn đăng nhập</h3>
            <p className="tutorial-description">Một video hướng dẫn nhanh về quy trình đăng nhập.</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="login-right-column">
        <div className="login-form-container">
          <button
            className="back-button"
            onClick={() => navigate('/')}
            type="button"
          >
            <i className="bi bi-arrow-left"></i>
          </button>

          <div className="login-form-header">
            <div className="form-logo">
              <div className="logo-circle-form">
                <img
                  src={logo2}
                  alt="logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    padding: '2px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              <span className="logo-name-form">AptechCanTho</span>
            </div>
            <h2 className="form-welcome">Chào Mừng </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Nhập email của bạn"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mật khẩu</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            <div className="mb-3 text-end">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="forgot-password-link">Quên mật khẩu?</a>
            </div>

            <div className="mb-3 terms-text">
              <small className="text-muted">Bằng cách nhấp vào đăng nhập, bạn chấp nhận <a href="#" className="terms-link">Điều khoản và điều kiện.</a></small>
            </div>

            {successMessage && (
              <div className="alert alert-success" role="alert" style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}>
                <i className="bi bi-check-circle me-2"></i>
                <span>{successMessage}</span>
              </div>
            )}

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
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>

            <div className="google-login-container text-center mb-3">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">Hoặc</span>
                <hr className="flex-grow-1" />
              </div>
              <div className="d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Đăng nhập Google thất bại')}
                  useOneTap
                  shape="circle"
                  width="100%"
                />
              </div>
            </div>

            <div className="text-center">
              <a href="#" className="faqs-link">FAQs</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


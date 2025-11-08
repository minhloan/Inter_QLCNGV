import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = '#0a0a0a';
    document.body.style.color = 'white';
    document.body.style.overflowX = 'hidden';
    document.body.style.position = 'relative';

    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
      document.body.style.overflowX = '';
      document.body.style.position = '';
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Background Grid */}
      <div className="background-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="grid-item"></div>
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="dark-overlay"></div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="logo-container">
            <span className="logo-name">Aptech CanTho</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Hệ thông quản lý giáo viên</h1>
          <p className="hero-subtitle">David Nguyen & David Nguyen & David Nguyen & David Nguyen & David Nguyen</p>
          <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); handleLoginClick(); }}>
            LOGIN
          </a>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span>Quản lý bởi CUSC</span>
          </div>
          <div className="footer-right">
            <a href="#" className="footer-link">ĐIỀU KHOẢN & ĐIỀU KIỆN</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;


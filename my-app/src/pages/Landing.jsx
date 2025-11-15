import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../assets/styles/Landing.css';



import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';
import img3 from '../assets/images/3.png';
import img4 from '../assets/images/4.png';
import img5 from '../assets/images/5.png';
import img6 from '../assets/images/7.png';
import img7 from '../assets/images/6.png';
import img8 from '../assets/images/8.png';
import img9 from '../assets/images/9.png';
import img10 from '../assets/images/10.png';
import img11 from '../assets/images/11.png';
import img12 from '../assets/images/12.png';

const gridImages = [
  img1, img2, img3, img4, img5, img6,
  img7, img8, img9, img10, img11, img12
];
const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('landing-page-body');
    return () => {
      document.body.classList.remove('landing-page-body');
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <div className="background-grid">
        {gridImages.map((imgSrc, i) => (
          <div key={i} className="grid-item">
            <img src={imgSrc} alt={`grid-item-${i}`} />
          </div>
        ))}
      </div>

      <div className="dark-overlay"></div>

      <div className="main-content">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">CUSC</div>
            <span className="logo-name">APTECH CANTHO</span>
          </div>
        </header>

        <div className="hero-section">
          <h1 className="hero-title">Hệ thống quản lý giáo viên</h1>
          <p className="hero-subtitle">Designed by David Nguyen & Designed by David Nguyen</p>
          <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); handleLoginClick(); }}>
            LOGIN
          </a>
        </div>

        <footer className="footer">
          <div className="footer-left">
            <span>QUẢN LÝ BỞI CUSC</span>
          </div>
          <div className="footer-right">
            <a href="#" className="footer-link">ĐIỀU KHOẢN & ĐIỀU KIỆN</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
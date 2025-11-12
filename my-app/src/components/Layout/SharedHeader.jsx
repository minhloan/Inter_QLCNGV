import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Common.css';
import logo2 from '../../assets/images/logo2.jpg';

const SharedHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="top-header">
      <div className="logo-container">
        <div className="logo-icon" style={{ overflow: 'hidden', borderRadius: '50%', width: '40px', height: '40px' }}>
          <img 
            src={logo2} 
            alt="logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', padding: '2px', backgroundColor: '#fff' }} 
          />
        </div>
        <Link to="/module-selection" className="logo-text">Aptech CanTho</Link>
      </div>
      <div className="header-actions">
        <div className="header-icon">
          <i className="bi bi-bell"></i>
        </div>
        <div className="header-icon user-icon" ref={dropdownRef} style={{ position: 'relative' }}>
          <i 
            className="bi bi-person" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          ></i>
          {showDropdown && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  <i className="bi bi-person"></i>
                </div>
              </div>
              <div className="user-dropdown-info">
                <div className="user-name">{(user?.username || 'USER').toUpperCase()}</div>
                <div className="user-email">{user?.userData?.email || user?.email || ''}</div>
              </div>
              <div className="user-dropdown-menu">
                <Link 
                  to="/edit-profile" 
                  className="user-dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="bi bi-person"></i>
                  <span>Edit Profile</span>
                  <i className="bi bi-chevron-right"></i>
                </Link>
                <div 
                  className="user-dropdown-item"
                  onClick={handleSignOut}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedHeader;


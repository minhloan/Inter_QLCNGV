import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Common.css';

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

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/module-selection">
          <div className="logo-container-nav">
            <div className="logo-circle-nav">
              <span>CUSC</span>
            </div>
            <span className="logo-name-nav">AptechCanTho</span>
          </div>
        </Link>
        <div className="navbar-nav ms-auto">
          <div className="nav-item d-flex align-items-center gap-3">
            <button 
              className="btn btn-link text-dark p-0" 
              id="notificationBtn"
              onClick={handleNotificationClick}
            >
              <i className="bi bi-bell fs-5"></i>
            </button>
            <button 
              className="btn btn-link text-dark p-0" 
              id="profileBtn"
              onClick={handleProfileClick}
              ref={dropdownRef}
              style={{ position: 'relative' }}
            >
              <i className="bi bi-person-circle fs-4"></i>
              {showDropdown && (
                <div className="user-dropdown" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '10px', zIndex: 1000 }}>
                  <div className="user-dropdown-header">
                    <div className="user-avatar-large">
                      <i className="bi bi-person"></i>
                    </div>
                  </div>
                  <div className="user-dropdown-info">
                    <div className="user-name">{(user?.userData?.full_name || user?.username || 'USER').toUpperCase()}</div>
                    <div className="user-email">{user?.userData?.email || user?.email || user?.username || ''}</div>
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
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SharedHeader;


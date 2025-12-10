import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../Common/NotificationDropdown';
import logo2 from '../../assets/images/logo2.jpg';
import { getMenuItems } from '../../utils/menuConfig';
import useUserProfileMedia from '../../hooks/useUserProfileMedia';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({ profile: false, dropdown: false, mobile: false });
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profileImage, coverImage } = useUserProfileMedia(user?.userId);
  
  const hasValidProfileImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '';
  const hasValidCoverImage = coverImage && typeof coverImage === 'string' && coverImage.trim() !== '';
  
  useEffect(() => {
    setImageErrors({ profile: false, dropdown: false, mobile: false });
  }, [profileImage]);
  

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event) => {
      const clickInsideMenu = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      const clickToggle = mobileToggleRef.current && mobileToggleRef.current.contains(event.target);
      if (!clickInsideMenu && !clickToggle) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Get user display name and email
  const displayName = user?.username  || 'USER';
  const displayEmail = user?.userData?.email || user?.email || '';
  const menuItems = getMenuItems(user?.role, location.pathname);

  
  // Determine logo link based on location
  const logoLink = location.pathname === '/module-selection' ? '/module-selection' : '/';

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
        <Link to={logoLink} className="logo-text">Aptech CanTho</Link>
      </div>
      <div className="header-actions">
        <NotificationDropdown />
        <div 
          className="header-icon user-icon" 
          ref={dropdownRef} 
          style={{ position: 'relative' }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {hasValidProfileImage && !imageErrors.profile ? (
            <img 
              src={profileImage} 
              alt="Ảnh đại diện" 
              className="avatar-circle"
              onError={() => {
                console.error('[Header] Failed to load profile image:', profileImage);
                setImageErrors(prev => ({ ...prev, profile: true }));
              }}
            />
          ) : (
            <i className="bi bi-person"></i>
          )}
          {showDropdown && (
            <div className="user-dropdown">
              <div
                className={`user-dropdown-header ${hasValidCoverImage ? 'has-cover' : ''}`}
                style={hasValidCoverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
              >
                <div className="user-avatar-large">
                  {hasValidProfileImage && !imageErrors.dropdown ? (
                    <img 
                      src={profileImage} 
                      alt="Ảnh đại diện"
                      onError={() => {
                        console.error('[Header] Failed to load profile image in dropdown:', profileImage);
                        setImageErrors(prev => ({ ...prev, dropdown: true }));
                      }}
                    />
                  ) : (
                    <i className="bi bi-person"></i>
                  )}
                </div>
              </div>
              <div className="user-dropdown-info">
                <div className="user-name">{displayName.toUpperCase()}</div>
                <div className="user-email">{displayEmail}</div>
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
      <button
        type="button"
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        ref={mobileToggleRef}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        className={`mobile-nav-backdrop ${isMobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div
        className={`mobile-nav-panel ${isMobileMenuOpen ? 'open' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="mobile-nav-header">
          <div className="mobile-nav-title">
            <span>Menu</span>
            <p>{displayName.toUpperCase()}</p>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div
          className={`mobile-user-info ${hasValidCoverImage ? 'has-cover' : ''}`}
          style={hasValidCoverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
        >
          <div className="mobile-user-avatar">
            {hasValidProfileImage && !imageErrors.mobile ? (
              <img 
                src={profileImage} 
                alt="Ảnh đại diện"
                onError={() => {
                  console.error('[Header] Failed to load profile image in mobile menu:', profileImage);
                  setImageErrors(prev => ({ ...prev, mobile: true }));
                }}
              />
            ) : (
              <i className="bi bi-person"></i>
            )}
          </div>
          <div>
            <div className="mobile-user-name">{displayName.toUpperCase()}</div>
            <div className="mobile-user-email">{displayEmail}</div>
          </div>
        </div>

        <div className="mobile-nav-links">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
              <i className="bi bi-chevron-right"></i>
            </Link>
          ))}
        </div>

        <div className="mobile-nav-footer">
          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSignOut();
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;


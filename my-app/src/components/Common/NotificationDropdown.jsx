import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markNotificationAsRead
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 3);

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
    if (showDropdown) {
      refreshNotifications();
    }
  }, [showDropdown, refreshNotifications]);

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/notifications');
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
    } catch {
      // ignore, error already handled by context state
    } finally {
      setShowDropdown(false);
      navigate('/notifications', {
        state: { notificationId: notification.id }
      });
    }
  };

  return (
    <div
      className="header-icon notification-icon"
      ref={dropdownRef}
      style={{ position: 'relative' }}
      onClick={() => setShowDropdown((prev) => !prev)}
    >
      <i className="bi bi-bell"></i>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <span className="notification-unread-count">{unreadCount} mới</span>
            )}
          </div>
          <div className="notification-dropdown-list">
            {loading ? (
              <div className="notification-empty">
                <i className="bi bi-arrow-repeat"></i>
                <span>Đang tải...</span>
              </div>
            ) : error ? (
              <div className="notification-empty">
                <i className="bi bi-exclamation-triangle"></i>
                <p>{error}</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="notification-empty">
                <i className="bi bi-bell-slash"></i>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <span className="notification-title">{notification.title}</span>
                      {!notification.isRead && (
                        <span className="notification-new-badge">Mới</span>
                      )}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="notification-dropdown-footer">
            <button className="btn-view-all" onClick={handleViewAll}>
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

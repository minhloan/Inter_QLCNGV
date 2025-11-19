import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useNotifications } from '../contexts/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    notifications,
    loading,
    error,
    unreadCount,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!selectedNotification) {
      return;
    }
    const updated = notifications.find((n) => n.id === selectedNotification.id);
    if (updated && updated !== selectedNotification) {
      setSelectedNotification(updated);
    }
  }, [notifications, selectedNotification]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.isRead);
    }
    if (filter === 'read') {
      return notifications.filter((notification) => notification.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const readCount = useMemo(
    () => notifications.filter((notification) => notification.isRead).length,
    [notifications]
  );

  const displayError = actionError || error;

  const handleMarkAsRead = async (id) => {
    setActionError(null);
    try {
      await markNotificationAsRead(id);
      if (selectedNotification?.id === id) {
        setSelectedNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionError(null);
    try {
      await markAllNotificationsAsRead();
      if (selectedNotification) {
        setSelectedNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setActionError(null);
    try {
      await deleteNotification(id);
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleOpenNotification = async (notification) => {
    setActionError(null);
    setSelectedNotification(notification);
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (err) {
        setActionError(err.message);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'danger':
        return 'bi-x-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'danger':
        return '#dc3545';
      default:
        return '#17a2b8';
    }
  };

  useEffect(() => {
    const notificationId = location.state?.notificationId;
    if (!notificationId || notifications.length === 0) {
      return;
    }
    const targetNotification = notifications.find((notification) => notification.id === notificationId);
    if (!targetNotification) {
      navigate(location.pathname, { replace: true });
      return;
    }

    setSelectedNotification(targetNotification);
    if (!targetNotification.isRead) {
      markNotificationAsRead(notificationId).catch((err) => setActionError(err.message));
    }
    navigate(location.pathname, { replace: true });
  }, [location, navigate, notifications, markNotificationAsRead]);

  return (
    <MainLayout>
      <div className="page-notifications">
        {/* Content Header */}
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Thông báo</h1>
          </div>
          <div></div>
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <div className="notification-actions">
            <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
              <i className="bi bi-check-all"></i>
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}

        {displayError && (
          <div className="notification-alert">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{displayError}</span>
          </div>
        )}

        {/* Filter Section */}
        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Đã đọc ({readCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-container">
          {loading ? (
            <div className="notifications-loading">
              <i className="bi bi-arrow-repeat"></i>
              <span>Đang tải thông báo...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell-slash"></i>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleOpenNotification(notification)}
                >
                  <div className="notification-card-icon" style={{ color: getNotificationColor(notification.type) }}>
                    <i className={`bi ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-card-content">
                    <div className="notification-card-header">
                      <h3 className="notification-card-title">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="notification-new-badge">Mới</span>
                      )}
                    </div>
                    <p className="notification-card-message">{notification.message}</p>
                    <div className="notification-card-footer">
                      <span className="notification-card-time">{notification.time}</span>
                      <div className="notification-card-actions">
                        {!notification.isRead && (
                          <button
                            className="btn-action btn-mark-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            title="Đánh dấu đã đọc"
                          >
                            <i className="bi bi-check"></i>
                          </button>
                        )}
                        <button
                          className="btn-action btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedNotification && (
          <div className="notification-modal-overlay" onClick={handleCloseModal}>
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
              <button className="notification-modal-close" onClick={handleCloseModal}>
                <i className="bi bi-x-lg"></i>
              </button>
              <div className="notification-modal-header">
                <div className="notification-modal-icon" style={{ color: getNotificationColor(selectedNotification.type) }}>
                  <i className={`bi ${getNotificationIcon(selectedNotification.type)}`}></i>
                </div>
                <div>
                  <h2>{selectedNotification.title}</h2>
                  <span>{selectedNotification.time}</span>
                </div>
              </div>
              <form className="notification-modal-form">
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input type="text" value={selectedNotification.title} readOnly />
                </div>
                <div className="form-group">
                  <label>Nội dung</label>
                  <textarea value={selectedNotification.message} rows={4} readOnly />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Loại thông báo</label>
                    <input type="text" value={selectedNotification.type} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <input type="text" value={selectedNotification.isRead ? 'Đã đọc' : 'Chưa đọc'} readOnly />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Đóng
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleDelete(selectedNotification.id);
                      handleCloseModal();
                    }}
                  >
                    Xóa thông báo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;


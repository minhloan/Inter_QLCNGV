import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getNotifications as fetchNotificationsApi,
  markNotificationAsRead as markNotificationAsReadApi,
  markAllNotificationsAsRead as markAllNotificationsAsReadApi,
  deleteNotification as deleteNotificationApi
} from '../api/notification';
import { formatTime } from '../data/notifications';

const NotificationContext = createContext(null);

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const enrichNotification = (notification) => ({
  ...notification,
  type: notification.type || 'info',
  time: formatTime(notification.createdAt)
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sortNotifications = useCallback(
    (items) =>
      [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    []
  );

  const setWithEnrichment = useCallback(
    (updater) => {
      setNotifications((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const sorted = sortNotifications(next);
        return sorted.map(enrichNotification);
      });
    },
    [sortNotifications]
  );

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotificationsApi();
      setWithEnrichment(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách thông báo.'));
    } finally {
      setLoading(false);
    }
  }, [setWithEnrichment]);

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationAsReadApi(notificationId);
        setWithEnrichment((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể cập nhật trạng thái thông báo.');
        setError(message);
        throw new Error(message);
      }
    },
    [setWithEnrichment]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsReadApi();
      setWithEnrichment((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể đánh dấu tất cả thông báo.');
      setError(message);
      throw new Error(message);
    }
  }, [setWithEnrichment]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await deleteNotificationApi(notificationId);
        setWithEnrichment((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa thông báo.');
        setError(message);
        throw new Error(message);
      }
    },
    [setWithEnrichment]
  );

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWithEnrichment((prev) => prev);
    }, 60000);

    return () => clearInterval(interval);
  }, [setWithEnrichment]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      loading,
      error,
      unreadCount,
      refreshNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearError: () => setError(null)
    }),
    [
      notifications,
      loading,
      error,
      unreadCount,
      refreshNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};



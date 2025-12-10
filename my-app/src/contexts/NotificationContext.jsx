import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getNotifications as fetchNotificationsApi,
  markNotificationAsRead as markNotificationAsReadApi,
  markAllNotificationsAsRead as markAllNotificationsAsReadApi,
  deleteNotification as deleteNotificationApi
} from '../api/notification';
import { formatTime } from '../data/notifications';
import { connectWebSocket, disconnectWebSocket } from '../api/websocket';

import { useAuth } from './AuthContext.jsx';

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
  const { isAuthenticated } = useAuth();

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

  // Kết nối WebSocket và lắng nghe notifications
  useEffect(() => {
    if (!isAuthenticated) {
      // Ngắt kết nối WebSocket nếu user đã logout
      disconnectWebSocket();
      setWithEnrichment([]);
      setError(null);
      return;
    }

    // Quick toggle to disable WS during debugging: set localStorage.disableWs = '1'
    const disableWs = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('disableWs') === '1';
    // eslint-disable-next-line no-console
    console.debug('[Notifications] isAuthenticated:', isAuthenticated, 'disableWs:', disableWs);
    if (disableWs) {
      // Do not attempt to connect when debugging WebSocket issues
      setError('WebSocket disabled (debug)');
      return;
    }

    // Kết nối WebSocket
    const handleNotification = (notificationPayload) => {


      // Chuyển đổi payload từ backend sang format frontend
      const newNotification = {
        id: notificationPayload.id,
        title: notificationPayload.title,
        message: notificationPayload.message,
        type: notificationPayload.type || 'info',
        relatedEntity: notificationPayload.relatedEntity,
        relatedId: notificationPayload.relatedId,
        createdAt: notificationPayload.createdAt,
        isRead: false
      };

      // Thêm notification mới vào đầu danh sách
      setWithEnrichment((prev) => {
        // Kiểm tra xem notification đã tồn tại chưa
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) {
          return prev;
        }
        return [newNotification, ...prev];
      });
    };

    const handleError = (error) => {
      setError('Lỗi kết nối thông báo thời gian thực. Đang thử kết nối lại...');
    };

    const handleConnect = () => {
      setError(null);
    };

    // Kết nối WebSocket (async)
    connectWebSocket(handleNotification, handleError, handleConnect).catch(err => {
      // eslint-disable-next-line no-console
      console.error('[Notifications] connectWebSocket failed:', err);
      setError('Lỗi kết nối thông báo thời gian thực.');
    });

    // Cleanup: ngắt kết nối khi component unmount hoặc user logout
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, setWithEnrichment]);

  // Load notifications ban đầu khi authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    }
  }, [refreshNotifications, isAuthenticated]);

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



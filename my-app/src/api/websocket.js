import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken } from './auth';
import { getWebSocketUrl } from '../config/appConfig';

let stompClient = null;
let reconnectAttempts = 0;
let savedCallbacks = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * Tạo WebSocket client và kết nối tới server
 * @param {Function} onNotification - Callback khi nhận được notification mới
 * @param {Function} onError - Callback khi có lỗi
 * @param {Function} onConnect - Callback khi kết nối thành công
 */
export const connectWebSocket = async (onNotification, onError, onConnect) => {
  const token = getToken();
  
  if (!token) {
    // console.warn('[WebSocket] No token available, cannot connect');
    return null;
  }

  // Lưu callbacks để có thể reconnect
  savedCallbacks = { onNotification, onError, onConnect };

  // Nếu đã có client đang kết nối, không tạo mới
  if (stompClient && stompClient.connected) {
    // console.log('[WebSocket] Already connected');
    return stompClient;
  }

  // Xóa client cũ nếu có
  if (stompClient) {
    disconnectWebSocket();
  }

  // Lấy WebSocket URL từ config file (có thể thay đổi mà không cần build lại)
  const wsUrl = await getWebSocketUrl();
  // console.log('[WebSocket] Connecting to:', wsUrl);

  // Tạo SockJS connection
  const socket = new SockJS(wsUrl);
  
  // Tạo STOMP client với connect headers
  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      if (import.meta.env.DEV) {
        // console.log('[STOMP]', str);
      }
    },
    onConnect: (frame) => {
      // console.log('[WebSocket] Connected successfully');
      reconnectAttempts = 0;
      
      // Subscribe vào queue notifications của user
      stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          // console.log('[WebSocket] Received notification:', notification);
          
          if (savedCallbacks?.onNotification) {
            savedCallbacks.onNotification(notification);
          }
        } catch (error) {
          // console.error('[WebSocket] Error parsing notification:', error);
        }
      });

      // console.log('[WebSocket] Subscribed to /user/queue/notifications');
      
      if (savedCallbacks?.onConnect) {
        savedCallbacks.onConnect();
      }
    },
    onStompError: (frame) => {
      console.error('[WebSocket] STOMP error:', frame);
      // Gracefully handle STOMP errors without crashing the UI
      if (savedCallbacks?.onError) {
        try {
          savedCallbacks.onError(frame);
        } catch (err) {
          console.error('[WebSocket] Error in onError callback:', err);
        }
      }
    },
    onWebSocketClose: (event) => {
      // console.warn('[WebSocket] Connection closed:', event);
      
      // Thử kết nối lại nếu chưa vượt quá số lần thử
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && savedCallbacks) {
        reconnectAttempts++;
        // console.log(`[WebSocket] Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(async () => {
          const newToken = getToken();
          if (newToken && savedCallbacks) {
            await connectWebSocket(
              savedCallbacks.onNotification,
              savedCallbacks.onError,
              savedCallbacks.onConnect
            );
          }
        }, RECONNECT_DELAY * reconnectAttempts);
      } else {
        // console.error('[WebSocket] Max reconnect attempts reached or no callbacks');
      }
    },
    onDisconnect: () => {
      // console.log('[WebSocket] Disconnected');
    }
  });

  // Kết nối
  stompClient.activate();

  return stompClient;
};

/**
 * Ngắt kết nối WebSocket
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    try {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
      stompClient = null;
      savedCallbacks = null;
      reconnectAttempts = 0;
      // console.log('[WebSocket] Disconnected');
    } catch (error) {
      // console.error('[WebSocket] Error disconnecting:', error);
    }
  }
};

/**
 * Kiểm tra xem WebSocket có đang kết nối không
 */
export const isWebSocketConnected = () => {
  return stompClient && stompClient.connected;
};


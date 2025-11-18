let appConfig = null;

/**
 * Load config từ file config.json trong public folder
 * File này có thể được thay đổi mà không cần build lại app
 */
export const loadAppConfig = async () => {
  if (appConfig) {
    return appConfig;
  }

  try {
    const response = await fetch('/config.json?' + new Date().getTime()); // Cache busting
    if (!response.ok) {
      throw new Error('Failed to load config');
    }
    appConfig = await response.json();
    
    // Fallback nếu không có config
    if (!appConfig) {
      appConfig = getDefaultConfig();
    }
    
    // console.log('[AppConfig] Loaded config:', appConfig);
    return appConfig;
  } catch (error) {
    // console.warn('[AppConfig] Failed to load config.json, using defaults:', error);
    appConfig = getDefaultConfig();
    return appConfig;
  }
};

/**
 * Lấy config mặc định (development)
 */
const getDefaultConfig = () => {
  return {
    apiUrl: import.meta.env.DEV 
      ? 'http://localhost:8080' 
      : window.location.origin,
    wsUrl: import.meta.env.DEV
      ? 'http://localhost:8080/ws'
      : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
    environment: import.meta.env.MODE || 'development'
  };
};

/**
 * Lấy API URL
 */
export const getApiUrl = async () => {
  const config = await loadAppConfig();
  return config.apiUrl;
};

/**
 * Lấy WebSocket URL
 */
export const getWebSocketUrl = async () => {
  const config = await loadAppConfig();
  return config.wsUrl;
};

/**
 * Lấy environment
 */
export const getEnvironment = async () => {
  const config = await loadAppConfig();
  return config.environment;
};

/**
 * Reset config (để reload lại)
 */
export const resetConfig = () => {
  appConfig = null;
};


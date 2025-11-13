import createApiInstance from "./createApiInstance.js";

const API_URL = "/v1/teacher/notifications";

const api = createApiInstance(API_URL);

export const getNotifications = async () => {
  const response = await api.get("");
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/unread");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  await api.post(`/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.post("/read-all");
};

export const deleteNotification = async (notificationId) => {
  await api.delete(`/${notificationId}`);
};



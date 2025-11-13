// Sample notification data
export const sampleNotifications = [
  {
    id: 1,
    title: 'Thông báo mới',
    message: 'Bạn có một thông báo mới từ hệ thống',
    time: '2 phút trước',
    isRead: false,
    type: 'info',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Thông báo mới',
    message: 'Đăng ký môn học của bạn đã được duyệt',
    time: '15 phút trước',
    isRead: false,
    type: 'success',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'Thông báo mới',
    message: 'Bạn có một cuộc hẹn mới trong tuần này',
    time: '1 giờ trước',
    isRead: false,
    type: 'warning',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'Thông báo hệ thống',
    message: 'Hệ thống sẽ bảo trì vào cuối tuần',
    time: '2 giờ trước',
    isRead: true,
    type: 'info',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: 'Thông báo mới',
    message: 'Bạn có một bài tập mới cần hoàn thành',
    time: '3 giờ trước',
    isRead: true,
    type: 'info',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    title: 'Thông báo mới',
    message: 'Kết quả thi Aptech đã được cập nhật',
    time: '5 giờ trước',
    isRead: true,
    type: 'success',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 7,
    title: 'Thông báo mới',
    message: 'Lịch dạy thử của bạn đã được xác nhận',
    time: '1 ngày trước',
    isRead: true,
    type: 'info',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 8,
    title: 'Thông báo mới',
    message: 'Bạn có một thông báo mới từ quản trị viên',
    time: '2 ngày trước',
    isRead: true,
    type: 'info',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to get unread count
export const getUnreadCount = (notifications) => {
  return notifications.filter(n => !n.isRead).length;
};

// Helper function to format time
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};


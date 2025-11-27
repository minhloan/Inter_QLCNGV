export const getMenuItems = (role) => {
  const adminMenuItems = [
    { path: '/manage-teacher', icon: 'bi-people', label: 'Quản lý Giáo viên' },
    { path: '/manage-subjects', icon: 'bi-book', label: 'Quản lý Môn học' },
    { path: '/subject-registration-management', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/aptech-exam-management', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/trial-teaching-management', icon: 'bi-mortarboard', label: 'Đánh giá giảng dạy' },
    { path: '/evidence-management', icon: 'bi-file-check', label: 'Minh chứng & OCR' },
    { path: '/teaching-assignment-management', icon: 'bi-calendar-check', label: 'Phân công Giảng dạy' },
    { path: '/reporting-export', icon: 'bi-graph-up', label: 'Báo cáo & Xuất dữ liệu' },
    { path: '/audit-log-management', icon: 'bi-journal-text', label: 'Nhật ký Hoạt động' },
  ];

  const teacherMenuItems = [
    { path: '/edit-profile', icon: 'bi-person', label: 'Hồ sơ Cá nhân' },
    { path: '/teacher-subject-registration', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/teacher-aptech-exam', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/teacher-trial-teaching', icon: 'bi-mortarboard', label: 'Đánh giá giảng dạy' },
    { path: '/my-reviews', icon: 'bi-clipboard-check', label: 'Chấm giảng dạy' },
    { path: '/teacher-evidence', icon: 'bi-file-check', label: 'Minh chứng' },
    { path: '/teacher-teaching-assignment', icon: 'bi-calendar-check', label: 'Phân công Giảng dạy' },
    { path: '/teacher-personal-reports', icon: 'bi-graph-up', label: 'Báo cáo Cá nhân' },
  ];

  const isAdmin = role === 'Manage-Leader' || role === 'admin';

  return isAdmin ? adminMenuItems : teacherMenuItems;
};



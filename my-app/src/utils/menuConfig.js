export const getMenuItems = (role, pathname) => {
  const adminMenuItems = [
    { path: '/manage-teacher', icon: 'bi-people', label: 'Quản lý Giáo viên' },
    { path: '/manage-subjects', icon: 'bi-book', label: 'Quản lý Môn học' },
    { path: '/subject-registration-management', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/aptech-exam-management', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/trial-teaching-management', icon: 'bi-mortarboard', label: 'Đánh giá giảng dạy' },
    { path: '/evidence-management', icon: 'bi-file-check', label: 'Minh chứng & OCR' },
    { path: '/reporting-export', icon: 'bi-graph-up', label: 'Báo cáo & Xuất dữ liệu' },
  ];

  const teacherMenuItems = [
    { path: '/edit-profile', icon: 'bi-person', label: 'Hồ sơ Cá nhân' },
    { path: '/teacher-subject-registration', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/teacher-aptech-exam', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/teacher-trial-teaching', icon: 'bi-mortarboard', label: 'Đánh giá giảng dạy' },
    { path: '/my-reviews', icon: 'bi-clipboard-check', label: 'Chấm giảng dạy' },
    { path: '/teacher-evidence', icon: 'bi-file-check', label: 'Minh chứng' },
    { path: '/teacher-personal-reports', icon: 'bi-graph-up', label: 'Báo cáo Cá nhân' },
  ];

  const isAdmin = role === 'Manage-Leader' || role === 'admin';
  if (pathname) {
    const normalized = pathname.split('?')[0];

    if (normalized.startsWith('/teacher')) {
      return teacherMenuItems;
    }

    for (const item of teacherMenuItems) {
      if (item.path === '/') continue;
      if (normalized === item.path) return teacherMenuItems;
      if (normalized.startsWith(item.path + '/')) return teacherMenuItems;
    }
  }
  return isAdmin ? adminMenuItems : teacherMenuItems;
};



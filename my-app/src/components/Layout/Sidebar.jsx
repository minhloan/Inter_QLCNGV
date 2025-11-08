import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Manage-Leader' || user?.role === 'admin';
  
  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Menu items for MANAGE-LEADER and admin
  const adminMenuItems = [
    { path: '/manage-teacher', icon: 'bi-people', label: 'Quản lý Giáo viên' },
    { path: '/manage-subjects', icon: 'bi-book', label: 'Quản lý Môn học' },
    { path: '/subject-registration-management', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/aptech-exam-management', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/trial-teaching-management', icon: 'bi-mortarboard', label: 'Giảng thử' },
    { path: '/evidence-management', icon: 'bi-file-check', label: 'Minh chứng & OCR' },
    { path: '/teaching-assignment-management', icon: 'bi-calendar-check', label: 'Phân công Giảng dạy' },
    { path: '/reporting-export', icon: 'bi-graph-up', label: 'Báo cáo & Xuất dữ liệu' }
  ];

  // Menu items for TEACHER
  const teacherMenuItems = [
    { path: '/edit-profile', icon: 'bi-person', label: 'Hồ sơ Cá nhân' },
    { path: '/teacher-subject-registration', icon: 'bi-clipboard-check', label: 'Đăng ký Môn học' },
    { path: '/teacher-aptech-exam', icon: 'bi-file-earmark-text', label: 'Kỳ thi Aptech' },
    { path: '/teacher-trial-teaching', icon: 'bi-mortarboard', label: 'Giảng thử' },
    { path: '/teacher-evidence', icon: 'bi-file-check', label: 'Minh chứng' },
    { path: '/teacher-teaching-assignment', icon: 'bi-calendar-check', label: 'Phân công Giảng dạy' },
    { path: '/teacher-personal-reports', icon: 'bi-graph-up', label: 'Báo cáo Cá nhân' }
  ];

  const menuItems = isAdmin ? adminMenuItems : teacherMenuItems;

  return (
    <div className="left-sidebar">
      <div className="sidebar-date">Ngày: <span>{getCurrentDate()}</span></div>
      <ul className="sidebar-nav">
        {menuItems.map((item, index) => (
          <li key={index} className="sidebar-nav-item">
            <Link 
              to={item.path} 
              className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;


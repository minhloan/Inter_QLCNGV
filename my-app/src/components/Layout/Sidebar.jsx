import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItems } from '../../utils/menuConfig';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const menuItems = getMenuItems(user?.role);

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


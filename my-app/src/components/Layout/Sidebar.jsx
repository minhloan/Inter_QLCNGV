import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItems } from '../../utils/menuConfig';
import useSidebar from '../../hooks/useSidebar';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { isCollapsed, toggle } = useSidebar(false);

    const getCurrentDate = () => {
        const currentDate = new Date();
        return currentDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

const menuItems = getMenuItems(user?.role, location.pathname);


    return (
        <div className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className={`sidebar-date ${isCollapsed ? 'd-none' : ''}`}>Ngày: <span>{getCurrentDate()}</span></div>
                <button
                    className="sidebar-toggle-btn"
                    onClick={toggle}
                    title={isCollapsed ? 'Bung ra' : 'Thu gọn'}
                >
                    <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
                </button>
            </div>
            <ul className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <li key={index} className="sidebar-nav-item">
                        <Link
                            to={item.path}
                            className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span className={isCollapsed ? 'd-none' : ''}>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;


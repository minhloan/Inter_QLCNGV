import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUserRole, getPrimaryRole, getUserInfo, logout as authLogout } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const role = getPrimaryRole();
      const userInfo = getUserInfo();
      const fullName = localStorage.getItem('full_name') || userInfo?.full_name || null;
      if (fullName && !localStorage.getItem('full_name')) {
        localStorage.setItem('full_name', fullName);
      }
      
      if (role && userInfo) {
        setUser({
          token,
          role,
          username: userInfo.username || userInfo.email || 'User',
          email: userInfo.email,
          userId: userInfo.userId,
          userData: {
            email: userInfo.email,
            userId: userInfo.userId,
            roles: userInfo.roles,
            full_name: fullName
          }
        });
      }
    }
    setLoading(false);
  }, []);

  const login = (token, role, username, userData) => {
    const userInfo = getUserInfo();
    if (userData?.full_name) {
      localStorage.setItem('full_name', userData.full_name);
    }
    
    setUser({
      token,
      role,
      username: userInfo?.username || username || userInfo?.email || 'User',
      email: userInfo?.email || username,
      userId: userInfo?.userId || userData?.id,
      userData: userData || {
        email: userInfo?.email || username,
        userId: userInfo?.userId || userData?.id,
        roles: getUserRole()
      }
    });
  };

  const logout = () => {
    // Xóa token từ Cookies
    authLogout();
    
    // Xóa localStorage
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedUsername'); // Giữ lại để tương thích ngược
    
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!getToken(),
    isManageLeader: user?.role === 'Manage-Leader' || user?.role === 'admin',
    isTeacher: user?.role === 'Teacher' || user?.role === 'teacher'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


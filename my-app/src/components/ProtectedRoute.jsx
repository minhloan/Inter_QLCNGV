import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, isManageLeader, isTeacher, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Support for allowedRoles array (for routes accessible by multiple roles)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const hasAccess = allowedRoles.some(role => {
      if (role === 'Manage-Leader') return isManageLeader;
      if (role === 'Teacher') return isTeacher;
      return false;
    });
    if (!hasAccess) {
      return <Navigate to="/module-selection" replace />;
    }
    return children;
  }

  // Support for single requiredRole (backward compatibility)
  if (requiredRole === 'Manage-Leader' && !isManageLeader) {
    return <Navigate to="/module-selection" replace />;
  }

  if (requiredRole === 'Teacher' && !isTeacher) {
    return <Navigate to="/module-selection" replace />;
  }

  return children;
};

export default ProtectedRoute;


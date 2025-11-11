import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import UpdatePassword from './pages/UpdatePassword';
import ManageTeacher from './pages/ManageTeacher';
import AddTeacher from './pages/AddTeacher';
import ManageSubjects from './pages/ManageSubjects';
import ManageSubjectAdd from './pages/ManageSubjectAdd';
import TeacherDashboard from './pages/TeacherDashboard';
import ModuleSelection from './pages/ModuleSelection';

// Admin pages
import SubjectRegistrationManagement from './pages/admin/SubjectRegistrationManagement';
import AptechExamManagement from './pages/admin/AptechExamManagement';
import TrialTeachingManagement from './pages/admin/TrialTeachingManagement';
import EvidenceManagement from './pages/admin/EvidenceManagement';
import TeachingAssignmentManagement from './pages/admin/TeachingAssignmentManagement';
import ReportingExport from './pages/admin/ReportingExport';

// Teacher pages
import EditProfile from './pages/EditProfile';
import TeacherSubjectRegistration from './pages/teacher/TeacherSubjectRegistration';
import TeacherAptechExam from './pages/teacher/TeacherAptechExam';
import TeacherTrialTeaching from './pages/teacher/TeacherTrialTeaching';
import TeacherEvidence from './pages/teacher/TeacherEvidence';
import TeacherTeachingAssignment from './pages/teacher/TeacherTeachingAssignment';
import TeacherPersonalReports from './pages/teacher/TeacherPersonalReports';

import './assets/styles/Common.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminManageSubjects from "./pages/admin/AdminManageSubject.jsx";
import AdminManageSubjectAdd from "./pages/admin/AdminManageSubjectAdd.jsx";

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'Manage-Leader' || user?.role === 'admin' ? '/module-selection' : '/module-selection'} replace />
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user?.role === 'Manage-Leader' || user?.role === 'admin' ? '/module-selection' : '/module-selection'} replace /> : <Login />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/module-selection" replace /> : <ForgotPassword />}
      />
      <Route
        path="/verify-otp"
        element={isAuthenticated ? <Navigate to="/module-selection" replace /> : <VerifyOtp />}
      />
      <Route
        path="/update-password"
        element={isAuthenticated ? <Navigate to="/module-selection" replace /> : <UpdatePassword />}
      />
      <Route
        path="/module-selection"
        element={
          <ProtectedRoute>
            <ModuleSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-teacher"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <ManageTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-teacher"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AddTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-subjects"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <ManageSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-subject-add"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/subject-registration-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <SubjectRegistrationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aptech-exam-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AptechExamManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trial-teaching-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TrialTeachingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <EvidenceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-assignment-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TeachingAssignmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reporting-export"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <ReportingExport />
          </ProtectedRoute>
        }
      />
      
      {/* Teacher Routes - Manage-Leader cũng có thể truy cập vì có thể làm giáo viên */}
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-subject-registration"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherSubjectRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-aptech-exam"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherAptechExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-trial-teaching"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherTrialTeaching />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-evidence"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherEvidence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-teaching-assignment"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherTeachingAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-personal-reports"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherPersonalReports />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

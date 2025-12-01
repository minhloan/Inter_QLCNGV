import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import UpdatePassword from './pages/UpdatePassword';
import ManageTeacher from './pages/ManageTeacher';
import AddTeacher from './pages/AddTeacher';
import TeacherDashboard from './pages/TeacherDashboard';
import ModuleSelection from './pages/ModuleSelection';

// Admin pages
import SubjectRegistrationManagement from './pages/admin/SubjectRegistrationManagement';
import TrialTeachingManagement from './pages/admin/TrialTeachingManagement';
import EvidenceManagement from './pages/admin/EvidenceManagement';
import TeachingAssignmentManagement from './pages/admin/TeachingAssignmentManagement';
import ReportingExport from './pages/admin/ReportingExport';
import AuditLogManagement from './pages/admin/AuditLogManagement';
import AdminManageSubjectSystem from "./pages/admin/AdminManageSubjectSystem.jsx";
import AdminManageSubjectSystemAdd from "./pages/admin/AdminManageSubjectSystemAdd.jsx";
import AdminManageSubjectSystemEdit from "./pages/admin/AdminManageSubjectSystemEdit.jsx";
import AdminManageSubjectAssignment from "./pages/admin/AdminManageSubjectAssignment.jsx";
import AdminManageSkill from "./pages/admin/AdminManageSkill.jsx";
import AdminManageSkillEdit from "./pages/admin/AdminManageSkillEdit.jsx";


// Teacher pages
import EditProfile from './pages/EditProfile';
import TeacherSubjectRegistration from './pages/teacher/TeacherSubjectRegistration';
import TeacherAptechExam from './pages/teacher/TeacherAptechExam';
import TeacherTrialTeaching from './pages/teacher/TeacherTrialTeaching';
import TeacherEvidence from './pages/teacher/TeacherEvidence';
import TeacherTeachingAssignment from './pages/teacher/TeacherTeachingAssignment';
import TeacherPersonalReports from './pages/teacher/TeacherPersonalReports';
import TeacherTeachingAssignmentDetail from "./pages/teacher/TeacherTeachingAssignmentDetail";
import Notifications from './pages/Notifications';

import './assets/styles/Common.css';
import './assets/styles/NewSkillBadge.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminManageSubjectAdd from "./pages/admin/AdminManageSubjectAdd.jsx";
import TrialTeachingDetail from "./pages/admin/TrialTeachingDetail.jsx";
import TrialTeachingAdd from "./pages/admin/TrialTeachingAdd.jsx";
import SubjectRegistrationDetail from "./pages/admin/SubjectRegistrationDetail.jsx";
import AdminManageSubject from "./pages/admin/AdminManageSubject.jsx";
import AdminManageSubjectDetail from "./pages/admin/AdminManageSubjectDetail.jsx";
import AdminManageSubjectEdit from "./pages/admin/AdminManageSubjectEdit.jsx";
import TeachingAssignmentAdd from "./pages/admin/TeachingAssignmentManagementAdd.jsx";
import TeachingAssignmentDetail from "./pages/admin/TeachingAssignmentDetail.jsx";
import TeacherTrialTeachingDetail from "./pages/teacher/TeacherTrialTeachingDetail.jsx";
import AptechExamAdd from "./pages/teacher/AptechExamAdd.jsx";
import MyReviews from "./pages/teacher/MyReviews.jsx";
import TrialEvaluationForm from "./pages/teacher/TrialEvaluationForm.jsx";
import AptechExamTake from "./pages/teacher/AptechExamTake.jsx";
import AptechExamManagement from "./pages/admin/AptechExamManagement.jsx";
import AdminAptechSesssionExamAdd from "./pages/admin/AdminAptechSesssionExamAdd.jsx";
import AdminAptechSessionList from "./pages/admin/AdminAptechSessionList.jsx";
import AptechExamDetail from "./pages/teacher/AptechExamDetail.jsx";
import TeacherRegisterNew from "./pages/teacher/TeacherRegisterNew.jsx";

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
            <AdminManageSubject />
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
        path="/teacher-trial-teaching-detail/:id"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherTrialTeachingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-subject-detail/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-subject-edit/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-skills"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSkill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-skills-edit/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSkillEdit />
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
        path="/manage-skills"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSkill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/aptech-exam/sessions"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminAptechSessionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/aptech-exam/add"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminAptechSesssionExamAdd />
          </ProtectedRoute>
        }
      />
      {/*<Route*/}
      {/*    path="/teacher/aptech-exam-detail/:id"*/}
      {/*    element={*/}
      {/*        <ProtectedRoute requiredRole="Manage-Leader">*/}
      {/*            <AptechExamDetail />*/}
      {/*        </ProtectedRoute>*/}
      {/*    }*/}
      {/*/>*/}
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
        path="/teaching-assignment-management-add"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TeachingAssignmentAdd />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teaching-assignment-detail/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TeachingAssignmentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-subject-systems"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectSystem />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-subject-system-add"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectSystemAdd />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-subject-system-edit/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectSystemEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-subject-system-assign/:systemId"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AdminManageSubjectAssignment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trial-teaching-detail/:id"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TrialTeachingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trial-teaching-add"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <TrialTeachingAdd />
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
      <Route
        path="/audit-log-management"
        element={
          <ProtectedRoute requiredRole="Manage-Leader">
            <AuditLogManagement />
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
        path="/teacher/aptech-exam-detail/:id"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <AptechExamDetail />
          </ProtectedRoute>
        }
      />
        <Route
            path="/teacher/subject-registration/new"
            element={<TeacherRegisterNew />}
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
        path="/subject-registration-detail/:id"
        element={<SubjectRegistrationDetail />}
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
        path="/teacher/aptech-exam-add"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <AptechExamAdd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/aptech-exam-take"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <AptechExamTake />
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
        path="/my-reviews"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <MyReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/trial-evaluation/:trialId"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TrialEvaluationForm />
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
        path="/teacher-teaching-assignment-detail/:id"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <TeacherTeachingAssignmentDetail />
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
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['Manage-Leader', 'Teacher']}>
            <Notifications />
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
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <h1 className="page-title">Teacher Dashboard</h1>
        </div>
      </div>

      <div className="table-container">
        <p>Welcome to Teacher Dashboard. This page is for Teacher role only.</p>
        <p>You can add teacher-specific features here.</p>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;


import MainLayout from '../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Common/Loading';
import { getAptechExamSessions, getAllAptechExams } from '../api/aptechExam';
import { getAuditLogs } from '../api/auditLog';

const StatCard = ({ icon, title, value, color }) => (
  <div className="col-md-3 col-sm-6 mb-4">
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center`} style={{ width: 56, height: 56 }}>
          <i className={`${icon} fs-4 text-white`}></i>
        </div>
        <div>
          <div className="text-uppercase text-muted small">{title}</div>
          <div className="fs-4 fw-bold">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

const QuickLink = ({ icon, label, path, onClick }) => (
  <div className="col-md-3 col-sm-6 mb-3">
    <button className="btn btn-light w-100 shadow-sm d-flex align-items-center gap-3 p-3" onClick={onClick}>
      <i className={`${icon} fs-4 text-primary`}></i>
      <div className="text-start">
        <div className="fw-semibold">{label}</div>
      </div>
    </button>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState([
    { icon: 'bi-person-fill', title: 'Tổng giảng viên', value: 0, color: 'primary' },
    { icon: 'bi-journal-bookmark-fill', title: 'Môn học', value: 0, color: 'success' },
    { icon: 'bi-calendar3', title: 'Phiên thi sắp tới', value: 0, color: 'warning' },
    { icon: 'bi-exclamation-circle-fill', title: 'Môn chưa phê duyệt', value: 0, color: 'danger' }
  ]);

  const handleNavigate = (path) => () => navigate(path);

  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch exam sessions and filter upcoming ones
        const sessionsData = await getAptechExamSessions();
        const now = new Date();
        const upcomingSessions = Array.isArray(sessionsData) 
          ? sessionsData.filter(session => {
              let dateStr = session.examDate || '';
              if (dateStr.includes('/')) {
                  const [d, m, y] = dateStr.split('/');
                  dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              }
              const timeStr = session.examTime || '00:00';
              const sessionDateTime = new Date(`${dateStr}T${timeStr}`);
              return !isNaN(sessionDateTime.getTime()) && sessionDateTime >= now;
          })
          : [];
        const upcomingCount = upcomingSessions.length;
        setUpcomingSessionsCount(upcomingCount);

        // Fetch all aptech exams and count those with aptechStatus === 'PENDING'
        const allExams = await getAllAptechExams();
        const pendingExamCount = Array.isArray(allExams)
          ? allExams.filter(ex => (ex.aptechStatus || '').toString().toUpperCase() === 'PENDING').length
          : 0;
        setPendingRegistrationsCount(pendingExamCount);

        // Fetch audit logs for recent activities
        const auditLogs = await getAuditLogs(0, 20);
        const activities = auditLogs.content || auditLogs || [];
        
        // Filter for exam registration activities
        const activityMessages = activities
          .filter(log => {
            const resourceType = (log.resourceType || '').toString().toUpperCase();
            const actionType = (log.actionType || '').toString().toUpperCase();
            // Only include relevant CREATE actions for EXAM, SUBJECT_REGISTRATION and TRIAL
            return actionType.includes('CREATE') && (
              resourceType.includes('EXAM') ||
              resourceType.includes('SUBJECT_REGISTRATION') ||
              resourceType.includes('TRIAL') ||
              resourceType.includes('TRIAL_TEACH') ||
              resourceType.includes('TRIAL_TEACHING')
            );
          })
          .map(log => {
            const teacherName = log.userName || 'Người dùng';
            const resourceType = (log.resourceType || '').toString().toUpperCase();
            let actionText = 'có hoạt động mới';

            if (resourceType.includes('EXAM')) {
              actionText = 'đã đăng ký môn thi mới';
            } else if (resourceType.includes('SUBJECT_REGISTRATION') || resourceType.includes('SUBJECT')) {
              actionText = 'đã đăng ký môn học mới';
            } else if (resourceType.includes('TRIAL') || resourceType.includes('TRIAL_TEACH') || resourceType.includes('TRIAL_TEACHING')) {
              actionText = 'đã đăng ký tham gia đánh giá giảng dạy';
            }

            return {
              id: log.id,
              teacherName,
              actionText,
              timestamp: log.createdAt || log.timestamp || new Date().toISOString()
            };
          })
          .slice(0, 5);
        
        setRecentActivities(activityMessages);

        // Update stats
        setStats(prev => [
          { ...prev[0], value: 124 }, // TODO: replace with real data
          { ...prev[1], value: 42 }, // TODO: replace with real data
          { ...prev[2], value: upcomingCount },
          { ...prev[3], value: pendingExamCount }
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <h1 className="page-title">Bảng điều khiển quản trị</h1>
          <div className="text-muted">Tổng quan hệ thống và liên kết nhanh</div>
          {/* Greeting shown after login */}
          <div className="dashboard-greeting mt-2">
            <div className="fw-semibold">Chào, {user?.userData?.full_name || user?.username || 'Bạn'}!</div>
            <div className="text-muted small">Chúc bạn một ngày làm việc hiệu quả.</div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <h5 className="mb-3">Liên kết nhanh</h5>
          </div>
          <QuickLink icon="bi-people-fill" label="Quản lý giáo viên" onClick={handleNavigate('/manage-teacher')} />
          <QuickLink icon="bi-journal-text" label="Quản lý môn học" onClick={handleNavigate('/manage-subjects')} />
          <QuickLink icon="bi-calendar-event" label="Quản lý kỳ thi Aptech" onClick={handleNavigate('/aptech-exam-management')} />
          <QuickLink icon="bi-file-earmark-text" label="Báo cáo & Xuất" onClick={handleNavigate('/reporting-export')} />
        </div>

        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">Hoạt động gần đây</h5>
                {recentActivities.length > 0 ? (
                  <div className="mt-3">
                    <ul className="list-group list-group-flush">
                      {recentActivities.map((activity) => {
                        const timestamp = new Date(activity.timestamp);
                        const dd = String(timestamp.getDate()).padStart(2, '0');
                        const mm = String(timestamp.getMonth() + 1).padStart(2, '0');
                        const yyyy = timestamp.getFullYear();
                        const formattedDate = `${dd}/${mm}/${yyyy}`;
                        const line = `- ${formattedDate}: Gv. ${activity.teacherName} ${activity.actionText}`;
                        return (
                          <li key={activity.id} className="list-group-item">
                            <div className="fw-semibold">{line}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="text-muted small mt-3">Chưa có hoạt động nào</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading />}
    </MainLayout>
  );
};

export default AdminDashboard;

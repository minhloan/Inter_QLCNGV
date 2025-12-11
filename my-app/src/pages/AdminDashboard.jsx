import MainLayout from '../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loading from '../components/Common/Loading';
import { getAptechExamSessions, getAllAptechExams } from '../api/aptechExam';
import { getAuditLogs } from '../api/auditLog';
import { getAllUsers } from '../api/user';
import { listAllSubjects } from '../api/subject';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/AdminDashboard.css';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSubjects: 0,
    upcomingSessions: 0,
    pendingApprovals: 0
  });

  const handleNavigate = (path) => () => navigate(path);

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

        // Fetch teachers count
        const usersData = await getAllUsers(1, 1000);
        const allUsers = usersData?.content || usersData || [];
        const teachersCount = Array.isArray(allUsers)
          ? allUsers.filter(u => (u.role || '').toString().toUpperCase() === 'TEACHER' && (u.active || '').toString().toUpperCase() === 'ACTIVE').length
          : 0;

        // Fetch subjects count
        const subjectsData = await listAllSubjects();
        const subjectsCount = Array.isArray(subjectsData) ? subjectsData.length : (subjectsData?.content?.length || 0);

        // Update stats object
        setStats({
          totalTeachers: teachersCount,
          totalSubjects: subjectsCount,
          upcomingSessions: upcomingCount,
          pendingApprovals: pendingExamCount
        });
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
        <div className="admin-header">
          <div className="admin-greeting">
            <div className="hi">Xin chào,</div>
            <div className="name">{user?.userData?.full_name || user?.username || 'Quản trị viên'}</div>
            <div className="text-muted">Tổng quan hệ thống và liên kết nhanh</div>
          </div>
          {/* settings button removed as requested */}
        </div>
      </div>

      <div className="container mt-4">
        <div className="dashboard-grid">
          <div className="cards-row">
            <div className="card-modern card-stat">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="label">Tổng giảng viên</div>
                  <div className="value">{stats?.totalTeachers || 0}</div>
                </div>
                <div className={`rounded-circle bg-primary d-flex align-items-center justify-content-center`} style={{ width: 52, height: 52 }}>
                  <i className={`bi-person-fill fs-5 text-white`}></i>
                </div>
              </div>
            </div>

            <div className="card-modern card-stat">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="label">Môn học</div>
                  <div className="value">{stats?.totalSubjects || 0}</div>
                </div>
                <div className={`rounded-circle bg-success d-flex align-items-center justify-content-center`} style={{ width: 52, height: 52 }}>
                  <i className={`bi-journal-bookmark-fill fs-5 text-white`}></i>
                </div>
              </div>
            </div>

            <div className="card-modern card-stat">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="label">Phiên thi sắp tới</div>
                  <div className="value">{stats?.upcomingSessions || 0}</div>
                </div>
                <div className={`rounded-circle bg-warning d-flex align-items-center justify-content-center`} style={{ width: 52, height: 52 }}>
                  <i className={`bi-calendar3 fs-5 text-white`}></i>
                </div>
              </div>
            </div>

            <div className="card-modern card-stat">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="label">Môn chưa phê duyệt</div>
                  <div className="value">{stats?.pendingApprovals || 0}</div>
                </div>
                <div className={`rounded-circle bg-danger d-flex align-items-center justify-content-center`} style={{ width: 52, height: 52 }}>
                  <i className={`bi-exclamation-circle-fill fs-5 text-white`}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="card-modern" style={{ gridColumn: '1 / -1' }}>
            <h5 className="card-title">Biểu đồ nhanh</h5>
            <div className="charts-row">
              <div className="chart-card card-modern">
                <svg width="180" height="180" viewBox="0 0 42 42" className="donut">
                  {/* create donut from stats values */}
                  {(() => {
                    const vals = [Number(stats?.totalTeachers||0), Number(stats?.totalSubjects||0), Number(stats?.upcomingSessions||0), Number(stats?.pendingApprovals||0)];
                    const total = vals.reduce((a,b) => a+b, 0) || 1;
                    const colors = ['#2563eb','#10b981','#f59e0b','#ef4444'];
                    let acc = 0;
                    return vals.map((v, i) => {
                      const start = (acc / total) * 100;
                      acc += v;
                      const end = (acc / total) * 100;
                      return (
                        <circle key={i} r="15.91549431" cx="21" cy="21" fill="transparent" stroke={colors[i%colors.length]} strokeWidth="6" strokeDasharray={`${end - start} ${100 - (end - start)}`} strokeDashoffset={-start} transform="rotate(-90 21 21)" />
                      );
                    });
                  })()}
                </svg>
                <div className="legend">
                  {([
                    { title: 'Tổng giảng viên', value: stats?.totalTeachers || 0 },
                    { title: 'Môn học', value: stats?.totalSubjects || 0 },
                    { title: 'Phiên thi sắp tới', value: stats?.upcomingSessions || 0 },
                    { title: 'Môn chưa phê duyệt', value: stats?.pendingApprovals || 0 }
                  ]).map((s, i) => (
                    <div className="item" key={s.title}><span className="swatch" style={{ background: ['#2563eb','#10b981','#f59e0b','#ef4444'][i%4] }}></span>{s.title}: <strong style={{marginLeft:6}}>{s.value}</strong></div>
                  ))}
                </div>
              </div>

              <div className="chart-card card-modern">
                <h6 className="card-title">So sánh chỉ số</h6>
                <div style={{display:'flex', flexDirection:'column', gap:10, width:'100%'}}>
                  {(() => {
                    const items = [
                      { title: 'Tổng giảng viên', value: Number(stats?.totalTeachers||0) },
                      { title: 'Môn học', value: Number(stats?.totalSubjects||0) },
                      { title: 'Phiên thi sắp tới', value: Number(stats?.upcomingSessions||0) },
                      { title: 'Môn chưa phê duyệt', value: Number(stats?.pendingApprovals||0) }
                    ];
                    const vals = items.map(i => i.value);
                    const max = Math.max(...vals, 1);
                    const colors = ['#2563eb','#10b981','#f59e0b','#ef4444'];
                    return items.map((s, i) => (
                      <div key={s.title} style={{display:'flex', alignItems:'center', gap:12}}>
                        <div style={{width:160, color:'var(--muted)'}}>{s.title}</div>
                        <div style={{flex:1, background:'#eef2f6', height:14, borderRadius:8, position:'relative'}}>
                          <div style={{width:`${(s.value||0)/max*100}%`, height:'100%', background:colors[i%colors.length], borderRadius:8}} title={`${s.value}`}></div>
                        </div>
                        <div style={{width:64, textAlign:'right', fontWeight:700}}>{s.value}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h5 className="mb-3">Liên kết nhanh</h5>
            <div className="quick-links">
              <div className="link" onClick={handleNavigate('/manage-teacher')}><i className="bi-people-fill"></i><div>Quản lý giáo viên</div></div>
              <div className="link" onClick={handleNavigate('/manage-subjects')}><i className="bi-journal-text"></i><div>Quản lý môn học</div></div>
              <div className="link" onClick={handleNavigate('/aptech-exam-management')}><i className="bi-calendar-event"></i><div>Quản lý kỳ thi Aptech</div></div>
              <div className="link" onClick={handleNavigate('/reporting-export')}><i className="bi-file-earmark-text"></i><div>Báo cáo & Xuất</div></div>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading />}
    </MainLayout>
  );
};

export default AdminDashboard;

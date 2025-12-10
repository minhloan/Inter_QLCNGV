import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useEffect, useState } from 'react';
import Loading from '../components/Common/Loading';
import { useNotifications } from '../contexts/NotificationContext';
import { getTeacherAptechExams } from '../api/aptechExam';
import { getMyTrials } from '../api/trial';
import { listAllSubjectRegistrations } from '../api/subjectRegistrationApi';

const Stat = ({ label, value }) => (
  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="text-uppercase text-muted small">{label}</div>
        <div className="fs-4 fw-bold">{value}</div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [completedExamsCount, setCompletedExamsCount] = useState(0);
  const [upcomingTrialsCount, setUpcomingTrialsCount] = useState(0);
  const [totalTrialsCount, setTotalTrialsCount] = useState(0);
  const [registeredSubjectsCount, setRegisteredSubjectsCount] = useState(0);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Aptech exams (teacher)
        const exams = await getTeacherAptechExams();

        // Parse dates and determine upcoming vs completed
        const today = new Date();
        const upcomingList = [];
        let completedCount = 0;

        if (Array.isArray(exams)) {
          exams.forEach((ex) => {
            // examDate stored as d/m/yyyy or yyyy-mm-dd in other places; try to normalize
            let dateStr = ex.examDate || '';
            if (dateStr.includes('/')) {
              const [d, m, y] = dateStr.split('/');
              dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            const timeStr = ex.examTime || '00:00';
            const examDateTime = new Date(`${dateStr}T${timeStr}`);

            if (!isNaN(examDateTime.getTime()) && examDateTime >= today) {
              // Upcoming aptech exam registration
              upcomingList.push(ex);
            }

            // Completed & graded
            if (ex.score !== null && ex.score !== undefined && ex.score !== '') {
              completedCount += 1;
            }
          });
        }

        // Trials
        const trials = await getMyTrials();
        let upcomingTrials = 0;
        let totalTrials = 0;
        if (Array.isArray(trials)) {
          totalTrials = trials.length;
          const now = new Date();
          trials.forEach((t) => {
            let tDate = t.trialDate || t.date || '';
            if (tDate && tDate.includes('/')) {
              const [d, m, y] = tDate.split('/');
              tDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            const tTime = t.trialTime || t.time || '00:00';
            const trialDateTime = new Date(`${tDate}T${tTime}`);
            if (!isNaN(trialDateTime.getTime()) && trialDateTime >= now) upcomingTrials += 1;
          });
        }

        // Subject registrations (teacher)
        const regs = await listAllSubjectRegistrations();
        const regsCount = Array.isArray(regs) ? regs.length : 0;

        if (!mounted) return;
        setUpcomingExams(upcomingList);
        setCompletedExamsCount(completedCount);
        setUpcomingTrialsCount(upcomingTrials);
        setTotalTrialsCount(totalTrials);
        setRegisteredSubjectsCount(regsCount);
        setUpcoming(upcomingList.slice(0, 5).map((ex) => ({ id: ex.id, title: `${ex.subjectName || ex.subjectCode || 'Môn'}`, date: ex.examDate })));
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleModuleSelect = (module) => {
    if (module === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <h1 className="page-title">Bảng điều khiển giáo viên</h1>
          <div className="text-muted">Tổng quan công việc, kỳ thi và thông báo dành cho bạn</div>
        </div>
        <div className="mt-3">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="moduleDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Chọn Module
            </button>
            <ul className="dropdown-menu" aria-labelledby="moduleDropdown">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleModuleSelect('admin')}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Quản lí giáo viên và môn học (Admin)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
            <div className="row g-3">
              <div className="col-lg-3 col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-uppercase text-muted small">Kỳ thi sắp tới</div>
                        <div className="fs-4 fw-bold">{upcomingExams.length}</div>
                      </div>
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-calendar-event text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-uppercase text-muted small">Môn đã thi</div>
                        <div className="fs-4 fw-bold">{completedExamsCount}</div>
                      </div>
                      <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-check2-circle text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-uppercase text-muted small">Buổi giảng thử sắp tới</div>
                        <div className="fs-4 fw-bold">{upcomingTrialsCount}</div>
                      </div>
                      <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-people text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-uppercase text-muted small">Tổng số buổi giảng thử</div>
                        <div className="fs-4 fw-bold">{totalTrialsCount}</div>
                      </div>
                      <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-collection text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-uppercase text-muted small">Số môn đã đăng ký</div>
                    <div className="fs-4 fw-bold">{registeredSubjectsCount}</div>
                    <div className="text-muted small mt-2">Tổng số môn bạn đã đăng ký tham gia</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-9 col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">Tác vụ nhanh</h5>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate('/edit-profile')}>
                        <i className="bi bi-person-circle"></i>
                        Đến trang cá nhân
                      </button>
                      <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/teacher-aptech-exam')}>
                        <i className="bi bi-calendar-event-fill"></i>
                        Đến kỳ thi
                      </button>
                      <button className="btn btn-outline-success d-flex align-items-center gap-2" onClick={() => navigate('/teacher-trial-teaching')}>
                        <i className="bi bi-pencil-square"></i>
                        Đến đánh giá giảng dạy
                      </button>
                      <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/teacher-subject-registration')}>
                        <i className="bi bi-book"></i>
                        Đến môn học
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div className="row mt-4">
          <div className="col-lg-6">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">Kỳ thi & Sự kiện sắp tới</h5>
                <ul className="list-group list-group-flush">
                  {upcoming.map(u => (
                    <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{u.title}</div>
                        <div className="text-muted small">{u.date}</div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/teacher-aptech-exam')}>Chi tiết</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">Thông báo gần đây</h5>
                <ul className="list-group list-group-flush">
                  {notifications.slice(0,5).map(n => (
                    <li key={n.id} className="list-group-item">
                      <div className="fw-semibold">{n.title}</div>
                      <div className="text-muted small">{n.message}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading />}
    </MainLayout>
  );
};

export default TeacherDashboard;


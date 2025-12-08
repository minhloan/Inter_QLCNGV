import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { registerAptechExam, getAptechExamSessions, getTeacherAptechExams } from '../../api/aptechExam';
import { getAllSubjects } from '../../api/subject';
import { useAuth } from '../../contexts/AuthContext';

const AptechExamAdd = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const formSectionWidth = '1200px';
    const formGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        alignItems: 'flex-start'
    };
    const fullWidthFieldStyle = { gridColumn: '1 / -1' };
    const [sessions, setSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [previousExams, setPreviousExams] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attempt, setAttempt] = useState(1);
    const [retakeReason, setRetakeReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            calculateAttempt();
        }
    }, [selectedSubject, previousExams]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sessionsData, subjectsData, examsData] = await Promise.all([
                getAptechExamSessions(),
                getAllSubjects(),
                getTeacherAptechExams()
            ]);
            setSessions(sessionsData);
            setSubjects(subjectsData);
            setPreviousExams(examsData);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải dữ liệu', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const calculateAttempt = () => {
        if (!selectedSubject || !previousExams.length) {
            setAttempt(1);
            return;
        }

        const subjectExams = previousExams.filter(exam => exam.subjectId === selectedSubject);
        const maxAttempt = subjectExams.length > 0 ? Math.max(...subjectExams.map(exam => exam.attempt || 1)) : 0;
        setAttempt(maxAttempt + 1);
    };

    const handleSessionChange = (sessionId) => {
        setSelectedSession(sessionId);
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        calculateAttempt();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSession || !selectedSubject) {
            showToast('Lỗi', 'Vui lòng chọn phiên thi và môn học', 'danger');
            return;
        }

        // Kiểm tra đã đăng ký môn khác ở phiên thi này chưa
        const sessionExams = previousExams.filter(exam => String(exam.sessionId) === String(selectedSession));
        if (sessionExams.length > 0) {
            const hasOtherSubject = sessionExams.some(exam => String(exam.subjectId) !== String(selectedSubject));
            if (hasOtherSubject) {
                console.log('Bạn đã đăng ký môn thi khác trước đó');
                showToast('Lỗi', 'Bạn đã đăng ký môn thi khác trước đó', 'danger');
                return;
            }
        }

        // Prevent registering when there's a previous ungraded registration (score === null)
        const subjectExams = previousExams.filter(exam => String(exam.subjectId) === String(selectedSubject));
        const hasPendingRegistration = subjectExams.some(exam => exam.score == null);
        if (hasPendingRegistration) {
            console.log('Môn này đã được đăng ký thi trước đó');
            showToast('Thông báo', 'Môn này đã được đăng ký thi trước đó', 'info');
            return;
        }

        // Prevent registering for a subject that was already passed (score >= 80)
        const hasPassed = subjectExams.some(exam => (exam.score != null && exam.score >= 80) || exam.result === 'PASS' || exam.aptechStatus === 'APPROVED');
        if (hasPassed) {
            console.log('Đã thi đậu môn này');
            showToast('Thông báo', 'Đã thi đậu môn này', 'info');
            return;
        }

        if (attempt > 1 && !retakeReason.trim()) {
            showToast('Lỗi', 'Vui lòng nhập lý do thi lại', 'danger');
            return;
        }

        try {
            setLoading(true);
            const requestData = {
                sessionId: selectedSession,
                subjectId: selectedSubject
            };

            await registerAptechExam(selectedSession, selectedSubject);
            showToast('Thành công', 'Đăng ký thi thành công', 'success');
            console.log('Đã đăng ký thi thành công');
            // Chuyển về trang TeacherAptechExam.jsx cho teacher
            navigate('/teacher-aptech-exam');
        } catch (error) {
            showToast('Lỗi', 'Đăng ký thi thất bại', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const selectedSessionData = sessions.find(s => s.id === selectedSession);

    if (loading) {
        return <Loading fullscreen={true} message="Đang xử lý..." />;
    }

    return (
        <MainLayout>
            <div
                className="page-admin-add-teacher page-align-with-form"
                style={{ '--page-section-width': formSectionWidth }}
            >
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Đăng ký Kỳ thi Aptech</h1>
                    </div>
                </div>

                <div
                    className="form-container"
                    style={{ width: '100%', maxWidth: formSectionWidth, margin: '0 auto' }}
                >
                    <form onSubmit={handleSubmit}>
                        {/* Part 1: Chọn Phiên thi */}
                        <div className="form-section">
                            <h3 className="section-title">Chọn Phiên thi</h3>
                            <div className="form-grid" style={formGridStyle}>
                                <div className="form-group">
                                    <label className="form-label">Phiên thi *</label>
                                    <select
                                        className="form-select"
                                        value={selectedSession}
                                        onChange={(e) => handleSessionChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn phiên thi</option>
                                        {sessions.map(session => (
                                            <option key={session.id} value={session.id}>
                                                {session.examDate} - {session.room}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ngày thi</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSessionData?.examDate || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Giờ thi</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSessionData?.examTime || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phòng thi</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSessionData?.room || ''}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group full-width" style={fullWidthFieldStyle}>
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={selectedSessionData?.note || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Part 2: Thông tin giảng viên */}
                        <div className="form-section">
                            <h3 className="section-title">Thông tin Giảng viên</h3>
                            <div className="form-grid" style={formGridStyle}>
                                <div className="form-group">
                                    <label className="form-label">Tên giảng viên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user?.username || 'N/A'}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Môn thi *</label>
                                    <select
                                        className="form-select"
                                        value={selectedSubject}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn môn thi</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.subjectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lần thi</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={attempt}
                                        readOnly
                                    />
                                </div>

                                {attempt > 1 && (
                                    <div className="form-group full-width" style={fullWidthFieldStyle}>
                                        <label className="form-label">Lý do thi lại *</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={retakeReason}
                                            onChange={(e) => setRetakeReason(e.target.value)}
                                            placeholder="Vui lòng nhập lý do thi lại..."
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit buttons */}
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                                <i className="bi bi-arrow-left"></i>
                                Quay lại
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-check-circle"></i>
                                Đăng ký
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            )}
        </MainLayout>
    );
};

export default AptechExamAdd;

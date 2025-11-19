import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getTrialById, downloadTrialReport } from '../../api/trial';

const TeacherTrialTeachingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trial, setTrial] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (id) loadTrialData();
    }, [id]);

    const loadTrialData = async () => {
        try {
            setLoading(true);
            const trialData = await getTrialById(id);
            setTrial(trialData);

            if (trialData.evaluation) setEvaluation(trialData.evaluation);
            if (trialData.attendees) setAttendees(trialData.attendees);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải dữ liệu giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const blob = await downloadTrialReport(evaluation?.fileReportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trial_report_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Thành công', 'Tải biên bản thành công', 'success');
        } catch (error) {
            showToast('Lỗi', 'Không thể tải biên bản', 'danger');
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ đánh giá', class: 'warning' },
            REVIEWED: { label: 'Đã đánh giá', class: 'success' }
        };
        const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
        return <span className={`badge badge-${statusInfo.class}`}>{statusInfo.label}</span>;
    };

    const getConclusionBadge = (conclusion) => {
        if (!conclusion) return null;
        const conclusionMap = {
            PASS: { label: 'Đạt yêu cầu', class: 'success' },
            FAIL: { label: 'Không đạt yêu cầu', class: 'danger' }
        };
        const conclusionInfo = conclusionMap[conclusion] || { label: conclusion, class: 'secondary' };
        return <span className={`badge badge-${conclusionInfo.class}`}>{conclusionInfo.label}</span>;
    };

    if (loading && !trial) return <MainLayout><Loading /></MainLayout>;

    if (!trial) {
        return (
            <MainLayout>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h4>Không tìm thấy dữ liệu giảng thử</h4>
                                    <button className="btn btn-primary mt-3" onClick={() => navigate('/teacher-trial-teaching')}>
                                        Quay lại danh sách
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container-fluid">
                {/* Header giống style ManageSubjectAdd */}
                <div className="content-header d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <button className="back-button" onClick={() => navigate('/teacher-trial-teaching')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h4 className="page-title mb-0">Chi tiết buổi giảng thử</h4>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        {/* Trial Information & Evaluation */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h5>Thông tin buổi giảng thử</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                    <tr><td><strong>Giảng viên:</strong></td><td>{trial.teacherName} ({trial.teacherCode})</td></tr>
                                    <tr><td><strong>Môn học:</strong></td><td>{trial.subjectName}</td></tr>
                                    <tr><td><strong>Ngày giảng:</strong></td><td>{trial.teachingDate}</td></tr>
                                    <tr><td><strong>Địa điểm:</strong></td><td>{trial.location || 'N/A'}</td></tr>
                                    <tr><td><strong>Trạng thái:</strong></td><td>{getStatusBadge(trial.status)}</td></tr>
                                    {trial.note && <tr><td><strong>Ghi chú:</strong></td><td>{trial.note}</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <h5>Kết quả đánh giá</h5>
                                {evaluation ? (
                                    <table className="table table-borderless">
                                        <tbody>
                                        <tr><td><strong>Điểm số:</strong></td><td>{evaluation.score}/100</td></tr>
                                        <tr><td><strong>Kết luận:</strong></td><td>{getConclusionBadge(evaluation.conclusion)}</td></tr>
                                        {evaluation.comments && <tr><td><strong>Nhận xét:</strong></td><td>{evaluation.comments}</td></tr>}
                                        {evaluation.fileReportId && (
                                            <tr>
                                                <td><strong>Biên bản:</strong></td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary" onClick={handleDownloadReport}>
                                                        <i className="bi bi-download"></i> Tải xuống
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted">Chưa có đánh giá</p>
                                )}
                            </div>
                        </div>

                        {/* Attendees Section */}
                        {attendees.length > 0 && (
                            <div>
                                <h5>Người tham dự</h5>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                        <tr><th>Tên</th><th>Vai trò</th></tr>
                                        </thead>
                                        <tbody>
                                        {attendees.map(a => (
                                            <tr key={a.id}>
                                                <td>{a.attendeeName}</td>
                                                <td>
                                                        <span className="badge badge-secondary">
                                                            {a.attendeeRole === 'CHU_TOA' ? 'Chủ tọa' :
                                                                a.attendeeRole === 'THU_KY' ? 'Thư ký' : 'Thành viên'}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
                {loading && <Loading />}
            </div>
        </MainLayout>
    );
};

export default TeacherTrialTeachingDetail;

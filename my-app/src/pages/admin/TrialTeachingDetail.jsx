import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import TrialEvaluationModal from '../../components/TrialEvaluationModal';
import TrialAttendeeModal from '../../components/TrialAttendeeModal';
import { getTrialById, updateTrialStatus, downloadTrialReport } from '../../api/trial';

const TrialTeachingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trial, setTrial] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showAttendeeModal, setShowAttendeeModal] = useState(false);
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

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLoading(true);
            await updateTrialStatus(id, newStatus);
            setTrial(prev => ({ ...prev, status: newStatus }));
            showToast('Thành công', 'Cập nhật trạng thái thành công', 'success');
        } catch (error) {
            showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
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
                                    <button className="btn btn-primary mt-3" onClick={() => navigate('/trial-teaching-management')}>
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
            <div className="page-admin-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate('/trial-teaching-management')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết buổi giảng thử</h1>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        {trial.status === 'PENDING' && evaluation && (
                            <button className="btn btn-success" onClick={() => handleStatusUpdate('REVIEWED')}>
                                <i className="bi bi-check-circle"></i> Đánh dấu đã đánh giá
                            </button>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        {/* Trial Information & Evaluation */}
                        <div className="row mb-4">
                            <div className="col-md-6 detail-section">
                                <h5>Thông tin buổi giảng thử</h5>
                                <div className="table-responsive">
                                    <table className="table table-borderless detail-table mb-0">
                                        <tbody>
                                        <tr><td>Giảng viên:</td><td className="text-break">{trial.teacherName} ({trial.teacherCode})</td></tr>
                                        <tr><td>Môn học:</td><td className="text-break">{trial.subjectName}</td></tr>
                                        <tr><td>Ngày giảng:</td><td className="text-break">{trial.teachingDate}</td></tr>
                                        <tr><td>Địa điểm:</td><td className="text-break">{trial.location || 'N/A'}</td></tr>
                                        <tr><td>Trạng thái:</td><td>{getStatusBadge(trial.status)}</td></tr>
                                        {trial.note && <tr><td>Ghi chú:</td><td className="text-break">{trial.note}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-md-6 detail-section">
                                <h5>Kết quả đánh giá</h5>
                                {evaluation ? (
                                    <div className="table-responsive">
                                        <table className="table table-borderless detail-table mb-0">
                                            <tbody>
                                            <tr><td>Điểm số:</td><td>{evaluation.score}/100</td></tr>
                                            <tr><td>Kết luận:</td><td>{getConclusionBadge(evaluation.conclusion)}</td></tr>
                                            {evaluation.comments && <tr><td>Nhận xét:</td><td className="text-break">{evaluation.comments}</td></tr>}
                                            {evaluation.fileReportId && (
                                                <tr>
                                                    <td>Biên bản:</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary" onClick={handleDownloadReport}>
                                                            <i className="bi bi-download"></i> Tải xuống
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted mb-0">Chưa có đánh giá</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2 flex-wrap mb-4">
                            <button className="btn btn-primary" onClick={() => setShowEvaluationModal(true)}>
                                <i className="bi bi-star"></i> Đánh giá giảng thử
                            </button>
                            <button className="btn btn-info" onClick={() => setShowAttendeeModal(true)}>
                                <i className="bi bi-people"></i> Quản lý người tham dự
                            </button>
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

                {/* Modals */}
                {showEvaluationModal && (
                    <TrialEvaluationModal
                        trialId={id}
                        trial={trial}
                        evaluation={evaluation}
                        onClose={() => setShowEvaluationModal(false)}
                        onSuccess={() => { setShowEvaluationModal(false); loadTrialData(); }}
                        onToast={showToast}
                    />
                )}

                {showAttendeeModal && (
                    <TrialAttendeeModal
                        trialId={id}
                        attendees={attendees}
                        onClose={() => setShowAttendeeModal(false)}
                        onSuccess={() => { setShowAttendeeModal(false); loadTrialData(); }}
                        onToast={showToast}
                    />
                )}

                {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
                {loading && <Loading />}
            </div>
        </MainLayout>
    );
};

export default TrialTeachingDetail;

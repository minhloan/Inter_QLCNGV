import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import TrialEvaluationModal from '../../components/TrialEvaluationModal';
import { useAuth } from '../../contexts/AuthContext';
import { getTrialById, exportTrialAssignment, exportTrialEvaluationForm, exportTrialMinutes } from '../../api/trial';
import { downloadTrialReport } from '../../api/file';

const TeacherTrialTeachingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trial, setTrial] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
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

    const handleDownloadReport = async (format) => {
        try {
            if (!evaluation?.imageFileId) {
                showToast('Lỗi', 'Biên bản chưa có sẵn', 'warning');
                return;
            }

            await downloadTrialReport(evaluation.imageFileId, id, format);
            showToast('Thành công', `Tải biên bản ${format.toUpperCase()} thành công`, 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast('Lỗi', `Không thể tải biên bản ${format.toUpperCase()}`, 'danger');
        }
    };

    const handleExportDocument = async (exportType, attendeeId = null) => {
        try {
            setLoading(true);
            let blob;
            let filename;

            switch (exportType) {
                case 'assignment':
                    blob = await exportTrialAssignment(id);
                    filename = `BM06.39-Phan_cong_danh_gia_GV_giang_thu_${id}.docx`;
                    break;
                case 'evaluation-form':
                    if (!attendeeId) {
                        showToast('Lỗi', 'Vui lòng chọn người đánh giá', 'warning');
                        return;
                    }
                    blob = await exportTrialEvaluationForm(id, attendeeId);
                    filename = `BM06.40-Phieu_danh_gia_giang_thu_${id}_${attendeeId}.xlsx`;
                    break;
                case 'minutes':
                    blob = await exportTrialMinutes(id);
                    filename = `BM06.41-BB_danh_gia_giang_thu_${id}.docx`;
                    break;
                default:
                    return;
            }

            const url = window.URL.createObjectURL(blob.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Thành công', 'Xuất file thành công', 'success');
        } catch (error) {
            console.error('Error exporting document:', error);
            showToast('Lỗi', 'Không thể xuất file', 'danger');
        } finally {
            setLoading(false);
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

    // Kiểm tra xem user hiện tại có được phân công đánh giá không (không chỉ CHỦ TỌA)
    const isCurrentUserAssigned = () => {
        if (!user?.userId || !attendees || attendees.length === 0) return false;
        return attendees.some(attendee => attendee.attendeeUserId === user.userId);
    };

    // Lấy attendeeId của user hiện tại (nếu được phân công)
    const getCurrentUserAttendeeId = () => {
        if (!user?.userId || !attendees || attendees.length === 0) return null;
        const myAttendee = attendees.find(attendee => attendee.attendeeUserId === user.userId);
        return myAttendee?.id || null;
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
            <div className="page-admin-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate('/teacher-trial-teaching')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết buổi giảng thử</h1>
                    </div>
                    {isCurrentUserAssigned() && (
                        <div className="d-flex gap-2 flex-wrap">
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setShowEvaluationModal(true)}
                            >
                                <i className="bi bi-star"></i> Đánh giá giảng thử
                            </button>
                        </div>
                    )}
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
                                            {evaluation.imageFileId && (
                                                <tr>
                                                    <td>Biên bản:</td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadReport('pdf')}>
                                                                <i className="bi bi-file-earmark-pdf"></i> PDF
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadReport('docx')}>
                                                                <i className="bi bi-file-earmark-word"></i> DOCX
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadReport('doc')}>
                                                                <i className="bi bi-file-earmark-word"></i> DOC
                                                            </button>
                                                        </div>
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

                        {/* Export Documents Section */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bi bi-file-earmark-arrow-down me-2"></i>
                                    Xuất biểu mẫu đánh giá
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <button 
                                            className="btn btn-outline-primary w-100" 
                                            onClick={() => handleExportDocument('assignment')}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-file-earmark-word me-2"></i>
                                            BM06.39 - Phân công đánh giá (Word)
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button 
                                            className="btn btn-outline-success w-100" 
                                            onClick={() => handleExportDocument('minutes')}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-file-earmark-word me-2"></i>
                                            BM06.41 - Biên bản đánh giá (Word)
                                        </button>
                                    </div>
                                    {trial?.evaluations && trial.evaluations.length > 0 && (
                                        <div className="col-md-6">
                                            <div className="dropdown">
                                                <button 
                                                    className="btn btn-outline-info w-100 dropdown-toggle" 
                                                    type="button" 
                                                    data-bs-toggle="dropdown"
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                                    BM06.40 - Phiếu đánh giá (Excel)
                                                </button>
                                                <ul className="dropdown-menu w-100">
                                                    {trial.evaluations.map((evaluation) => (
                                                        <li key={evaluation.id}>
                                                            <button 
                                                                className="dropdown-item" 
                                                                onClick={() => handleExportDocument('evaluation-form', evaluation.attendeeId)}
                                                            >
                                                                {evaluation.attendeeName || 'Người đánh giá'} 
                                                                {evaluation.attendeeRole && ` (${evaluation.attendeeRole === 'CHU_TOA' ? 'Chủ tọa' : evaluation.attendeeRole === 'THU_KY' ? 'Thư ký' : 'Thành viên'})`}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Modal */}
                {showEvaluationModal && (
                    <TrialEvaluationModal
                        trialId={id}
                        trial={trial}
                        evaluation={evaluation}
                        attendeeId={getCurrentUserAttendeeId()}
                        attendees={attendees}
                        onClose={() => setShowEvaluationModal(false)}
                        onSuccess={() => { 
                            setShowEvaluationModal(false); 
                            loadTrialData(); 
                        }}
                        onToast={showToast}
                    />
                )}

                {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
                {loading && <Loading />}
            </div>
        </MainLayout>
    );
};

export default TeacherTrialTeachingDetail;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import TrialEvaluationModal from '../../components/TrialEvaluationModal';
import TrialAttendeeModal from '../../components/TrialAttendeeModal';
import { useAuth } from '../../contexts/AuthContext';
import { getTrialById, updateTrialStatus, adminOverrideTrialResult, exportTrialAssignment, exportTrialEvaluationForm, exportTrialMinutes, exportTrialStatistics } from '../../api/trial';
import { downloadTrialReport } from '../../api/file';

const TrialTeachingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isManageLeader } = useAuth();
    const [trial, setTrial] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showAttendeeModal, setShowAttendeeModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [overrideResult, setOverrideResult] = useState('');
    const [overrideNote, setOverrideNote] = useState('');

    useEffect(() => {
        if (id) loadTrialData();
    }, [id]);

    const loadTrialData = async () => {
        try {
            setLoading(true);
            const trialData = await getTrialById(id);
            setTrial(trialData);

            // Xử lý evaluation (số ít) hoặc evaluations (số nhiều)
            if (trialData.evaluation) {
                setEvaluation(trialData.evaluation);
            } else if (trialData.evaluations && trialData.evaluations.length > 0) {
                // Nếu có nhiều evaluations, lấy cái đầu tiên làm evaluation chính (nếu cần)
                setEvaluation(trialData.evaluations[0]);
            }

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
                case 'statistics':
                    blob = await exportTrialStatistics();
                    filename = `BM06.42-Thong_ke_danh_gia_giang_thu.xlsx`;
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
            const errorMessage = error.message || 'Không thể xuất file';
            showToast('Lỗi', errorMessage, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminOverride = async (e) => {
        e.preventDefault();
        if (!overrideResult) {
            showToast('Lỗi', 'Vui lòng chọn kết luận', 'warning');
            return;
        }

        try {
            setLoading(true);
            await adminOverrideTrialResult(id, {
                finalResult: overrideResult,
                resultNote: overrideNote
            });
            showToast('Thành công', 'Đã cập nhật kết quả cuối cùng', 'success');
            loadTrialData(); // Reload data
            setOverrideResult('');
            setOverrideNote('');
        } catch (error) {
            console.error('Error admin override:', error);
            showToast('Lỗi', 'Không thể cập nhật kết quả', 'danger');
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

    // Kiểm tra xem user hiện tại có phải là Manage hoặc giáo viên được phân công đánh giá không
    const canEvaluate = () => {
        // Manage/Admin luôn có quyền đánh giá
        if (isManageLeader) return true;

        // Kiểm tra xem user hiện tại có trong danh sách attendees không
        if (!user?.userId || !attendees || attendees.length === 0) return false;
        return attendees.some(attendee => attendee.attendeeUserId === user.userId);
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

                        {/* Action Buttons */}
                        <div className="trial-action-buttons">
                            {canEvaluate() && (
                                <button className="btn btn-trial-evaluate" onClick={() => setShowEvaluationModal(true)}>
                                    <i className="bi bi-star"></i> ĐÁNH GIÁ GIẢNG THỬ
                                </button>
                            )}
                            {isManageLeader && (
                                <button className="btn btn-trial-attendee" onClick={() => setShowAttendeeModal(true)}>
                                    <i className="bi bi-people"></i> Quản lý người tham dự
                                </button>
                            )}
                        </div>

                        {/* Admin Override Section */}
                        {isManageLeader && trial.evaluations && trial.evaluations.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="bi bi-shield-fill-check me-2"></i>
                                        Admin Override - Quyết định cuối cùng
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {trial.averageScore !== null && (
                                        <div className="alert alert-info mb-3">
                                            <strong>Kết quả tự động:</strong>
                                            <ul className="mb-0 mt-2">
                                                <li>Điểm trung bình: <strong>{trial.averageScore}</strong></li>
                                                <li>Kết luận: {trial.finalResult ? (
                                                    <span className={`badge bg-${trial.finalResult === 'PASS' ? 'success' : 'danger'}`}>
                                                        {trial.finalResult === 'PASS' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                                                    </span>
                                                ) : 'Chưa xác định'}</li>
                                                {trial.hasRedFlag && (
                                                    <li className="text-warning">
                                                        <i className="bi bi-exclamation-triangle-fill"></i> Có điểm đánh giá thấp đáng lo ngại
                                                    </li>
                                                )}
                                                {trial.needsReview && (
                                                    <li className="text-warning">
                                                        <i className="bi bi-exclamation-circle-fill"></i> Kết quả chưa rõ ràng, cần đánh giá lại
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {trial.adminOverride && trial.resultNote && (
                                        <div className="alert alert-success mb-3">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <strong>Quyết định đã được Admin xác nhận</strong>
                                            <p className="mb-0 mt-2">{trial.resultNote}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleAdminOverride}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Kết luận cuối cùng *</label>
                                                <select
                                                    className="form-select"
                                                    value={overrideResult}
                                                    onChange={(e) => setOverrideResult(e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Chọn kết luận --</option>
                                                    <option value="PASS">ĐẠT</option>
                                                    <option value="FAIL">KHÔNG ĐẠT</option>
                                                </select>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">Ghi chú / Lý do</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={overrideNote}
                                                    onChange={(e) => setOverrideNote(e.target.value)}
                                                    placeholder="Nhập lý do ra quyết định này (ví dụ: Sau khi họp Hội đồng thảo luận...)"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            <i className="bi bi-shield-fill-check me-2"></i>
                                            {loading ? 'Đang xử lý...' : 'Xác nhận quyết định cuối cùng'}
                                        </button>
                                    </form>
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
                                            - Phân công đánh giá (Word)
                                        </button>
                                    </div>
                                    <div className="col-md-6">
                                        <button
                                            className="btn btn-outline-success w-100"
                                            onClick={() => handleExportDocument('minutes')}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-file-earmark-word me-2"></i>
                                            - Biên bản đánh giá (Word)
                                        </button>
                                    </div>
                                    {/* {trial?.evaluations && trial.evaluations.length > 0 && (
                                        <div className="col-md-6">
                                            <div className="dropdown">
                                                <button 
                                                    className="btn btn-outline-info w-100 dropdown-toggle" 
                                                    type="button" 
                                                    data-bs-toggle="dropdown"
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                                    - Phiếu đánh giá (Excel)
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
                                    )} */}
                                    {/* <div className="col-md-6">
                                        <button 
                                            className="btn btn-outline-warning w-100" 
                                            onClick={() => handleExportDocument('statistics')}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-file-earmark-excel me-2"></i>
                                            BM06.42 - Thống kê đánh giá (Excel)
                                        </button>
                                    </div> */}
                                </div>
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
                                                        <span className="badge badge-status secondary">
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
                        attendees={attendees}
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

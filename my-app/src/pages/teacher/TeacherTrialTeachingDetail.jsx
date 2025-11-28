import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { getTrialById, exportTrialAssignment, exportTrialEvaluationForm, exportTrialMinutes } from '../../api/trial';
import { downloadTrialReport, getFile } from '../../api/file';
import { getAptechExamsByTeacherForAdmin } from '../../api/aptechExam';

const TeacherTrialTeachingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isManageLeader } = useAuth();
    const [trial, setTrial] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [aptechExams, setAptechExams] = useState([]);
    const [loadingCertificates, setLoadingCertificates] = useState(false);
    const [showCertificates, setShowCertificates] = useState(false);
    const [certPage, setCertPage] = useState(1);
    const CERT_PAGE_SIZE = 10;

    useEffect(() => {
        if (id) loadTrialData();
    }, [id]);

    const buildConsolidatedEvaluation = (trialData) => {
        if (!trialData) return null;

        const commentList = (trialData.evaluations || [])
            .map(item => item?.comments?.trim())
            .filter(Boolean);
        const firstFileId = (trialData.evaluations || []).find(item => item?.imageFileId)?.imageFileId;

        if (trialData.averageScore !== null && trialData.averageScore !== undefined) {
            return {
                score: trialData.averageScore,
                conclusion: trialData.finalResult || null,
                comments: commentList.length ? commentList.join('; ') : null,
                imageFileId: firstFileId || null,
            };
        }

        if (trialData.finalResult) {
            return {
                score: null,
                conclusion: trialData.finalResult,
                comments: commentList.length ? commentList.join('; ') : null,
                imageFileId: firstFileId || null,
            };
        }

        if (trialData.evaluation) return trialData.evaluation;
        if (trialData.evaluations && trialData.evaluations.length > 0) return trialData.evaluations[0];
        return null;
    };

    const loadTrialData = async () => {
        try {
            setLoading(true);
            const trialData = await getTrialById(id);
            setTrial(trialData);

            const consolidatedEvaluation = buildConsolidatedEvaluation(trialData);
            setEvaluation(consolidatedEvaluation);

            if (trialData.attendees) setAttendees(trialData.attendees);

            // Load Aptech certificates for the teacher of this trial
            if (trialData.teacherId) {
                try {
                    setLoadingCertificates(true);
                    const exams = await getAptechExamsByTeacherForAdmin(trialData.teacherId);
                    setAptechExams(exams || []);
                } finally {
                    setLoadingCertificates(false);
                }
            } else {
                setAptechExams([]);
            }
        } catch (error) {
            showToast('Lỗi', 'Không thể tải dữ liệu giảng dạy', 'danger');
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
        return <span className={`badge badge-status ${conclusionInfo.class}`}>{conclusionInfo.label}</span>;
    };

    const handleOpenFileById = async (fileId) => {
        if (!fileId) return;
        try {
            const url = await getFile(fileId);
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            showToast('Lỗi', 'Không thể mở file chứng nhận', 'danger');
        }
    };

    // Kiểm tra xem user hiện tại có phải là teacher được đánh giá không
    const isCurrentUserTheTeacher = () => {
        if (!user?.userId || !trial?.teacherId) return false;
        // So sánh cả string và number để đảm bảo chính xác
        const userIdStr = String(user.userId);
        const teacherIdStr = String(trial.teacherId);
        return userIdStr === teacherIdStr;
    };

    // Kiểm tra xem user hiện tại có được phân công đánh giá không (không chỉ CHỦ TỌA)
    const isCurrentUserAssigned = () => {
        if (!user?.userId || !attendees || attendees.length === 0) return false;
        return attendees.some(attendee => attendee.attendeeUserId === user.userId);
    };

    // Kiểm tra xem user có quyền xem và export file không
    // - Admin/Manager: luôn có quyền
    // - Người đánh giá (có trong attendees): có quyền
    // - Teacher được đánh giá: KHÔNG có quyền
    const canExportDocuments = () => {
        if (isManageLeader) return true; // Admin/Manager luôn có quyền
        if (isCurrentUserTheTeacher()) return false; // Teacher được đánh giá không có quyền
        return isCurrentUserAssigned(); // Người đánh giá có quyền
    };

    // Lấy attendeeId của user hiện tại (nếu được phân công)
    const getCurrentUserAttendeeId = () => {
        if (!user?.userId || !attendees || attendees.length === 0) return null;
        const myAttendee = attendees.find(attendee => attendee.attendeeUserId === user.userId);
        return myAttendee?.id || null;
    };

    const totalCertPages = Math.ceil(aptechExams.length / CERT_PAGE_SIZE) || 1;
    const currentCertPage = Math.min(certPage, totalCertPages);
    const certStart = (currentCertPage - 1) * CERT_PAGE_SIZE;
    const pagedExams = aptechExams.slice(certStart, certStart + CERT_PAGE_SIZE);

    if (loading && !trial) return <MainLayout><Loading /></MainLayout>;

    if (!trial) {
        return (
            <MainLayout>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h4>Không tìm thấy dữ liệu giảng dạy</h4>
                                    <button className="btn btn-primary mt-3" onClick={() => {
                                        const fromPage = location.state?.fromPage;
                                        navigate(fromPage === 'my-reviews' ? '/my-reviews' : '/teacher-trial-teaching');
                                    }}>
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

    // Xác định trang quay lại dựa trên location.state
    const getBackPath = () => {
        const fromPage = location.state?.fromPage;
        if (fromPage === 'my-reviews') {
            return '/my-reviews';
        }
        return '/teacher-trial-teaching';
    };

    return (
        <MainLayout>
            <div className="page-admin-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(getBackPath())}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết buổi giảng dạy</h1>
                    </div>
                    {isCurrentUserAssigned() && (
                        <div className="d-flex gap-2 flex-wrap">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/teacher/trial-evaluation/${id}`, {
                                    state: {
                                        attendeeId: getCurrentUserAttendeeId(),
                                        evaluation: evaluation
                                    }
                                })}
                            >
                                <i className="bi bi-star"></i> Chấm đánh giá
                            </button>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-body">
                        {/* Trial Information & Evaluation */}
                        <div className="row mb-4">
                            <div className="col-md-6 detail-section">
                                <h5>Thông tin buổi giảng dạy</h5>
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
                                {evaluation || (trial?.finalResult) ? (
                                    <div className="table-responsive">
                                        <table className="table table-borderless detail-table mb-0">
                                            <tbody>
                                                {evaluation?.score !== null && evaluation?.score !== undefined && (
                                                    <tr><td>Điểm số:</td><td>{evaluation.score}/100</td></tr>
                                                )}
                                                {(evaluation?.conclusion || trial?.finalResult) && (
                                                    <tr><td>Kết luận:</td><td>{getConclusionBadge(evaluation?.conclusion || trial?.finalResult)}</td></tr>
                                                )}
                                                {evaluation?.comments && <tr><td>Nhận xét:</td><td className="text-break">{evaluation.comments}</td></tr>}
                                                {evaluation?.imageFileId && canExportDocuments() && (
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

                        {/* Aptech Certificates Section - chỉ cho manage hoặc người được phân công chấm */}
                        {canExportDocuments() && (
                            <div className="card mb-4 mt-3">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h5 className="mb-0">
                                            <i className="bi bi-award me-2" />
                                            Chứng nhận & Bằng Aptech của giảng viên
                                        </h5>
                                        {aptechExams.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setShowCertificates(prev => !prev)}
                                            >
                                                <i
                                                    className={`bi ${showCertificates ? 'bi-chevron-up' : 'bi-chevron-down'
                                                        } me-1`}
                                                />
                                                {showCertificates ? 'Thu gọn' : 'Hiển thị danh sách'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loadingCertificates ? (
                                        <p className="text-muted mb-0">Đang tải dữ liệu chứng chỉ...</p>
                                    ) : aptechExams.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            Chưa ghi nhận kỳ thi Aptech nào cho giảng viên này trong hệ thống.
                                        </p>
                                    ) : showCertificates ? (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table table-striped align-middle mb-2">
                                                    <thead>
                                                        <tr>
                                                            <th>Môn thi</th>
                                                            <th>Ngày thi</th>
                                                            <th>Lần thi</th>
                                                            <th>Điểm</th>
                                                            <th>Kết quả</th>
                                                            <th>Chứng nhận thi</th>
                                                            <th>Bằng Aptech</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pagedExams.map(exam => (
                                                            <tr key={exam.id}>
                                                                <td className="text-break">
                                                                    {(exam.subjectCode ? `${exam.subjectCode} - ` : '') +
                                                                        (exam.subjectName || '')}
                                                                </td>
                                                                <td>{exam.examDate || ''}</td>
                                                                <td>{exam.attempt}</td>
                                                                <td>{exam.score != null ? exam.score : '—'}</td>
                                                                <td>{exam.result || '—'}</td>
                                                                <td>
                                                                    {exam.examProofFileId ? (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() =>
                                                                                handleOpenFileById(exam.examProofFileId)
                                                                            }
                                                                        >
                                                                            <i className="bi bi-file-earmark-richtext me-1" />
                                                                            Xem chứng nhận
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-muted small">Không có</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {exam.certificateFileId ? (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-success"
                                                                            onClick={() =>
                                                                                handleOpenFileById(exam.certificateFileId)
                                                                            }
                                                                        >
                                                                            <i className="bi bi-patch-check me-1" />
                                                                            Xem bằng
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-muted small">Không có</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {totalCertPages > 1 && (
                                                <nav aria-label="Aptech certificates pagination">
                                                    <ul className="pagination pagination-sm justify-content-end mb-0 flex-wrap">
                                                        <li
                                                            className={`page-item ${currentCertPage === 1 ? 'disabled' : ''
                                                                }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    setCertPage(prev => Math.max(1, prev - 1))
                                                                }
                                                                disabled={currentCertPage === 1}
                                                            >
                                                                <i className="bi bi-chevron-left" />
                                                            </button>
                                                        </li>
                                                        {Array.from({ length: totalCertPages }).map((_, idx) => {
                                                            const page = idx + 1;
                                                            return (
                                                                <li
                                                                    key={page}
                                                                    className={`page-item ${page === currentCertPage ? 'active' : ''
                                                                        }`}
                                                                >
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => setCertPage(page)}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                        <li
                                                            className={`page-item ${currentCertPage === totalCertPages ? 'disabled' : ''
                                                                }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    setCertPage(prev =>
                                                                        Math.min(totalCertPages, prev + 1)
                                                                    )
                                                                }
                                                                disabled={currentCertPage === totalCertPages}
                                                            >
                                                                <i className="bi bi-chevron-right" />
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-muted mb-0">
                                            Có {aptechExams.length} lần thi Aptech. Bấm "Hiển thị danh sách" để xem chi
                                            tiết.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Export Documents Section - Chỉ hiển thị nếu user có quyền */}
                        {canExportDocuments() && (
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

                                        {/* BM06.40 - Phiếu đánh giá cá nhân cho giáo viên cơ hữu / người chấm */}
                                        {getCurrentUserAttendeeId() && (
                                            <div className="col-md-6">
                                                <button
                                                    className="btn btn-outline-info w-100"
                                                    disabled={loading}
                                                    onClick={async () => {
                                                        try {
                                                            setLoading(true);
                                                            const attendeeId = getCurrentUserAttendeeId();
                                                            const res = await exportTrialEvaluationForm(id, attendeeId);
                                                            const blob = res.data;
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');

                                                            const safeTeacher = (trial.teacherName || 'GiangVien')
                                                                .replace(/\s+/g, '_');
                                                            const safeEvaluator = (user?.userData?.full_name || user?.username || 'NguoiDanhGia')
                                                                .replace(/\s+/g, '_');
                                                            const filename = `BM06.40-Phieu_danh_gia_giang_thu-${safeTeacher}-${safeEvaluator}.xlsx`;

                                                            a.href = url;
                                                            a.download = filename;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(a);

                                                            showToast('Thành công', 'Đã xuất phiếu đánh giá của bạn', 'success');
                                                        } catch (error) {
                                                            console.error('Error exporting personal evaluation form:', error);
                                                            showToast('Lỗi', 'Không thể xuất phiếu đánh giá', 'danger');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                                    BM06.40 - Phiếu đánh giá của tôi (Excel)
                                                </button>
                                            </div>
                                        )}
                                    </div>
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

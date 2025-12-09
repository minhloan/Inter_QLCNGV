import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getExamById, updateExamScore, uploadExamProof, uploadFinalCertificate, viewCertificate } from '../../api/aptechExam';

const layoutStyles = {
    page: {
        paddingBottom: '32px'
    },
    cardGrid: {
        gap: '24px'
    }
};

const AptechExamDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [score, setScore] = useState("");
    const examHasProof = Boolean(exam?.examProofFileId);

    useEffect(() => {
        if (exam) {
            setScore(exam.score ?? "");
        }
    }, [exam]);

    const handleScoreKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveScore();
        }
    };

    // Hàm kiểm tra trạng thái nhập điểm
    // Returns: { canInput: boolean, reason: string, status: 'notYet' | 'valid' | 'expired' }
    const getScoreInputStatus = () => {
        if (!exam) return { canInput: false, reason: 'Không có dữ liệu kỳ thi', status: 'notYet' };

        let date = exam.examDate || '';
        let time = exam.examTime || '00:00';

        // Chuyển đổi format ngày
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        const examStartTime = new Date(`${date}T${time}`);
        const now = new Date();

        // Nếu ngày/giờ không hợp lệ
        if (!examStartTime || isNaN(examStartTime.getTime())) {
            return { canInput: false, reason: 'Ngày thi không hợp lệ', status: 'notYet' };
        }

        // Kiểm tra xem kỳ thi đã bắt đầu hay chưa
        if (now.getTime() < examStartTime.getTime()) {
            return { canInput: false, reason: 'Kỳ thi chưa bắt đầu', status: 'notYet' };
        }

        // Tính thời gian kết thúc (24 giờ sau kỳ thi bắt đầu)
        const examEndTime = new Date(examStartTime.getTime() + 24 * 60 * 60 * 1000);

        // Kiểm tra xem còn trong vòng 24 giờ hay không
        if (now.getTime() <= examEndTime.getTime()) {
            return { canInput: true, reason: 'Có thể nhập điểm', status: 'valid' };
        }

        // Quá 24 giờ rồi
        return { canInput: false, reason: 'Hết thời gian nhập điểm', status: 'expired' };
    };

    const saveScore = async () => {
        try {
            if (exam && exam.aptechStatus && exam.aptechStatus !== 'PENDING') {
                showToast('Lỗi', 'Không thể sửa điểm sau khi phê duyệt hoặc từ chối', 'danger');
                return;
            }

            // Kiểm tra trạng thái nhập điểm
            const statusInfo = getScoreInputStatus();
            if (!statusInfo.canInput) {
                showToast('Lỗi', statusInfo.reason, 'danger');
                return;
            }

            const numeric = Number(score);
            const result = numeric >= 60 ? 'PASS' : 'FAIL';
            await updateExamScore(id, numeric, result);
            showToast('Thành công', 'Đã lưu điểm', 'success');
            await loadExamDetail();
        } catch (err) {
            showToast('Lỗi', 'Lỗi khi lưu điểm', 'danger');
        }
    };

    const handleScoreChange = (e) => {
        let value = e.target.value;
        if (value === '') {
            setScore('');
            return;
        }
        if (!/^\d+$/.test(value)) return;
        value = Number(value);
        if (value > 100) value = 100;
        if (value < 0) value = 0;
        setScore(value);
    };

    useEffect(() => {
        loadExamDetail();
    }, [id]);

    const loadExamDetail = async () => {
        try {
            setLoading(true);
            const examData = await getExamById(id);
            setExam(examData);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải chi tiết kỳ thi', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const handleExamProofUpload = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            const ocrResponse = await uploadExamProof(id, file);

            if (ocrResponse && ocrResponse.extractedScore != null) {
                showToast('Thành công', `Đã tải chứng nhận và tự động lưu điểm: ${ocrResponse.extractedScore}`, 'success');
            } else {
                showToast('Thông báo', 'Đã tải chứng nhận thi', 'success');
            }

            await loadExamDetail();
        } catch (err) {
            console.error('Exam proof upload error:', err);
            showToast('Lỗi', err.response?.data?.error || 'Không thể tải chứng nhận', 'danger');
        } finally {
            event.target.value = '';
            setLoading(false);
        }
    };

    const handleFinalCertificateUpload = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            await uploadFinalCertificate(id, file);
            // Intentionally do not show toast for 'Upload bằng' as requested
            await loadExamDetail();
        } catch (err) {
            console.error('Final certificate upload error:', err);
            // Intentionally suppress toast on failure for 'Upload bằng'
        } finally {
            event.target.value = '';
            setLoading(false);
        }
    };

    const handleViewCertificate = async () => {
        try {
            const blob = await viewCertificate(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Error viewing certificate:', err);
            showToast('Lỗi', 'Không thể xem ảnh', 'danger');
        }
    };

    const renderStatusBadgeByScore = (scoreVal) => {
        if (scoreVal === null || scoreVal === undefined || scoreVal === '') return null;
        const s = Number(scoreVal);
        if (s >= 80) return <span className="badge badge-status success">Đạt</span>;
        if (s >= 60) return <span className="badge badge-status warning">Đạt</span>;
        return <span className="badge badge-status danger">Không đạt</span>;
    };

    const renderAptechStatusBadge = (status) => {
        if (!status) return <span className="badge badge-status warning">ĐỢI DUYỆT</span>;
        if (status === 'PENDING') return <span className="badge badge-status warning">ĐỢI DUYỆT</span>;
        if (status === 'APPROVED') return <span className="badge badge-status success">ĐÃ DUYỆT</span>;
        if (status === 'REJECTED') return <span className="badge badge-status danger">TỪ CHỐI</span>;
        return <span className="badge badge-status secondary">{status}</span>;
    };

    const canUploadFinalCertificate = () => {
        if (!examHasProof) return false;
        const currentScore = exam?.score ?? score;
        if (currentScore === null || currentScore === undefined || currentScore === '') return false;
        return Number(currentScore) >= 80;
    };

    return (
        <MainLayout>
            <div className="page-teacher-aptech-exam-detail">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết Kỳ thi Aptech</h1>
                    </div>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        <i className="bi bi-list-ul me-2" />Danh sách kỳ thi
                    </button>
                </div>

                <div style={layoutStyles.page}>
                    <div className="detail-card-grid" style={{ ...layoutStyles.cardGrid, maxWidth: '1240px', margin: '0 auto', paddingLeft: '30px', paddingRight: '30px', boxSizing: 'border-box' }}>
                        {!exam ? (
                            <div className="detail-card text-center text-muted">
                                {loading ? 'Đang tải dữ liệu kỳ thi...' : 'Không tìm thấy kỳ thi'}
                            </div>
                        ) : (
                            <>
                                <section className="detail-card">
                                    <div className="detail-section-header">
                                        <h5><i className="bi bi-person-badge" /> Thông tin Giáo viên</h5>
                                    </div>
                                    <div className="detail-section-body">
                                        <div className="row gy-4">
                                            <div className="col-md-6">
                                                <div className="d-flex flex-column h-100">
                                                    <span className="text-uppercase text-muted small">Tên giảng viên</span>
                                                    <strong className="fs-5">{exam.teacherName || '—'}</strong>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex flex-column h-100">
                                                    <span className="text-uppercase text-muted small">Môn thi</span>
                                                    <span className="fs-5">{(exam.subjectCode ? `${exam.subjectCode} · ` : '') + (exam.subjectName || '—')}</span>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="d-flex flex-column h-100">
                                                    <span className="text-uppercase text-muted small mb-2">Điểm</span>
                                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                                        {exam && exam.aptechStatus !== 'PENDING' ? (
                                                            <>
                                                                {score !== null && score !== '' ? (
                                                                    <span className={`fs-3 fw-bold ${Number(score) >= 80 ? 'text-success' : Number(score) >= 60 ? 'text-warning' : 'text-danger'}`}>
                                                                        {score}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted">N/A</span>
                                                                )}
                                                            </>
                                                        ) : (() => {
                                                            const statusInfo = getScoreInputStatus();
                                                            if (statusInfo.status === 'expired') {
                                                                // Quá 24 giờ rồi - hiển thị "Vắng thi"
                                                                return (
                                                                    <span className="badge badge-status danger">Vắng thi</span>
                                                                );
                                                            } else {
                                                                // Còn trong 24 giờ - cho phép nhập
                                                                return (
                                                                    <>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control form-control-lg"
                                                                            style={{ maxWidth: '200px' }}
                                                                            min="0"
                                                                            max="100"
                                                                            value={score}
                                                                            onChange={handleScoreChange}
                                                                            onKeyDown={handleScoreKeyDown}
                                                                            placeholder="Nhập điểm (0-100)"
                                                                            disabled={statusInfo.status === 'notYet'}
                                                                        />
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            onClick={saveScore}
                                                                            disabled={statusInfo.status === 'notYet'}
                                                                            title={statusInfo.reason}
                                                                        >
                                                                            Lưu
                                                                        </button>
                                                                    </>
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3 col-sm-6">
                                                <div className="d-flex flex-column gap-2">
                                                    <span className="text-uppercase text-muted small">Kết quả</span>
                                                    <div>{renderStatusBadgeByScore(exam.score ?? score)}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6">
                                                <div className="d-flex flex-column gap-2">
                                                    <span className="text-uppercase text-muted small">Hiện trạng</span>
                                                    <div>{renderAptechStatusBadge(exam.aptechStatus)}</div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className={`h-100 border rounded-4 p-4 d-flex flex-column gap-3 ${examHasProof ? 'border-success bg-success-subtle' : 'border-secondary bg-light'}`}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                                                            <i className="bi bi-journal-richtext text-success fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <strong>Chứng nhận thi</strong>
                                                            <div className="text-muted small">Upload phiếu điểm để hệ thống đọc OCR</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {examHasProof ? (
                                                            <div className="text-success mb-2">Đã tải chứng nhận thi</div>
                                                        ) : (
                                                            <div className="text-muted mb-2">Chưa có chứng nhận thi</div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id="upload-exam-proof"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={handleExamProofUpload}
                                                        />
                                                        <button className="btn btn-outline-success" onClick={() => document.getElementById('upload-exam-proof').click()}>
                                                            {examHasProof ? 'Upload lại chứng nhận' : 'Upload chứng nhận'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className={`h-100 border rounded-4 p-4 d-flex flex-column gap-3 ${exam.certificateFileId ? 'border-primary bg-primary-subtle' : 'border-secondary bg-light'}`}>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                                                            <i className="bi bi-award text-primary fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <strong>Bằng Aptech</strong>
                                                            <div className="text-muted small">Yêu cầu &gt;= 80 điểm và có chứng nhận thi</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        {exam.certificateFileId ? (
                                                            <div className="text-primary">Đã tải lên bằng Aptech</div>
                                                        ) : (
                                                            <div className="text-muted">Chưa có bằng được nộp</div>
                                                        )}
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {canUploadFinalCertificate() ? (
                                                                <>
                                                                    <input
                                                                        type="file"
                                                                        id="upload-final-certificate"
                                                                        accept="image/*"
                                                                        style={{ display: 'none' }}
                                                                        onChange={handleFinalCertificateUpload}
                                                                    />
                                                                    <button className="btn btn-primary" onClick={() => document.getElementById('upload-final-certificate').click()}>
                                                                        Upload bằng
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-muted small">
                                                                    Cần chứng nhận thi và điểm &gt;= 80 để nộp bằng
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="detail-card">
                                    <div className="detail-section-header">
                                        <h5><i className="bi bi-sticky" /> Ghi chú</h5>
                                    </div>
                                    <div className="detail-section-body note-box">
                                        {exam.note && exam.note.trim() !== '' ? exam.note : 'Không có ghi chú.'}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {loading && <Loading />}

            {toast.show && (
                <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
            )}
        </MainLayout>
    );
};

export default AptechExamDetail;

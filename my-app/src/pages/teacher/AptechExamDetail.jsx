import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getExamById, updateExamScore, uploadCertificate } from '../../api/aptechExam';

const AptechExamDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    const [score, setScore] = useState("");

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

    const saveScore = async () => {
        try {
            // Prevent editing after approval/rejection
            if (exam && exam.aptechStatus && exam.aptechStatus !== 'PENDING') {
                showToast('Lỗi', 'Không thể sửa điểm sau khi phê duyệt hoặc từ chối', 'danger');
                return;
            }

            // Prevent saving score before exam started
            if (exam) {
                let date = exam.examDate || '';
                let time = exam.examTime || '00:00';
                if (date.includes('/')) {
                    const [d, m, y] = date.split('/');
                    date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
                const start = new Date(`${date}T${time}`);
                const now = new Date();
                if (start && !isNaN(start.getTime()) && now.getTime() < start.getTime()) {
                    showToast('Lỗi', 'Kỳ thi chưa bắt đầu', 'danger');
                    return;
                }
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

    const renderStatusBadgeByScore = (scoreVal) => {
        if (scoreVal === null || scoreVal === undefined || scoreVal === '') return null;
        const s = Number(scoreVal);
        if (s >= 80) return <span className="badge badge-status success">Đạt (Có thể cấp chứng nhận)</span>;
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

    return (
        <MainLayout>
            <div className="page-teacher-aptech-exam-detail page-align-with-form">
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

                <div className="detail-card-grid">
                    {!exam ? (
                        <div className="detail-card text-center text-muted">
                            {loading ? 'Đang tải dữ liệu kỳ thi...' : 'Không tìm thấy kỳ thi'}
                        </div>
                    ) : (
                        <>
                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-person-badge" /> Thông tin Giáo viên
                                    </h5>
                                </div>
                                <div className="detail-section-body">
                                    <div className="info-row">
                                        <span className="label">Tên giảng viên</span>
                                        <strong>{exam.teacherName || '—'}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Môn thi</span>
                                        <span>{(exam.subjectCode ? `${exam.subjectCode} - ` : '') + (exam.subjectName || '—')}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Điểm</span>
                                        <div className="value">
                                            {exam && exam.aptechStatus !== 'PENDING' ? (
                                                <>
                                                    {score !== null && score !== '' ? (
                                                        <span className={Number(score) >= 80 ? 'text-success fw-bold' : Number(score) >= 60 ? 'text-warning fw-bold' : 'text-danger fw-bold'}>
                                                            {score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        style={{ width: '200px', display: 'inline-block' }}
                                                        min="0"
                                                        max="100"
                                                        value={score}
                                                        onChange={handleScoreChange}
                                                        onKeyDown={handleScoreKeyDown}
                                                        placeholder="Nhập điểm (0-100)"
                                                    />
                                                    <button className="btn btn-sm btn-primary ms-2" onClick={saveScore}>Lưu</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Kết quả</span>
                                        <div>{renderStatusBadgeByScore(exam.score ?? score)}</div>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Hiện trạng</span>
                                        <div>{renderAptechStatusBadge(exam.aptechStatus)}</div>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Hình ảnh điểm</span>
                                        <div>
                                            <input
                                                type="file"
                                                id="upload-screenshot"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const f = e.target.files && e.target.files[0];
                                                    if (!f) return;
                                                    try {
                                                        setLoading(true);
                                                        await uploadCertificate(id, f);
                                                        showToast('Thành công', 'Đã tải ảnh lên', 'success');
                                                        await loadExamDetail();
                                                    } catch (err) {
                                                        showToast('Lỗi', 'Không thể tải ảnh lên', 'danger');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                            <button className="btn btn-sm btn-secondary" onClick={() => document.getElementById('upload-screenshot').click()}>
                                                Upload ảnh điểm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-sticky" /> Ghi chú
                                    </h5>
                                </div>
                                <div className="detail-section-body note-box">
                                    {exam.note && exam.note.trim() !== '' ? exam.note : 'Không có ghi chú.'}
                                </div>
                            </section>
                        </>
                    )}
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

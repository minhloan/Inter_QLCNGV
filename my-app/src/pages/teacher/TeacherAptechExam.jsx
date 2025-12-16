import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getTeacherAptechExams, viewCertificate } from '../../api/aptechExam';

const TeacherAptechExam = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [resultFilter, setResultFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [exams, resultFilter]);

    const loadExams = async () => {
        try {
            setLoading(true);
            const data = await getTeacherAptechExams();

            // sort exams newest -> oldest by examDate then examTime
            const toTimestamp = (exam) => {
                if (!exam) return 0;
                let date = exam.examDate || '';
                const time = (exam.examTime || '00:00').slice(0,5);
                if (!date) return 0;
                if (date.includes('/')) {
                    const [d, m, y] = date.split('/');
                    date = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
                }
                const dt = new Date(`${date}T${time}`);
                return isNaN(dt.getTime()) ? 0 : dt.getTime();
            };

            const sorted = (data || []).slice().sort((a, b) => {
                return toTimestamp(b) - toTimestamp(a);
            });

            setExams(sorted);
            setFilteredExams(sorted);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải danh sách kỳ thi', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...exams];

        if (resultFilter) {
            filtered = filtered.filter(exam => exam.result === resultFilter);
        }

        setFilteredExams(filtered);
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const getResultBadge = (exam) => {
        // If exam is rejected, always show "Không đạt"
        if (exam?.aptechStatus === 'REJECTED') return <span className={`badge badge-status danger`}>Không đạt</span>;
        
        const s = exam && (exam.score !== null && exam.score !== undefined) ? Number(exam.score) : null;
        if (s === null) return <span className={`badge badge-status warning`}>Chờ thi</span>;
        if (s >= 80) return <span className={`badge badge-status success`}>Đạt</span>;
        if (s >= 60) return <span className={`badge badge-status warning`}>Đạt</span>;
        return <span className={`badge badge-status danger`}>Không đạt</span>;
    };

    const parseExamStart = (exam) => {
        if (!exam) return null;
        let date = exam.examDate || '';
        const time = exam.examTime || '00:00';
        if (!date) return null;
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        const dt = new Date(`${date}T${time}`);
        return isNaN(dt.getTime()) ? null : dt;
    };

    const renderScoreCell = (exam) => {
        const start = parseExamStart(exam);
        const now = new Date();

        // If exam is rejected, display score as 0
        if (exam.aptechStatus === 'REJECTED') {
            return <span className="text-danger fw-bold">0</span>;
        }

        const score = exam.score;

        if (score !== null && score !== undefined) {
            const cls = score >= 80 ? 'text-success fw-bold' : score >= 60 ? 'text-warning fw-bold' : 'text-danger fw-bold';
            return <span className={cls}>{score}</span>;
        }

        // not yet scored
        if (start && now.getTime() < start.getTime()) {
            return <span className="text-warning fw-bold">Chờ thi</span>;
        }

        // more than 24 hours after start and still no score => Vắng thi
        if (start && now.getTime() > (start.getTime() + 24 * 60 * 60 * 1000)) {
            return <span className="text-danger fw-bold">Vắng thi</span>;
        }

        return 'N/A';
    };

    const totalPages = Math.ceil(filteredExams.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageExams = filteredExams.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải danh sách kỳ thi Aptech..." />;
    }

    return (
        <MainLayout>
            <div className="page-teacher-aptech-exam">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Kỳ thi Aptech</h1>
                    </div>

                    <div className="aptech-header-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/teacher/aptech-exam-add')}>
                            <i className="bi bi-plus-circle"></i>
                            <span>Đăng ký thi</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/teacher/aptech-exam-take')}>
                            <i className="bi bi-play-circle"></i>
                            <span>Tham gia thi</span>
                        </button>
                    </div>
                </div>

                <div className="filter-table-wrapper">
                    {/* Filter Section */}
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Kết quả</label>
                                <select
                                    className="filter-select"
                                    value={resultFilter}
                                    onChange={(e) => setResultFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PASS">Đạt</option>
                                    <option value="FAIL">Không đạt</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={async () => {
                                        setResultFilter('');
                                        // reload list from server to show recent changes
                                        await loadExams();
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Exams Table */}
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="25%">Môn thi</th>
                                    <th width="12%">Ngày thi</th>
                                    <th width="10%">Giờ thi</th>
                                    <th width="10%">Phòng</th>
                                    <th width="8%">Lần thi</th>
                                    <th width="8%">Điểm</th>
                                    <th width="10%">Kết quả</th>
                                    <th width="12%" className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageExams.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">
                                            <div className="empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>Không tìm thấy kỳ thi nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageExams.map((exam, index) => (
                                        <tr key={exam.id} className="fade-in">
                                            <td>{startIndex + index + 1}</td>
                                            <td>{(exam.subjectCode ? `${exam.subjectCode} - ` : '') + (exam.subjectName || 'N/A')}</td>
                                            <td>{exam.examDate || 'N/A'}</td>
                                            <td>{exam.examTime || 'N/A'}</td>
                                            <td>{exam.room || 'N/A'}</td>
                                            <td>{exam.attempt || 1}</td>
                                            <td>
                                                {renderScoreCell(exam)}
                                            </td>
                                            <td>{getResultBadge(exam)}</td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => navigate(`/teacher/aptech-exam-detail/${exam.id}`)}
                                                        title="Chi tiết"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                            return (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
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

export default TeacherAptechExam;

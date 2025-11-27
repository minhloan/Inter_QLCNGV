import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getMyTrials, downloadTrialReport } from '../../api/trial';

const TeacherTrialTeaching = () => {
    const navigate = useNavigate();
    const [trials, setTrials] = useState([]);
    const [filteredTrials, setFilteredTrials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadTrials();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [trials, statusFilter]);

    const loadTrials = async () => {
        try {
            setLoading(true);
            const response = await getMyTrials();
            setTrials(response || []);
            setFilteredTrials(response || []);
        } catch (error) {
            console.error('Error loading trials:', error);
            showToast('Lỗi', 'Không thể tải danh sách giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...trials];

        if (statusFilter) {
            filtered = filtered.filter(trial => trial.status === statusFilter);
        }

        setFilteredTrials(filtered);
        setCurrentPage(1);
    };

    const downloadReport = async (trialId) => {
        try {
            const trial = trials.find(t => t.id === trialId);
            // Tìm imageFileId từ evaluations
            const evaluationWithFile = trial?.evaluations?.find(evaluation => evaluation.imageFileId);
            if (!trial || !evaluationWithFile?.imageFileId) {
                showToast('Lỗi', 'Biên bản chưa có sẵn', 'warning');
                return;
            }

            const response = await downloadTrialReport(evaluationWithFile.imageFileId);
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trial_report_${trialId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Thành công', 'Tải biên bản thành công', 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
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
            REVIEWED: { label: 'Đã đánh giá', class: 'info' }
        };
        const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
        return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
    };

    const getConclusionBadge = (trial) => {
        // Check if needs review first
        if (trial?.needsReview) {
            return <span className="badge badge-status warning">CẦN ĐÁNH GIÁ LẠI</span>;
        }

        const conclusion = trial?.finalResult;
        if (!conclusion) return '-';

        const conclusionMap = {
            PASS: { label: 'ĐẠT', class: 'success' },
            FAIL: { label: 'KHÔNG ĐẠT', class: 'danger' }
        };
        const conclusionInfo = conclusionMap[conclusion] || { label: conclusion, class: 'secondary' };

        return (
            <div className="d-flex align-items-center gap-2">
                <span className={`badge badge-status ${conclusionInfo.class}`}>
                    {conclusionInfo.label}
                </span>
                {trial?.adminOverride && (
                    <i className="bi bi-shield-fill-check text-primary"
                        title="Admin đã ra quyết định cuối cùng"></i>
                )}
            </div>
        );
    };

    const renderScore = (trial) => {
        // Ưu tiên dùng averageScore từ backend (đã được tính chính xác)
        // Nếu không có thì mới tự tính từ evaluations
        let avgScore = null;
        
        if (trial.averageScore !== null && trial.averageScore !== undefined) {
            avgScore = trial.averageScore;
        } else if (trial.evaluations && trial.evaluations.length > 0) {
            // Fallback: tự tính nếu backend chưa có averageScore
            const totalScore = trial.evaluations.reduce((sum, evaluation) => sum + (evaluation.score || 0), 0);
            avgScore = Math.round(totalScore / trial.evaluations.length);
        }
        
        if (avgScore !== null) {
            return (
                <div className="d-flex align-items-center gap-2">
                    <span className={avgScore >= 70 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        {avgScore}
                    </span>
                    {trial.hasRedFlag && (
                        <i className="bi bi-exclamation-triangle-fill text-warning"
                            title="Có điểm đánh giá thấp đáng lo ngại"></i>
                    )}
                </div>
            );
        }
        return '-';
    };

    const totalPages = Math.ceil(filteredTrials.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageTrials = filteredTrials.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải danh sách giảng dạy..." />;
    }

    return (
        <MainLayout>
            <div className="page-teacher-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Đánh giá giảng dạy</h1>
                    </div>
                </div>

                <div className="filter-table-wrapper">
                    {/* Filter Section */}
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PENDING">Chờ đánh giá</option>
                                    <option value="REVIEWED">Đã đánh giá</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <button className="btn btn-secondary" onClick={() => setStatusFilter('')} style={{ width: '100%' }}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trials Table */}
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="25%">Môn học</th>
                                        <th width="12%">Ngày giảng dạy</th>
                                        <th width="10%">Địa điểm</th>
                                        <th width="8%">Điểm</th>
                                        <th width="10%">Trạng thái</th>
                                        <th width="10%">Kết luận</th>
                                        <th width="10%" className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageTrials.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                <div className="empty-state">
                                                    <i className="bi bi-inbox"></i>
                                                    <p>Không tìm thấy giảng dạy nào</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pageTrials.map((trial, index) => (
                                            <tr key={trial.id} className="fade-in">
                                                <td>{startIndex + index + 1}</td>
                                                <td>{trial.subjectName || 'N/A'}</td>
                                                <td>{trial.teachingDate || 'N/A'}</td>
                                                <td>{trial.location || 'N/A'}</td>
                                                <td>
                                                    {renderScore(trial)}
                                                </td>
                                                <td>{getStatusBadge(trial.status)}</td>
                                                <td>{getConclusionBadge(trial)}</td>
                                                <td className="text-center">
                                                    <div className="action-buttons">
                                                        {trial.status === 'REVIEWED' && trial.evaluations?.some(evaluation => evaluation.imageFileId) && (
                                                            <button
                                                                className="btn btn-sm btn-info btn-action"
                                                                onClick={() => downloadReport(trial.id)}
                                                                title="Xem biên bản"
                                                            >
                                                                <i className="bi bi-file-text"></i>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-primary btn-action"
                                                            onClick={() => navigate(`/teacher-trial-teaching-detail/${trial.id}`)}
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

export default TeacherTrialTeaching;


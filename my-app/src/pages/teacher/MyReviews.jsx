import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { getMyReviews, getEvaluationByAttendee } from '../../api/trial';

const MyReviews = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trials, setTrials] = useState([]);
    const [filteredTrials, setFilteredTrials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadTrials().then(r => loadTrials());
    }, []);

    useEffect(() => {
        applyFilters();
    }, [trials, statusFilter]);

    const loadTrials = async () => {
        try {
            setLoading(true);
            const response = await getMyReviews();
            const trialsWithEvaluation = await Promise.all(
                (response || []).map(async (trial) => {
                    // Find attendee for current user in this trial
                    const myAttendee = trial.attendees?.find(
                        attendee => attendee.attendeeUserId === user?.userId
                    );
                    
                    let evaluation = null;
                    if (myAttendee?.id) {
                        try {
                            evaluation = await getEvaluationByAttendee(myAttendee.id);
                        } catch (error) {
                            // Evaluation not found yet, that's okay
                        }
                    }
                    
                    return {
                        ...trial,
                        myAttendee,
                        evaluation,
                        hasEvaluated: !!evaluation
                    };
                })
            );
            setTrials(trialsWithEvaluation);
            setFilteredTrials(trialsWithEvaluation);
        } catch (error) {
            console.error('Error loading reviews:', error);
            showToast('Lỗi', 'Không thể tải danh sách giảng thử cần chấm', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...trials];

        if (statusFilter === 'evaluated') {
            filtered = filtered.filter(trial => trial.hasEvaluated);
        } else if (statusFilter === 'pending') {
            filtered = filtered.filter(trial => !trial.hasEvaluated);
        }

        setFilteredTrials(filtered);
        setCurrentPage(1);
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const handleEvaluate = (trial) => {
        navigate(`/teacher/trial-evaluation/${trial.id}`, {
            state: { 
                trial,
                attendeeId: trial.myAttendee?.id 
            }
        });
    };

    const handleViewEvaluation = (trial) => {
        navigate(`/teacher/trial-evaluation/${trial.id}`, {
            state: { 
                trial,
                attendeeId: trial.myAttendee?.id,
                evaluation: trial.evaluation,
                readOnly: true
            }
        });
    };

    const getStatusBadge = (trial) => {
        if (trial.hasEvaluated) {
            return <span className="badge bg-success">Đã chấm</span>;
        }
        return <span className="badge bg-warning">Chưa chấm</span>;
    };

    const getTrialStatusBadge = (status) => {
        const statusMap = {
            PENDING: { class: 'bg-secondary', text: 'Chờ chấm' },
            REVIEWED: { class: 'bg-info', text: 'Đang chấm' },
            PASSED: { class: 'bg-success', text: 'Đạt' },
            FAILED: { class: 'bg-danger', text: 'Không đạt' }
        };
        const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const totalPages = Math.ceil(filteredTrials.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentTrials = filteredTrials.slice(startIndex, endIndex);

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải danh sách giảng thử cần chấm..." />;
    }

    return (
        <MainLayout>
            <div className="page-teacher-my-reviews">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chấm giảng thử</h1>
                    </div>
                </div>

                <div className="filter-table-wrapper">
                    {/* Filter Section */}
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Lọc theo trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="pending">Chưa chấm</option>
                                    <option value="evaluated">Đã chấm</option>
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
                        {currentTrials.length === 0 ? (
                            <div className="empty-state">
                                <i className="bi bi-inbox"></i>
                                <p>Không có buổi giảng thử nào cần chấm</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Giáo viên</th>
                                                <th>Môn học</th>
                                                <th>Ngày giảng</th>
                                                <th>Vai trò</th>
                                                <th>Trạng thái chấm</th>
                                                <th>Trạng thái buổi giảng</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTrials.map((trial) => (
                                                <tr key={trial.id}>
                                                    <td>
                                                        <div>
                                                            <strong>{trial.teacherName}</strong>
                                                            {trial.teacherCode && (
                                                                <div className="text-muted small">
                                                                    {trial.teacherCode}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{trial.subjectName}</td>
                                                    <td>
                                                        {trial.teachingDate && (
                                                            <div>
                                                                {new Date(trial.teachingDate).toLocaleDateString('vi-VN')}
                                                                {trial.teachingTime && (
                                                                    <div className="text-muted small">
                                                                        {trial.teachingTime}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {trial.myAttendee?.attendeeRole && (
                                                            <span className="badge bg-primary">
                                                                {trial.myAttendee.attendeeRole === 'CHU_TOA' ? 'Chủ tọa' :
                                                                 trial.myAttendee.attendeeRole === 'THU_KY' ? 'Thư ký' :
                                                                 'Thành viên'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{getStatusBadge(trial)}</td>
                                                    <td>{getTrialStatusBadge(trial.status)}</td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => navigate(`/teacher-trial-teaching-detail/${trial.id}`, {
                                                                    state: { fromPage: 'my-reviews' }
                                                                })}
                                                                title="Xem chi tiết"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                            {trial.hasEvaluated ? (
                                                                <button
                                                                    className="btn btn-sm btn-info"
                                                                    onClick={() => handleViewEvaluation(trial)}
                                                                    title="Xem đánh giá"
                                                                >
                                                                    <i className="bi bi-clipboard-check me-1"></i>
                                                                    Xem đánh giá
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => handleEvaluate(trial)}
                                                                    title="Chấm điểm"
                                                                >
                                                                    <i className="bi bi-pencil me-1"></i>
                                                                    Chấm điểm
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
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
                            </>
                        )}
                    </div>
                </div>

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default MyReviews;


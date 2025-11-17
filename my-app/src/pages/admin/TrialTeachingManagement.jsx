import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllTrials } from '../../api/trial';

const TrialTeachingManagement = () => {
    const navigate = useNavigate();
    const [trials, setTrials] = useState([]);
    const [filteredTrials, setFilteredTrials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        const load = async () => {
            await loadTrials();
        };
        load();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [trials, searchTerm, statusFilter]);

    const loadTrials = async () => {
        try {
            setLoading(true);
            const data = await getAllTrials();
            setTrials(data || []);
            setFilteredTrials(data || []);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải danh sách giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...trials];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(trial =>
                trial?.teacherName?.toLowerCase().includes(term) ||
                trial?.teacherCode?.toLowerCase().includes(term) ||
                trial?.subjectName?.toLowerCase().includes(term)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(trial => trial?.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        setFilteredTrials(filtered);
        setCurrentPage(1);
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const formatDate = (localDate) => {
        if (!localDate) return 'N/A';
        const [year, month, day] = localDate.split('-'); // LocalDate format: YYYY-MM-DD
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : 'N/A';

    const getStatusBadge = (status) => {
        const map = {
            PENDING: { label: 'Chờ đánh giá', class: 'warning' },
            REVIEWED: { label: 'Đã đánh giá', class: 'success' },
        };
        const info = map[status] || { label: status, class: 'secondary' };
        return <span className={`badge badge-status ${info.class}`}>{info.label}</span>;
    };

    const totalPages = Math.ceil(filteredTrials.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageTrials = filteredTrials.slice(startIndex, startIndex + pageSize);

    if (loading) return <Loading fullscreen={true} message="Đang tải danh sách giảng thử..." />;

    return (
        <MainLayout>
            <div className="page-admin-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Giảng thử</h1>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/trial-teaching-add')}>
                        <i className="bi bi-plus-circle"></i> Thêm Lịch Giảng thử
                    </button>
                </div>

                <div className="filter-table-wrapper">
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Tìm kiếm</label>
                                <div className="search-input-group">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Tên giáo viên, mã giáo viên, môn học..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="pending">Chờ đánh giá</option>
                                    <option value="passed">Đạt</option>
                                    <option value="failed">Không đạt</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                                    style={{ width: '100%' }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã GV</th>
                                    <th>Tên Giáo viên</th>
                                    <th>Môn học</th>
                                    <th>Ngày giảng thử</th>
                                    <th>Giờ</th>
                                    <th>Điểm</th>
                                    <th>Kết luận</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageTrials.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            <div className="empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>Không tìm thấy giảng thử nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageTrials.map((trial, index) => (
                                        <tr key={trial.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{trial.teacherCode || 'N/A'}</td>
                                            <td>{trial.teacherName || 'N/A'}</td>
                                            <td>{trial.subjectName || 'N/A'}</td>
                                            <td>{formatDate(trial.teachingDate)}</td>
                                            <td>{formatTime(trial.teachingTime)}</td>
                                            <td>{trial.score != null ? (
                                                <span className={trial.score >= 7 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                        {trial.score}
                                                    </span>
                                            ) : 'N/A'}</td>
                                            <td>
                                                {trial.evaluation?.conclusion ? (
                                                    <span className={`badge ${trial.evaluation.conclusion === 'PASS' ? 'badge-success' : 'badge-danger'}`}>
                                                        {trial.evaluation.conclusion === 'PASS' ? 'Đạt' : 'Không đạt'}
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td>{getStatusBadge(trial.status)}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => navigate(`/trial-teaching-detail/${trial.id}`)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <nav className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                            return (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
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

export default TrialTeachingManagement;

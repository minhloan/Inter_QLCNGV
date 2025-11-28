import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllTrials, exportTrialStatistics } from '../../api/trial';

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

    // Export modal states
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilterType, setExportFilterType] = useState('all'); // all, dateRange, monthly, yearly
    const [exportFilters, setExportFilters] = useState({
        startDate: '',
        endDate: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [exporting, setExporting] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);

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

            // Sort by teachingDate descending (newest first)
            const sortedTrials = (data || []).sort((a, b) => {
                if (!a.teachingDate) return 1;
                if (!b.teachingDate) return -1;
                return b.teachingDate.localeCompare(a.teachingDate);
            });

            setTrials(sortedTrials);
            setFilteredTrials(sortedTrials);
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

        // Sort by teachingDate descending (newest first)
        filtered.sort((a, b) => {
            if (!a.teachingDate) return 1;
            if (!b.teachingDate) return -1;
            return b.teachingDate.localeCompare(a.teachingDate);
        });

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

    const handleExportStatistics = async () => {
        try {
            setExporting(true);
            let params = {};

            if (exportFilterType === 'dateRange') {
                if (!exportFilters.startDate || !exportFilters.endDate) {
                    showToast('Lỗi', 'Vui lòng chọn khoảng ngày', 'danger');
                    return;
                }
                params.startDate = exportFilters.startDate;
                params.endDate = exportFilters.endDate;
            } else if (exportFilterType === 'monthly') {
                params.year = exportFilters.year;
                params.month = exportFilters.month;
            } else if (exportFilterType === 'yearly') {
                params.year = exportFilters.year;
            }
            // exportFilterType === 'all' => no params

            const response = await exportTrialStatistics(params);

            // Create download link
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from Content-Disposition header
            let filename = 'BM06.42-Thong_ke_danh_gia_GV_giang_thu.xlsx';
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                // Match filename="value" or filename=value (handle quotes properly)
                const matches = /filename[^;=\n]*=(["']?)(.+?)\1(?:;|$)/i.exec(contentDisposition);
                if (matches && matches[2]) {
                    filename = matches[2];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast('Thành công', 'Xuất thống kê BM06.42 thành công', 'success');
            setShowExportModal(false);
        } catch (error) {
            console.error('Export error:', error);
            showToast('Lỗi', 'Không thể xuất thống kê', 'danger');
        } finally {
            setExporting(false);
        }
    };

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
                        <h1 className="page-title">Quản lý đánh giá giảng dạy</h1>
                    </div>
                    <div className="content-actions">
                        <div className="position-relative d-inline-block">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                                onBlur={() => setTimeout(() => setShowActionsDropdown(false), 200)}
                            >
                                <i className="bi bi-gear"></i> Tiện ích
                            </button>
                            {showActionsDropdown && (
                                <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000, minWidth: '220px' }}>
                                    <button className="dropdown-item" onClick={() => setShowExportModal(true)}>
                                        <i className="bi bi-file-earmark-excel me-2"></i> Xuất thống kê BM06.42
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-primary" onClick={() => navigate('/trial-teaching-add')}>
                            <i className="bi bi-plus-circle"></i> Thêm Lịch Giảng thử
                        </button>
                    </div>
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

            {/* Export Statistics Modal */}
            {showExportModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-file-earmark-excel text-success me-2"></i>
                                    Xuất thống kê BM06.42
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowExportModal(false)}
                                    disabled={exporting}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Lọc theo:</label>

                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFilter"
                                            id="filterAll"
                                            checked={exportFilterType === 'all'}
                                            onChange={() => setExportFilterType('all')}
                                        />
                                        <label className="form-check-label" htmlFor="filterAll">
                                            Tất cả (không lọc)
                                        </label>
                                    </div>

                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFilter"
                                            id="filterDateRange"
                                            checked={exportFilterType === 'dateRange'}
                                            onChange={() => setExportFilterType('dateRange')}
                                        />
                                        <label className="form-check-label" htmlFor="filterDateRange">
                                            Khoảng thời gian
                                        </label>
                                    </div>

                                    {exportFilterType === 'dateRange' && (
                                        <div className="ms-4 mb-3">
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <label className="form-label small">Từ ngày:</label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={exportFilters.startDate}
                                                        onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label small">Đến ngày:</label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={exportFilters.endDate}
                                                        onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFilter"
                                            id="filterMonthly"
                                            checked={exportFilterType === 'monthly'}
                                            onChange={() => setExportFilterType('monthly')}
                                        />
                                        <label className="form-check-label" htmlFor="filterMonthly">
                                            Theo tháng
                                        </label>
                                    </div>

                                    {exportFilterType === 'monthly' && (
                                        <div className="ms-4 mb-3">
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <label className="form-label small">Tháng:</label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={exportFilters.month}
                                                        onChange={(e) => setExportFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                                                    >
                                                        {[...Array(12)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label small">Năm:</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={exportFilters.year}
                                                        onChange={(e) => setExportFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                                        min="2000"
                                                        max="2100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="exportFilter"
                                            id="filterYearly"
                                            checked={exportFilterType === 'yearly'}
                                            onChange={() => setExportFilterType('yearly')}
                                        />
                                        <label className="form-check-label" htmlFor="filterYearly">
                                            Theo năm
                                        </label>
                                    </div>

                                    {exportFilterType === 'yearly' && (
                                        <div className="ms-4 mb-3">
                                            <label className="form-label small">Năm:</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                style={{ maxWidth: '150px' }}
                                                value={exportFilters.year}
                                                onChange={(e) => setExportFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                                min="2000"
                                                max="2100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowExportModal(false)}
                                    disabled={exporting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleExportStatistics}
                                    disabled={exporting}
                                >
                                    {exporting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang xuất...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-download me-2"></i>
                                            Xuất Excel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default TrialTeachingManagement;

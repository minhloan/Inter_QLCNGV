import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getUpcomingAptechExamSessions } from '../../api/aptechExam';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const AdminAptechSessionList = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [meta, setMeta] = useState({ totalPages: 0, totalElements: 0, hasNext: false });
    const [searchDraft, setSearchDraft] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    const showToast = (title, message, type = 'info') => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
    };

    const fetchSessions = async ({ nextPage = page, nextSize = pageSize, keyword = searchTerm } = {}) => {
        try {
            setLoading(true);
            const response = await getUpcomingAptechExamSessions({
                page: nextPage,
                size: nextSize,
                search: keyword?.trim() || undefined
            });

            // Sort sessions by examDate descending (newest first)
            const sortedSessions = (response?.items || []).sort((a, b) => {
                if (!a.examDate) return 1;
                if (!b.examDate) return -1;
                return b.examDate.localeCompare(a.examDate);
            });
            setSessions(sortedSessions);

            setMeta({
                totalPages: response?.totalPages ?? 0,
                totalElements: response?.totalElements ?? 0,
                hasNext: response?.hasNext ?? false
            });

            if (typeof response?.page === 'number') {
                setPage(response.page);
            } else {
                setPage(nextPage);
            }
            setPageSize(response?.size ?? nextSize);
        } catch (error) {
            console.error('Failed to load sessions', error);
            showToast('Lỗi', 'Không thể tải danh sách đợt thi Aptech', 'danger');
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    };

    useEffect(() => {
        fetchSessions({ nextPage: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const keyword = searchDraft.trim();
        setSearchTerm(keyword);
        setPage(0);
        fetchSessions({ nextPage: 0, keyword, nextSize: pageSize });
    };

    const handleReset = () => {
        setSearchDraft('');
        setSearchTerm('');
        setPage(0);
        fetchSessions({ nextPage: 0, keyword: '', nextSize: pageSize });
    };

    const handlePageChange = (direction) => {
        const targetPage = direction === 'next' ? page + 1 : page - 1;
        if (targetPage < 0 || (meta.totalPages > 0 && targetPage >= meta.totalPages)) return;
        setPage(targetPage);
        fetchSessions({ nextPage: targetPage });
    };

    const handlePageSizeChange = (event) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setPage(0);
        fetchSessions({ nextPage: 0, nextSize: newSize });
    };

    const formatDate = (value) => {
        if (!value) return '...';
        const parts = value.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
    };

    const formatTime = (value) => {
        if (!value) return '...';
        return value.length > 5 ? value.slice(0, 5) : value;
    };

    const totalCount = meta.totalElements ?? 0;
    const totalPages = meta.totalPages ?? 0;
    // Hàm kiểm tra phiên thi có trong quá khứ hay không
    const isSessionInPast = (session) => {
        if (!session.examDate || !session.examTime) return false;
        let date = session.examDate;
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        const time = session.examTime || '00:00';
        const sessionDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        return sessionDateTime.getTime() < now.getTime();
    };

    // Lọc phiên thi trong quá khứ
    const activeSessions = sessions.filter(session => !isSessionInPast(session));
    const pageNumbers = useMemo(() => {
        if (!totalPages) return [];
        return Array.from({ length: totalPages }, (_, index) => index);
    }, [totalPages]);

    const handleDirectPageChange = (targetPage) => {
        if (
            targetPage === page ||
            targetPage < 0 ||
            (totalPages > 0 && targetPage >= totalPages)
        ) {
            return;
        }
        fetchSessions({ nextPage: targetPage });
    };

    if (initializing) {
        return <Loading fullscreen={true} message="Đang tải danh sách đợt thi Aptech..." />;
    }

    return (
        <MainLayout>
            <div className="page-admin-subject">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Đợt thi Aptech sắp diễn ra</h1>
                    </div>
                    <div className="content-actions">
                        <button
                            type="button"
                            className="btn btn-outline-secondary me-2"
                            onClick={() => fetchSessions({ nextPage: page })}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Làm mới
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/admin/aptech-exam/add')}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Tạo đợt thi mới
                        </button>
                    </div>
                </div>
                <p className="page-subtitle subject-count">Đợt thi khả dụng: {activeSessions.length} / Tổng số: {totalCount}</p>

                {loading && !initializing && (
                    <Loading fullscreen={true} message="Đang tải danh sách đợt thi Aptech..." />
                )}

                <div className="filter-table-wrapper">
                    <div className="filter-section">
                        <form className="filter-row" onSubmit={handleSearchSubmit}>
                            <div className="filter-group" style={{ flex: 1 }}>
                                <label className="filter-label">Tìm kiếm đợt thi</label>
                                <div className="search-input-group">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Phòng thi, ghi chú..."
                                        value={searchDraft}
                                        onChange={(e) => setSearchDraft(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Số dòng/trang</label>
                                <select
                                    className="filter-select"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                >
                                    {PAGE_SIZE_OPTIONS.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">&nbsp;</label>
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    <i className="bi bi-filter-circle me-1"></i>
                                    Lọc
                                </button>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">&nbsp;</label>
                                <button
                                    type="button"
                                    className="btn btn-secondary w-100"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="table-container">
                        <div className="table-responsive mt-3 mt-md-0">
                            <table className="table table-hover table-bordered align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Ngày thi</th>
                                        <th>Giờ thi</th>
                                        <th>Phòng</th>
                                        <th>Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSessions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                Không có đợt thi nào phù hợp
                                            </td>
                                        </tr>
                                    ) : (
                                        activeSessions.map((session, index) => (
                                            <tr key={session.id}>
                                                <td>{page * pageSize + index + 1}</td>
                                                <td>{formatDate(session.examDate)}</td>
                                                <td>{formatTime(session.examTime)}</td>
                                                <td>{session.room || '-'}</td>
                                                <td>{session.note || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <nav className="mt-3 mb-2">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange('prev')}
                                            disabled={page === 0}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {pageNumbers.map((pageNumber) => (
                                        <li
                                            key={pageNumber}
                                            className={`page-item ${page === pageNumber ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handleDirectPageChange(pageNumber)}
                                            >
                                                {pageNumber + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange('next')}
                                            disabled={page >= totalPages - 1}
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

export default AdminAptechSessionList;


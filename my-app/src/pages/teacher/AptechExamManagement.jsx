import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

// 🔥 Import API mới đúng chuẩn Trial-style
import {
    getAllAptechExams,
    adminUpdateExamStatus,
    getAptechExamSessions,
    exportSummary,
    exportList,
    exportStats
} from '../../api/aptechExam.js';

const AptechExamManagement = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    const [sessionLoading, setSessionLoading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState(null);
    const [exportSessionId, setExportSessionId] = useState('');
    const [exportGeneratedBy, setExportGeneratedBy] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [exams, searchTerm, statusFilter]);

    useEffect(() => {
        if (!showExportMenu) return;
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu]);

    useEffect(() => {
        loadSessions();
        if (typeof window !== 'undefined') {
            const savedSignature = localStorage.getItem('aptechExportSignature');
            if (savedSignature) {
                setExportGeneratedBy(savedSignature);
            }
        }
    }, []);

    useEffect(() => {
        if (!exportSessionId && sessions.length > 0) {
            setExportSessionId(sessions[0].id);
        }
    }, [sessions, exportSessionId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Gọi API mới
            const examsData = await getAllAptechExams();

            setExams(examsData);
            setFilteredExams(examsData);

        } catch (error) {
            showToast('Lỗi', 'Không thể tải dữ liệu', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
    };

    const loadSessions = async () => {
        try {
            setSessionLoading(true);
            const data = await getAptechExamSessions();
            setSessions(data || []);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải danh sách đợt thi Aptech', 'danger');
        } finally {
            setSessionLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...exams];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(exam =>
                (exam.teacherName && exam.teacherName.toLowerCase().includes(term)) ||
                (exam.teacherCode && exam.teacherCode.toLowerCase().includes(term)) ||
                (exam.subjectName && exam.subjectName.toLowerCase().includes(term)) ||
                (exam.subjectCode && exam.subjectCode.toLowerCase().includes(term))
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(exam => exam.result === statusFilter);
        }

        setFilteredExams(filtered);
        setCurrentPage(1);
    };

    const getStatusBadge = (exam) => {
        const s = exam && (exam.score !== null && exam.score !== undefined) ? Number(exam.score) : null;
        if (s === null) return <span className={`badge badge-status warning`}>Chờ thi</span>;
        if (s >= 80) return <span className={`badge badge-status success`}>Đạt</span>;
        if (s >= 60) return <span className={`badge badge-status warning`}>Đạt</span>;
        return <span className={`badge badge-status danger`}>Không đạt</span>;
    };

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (type, params = {}) => {
        try {
            let resp;
            if (type === 'summary') resp = await exportSummary(params);
            if (type === 'list') resp = await exportList(params);
            if (type === 'stats') resp = await exportStats(params);

            if (resp && resp.data) {
                // Try to use filename from header, fallback to default
                const cd = resp.headers['content-disposition'] || resp.headers['Content-Disposition'] || '';
                let filename = 'export.docx';
                const match = cd.match(/filename=([^;\n\r]+)/);
                if (match) filename = match[1].replace(/"/g, '');
                const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                downloadBlob(blob, filename);
                showToast('Thành công', 'Đã xuất dữ liệu', 'success');
            } else {
                showToast('Lỗi', 'Không thể xuất dữ liệu', 'danger');
                return false;
            }
            return true;
        } catch (err) {
            const serverMessage = err?.response?.data;
            if (typeof serverMessage === 'string' && serverMessage.trim()) {
                showToast('Lỗi', serverMessage.trim(), 'danger');
            } else {
                showToast('Lỗi', 'Không thể xuất dữ liệu', 'danger');
            }
            return false;
        } finally {
            setShowExportMenu(false);
        }
    };

    const openExportModal = (type) => {
        setExportType(type);
        setShowExportModal(true);
        setShowExportMenu(false);
        if (!exportSessionId && sessions.length > 0) {
            setExportSessionId(sessions[0].id);
        }
    };

    const closeExportModal = () => {
        setShowExportModal(false);
        setExportType(null);
    };

    const requireSession = exportType === 'summary' || exportType === 'list';
    const requireSignature = exportType === 'summary' || exportType === 'list';

    const submitExport = async () => {
        if (!exportType) return;
        if (requireSession && sessions.length > 0 && !exportSessionId) {
            showToast('Thiếu thông tin', 'Vui lòng chọn đợt thi cần xuất', 'warning');
            return;
        }
        if (requireSignature && !exportGeneratedBy.trim()) {
            showToast('Thiếu thông tin', 'Vui lòng nhập tên người lập biểu', 'warning');
            return;
        }
        if (requireSession) {
            if (sessions.length === 0) {
                showToast('Thiếu dữ liệu', 'Chưa có đợt thi Aptech để xuất biểu', 'warning');
                return;
            }
            const selectedSession = sessions.find(session => session.id === exportSessionId);
            if (!selectedSession) {
                showToast('Thông tin không hợp lệ', 'Đợt thi đã bị xóa hoặc không tồn tại', 'warning');
                return;
            }
        }
        setExporting(true);
        const success = await handleExport(exportType, {
            sessionId: exportSessionId,
            generatedBy: exportGeneratedBy.trim()
        });
        setExporting(false);
        if (success) {
            if (requireSignature && typeof window !== 'undefined') {
                localStorage.setItem('aptechExportSignature', exportGeneratedBy.trim());
            }
            closeExportModal();
        }
    };

    const totalPages = Math.ceil(filteredExams.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageExams = filteredExams.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải danh sách kỳ thi Aptech..." />;
    }

    return (
        <MainLayout>
            <div className="page-admin-aptech-exam">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Kỳ thi Aptech</h1>
                    </div>
                    <div className="aptech-admin-header-actions" ref={exportMenuRef}>
                        <button
                            type="button"
                            className="btn btn-primary me-2"
                            onClick={() => navigate('/admin/aptech-exam-add')}
                        >
                            <i className="bi bi-plus-circle"></i>
                            <span>Thêm phiên thi</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setShowExportMenu(prev => !prev)}
                        >
                            <i className="bi bi-file-earmark-arrow-down"></i>
                            <span>Xuất dữ liệu kỳ thi</span>
                            <i className={`bi ms-2 ${showExportMenu ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                        {showExportMenu && (
                            <div className="export-menu" role="menu">
                                <button type="button" className="export-menu-item" onClick={() => openExportModal('summary')}>
                                    <strong>Tổng hợp kết quả thi GV Aptech</strong>
                                </button>
                                <button type="button" className="export-menu-item" onClick={() => openExportModal('list')}>
                                    <strong>Danh sách thi chứng nhận Aptech</strong>
                                </button>
                                <button type="button" className="export-menu-item" onClick={() => openExportModal('stats')}>
                                    <strong>Thống kê giáo viên thi chứng nhận Aptech</strong>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter */}
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
                                    <option value="PASS">Đạt</option>
                                    <option value="FAIL">Không đạt</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={async () => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        // Reload latest data from server
                                        await loadData();
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Reset
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã GV</th>
                                    <th>Tên Giáo viên</th>
                                    <th>Môn thi</th>
                                    <th>Ngày thi</th>
                                    <th>Giờ thi</th>
                                    <th>Điểm</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Thao tác</th>
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
                                        <tr key={exam.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{exam.teacherCode}</td>
                                            <td>{exam.teacherName}</td>
                                            <td>{(exam.subjectCode ? `${exam.subjectCode} - ` : '') + (exam.subjectName || '')}</td>
                                            <td>{exam.examDate}</td>
                                            <td>{exam.examTime}</td>

                                            <td>
                                                {exam.score != null ? (
                                                    <span className={exam.score >= 80 ? "text-success fw-bold" : exam.score >= 60 ? "text-warning fw-bold" : "text-danger fw-bold"}>
                                                            {exam.score}
                                                        </span>
                                                ) : "N/A"}
                                            </td>

                                            <td>{getStatusBadge(exam)}</td>

                                            <td className="text-center">

                                                {/* Approve / Reject badges: only visible khi đã upload file và đang chờ duyệt */}
                                                {exam.certificateFileId && exam.aptechStatus === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success me-1"
                                                            title="Duyệt chứng chỉ"
                                                            onClick={async () => {
                                                                try {
                                                                    await adminUpdateExamStatus(exam.id, 'APPROVED');
                                                                    showToast('Thành công', 'Đã phê duyệt chứng chỉ', 'success');
                                                                    // update local state
                                                                    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, aptechStatus: 'APPROVED' } : e));
                                                                } catch (err) {
                                                                    showToast('Lỗi', 'Không thể phê duyệt', 'danger');
                                                                }
                                                            }}
                                                        >
                                                            <i className="bi bi-check-lg"></i>
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            title="Từ chối chứng chỉ"
                                                            onClick={async () => {
                                                                try {
                                                                    await adminUpdateExamStatus(exam.id, 'REJECTED');
                                                                    showToast('Thành công', 'Đã từ chối chứng chỉ', 'success');
                                                                    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, aptechStatus: 'REJECTED' } : e));
                                                                } catch (err) {
                                                                    showToast('Lỗi', 'Không thể từ chối', 'danger');
                                                                }
                                                            }}
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>

                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>

                                </ul>
                            </nav>
                        )}
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

            </div>

            {showExportModal && (
                <div className="export-config-overlay">
                    <div className="export-config-modal">
                        <h3>Cấu hình xuất file</h3>
                        <p className="text-muted mb-3">
                            {exportType === 'summary' && 'BM06.36 - Tổng hợp kết quả thi giáo viên Aptech.'}
                            {exportType === 'list' && 'BM06.35 - Danh sách thi chứng nhận Aptech.'}
                            {exportType === 'stats' && 'Xuất thống kê điểm thi giáo viên Aptech.'}
                        </p>

                        {requireSession && (
                            <div className="form-group">
                                <label>Đợt thi Aptech</label>
                                <select
                                    className="filter-select"
                                    value={exportSessionId}
                                    onChange={(e) => setExportSessionId(e.target.value)}
                                    disabled={sessionLoading}
                                >
                                    {sessions.length === 0 ? (
                                        <option value="" disabled>Chưa có đợt thi khả dụng</option>
                                    ) : (
                                        sessions.map(session => (
                                            <option key={session.id} value={session.id}>
                                                {(session.examDate || 'Chưa rõ ngày')} | {(session.examTime || '...')} | {(session.room || '...')}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {sessionLoading && <small className="text-muted">Đang tải danh sách đợt thi...</small>}
                            </div>
                        )}

                        {requireSignature && (
                            <div className="form-group">
                                <label>Người lập biểu</label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    placeholder="Nhập tên hiển thị chữ ký"
                                    value={exportGeneratedBy}
                                    onChange={(e) => setExportGeneratedBy(e.target.value)}
                                />
                            </div>
                        )}

                        {exportType === 'stats' && (
                            <div className="form-group">
                                <label>Tùy chọn</label>
                                <p className="mb-0 text-muted">Báo cáo thống kê sử dụng toàn bộ dữ liệu, không cần cấu hình thêm.</p>
                            </div>
                        )}

                        <div className="export-config-actions">
                            <button type="button" className="btn btn-light" onClick={closeExportModal} disabled={exporting}>
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={submitExport}
                                disabled={exporting}
                            >
                                {exporting ? 'Đang xuất...' : 'Xuất file'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default AptechExamManagement;

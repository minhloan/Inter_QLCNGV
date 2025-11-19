import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

// 🔥 Import API mới đúng chuẩn Trial-style
import { getAllAptechExams, adminUpdateExamStatus } from '../../api/aptechExam.js';

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

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [exams, searchTerm, statusFilter]);

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

    const applyFilters = () => {
        let filtered = [...exams];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(exam =>
                (exam.teacherName && exam.teacherName.toLowerCase().includes(term)) ||
                (exam.teacherCode && exam.teacherCode.toLowerCase().includes(term)) ||
                (exam.subjectName && exam.subjectName.toLowerCase().includes(term))
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(exam => exam.result === statusFilter);
        }

        setFilteredExams(filtered);
        setCurrentPage(1);
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
    };

    const getStatusBadge = (result) => {
        const map = {
            PASS: { label: "Đạt", class: "success" },
            FAIL: { label: "Không đạt", class: "danger" },
            null: { label: "Chờ thi", class: "warning" }
        };

        const status = map[result] || { label: "Chờ thi", class: "warning" };
        return <span className={`badge badge-status ${status.class}`}>{status.label}</span>;
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
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
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
                                            <td>{exam.subjectName}</td>
                                            <td>{exam.examDate}</td>
                                            <td>{exam.examTime}</td>

                                            <td>
                                                {exam.score != null ? (
                                                    <span className={exam.score >= 80 ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                            {exam.score}
                                                        </span>
                                                ) : "N/A"}
                                            </td>

                                            <td>{getStatusBadge(exam.result)}</td>

                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-info me-2"
                                                    onClick={() => navigate(`/aptech-exam-detail/${exam.id}`)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {/* Approve / Reject badges: only visible when score >= 80 and awaiting approval */}
                                                {exam.score != null && exam.score >= 80 && exam.aptechStatus === 'PENDING' ? (
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
        </MainLayout>
    );
};

export default AptechExamManagement;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllRegistrationsForAdmin, updateRegistrationStatus } from '../../api/adminSubjectRegistrationApi';

const SubjectRegistrationManagement = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
    });

    useEffect(() => {
        loadRegistrations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [registrations, searchTerm, statusFilter, subjectFilter]);

    // 🔥 Lấy danh sách đăng ký từ backend
    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const rows = await getAllRegistrationsForAdmin();
            const normalized = (rows || []).map((reg) => ({
                id: reg.id,
                teacher_code: reg.teacherCode || 'N/A',
                teacher_name: reg.teacherName || 'N/A',
                subject_id: reg.subjectId || null,
                subject_name: reg.subjectName || 'N/A',
                quarter: reg.quarter ?? null,
                registration_date: reg.registrationDate || 'N/A',
                status: (reg.status || '').toLowerCase(),
                notes: reg.notes || '',
            }));
            setRegistrations(normalized);
            setFilteredRegistrations(normalized);
            setCurrentPage(1);
        } catch (error) {
            console.error('Lỗi load đăng ký:', error.response ? error.response.data : error.message);
            showToast('Lỗi', 'Không thể tải danh sách đăng ký', 'danger');
        } finally {
            setLoading(false);
        }
    };


    const applyFilters = () => {
        let filtered = [...registrations];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (reg) =>
                    (reg.teacher_name && reg.teacher_name.toLowerCase().includes(term)) ||
                    (reg.teacher_code && reg.teacher_code.toLowerCase().includes(term)) ||
                    (reg.subject_name && reg.subject_name.toLowerCase().includes(term))
            );
        }
        if (statusFilter) {
            filtered = filtered.filter((reg) => reg.status === statusFilter);
        }
        if (subjectFilter) {
            filtered = filtered.filter((reg) => reg.subject_id === parseInt(subjectFilter, 10));
        }
        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

    // 🔥 Duyệt / từ chối đăng ký – gọi backend + cập nhật state
    const handleStatusChange = async (registrationId, newStatus) => {
        try {
            setLoading(true);
            // Gửi 'APPROVED'/'REJECTED' lên backend
            await updateRegistrationStatus(registrationId, newStatus.toUpperCase());
            // Cập nhật lại local state
            setRegistrations((prev) =>
                prev.map((reg) => (reg.id === registrationId ? { ...reg, status: newStatus } : reg))
            );
            showToast('Thành công', 'Cập nhật trạng thái thành công', 'success');
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ duyệt', class: 'warning' },
            approved: { label: 'Đã duyệt', class: 'success' },
            rejected: { label: 'Từ chối', class: 'danger' },
        };
        const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
        return (
            <span className={`badge badge-status ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
        );
    };

    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageRegistrations = filteredRegistrations.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải danh sách đăng ký môn học..." />;
    }

    return (
        <MainLayout>
            <div className="page-admin-subject-registration">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Đăng ký Môn học</h1>
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
                                        placeholder="Tên giáo viên, mã giáo viên, tên môn..."
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
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="rejected">Từ chối</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        setSubjectFilter('');
                                    }}
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
                                    <th width="5%">#</th>
                                    <th width="10%">Mã GV</th>
                                    <th width="15%">Tên Giáo viên</th>
                                    <th width="20%">Tên Môn học</th>
                                    <th width="10%">Quý</th>
                                    <th width="12%">Ngày đăng ký</th>
                                    <th width="10%">Trạng thái</th>
                                    <th width="13%" className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            <div className="empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>Không tìm thấy đăng ký nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageRegistrations.map((reg, index) => (
                                        <tr key={reg.id} className="fade-in">
                                            <td>{startIndex + index + 1}</td>
                                            <td><span className="teacher-code">{reg.teacher_code}</span></td>
                                            <td>{reg.teacher_name}</td>
                                            <td>{reg.subject_name}</td>
                                            <td>{reg.quarter ? ` ${reg.quarter}` : "N/A"}</td>
                                            <td>{reg.registration_date}</td>
                                            <td>{getStatusBadge(reg.status)}</td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-success btn-action"
                                                                onClick={() => handleStatusChange(reg.id, 'approved')}
                                                                title="Duyệt"
                                                            >
                                                                <i className="bi bi-check-circle"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger btn-action"
                                                                onClick={() => handleStatusChange(reg.id, 'rejected')}
                                                                title="Từ chối"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-info btn-action"
                                                        onClick={() => navigate(`/subject-registration-detail/${reg.id}`)}
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
                                        <button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
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
                                        <button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>

                {toast.show && (
                    <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
                )}
            </div>
        </MainLayout>
    );
};

export default SubjectRegistrationManagement;

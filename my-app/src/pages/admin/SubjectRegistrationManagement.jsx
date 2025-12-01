import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import {
    exportRegistrationsExcel,
    getAllRegistrationsForAdmin,
    importRegistrationsExcel,
    updateRegistrationStatus,
    exportPlanExcel,
    importPlanExcel,
} from '../../api/adminSubjectRegistrationApi';
import { searchUsersByTeaching } from '../../api/user';
import ExportImportModal from '../../components/Teacher/ExportImportModal';

const SubjectRegistrationManagement = () => {
    const navigate = useNavigate();

    // --- STATES ---
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [loading, setLoading] = useState(false);

    // Plan modal states
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planTeacherId, setPlanTeacherId] = useState("");
    const [planTeacherName, setPlanTeacherName] = useState("");
    const [planImportResult, setPlanImportResult] = useState(null);
    const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
    const [foundTeachers, setFoundTeachers] = useState([]);
    const [planYear, setPlanYear] = useState(new Date().getFullYear());
    const [exportAllTeachers, setExportAllTeachers] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
    });

    // --- EFFECTS ---
    useEffect(() => {
        loadRegistrations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [registrations, searchTerm, statusFilter, subjectFilter]);

    useEffect(() => {
        if (showPlanModal) {
            fetchTeachers();
        }
    }, [showPlanModal]);

    // --- HELPER FUNCTIONS ---

    const fetchTeachers = async (keyword = "") => {
        try {
            const users = await searchUsersByTeaching(keyword);
            setFoundTeachers(users);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const [datePart] = dateStr.split(/[T ]/);
        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    };

    const formatDeadline = (year, quarter) => {
        if (!year || !quarter) return 'N/A';
        const mapMonth = {
            QUY1: '03',
            QUY2: '06',
            QUY3: '09',
            QUY4: '12',
        };
        const month = mapMonth[quarter] || '';
        if (!month) return `${quarter}-${year}`;
        return `${month}-${year}`;
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    // --- DATA LOADING & ACTIONS ---

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const data = await getAllRegistrationsForAdmin();
            const normalized = data.map((reg) => ({
                id: reg.id,
                teacher_code: reg.teacherCode,
                teacher_name: reg.teacherName,
                teacher_id: reg.teacherId,
                subject_id: reg.subjectId,
                subject_name: reg.subjectName,
                subject_code: reg.subjectCode,
                system_name: reg.systemName || 'N/A',
                semester: reg.semester || null,
                year: reg.year ?? null,
                quarter: reg.quarter ?? null,
                registration_date: formatDate(reg.registrationDate),
                status: (reg.status || '').toLowerCase(),
                notes: reg.notes || '',
            }));
            setRegistrations(normalized);
            setFilteredRegistrations(normalized);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                'Lỗi load đăng ký:',
                error.response ? error.response.data : error.message
            );
            showToast('Lỗi', 'Không thể tải danh sách đăng ký', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const formatSemester = (sem) => {
        if (!sem) return "";
        const map = {
            "SEMESTER_1": "Kỳ 1",
            "SEMESTER_2": "Kỳ 2",
            "SEMESTER_3": "Kỳ 3",
            "SEMESTER_4": "Kỳ 4",
        };
        return map[sem] || sem;
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
            filtered = filtered.filter(
                (reg) => (reg.status || '').toLowerCase() === statusFilter
            );
        }

        if (subjectFilter) {
            filtered = filtered.filter(
                (reg) => reg.subject_id === parseInt(subjectFilter, 10)
            );
        }

        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

    const handleStatusChange = async (registrationId, newStatus) => {
        try {
            setLoading(true);
            await updateRegistrationStatus(registrationId, newStatus);
            const normalized = newStatus.toLowerCase();
            setRegistrations((prev) =>
                prev.map((reg) =>
                    reg.id === registrationId ? { ...reg, status: normalized } : reg
                )
            );
            showToast('Thành công', 'Cập nhật trạng thái thành công', 'success');
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const key = (status || "").toLowerCase();
        const statusMap = {
            registered: { label: "Đang chờ duyệt", class: "info" },
            completed: { label: "Đã duyệt", class: "success" },
            not_completed: { label: "Từ chối", class: "secondary" },
            carryover: { label: "Dời môn", class: "warning" },
        };
        const info = statusMap[key] || {
            label: status || "Không rõ",
            class: "secondary",
        };
        return (
            <span className={`badge badge-status ${info.class}`}>
                {info.label}
            </span>
        );
    };

    // --- PAGINATION CALCS ---
    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageRegistrations = filteredRegistrations.slice(
        startIndex,
        startIndex + pageSize
    );

    // --- RENDER ---

    if (loading && !showPlanModal) {
        return (
            <Loading
                fullscreen={true}
                message="Đang tải danh sách đăng ký môn học..."
            />
        );
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

                    <button
                        onClick={() => setShowPlanModal(true)}
                        className="btn btn-info btn-export-import"
                        style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            border: 'none',
                            fontWeight: '500'
                        }}
                    >
                        <i className="bi bi-calendar-check"></i>
                        <span className="d-none d-sm-inline ms-2">Kế hoạch chuyên môn</span>
                    </button>

                    <ExportImportModal
                        isOpen={showPlanModal}
                        onClose={() => setShowPlanModal(false)}
                        title="Kế hoạch chuyên môn"
                        icon="bi-calendar-check"
                        headerStyle={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)', color: 'white' }}
                        exportTitle="Xuất kế hoạch chuyên môn"
                        exportDescription={exportAllTeachers ? `Xuất kế hoạch của TẤT CẢ giáo viên trong năm ${planYear}.` : `Xuất kế hoạch của giáo viên đã chọn trong năm ${planYear}.`}
                        importTitle="Nhập kế hoạch chuyên môn"
                        importDescription="Upload file Excel để import kế hoạch cho giáo viên đã chọn."
                        importTopChildren={
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Chọn giáo viên <span className="text-danger">*</span>
                                </label>

                                {/* Search Input */}
                                <div className="custom-search-box">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="form-control search-input"
                                        placeholder="Tìm kiếm giáo viên (Tên hoặc Mã)..."
                                        value={teacherSearchTerm}
                                        onChange={(e) => {
                                            setTeacherSearchTerm(e.target.value);
                                            fetchTeachers(e.target.value);
                                        }}
                                    />
                                </div>

                                {/* ONLY SHOW LIST WHEN TYPING */}
                                {teacherSearchTerm.trim().length > 0 && (
                                    <div className="teacher-list">
                                        {foundTeachers.length === 0 ? (
                                            <div className="empty-teacher">Không tìm thấy giáo viên</div>
                                        ) : (
                                            foundTeachers.map((t) => (
                                                <div
                                                    key={t.id}
                                                    className={`teacher-item ${planTeacherId === t.id ? "active" : ""}`}
                                                    onClick={() => {
                                                        setPlanTeacherId(t.id);
                                                        setPlanTeacherName(`${t.teacherCode} - ${t.username}`);
                                                        setTeacherSearchTerm("");  // ẩn list sau khi chọn
                                                        setFoundTeachers([]);      // clear list
                                                    }}
                                                >
                                                    <span className="teacher-code">{t.teacherCode}</span>
                                                    <span className="teacher-name">{t.username}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Show selected teacher */}
                                {planTeacherName && teacherSearchTerm === "" && (
                                    <div className="alert alert-info mt-2 py-2">
                                        <i className="bi bi-person-check me-2"></i>
                                        Đã chọn: <strong>{planTeacherName}</strong>
                                    </div>
                                )}
                            </div>


                        }
                        onExport={async () => {
                            if (!planTeacherId && !exportAllTeachers) {
                                showToast('Thiếu thông tin', 'Vui lòng chọn giáo viên hoặc chọn xuất tất cả', 'warning');
                                return;
                            }
                            try {
                                const teacherIdToExport = exportAllTeachers ? null : planTeacherId;
                                await exportPlanExcel(teacherIdToExport, planYear);
                                showToast('Thành công', 'Đang tải file xuống...', 'success');
                            } catch (err) {
                                showToast('Lỗi', err.message, 'danger');
                            }
                        }}
                        onImport={async (file) => {
                            if (!planTeacherId) {
                                showToast('Thiếu thông tin', 'Vui lòng chọn giáo viên', 'warning');
                                return;
                            }
                            setLoading(true);
                            try {
                                const result = await importPlanExcel(planTeacherId, file);
                                setPlanImportResult(result);
                                showToast('Import hoàn tất', `Thành công: ${result.successCount}, lỗi: ${result.errorCount}`, 'success');
                                await loadRegistrations();
                            } catch (err) {
                                showToast('Lỗi import', err.response?.data?.message || err.message, 'danger');
                            }
                            setLoading(false);
                        }}
                        exporting={loading}
                        importing={loading}
                        importChildren={
                            <>
                                {exportAllTeachers && (
                                    <div className="alert alert-warning small mb-3">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Chức năng Import chưa hỗ trợ import hàng loạt. Vui lòng chọn từng giáo viên để import.
                                    </div>
                                )}

                                {planImportResult && planImportResult.errorCount > 0 && (
                                    <div className="alert alert-warning mt-3 mb-0">
                                        <strong>Kết quả import:</strong>
                                        <div className="small">Thành công: {planImportResult.successCount}</div>
                                        <div className="small">Lỗi: {planImportResult.errorCount}</div>
                                        {planImportResult.errors && planImportResult.errors.length > 0 && (
                                            <ul
                                                className="mt-2 mb-0 ps-3 small"
                                                style={{ maxHeight: 150, overflowY: 'auto' }}
                                            >
                                                {planImportResult.errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </>
                        }

                    >
                        {/* Export Tab Content (Children) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Năm kế hoạch</label>
                            <input
                                type="number"
                                className="form-control"
                                value={planYear}
                                onChange={(e) => setPlanYear(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="exportAllTeachers"
                                    checked={exportAllTeachers}
                                    onChange={(e) => {
                                        setExportAllTeachers(e.target.checked);
                                        if (e.target.checked) {
                                            setPlanTeacherId("");
                                            setPlanTeacherName("");
                                        }
                                    }}
                                />
                                <label className="form-check-label fw-bold" htmlFor="exportAllTeachers">
                                    Xuất kế hoạch cho TẤT CẢ giáo viên
                                </label>
                            </div>
                            <div className="form-text text-muted">
                                Nếu chọn, sẽ xuất ra 1 file Excel với mỗi giáo viên là 1 sheet.
                            </div>
                        </div>

                        {!exportAllTeachers && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Chọn giáo viên <span className="text-danger">*</span>
                                </label>

                                {/* Search Input */}
                                <div className="input-group mb-2">
                                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm giáo viên (Tên hoặc Mã)..."
                                        value={teacherSearchTerm}
                                        onChange={(e) => {
                                            const keyword = e.target.value;
                                            setTeacherSearchTerm(keyword);
                                            fetchTeachers(keyword);
                                        }}
                                    />
                                </div>

                                {/* SELECT — chỉ hiện danh sách khi có từ khóa tìm kiếm */}
                                <select
                                    className="form-select"
                                    value={planTeacherId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selected = foundTeachers.find((t) => t.id === selectedId);
                                        setPlanTeacherId(selectedId);
                                        setPlanTeacherName(selected ? `${selected.teacherCode} - ${selected.username}` : "");
                                    }}
                                >
                                    {/* Khi CHƯA gõ từ khóa → hiển thị placeholder */}
                                    {teacherSearchTerm.trim() === "" && (
                                        <option value="">-- Chọn giáo viên --</option>
                                    )}

                                    {/* Khi ĐÃ GÕ → chỉ hiển thị kết quả filter, KHÔNG hiển thị placeholder */}
                                    {teacherSearchTerm.trim() !== "" &&
                                        foundTeachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.teacherCode} - {t.username}
                                            </option>
                                        ))
                                    }
                                </select>


                                <div className="form-text text-muted">
                                    {teacherSearchTerm.trim().length > 0
                                        ? `${foundTeachers.length} giáo viên được tìm thấy.`
                                        : "Nhập từ khóa để tìm giáo viên."}
                                </div>
                            </div>
                        )}

                        {!exportAllTeachers && planTeacherName && (
                            <div className="alert alert-info mt-2 py-2">
                                <i className="bi bi-person-check me-2"></i>
                                Đã chọn: <strong>{planTeacherName}</strong>
                            </div>
                        )}


                    </ExportImportModal>
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
                                    <option value="registered">Chờ duyệt</option>
                                    <option value="completed">Đã duyệt</option>
                                    <option value="not_completed">Từ chối</option>
                                    <option value="carryover">Dời môn</option>
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
                                    <th width="18%">Tên Môn học</th>
                                    <th width="12%">Chương trình</th>
                                    <th width="8%">Kỳ học</th>
                                    <th width="10%">Hạn hoàn thành</th>
                                    <th width="10%">Ngày đăng ký</th>
                                    <th width="10%">Trạng thái</th>
                                    <th width="12%" className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center">
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
                                            <td>
                                                    <span className="teacher-code">
                                                        {reg.teacher_code}
                                                    </span>
                                            </td>
                                            <td>{reg.teacher_name}</td>
                                            <td>{reg.subject_name}</td>
                                            <td>{reg.system_name}</td>
                                            <td>{formatSemester(reg.semester)}</td>


                                            <td>{formatDeadline(reg.year, reg.quarter)}</td>
                                            <td>{reg.registration_date}</td>
                                            <td>{getStatusBadge(reg.status)}</td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    {(reg.status === 'registered' || reg.status === 'carryover') && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-success btn-action"
                                                                onClick={() =>
                                                                    handleStatusChange(reg.id, 'COMPLETED')
                                                                }
                                                                title="Duyệt"
                                                            >
                                                                <i className="bi bi-check-circle"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger btn-action"
                                                                onClick={() =>
                                                                    handleStatusChange(reg.id, 'NOT_COMPLETED')
                                                                }
                                                                title="Từ chối"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        className="btn btn-sm btn-info btn-action"
                                                        onClick={() =>
                                                            navigate(
                                                                `/subject-registration-detail/${reg.id}`
                                                            )
                                                        }
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
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 2 && page <= currentPage + 2)
                                        ) {
                                            return (
                                                <li
                                                    key={page}
                                                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(page)}
                                                    >
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
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(totalPages, prev + 1)
                                                )
                                            }
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

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() =>
                            setToast((prev) => ({ ...prev, show: false }))
                        }
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default SubjectRegistrationManagement;
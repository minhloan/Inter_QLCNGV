import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import {
    exportRegistrationsExcel,
    getAllRegistrationsForAdmin, importRegistrationsExcel,
    updateRegistrationStatus,
} from '../../api/adminSubjectRegistrationApi';


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
    const [importResult, setImportResult] = useState(null);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [excelTab, setExcelTab] = useState("export"); // export | import
    const [exportStatus, setExportStatus] = useState("ALL");
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");

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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';

        const [datePart] = dateStr.split(/[T ]/); // tách theo T hoặc khoảng trắng
        const [year, month, day] = datePart.split('-'); // "2025-11-14" -> ["2025","11","14"]
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`; // dd/MM/yyyy
    };

    // Lấy danh sách đăng ký từ backend
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
                subject_code: reg.subjectCode || 'N/A',

                // 👉 thêm
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

    const applyFilters = () => {
        let filtered = [...registrations];

        // Tìm kiếm
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (reg) =>
                    (reg.teacher_name &&
                        reg.teacher_name.toLowerCase().includes(term)) ||
                    (reg.teacher_code &&
                        reg.teacher_code.toLowerCase().includes(term)) ||
                    (reg.subject_name &&
                        reg.subject_name.toLowerCase().includes(term))
            );
        }

        // Lọc theo trạng thái
        if (statusFilter) {
            filtered = filtered.filter(
                (reg) => (reg.status || '').toLowerCase() === statusFilter
            );
        }

        // (nếu sau này dùng subjectFilter thì thêm điều kiện ở đây)
        if (subjectFilter) {
            filtered = filtered.filter(
                (reg) => reg.subject_id === parseInt(subjectFilter, 10)
            );
        }

        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

    // Duyệt / từ chối đăng ký – gọi backend + cập nhật state
    const handleStatusChange = async (registrationId, newStatus) => {
        try {
            setLoading(true);

            // newStatus: 'COMPLETED' hoặc 'NOT_COMPLETED' (ENUM gửi lên backend)
            await updateRegistrationStatus(registrationId, newStatus);

            // Cập nhật lại state phía frontend (lưu lowercase cho đồng bộ)
            const normalized = newStatus.toLowerCase(); // "completed" | "not_completed"
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

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const key = (status || "").toLowerCase();

        const statusMap = {
            registered: { label: "Đang chờ duyệt", class: "info" },
            completed: { label: "Đã duyệt", class: "success" },
            not_completed: { label: "Từ chối", class: "secondary" },
            carryover: { label: "Dời môn", class: "warning" }, // ⭐ THÊM
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

    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageRegistrations = filteredRegistrations.slice(
        startIndex,
        startIndex + pageSize
    );

    if (loading) {
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

                    {/*export-import button*/}
                    <button
                        onClick={() => setShowExcelModal(true)}
                        style={{
                            background: "linear-gradient(90deg, #627cf5, #8f4df3)",
                            color: "white",
                            padding: "10px 22px",
                            borderRadius: "10px",
                            border: "none",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <i className="bi bi-file-earmark-spreadsheet"></i>
                        Xuất / Nhập Excel
                    </button>




                    {/* ===================== MODAL XUẤT/NHẬP EXCEL ==================== */}
                    {showExcelModal && (
                        <>
                            <style>
                                {`
      /* Nút chính */
      .excel-main-btn {
        background: linear-gradient(90deg, #627cf5, #8f4df3);
        color: white;
        padding: 10px 22px;
        border-radius: 10px;
        border: none;
        font-weight: 600;
        display: flex;
        gap: 8px;
        align-items: center;
        cursor: pointer;
      }

      /* Overlay */
      .excel-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .excel-modal-box {
        width: 780px;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        animation: fadeIn 0.25s ease;
      }

      /* Header */
      .excel-modal-header {
        background: linear-gradient(90deg, #627cf5, #8f4df3);
        padding: 16px 20px;
        color: white;
        display: flex;
        justify-content: space-between;
      }

      .excel-modal-header .title {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
      }

      .excel-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 22px;
        cursor: pointer;
      }

      /* Tabs */
      .excel-tabs {
        display: flex;
        background: white;
        border-bottom: 1px solid #ddd;
      }

      .excel-tabs button {
        flex: 1;
        padding: 14px;
        cursor: pointer;
        border: none;
        background: none;
        font-weight: 600;
        color: #777;
      }

      .excel-tabs button.active {
        color: #6c5ce7;
        border-bottom: 3px solid #6c5ce7;
      }

      /* Nội dung tab */
      .excel-tab-content {
        padding: 22px;
      }

      /* Card info */
      .excel-card {
        background: #f9fafc;
        display: flex;
        gap: 12px;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
      }

      .excel-card i {
        font-size: 24px;
        color: #6c5ce7;
      }

      .excel-select {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 15px;
      }

      /* Upload Box */
      .excel-upload-box {
        border: 2px dashed #8f4df3;
        border-radius: 12px;
        padding: 35px;
        text-align: center;
        cursor: pointer;
        color: #666;
      }

      .excel-upload-box i {
        font-size: 40px;
        color: #8f4df3;
      }

      .excel-upload-box:hover {
        background: #faf6ff;
      }

      /* Notes */
      .excel-note {
        padding: 15px;
        border-radius: 10px;
        margin-top: 15px;
      }

      .excel-note.blue {
        background: #eaf3ff;
        border-left: 4px solid #4a90e2;
      }

      .excel-note.yellow {
        background: #fff9e6;
        border-left: 4px solid #f2c94c;
      }

      /* Footer buttons */
      .excel-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .btn-cancel {
        padding: 10px 22px;
        border-radius: 8px;
        border: 1px solid #ccc;
        background: white;
      }

      .btn-primary {
        padding: 10px 22px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(90deg, #627cf5, #8f4df3);
        color: white;
        font-weight: 600;
      }
      `}
                            </style>

                            <div className="excel-modal-overlay">
                                <div className="excel-modal-box">

                                    {/* Header */}
                                    <div className="excel-modal-header">
                                        <div className="title">
                                            <i className="bi bi-filetype-xlsx"></i> Xuất / Nhập dữ liệu Excel
                                        </div>
                                        <button className="excel-close-btn" onClick={() => setShowExcelModal(false)}>✕</button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="excel-tabs">
                                        <button
                                            className={excelTab === "export" ? "active" : ""}
                                            onClick={() => setExcelTab("export")}
                                        >
                                            <i className="bi bi-download"></i> Xuất dữ liệu
                                        </button>
                                        <button
                                            className={excelTab === "import" ? "active" : ""}
                                            onClick={() => setExcelTab("import")}
                                        >
                                            <i className="bi bi-upload"></i> Nhập dữ liệu
                                        </button>
                                    </div>

                                    {/* EXPORT TAB */}
                                    {excelTab === "export" && (
                                        <div className="excel-tab-content">
                                            <div className="excel-card">
                                                <i className="bi bi-info-circle"></i>
                                                <div>
                                                    <h4>Xuất danh sách đăng ký ra Excel</h4>
                                                    <p>Chọn trạng thái để xuất dữ liệu.</p>
                                                </div>
                                            </div>

                                            <label>Tìm kiếm giáo viên</label>
                                            <input
                                                type="text"
                                                className="excel-select"
                                                placeholder="Nhập tên hoặc mã GV..."
                                                value={teacherSearch}
                                                onChange={(e) => setTeacherSearch(e.target.value)}
                                            />

                                            {teacherSearch && (
                                                <div className="excel-search-results">
                                                    {registrations
                                                        .filter(r =>
                                                            (r.teacher_name + r.teacher_code).toLowerCase()
                                                                .includes(teacherSearch.toLowerCase())
                                                        )
                                                        .map((r, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="excel-search-item"
                                                                onClick={() => {
                                                                    setSelectedTeacher(r.teacher_name);
                                                                    setTeacherSearch("");
                                                                }}
                                                            >
                                                                {r.teacher_code} - {r.teacher_name}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}

                                            {selectedTeacher && (
                                                <div style={{ marginBottom: 10 }}>
                                                    <strong>Đã chọn:</strong> {selectedTeacher}
                                                </div>
                                            )}


                                            <label>Lọc theo trạng thái</label>
                                            <select
                                                className="excel-select"
                                                value={exportStatus}
                                                onChange={(e) => setExportStatus(e.target.value)}
                                            >
                                                <option value="ALL">Tất cả</option>
                                                <option value="REGISTERED">Chờ duyệt</option>
                                                <option value="COMPLETED">Đã duyệt</option>
                                                <option value="NOT_COMPLETED">Từ chối</option>
                                                <option value="CARRYOVER">Dời môn</option>
                                            </select>

                                            <div className="excel-note blue">
                                                <ul>
                                                    <li>File Excel sẽ tải xuống tự động</li>
                                                    <li>Bạn có thể chỉnh sửa và import lại</li>
                                                </ul>
                                            </div>

                                            <div className="excel-footer">
                                                <button className="btn-cancel" onClick={() => setShowExcelModal(false)}>Đóng</button>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => exportRegistrationsExcel(exportStatus, selectedTeacher)}
                                                >
                                                    <i className="bi bi-download"></i> Xuất file Excel
                                                </button>

                                            </div>
                                        </div>
                                    )}

                                    {/* IMPORT TAB */}
                                    {excelTab === "import" && (
                                        <div className="excel-tab-content">

                                            <div className="excel-card">
                                                <i className="bi bi-info-circle"></i>
                                                <div>
                                                    <h4>Nhập dữ liệu từ Excel</h4>
                                                    <p>Nhấn để chọn file Excel cần nhập.</p>
                                                </div>
                                            </div>

                                            <label className="excel-upload-box">
                                                <i className="bi bi-cloud-arrow-up"></i>
                                                <p>Nhấn để chọn file Excel</p>
                                                <span>Hỗ trợ .xlsx, .xls</span>

                                                <input
                                                    type="file"
                                                    hidden
                                                    accept=".xlsx,.xls"
                                                    onChange={async (e) => {
                                                        if (!e.target.files?.[0]) return;

                                                        setLoading(true);

                                                        try {
                                                            const result = await importRegistrationsExcel(e.target.files[0]);
                                                            setImportResult(result);
                                                            showToast("Import hoàn tất", `Tổng: ${result.totalRows}, thành công: ${result.successCount}, lỗi: ${result.errorCount}`, "success");

                                                            await loadRegistrations();
                                                        } catch (err) {
                                                            showToast("Lỗi import", err.response?.data || err.message, "danger");
                                                        }

                                                        setLoading(false);
                                                        e.target.value = "";
                                                    }}
                                                />



                                            </label>

                                            {importResult && importResult.errorCount > 0 && (
                                                <div className="excel-note blue" style={{ marginTop: 10 }}>
                                                    <strong>Kết quả import:</strong>
                                                    <div>Tổng dòng: {importResult.totalRows}</div>
                                                    <div>Thành công: {importResult.successCount}</div>
                                                    <div>Bỏ qua (trùng): {importResult.skippedCount}</div>
                                                    <div>Lỗi: {importResult.errorCount}</div>
                                                    {importResult.errors && importResult.errors.length > 0 && (
                                                        <ul style={{ marginTop: 8, maxHeight: 150, overflowY: "auto", fontSize: 13 }}>
                                                            {importResult.errors.map((err, idx) => (
                                                                <li key={idx}>
                                                                    Dòng {err.rowIndex}: {err.message}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}

                                            <div className="excel-footer">
                                                <button className="btn-cancel" onClick={() => setShowExcelModal(false)}>Đóng</button>
                                            </div>

                                        </div>
                                    )}

                                </div>
                            </div>
                        </>
                    )}




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
                                    <th width="12%">Chương trình</th>{/* system_name */}
                                    <th width="8%">Kỳ học</th>          {/* semester */}
                                    <th width="10%">Hạn hoàn thành</th>{/* year + quarter */}
                                    <th width="10%">Ngày đăng ký</th>  {/* registration_date */}
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
                                            <td>{reg.semester}</td>

                                            <td>{formatDeadline(reg.year, reg.quarter)}</td>
                                            <td>{reg.registration_date}</td>
                                            <td>{getStatusBadge(reg.status)}</td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    {/* Chỉ cho duyệt / từ chối khi đang ở trạng thái đã đăng ký */}
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
                                    <li
                                        className={`page-item ${
                                            currentPage === 1 ? 'disabled' : ''
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.max(1, prev - 1))
                                            }
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
                                                    className={`page-item ${
                                                        currentPage === page ? 'active' : ''
                                                    }`}
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
                                    <li
                                        className={`page-item ${
                                            currentPage === totalPages ? 'disabled' : ''
                                        }`}
                                    >
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

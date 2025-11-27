import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";
import {
    listAllSubjectRegistrations,
    registerSubject,
    carryOverSubject,
    exportPlanByYear,
    importPlanByYear,
} from "../../api/subjectRegistrationApi.js";
import { listAllSubjects } from "../../api/subject.js";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "REGISTERED", label: "Đã đăng ký" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "NOT_COMPLETED", label: "Chưa hoàn thành" },
    { value: "CARRYOVER", label: "Dời Môn" },
];

const TeacherSubjectRegistration = () => {
    const navigate = useNavigate();

    const [registrations, setRegistrations] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [yearFilter, setYearFilter] = useState("");
    const [quarterFilter, setQuarterFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const currentYear = new Date().getFullYear();
    const [registerYear, setRegisterYear] = useState(currentYear);
    const [registerQuarter, setRegisterQuarter] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showExcelModal, setShowExcelModal] = useState(false);
    const [excelTab, setExcelTab] = useState("export");


    const [filtersReset, setFiltersReset] = useState(true);

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    // ======================= CARRY OVER ============================
    const [showCarryModal, setShowCarryModal] = useState(false);
    const [carryTarget, setCarryTarget] = useState(null);
    const [carryYear, setCarryYear] = useState(currentYear + 1);
    const [carryQuarter, setCarryQuarter] = useState("");
    const [carryReason, setCarryReason] = useState("");

    const openCarryOverModal = (reg) => {
        setCarryTarget(reg);
        setCarryYear(currentYear + 1);
        setCarryQuarter("");
        setCarryReason("");
        setShowCarryModal(true);
    };

    const handleCarryOver = async () => {
        if (!carryQuarter) {
            showToast("Lỗi", "Vui lòng chọn quý mới!", "danger");
            return;
        }
        try {
            const payload = {
                targetYear: parseInt(carryYear),
                quarter: `QUY${carryQuarter}`,
                reasonForCarryOver: carryReason,
            };

            await carryOverSubject(carryTarget.id, payload);

            showToast("Thành công", "Dời môn thành công!", "success");
            setShowCarryModal(false);
            await loadRegistrations();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.details ||
                JSON.stringify(err.response?.data) ||
                "Không thể dời môn";

            showToast("Lỗi", msg, "danger");
        }
    };

    // ======================= IMPORT PLAN ==========================
    const [showImportModal, setShowImportModal] = useState(false);
    const [importYear, setImportYear] = useState(currentYear);
    const [importFile, setImportFile] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const openImportModal = () => {
        setImportYear(currentYear);
        setImportFile(null);
        setImportResult(null);
        setShowImportModal(true);
    };

    const handleImportPlan = async () => {
        if (!importFile) {
            showToast("Lỗi", "Vui lòng chọn file Excel cần import!", "danger");
            return;
        }

        try {
            setLoading(true);
            const res = await importPlanByYear(importYear, importFile);
            setImportResult(res);
            showToast("Thành công", `Import kế hoạch năm ${importYear} thành công!`, "success");
            await loadRegistrations();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể import kế hoạch";
            showToast("Lỗi", msg, "danger");
        } finally {
            setLoading(false);
        }
    };

    // ======================= EXPORT PLAN ==========================
    const handleExportPlan = async () => {
        try {
            setLoading(true);
            const year = yearFilter || currentYear;
            const res = await exportPlanByYear(year);

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ke-hoach-nam-${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            showToast("Lỗi", "Không thể export kế hoạch năm.", "danger");
        } finally {
            setLoading(false);
        }
    };

    // ===============================================================

    useEffect(() => {
        loadRegistrations();
        loadAvailableSubjects();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [registrations, yearFilter, quarterFilter, statusFilter, filtersReset]);
    const getDeadline = (year, quarter) => {
        if (!year || !quarter) return "N/A";

        const monthMap = {
            QUY1: "03",
            QUY2: "06",
            QUY3: "09",
            QUY4: "12",
        };

        const month = monthMap[quarter] ?? null;
        return month ? `${month}-${year}` : "N/A";
    };
    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const rows = await listAllSubjectRegistrations();

            const normalized = (rows || []).map((item) => {
                // Format registration date
                let formattedDate = item.registrationDate
                    ? item.registrationDate.split("T")[0]
                    : "N/A";

                // Convert quarter QUY1 -> 1
                let quarterNumber = "";
                if (item.quarter && item.quarter.startsWith("QUY")) {
                    quarterNumber = item.quarter.replace("QUY", "");
                }

                return {
                    id: item.id,
                    subjectId: item.subjectId,

                    // ⭐ NEW — giống ADMIN
                    subject_code: item.subjectCode ?? "N/A",
                    subject_name: item.subjectName ?? "N/A",
                    system_name: item.systemName ?? "N/A",
                    semester: item.semester ?? "N/A",
                    year: item.year ?? null,
                    quarter_raw: item.quarter ?? null,     // QUY1, QUY2...
                    quarter: quarterNumber,                // 1, 2, 3, 4

                    registration_date: formattedDate,
                    status: (item.status || "").toUpperCase(),
                    reason_for_carry_over: item.reasonForCarryOver ?? "-",

                    // ⭐ NEW — deadline như admin
                    deadline: getDeadline(item.year, item.quarter),
                };
            });

            setRegistrations(normalized);
            setFilteredRegistrations(normalized);
            setCurrentPage(1);
        } finally {
            setLoading(false);
        }
    };


    const loadAvailableSubjects = async () => {
        try {
            const subjects = await listAllSubjects();
            setAvailableSubjects((subjects || []).filter((s) => s.isActive));
        } catch {
            showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
        }
    };

    const applyFilters = () => {
        if (filtersReset) {
            setFilteredRegistrations(registrations);
            return;
        }

        let filtered = [...registrations];

        if (yearFilter) filtered = filtered.filter((reg) => reg.year == yearFilter);
        if (quarterFilter) filtered = filtered.filter((reg) => reg.quarter == quarterFilter);
        if (statusFilter)
            filtered = filtered.filter(
                (reg) => (reg.status || "").toUpperCase() === statusFilter
            );

        setFilteredRegistrations(filtered);
    };

    const handleRegister = async (subjectId, year, quarter) => {
        const isDuplicated = registrations.some(
            (reg) =>
                reg.subjectId === subjectId && Number(reg.year) === Number(year)
        );

        if (isDuplicated) {
            showToast("Lỗi", `Môn này đã được đăng ký trong năm ${year}.`, "danger");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                subjectId,
                year: parseInt(year),
                quarter: parseInt(quarter),
                status: "REGISTERED",
            };

            await registerSubject(payload);
            showToast("Thành công", "Đăng ký môn học thành công!", "success");
            setShowRegisterModal(false);
            await loadRegistrations();
        } catch (error) {
            showToast("Lỗi", "Không thể đăng ký môn học.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const map = {
            REGISTERED: { label: "Đã đăng ký", class: "info" },
            COMPLETED: { label: "Hoàn thành", class: "success" },
            NOT_COMPLETED: { label: "Chưa hoàn thành", class: "warning" },
            CARRYOVER: { label: "Dời Môn", class: "carryover" },
        };
        const s = map[status] || { label: status, class: "secondary" };
        return <span className={`badge badge-status ${s.class}`}>{s.label}</span>;
    };

    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageRegistrations = filteredRegistrations.slice(
        startIndex,
        startIndex + pageSize
    );

    const validationYear = yearFilter || currentYear;
    const regsForValidationYear = registrations.filter(
        (r) =>
            r.year == validationYear && r.status !== "NOT_COMPLETED"
    );
    const totalSubjectsInYear = regsForValidationYear.length;

    const missingQuarters = [1, 2, 3, 4].filter(
        (q) => !regsForValidationYear.some((reg) => reg.quarter == q)
    );

    if (loading) return <Loading fullscreen={true} message="Đang tải dữ liệu..." />;

    return (
        <MainLayout>
            <div className="page-teacher-subject-registration">

                {/* HEADER */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Đăng ký Môn học</h1>
                    </div>
                    {/*Import-Export Button*/}
                    <button
                        onClick={() => setShowExcelModal(true)}
                        style={{
                            padding: "10px 18px",
                            background: "linear-gradient(90deg, #667eea, #764ba2)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 500,
                        }}
                    >
                        <i className="bi bi-file-earmark-spreadsheet"></i>
                        Xuất / Nhập Excel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            // Reset khi mở modal
                            setRegisterYear(currentYear);
                            setRegisterQuarter("");
                            setSelectedSubject("");
                            setSubjectSearchTerm("");
                            setShowRegisterModal(true);
                        }}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Đăng ký Môn mới
                    </button>



                    {showExcelModal && (
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,0.35)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 2000,
                            }}
                        >
                            <div
                                style={{
                                    width: "640px",
                                    background: "#fff",
                                    borderRadius: "14px",
                                    overflow: "hidden",
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                                }}
                            >
                                {/* HEADER */}
                                <div
                                    style={{
                                        background: "linear-gradient(90deg, #667eea, #764ba2)",
                                        padding: "16px 20px",
                                        color: "white",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <h3 style={{ margin: 0, fontSize: "20px" }}>
                                        <i className="bi bi-file-earmark-excel"></i> Xuất / Nhập dữ liệu Excel
                                    </h3>
                                    <button
                                        onClick={() => setShowExcelModal(false)}
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            border: "none",
                                            color: "white",
                                            padding: "6px 10px",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        Đóng
                                    </button>
                                </div>

                                {/* TAB */}
                                <div
                                    style={{
                                        display: "flex",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    <div
                                        onClick={() => setExcelTab("export")}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            background: excelTab === "export" ? "#f3f4ff" : "white",
                                            borderBottom: excelTab === "export" ? "3px solid #667eea" : "none",
                                        }}
                                    >
                                        <i className="bi bi-download"></i> Xuất dữ liệu
                                    </div>

                                    <div
                                        onClick={() => setExcelTab("import")}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            background: excelTab === "import" ? "#f3f4ff" : "white",
                                            borderBottom: excelTab === "import" ? "3px solid #667eea" : "none",
                                        }}
                                    >
                                        <i className="bi bi-upload"></i> Nhập dữ liệu
                                    </div>
                                </div>

                                {/* TAB EXPORT */}
                                {excelTab === "export" && (
                                    <div style={{ padding: "20px" }}>
                                        <p><b>Xuất danh sách môn học đã đăng ký ra file Excel.</b></p>
                                        <div style={{ textAlign: "right" }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    handleExportPlan();
                                                    setShowExcelModal(false);
                                                }}
                                            >
                                                <i className="bi bi-download"></i> Xuất file Excel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB IMPORT */}
                                {excelTab === "import" && (
                                    <div style={{ padding: "20px" }}>
                                        <p><b>Nhập kế hoạch năm từ file Excel (.xlsx)</b></p>
                                        <div
                                            style={{
                                                border: "2px dashed #667eea",
                                                padding: "30px",
                                                textAlign: "center",
                                                borderRadius: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <input
                                                type="file"
                                                accept=".xlsx"
                                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                            />
                                            <p style={{ marginTop: "10px" }}>
                                                Nhấn để chọn file Excel
                                            </p>
                                        </div>
                                        {/* Result */}
                                        {importResult && (
                                            <div className="mt-3">
                                                <p>
                                                    Tổng: <b>{importResult.totalRows}</b> – Thành công:{" "}
                                                    <b>{importResult.successCount}</b> – Lỗi:{" "}
                                                    <b>{importResult.errorCount}</b>
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ textAlign: "right", marginTop: "20px" }}>
                                            <button
                                                className="btn btn-success"
                                                onClick={async () => {
                                                    await handleImportPlan();
                                                }}
                                                disabled={!importFile}
                                            >
                                                <i className="bi bi-upload"></i> Import dữ liệu
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* FILTER + TABLE WRAPPER */}
                <div className="filter-table-wrapper">
                    {/* FILTER */}
                    <div className="filter-section">
                        <div className="filter-row">

                            {/* Năm */}
                            <div className="filter-group">
                                <label className="filter-label">Năm</label>
                                <select
                                    className="filter-select"
                                    value={yearFilter}
                                    onChange={(e) => {
                                        setFiltersReset(false);
                                        setYearFilter(e.target.value);
                                    }}
                                >
                                    <option value="">Tất cả</option>
                                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quý */}
                            <div className="filter-group">
                                <label className="filter-label">Quý</label>
                                <select
                                    className="filter-select"
                                    value={quarterFilter}
                                    onChange={(e) => {
                                        setFiltersReset(false);
                                        setQuarterFilter(e.target.value);
                                    }}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="1">Quý 1</option>
                                    <option value="2">Quý 2</option>
                                    <option value="3">Quý 3</option>
                                    <option value="4">Quý 4</option>
                                </select>
                            </div>

                            {/* Trạng thái */}
                            <div className="filter-group">
                                <label className="filter-label">Trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setFiltersReset(false);
                                        setStatusFilter(e.target.value);
                                    }}
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reset */}
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setYearFilter("");
                                        setQuarterFilter("");
                                        setStatusFilter("");
                                        setFiltersReset(true);
                                    }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã môn</th>
                                    <th>Tên môn</th>
                                    <th>Chương trình</th>
                                    <th>Kỳ học</th>
                                    <th>Hạn hoàn thành</th>
                                    <th>Năm</th>
                                    <th>Quý</th>
                                    <th>Ngày đăng ký</th>
                                    <th>Trạng thái</th>
                                    <th>Ghi chú</th>
                                    <th>Hành động</th>
                                </tr>
                                </thead>


                                <tbody>
                                {pageRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">
                                            <div className="empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>Không có đăng ký nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageRegistrations.map((reg, index) => (
                                        <tr key={reg.id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{reg.subject_code}</td>
                                            <td>{reg.subject_name}</td>
                                            <td>{reg.system_name}</td>
                                            <td>{reg.semester}</td>
                                            <td>{reg.deadline}</td>
                                            <td>{reg.year}</td>
                                            <td>{reg.quarter ? `QUY${reg.quarter}` : "N/A"}</td>
                                            <td>{reg.registration_date}</td>
                                            <td>{getStatusBadge(reg.status)}</td>
                                            <td>{reg.reason_for_carry_over}</td>

                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => openCarryOverModal(reg)}
                                                >
                                                    <i className="bi bi-arrow-repeat"></i> Dời
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <nav className="mt-3">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${page === currentPage ? "active" : ""}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}

                    </div>
                </div>

                {/* THỐNG KÊ */}
                {totalSubjectsInYear < 4 && (
                    <div className="alert alert-warning mt-3">
                        Năm <b>{validationYear}</b> bạn mới đăng ký <b>{totalSubjectsInYear}</b> môn.
                        Cần tối thiểu <b>4 môn / năm</b>.
                    </div>
                )}

                {missingQuarters.length > 0 && (
                    <div className="alert alert-warning">
                        Các quý chưa có môn:{" "}
                        {missingQuarters.join(", ")}
                    </div>
                )}

                {/* ============== MODAL ĐĂNG KÝ MÔN ============== */}
                {showRegisterModal && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                padding: "24px",
                                width: "520px",
                                borderRadius: "12px",
                            }}
                        >
                            <h3 style={{ marginBottom: "16px" }}>Đăng ký Môn học Mới</h3>

                            {/* Môn học */}
                            <div style={{ marginBottom: "20px" }}>
                                <label>Môn học</label>

                                <input
                                    className="form-control"
                                    style={{ marginTop: "6px", marginBottom: "10px" }}
                                    placeholder="Tìm kiếm môn..."
                                    value={subjectSearchTerm}
                                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                                />

                                <select
                                    className="form-control"
                                    style={{ marginTop: "6px" }}
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="">-- Chọn môn --</option>

                                    {availableSubjects
                                        .filter((s) =>
                                            `${s.subjectCode} ${s.subjectName}`
                                                .toLowerCase()
                                                .includes(subjectSearchTerm.toLowerCase())
                                        )
                                        .map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.subjectCode} - {s.subjectName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Năm */}
                            <div style={{ marginBottom: "20px" }}>
                                <label>Năm</label>
                                <select
                                    className="form-control"
                                    style={{ marginTop: "6px" }}
                                    value={registerYear}
                                    onChange={(e) => setRegisterYear(e.target.value)}
                                >
                                    {[currentYear, currentYear + 1].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quý */}
                            <div style={{ marginBottom: "24px" }}>
                                <label>Quý</label>
                                <select
                                    className="form-control"
                                    style={{ marginTop: "6px" }}
                                    value={registerQuarter}
                                    onChange={(e) => setRegisterQuarter(e.target.value)}
                                >
                                    <option value="">-- Chọn quý --</option>
                                    <option value="1">Quý 1</option>
                                    <option value="2">Quý 2</option>
                                    <option value="3">Quý 3</option>
                                    <option value="4">Quý 4</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                }}
                            >
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowRegisterModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    disabled={!selectedSubject || !registerQuarter}
                                    onClick={() =>
                                        handleRegister(selectedSubject, registerYear, registerQuarter)
                                    }
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* ============== MODAL DỜI MÔN ============== */}
                {showCarryModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Dời môn sang năm khác</h3>

                            <p>
                                <b>Môn:</b> {carryTarget?.subject_name} <br />
                                <b>Mã môn:</b> {carryTarget?.subject_code}
                            </p>

                            <div className="form-group">
                                <label>Năm mới</label>
                                <select
                                    className="form-control"
                                    value={carryYear}
                                    onChange={(e) => setCarryYear(e.target.value)}
                                >
                                    {[currentYear, currentYear + 1, currentYear + 2].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group mt-3">
                                <label>Quý mới</label>
                                <select
                                    className="form-control"
                                    value={carryQuarter}
                                    onChange={(e) => setCarryQuarter(e.target.value)}
                                >
                                    <option value="">-- Chọn quý --</option>
                                    <option value="1">Quý 1</option>
                                    <option value="2">Quý 2</option>
                                    <option value="3">Quý 3</option>
                                    <option value="4">Quý 4</option>
                                </select>
                            </div>

                            <div className="form-group mt-3">
                                <label>Lý do dời môn</label>
                                <textarea
                                    className="form-control"
                                    value={carryReason}
                                    onChange={(e) => setCarryReason(e.target.value)}
                                    placeholder="Nhập lý do..."
                                ></textarea>
                            </div>

                            <div className="mt-4 d-flex justify-content-end">
                                <button
                                    className="btn btn-secondary me-2"
                                    onClick={() => setShowCarryModal(false)}
                                >
                                    Hủy
                                </button>
                                <button className="btn btn-primary" onClick={handleCarryOver}>
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============== MODAL IMPORT KẾ HOẠCH NĂM ============== */}
                {showImportModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Import kế hoạch năm từ Excel</h3>

                            <div className="form-group">
                                <label>Năm kế hoạch</label>
                                <select
                                    className="form-control"
                                    value={importYear}
                                    onChange={(e) => setImportYear(e.target.value)}
                                >
                                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group mt-3">
                                <label>File Excel (.xlsx)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".xlsx"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                />
                            </div>

                            {importResult && (
                                <div className="mt-3">
                                    <p>
                                        Tổng dòng: <b>{importResult.totalRows}</b> – Thành công:{" "}
                                        <b>{importResult.successCount}</b> – Lỗi:{" "}
                                        <b>{importResult.errorCount}</b>
                                    </p>
                                    {importResult.errors && importResult.errors.length > 0 && (
                                        <div className="alert alert-warning" style={{ maxHeight: 200, overflow: "auto" }}>
                                            <ul>
                                                {importResult.errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 d-flex justify-content-end">
                                <button
                                    className="btn btn-secondary me-2"
                                    onClick={() => setShowImportModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleImportPlan}
                                    disabled={!importFile}
                                >
                                    Thực hiện Import
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </MainLayout>
    );
};

export default TeacherSubjectRegistration;

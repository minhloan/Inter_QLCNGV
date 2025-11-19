import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import {
    listAllSubjectRegistrations,
    registerSubject,
} from "../../api/subjectRegistrationApi.js";
import { listAllSubjects } from "../../api/subject.js";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "REGISTERED", label: "Đã đăng ký" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "NOT_COMPLETED", label: "Chưa hoàn thành" },
];

const TeacherSubjectRegistration = () => {
    const navigate = useNavigate();

    const [registrations, setRegistrations] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // ===== BỘ LỌC TRÊN TABLE =====
    const [yearFilter, setYearFilter] = useState(""); // "" = tất cả năm
    const [quarterFilter, setQuarterFilter] = useState(""); // "" = tất cả quý
    const [statusFilter, setStatusFilter] = useState(""); // "" = tất cả trạng thái

    // ===== STATE TRONG MODAL ĐĂNG KÝ =====
    const currentYear = new Date().getFullYear();
    const [registerYear, setRegisterYear] = useState(currentYear);
    const [registerQuarter, setRegisterQuarter] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    // 🔍 state tìm kiếm môn học trong modal
    const [subjectSearchTerm, setSubjectSearchTerm] = useState("");

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // true = đang hiển thị tất cả, không áp dụng lọc
    const [filtersReset, setFiltersReset] = useState(true);

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        loadRegistrations();
        loadAvailableSubjects();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [registrations, yearFilter, quarterFilter, statusFilter, filtersReset]);

    // ===================== LOAD DATA =====================
    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const rows = await listAllSubjectRegistrations();

            const normalized = (rows || []).map((item) => {
                // ---- format ngày yyyy-MM-dd ----
                const rawDate =
                    item.creationTimestamp ||
                    item.createdAt ||
                    item.registrationDate ||
                    null;

                let formattedDate = null;
                if (rawDate) {
                    if (typeof rawDate === "string") {
                        formattedDate = rawDate.split("T")[0];
                    } else {
                        const d = new Date(rawDate);
                        if (!isNaN(d.getTime())) {
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, "0");
                            const dd = String(d.getDate()).padStart(2, "0");
                            formattedDate = `${y}-${m}-${dd}`;
                        }
                    }
                }

                // ---- chuẩn hoá QUY1 -> "1", QUY2 -> "2" ----
                const rawQuarter = item.quarter ?? "";
                let quarterNumber = "";
                if (
                    typeof rawQuarter === "string" &&
                    rawQuarter.toUpperCase().startsWith("QUY")
                ) {
                    quarterNumber = rawQuarter.toUpperCase().replace("QUY", "");
                }

                const status = (item.status || "").toString().trim().toUpperCase();

                return {
                    id: item.id,
                    subjectId: item.subjectId,              // 👈 THÊM DÒNG NÀY
                    subject_code: item.subjectCode ?? "N/A",
                    subject_name: item.subjectName ?? "N/A",
                    year: item.year ?? null,
                    quarter: quarterNumber,
                    status,
                    reason_for_carry_over: item.reasonForCarryOver ?? "-",
                    registration_date: formattedDate,
                };
            });

            setRegistrations(normalized);
            setFilteredRegistrations(normalized);
            setCurrentPage(1);
        } catch (error) {
            console.error(error);
            showToast("Lỗi", "Không thể tải danh sách đăng ký", "danger");
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableSubjects = async () => {
        try {
            const subjects = await listAllSubjects();
            const activeSubjects = (subjects || []).filter((s) => s.isActive);
            setAvailableSubjects(activeSubjects);
        } catch (error) {
            console.error("Lỗi tải danh sách môn học:", error);
            showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
        }
    };

    // ===================== FILTER TABLE =====================
    const applyFilters = () => {
        // Nếu đang reset: luôn show toàn bộ
        if (filtersReset) {
            setFilteredRegistrations(registrations);
            setCurrentPage(1);
            return;
        }

        let filtered = [...registrations];

        // Năm
        if (yearFilter) {
            filtered = filtered.filter(
                (reg) => Number(reg.year) === Number(yearFilter)
            );
        }

        // Quý
        if (quarterFilter) {
            filtered = filtered.filter(
                (reg) => String(reg.quarter) === String(quarterFilter)
            );
        }

        // Trạng thái
        if (statusFilter) {
            filtered = filtered.filter(
                (reg) => (reg.status || "").toUpperCase() === statusFilter
            );
        }

        setFilteredRegistrations(filtered);
        setCurrentPage(1);
    };

    // ===================== REGISTER =====================
    const handleRegister = async (subjectId, year, quarter) => {
        // ✅ 1) Check trùng môn trong cùng 1 năm
        const isDuplicated = registrations.some((reg) => {
            if (!reg.subjectId || reg.year == null) return false;
            return (
                reg.subjectId.toString() === subjectId.toString() &&
                Number(reg.year) === Number(year)
                // Nếu muốn bỏ qua môn bị TỪ CHỐI thì thêm:
                // && (reg.status || "").toUpperCase() !== "NOT_COMPLETED"
            );
        });

        if (isDuplicated) {
            showToast(
                "Lỗi",
                `Bạn đã đăng ký môn này trong năm ${year}, không thể đăng ký trùng.`,
                "danger"
            );
            return; // ⛔ Không gọi API nữa
        }

        // ✅ 2) Nếu không trùng thì mới gọi API
        try {
            setLoading(true);

            const payload = {
                subjectId,
                year: parseInt(year, 10),
                quarter: parseInt(quarter, 10),
                status: "REGISTERED",
            };

            await registerSubject(payload);
            showToast("Thành công", "Đăng ký môn học thành công 🎉", "success");
            setShowRegisterModal(false);
            await loadRegistrations();
        } catch (error) {
            console.error("❌ Lỗi khi đăng ký:", error.response?.data || error.message);
            showToast(
                "Lỗi",
                error.response?.data || "Không thể đăng ký môn học.",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };


    // ===================== UI HELPERS =====================
    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            REGISTERED: { label: "Đã đăng ký", class: "info" },
            COMPLETED: { label: "Hoàn thành", class: "success" },
            NOT_COMPLETED: { label: "Chưa hoàn thành", class: "warning" },
        };
        const s =
            statusMap[(status || "").toUpperCase()] || {
                label: status,
                class: "secondary",
            };
        return <span className={`badge badge-status ${s.class}`}>{s.label}</span>;
    };

    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageRegistrations = filteredRegistrations.slice(
        startIndex,
        startIndex + pageSize
    );

    // 🔍 danh sách môn học đã lọc theo ô tìm kiếm trong modal
    const filteredSubjectsForModal = availableSubjects.filter((s) => {
        if (!subjectSearchTerm) return true;
        const keyword = subjectSearchTerm.toLowerCase();
        const combined = `${s.subjectCode || ""} ${s.subjectName || ""}`.toLowerCase();
        return combined.includes(keyword);
    });

    // ===================== VALIDATION THỐNG KÊ (4 MÔN/NĂM, 1 MÔN/QUÝ) =====================
    // Năm dùng để kiểm tra: nếu user chọn năm lọc thì lấy năm đó, nếu không thì dùng năm hiện tại
    const validationYear = yearFilter || currentYear;

    // Chỉ tính các đăng ký của năm đó và không bị TỪ CHỐI
    const regsForValidationYear = registrations.filter(
        (reg) =>
            Number(reg.year) === Number(validationYear) &&
            (reg.status || "").toUpperCase() !== "NOT_COMPLETED"
    );

    const totalSubjectsInYear = regsForValidationYear.length;

    // Những quý chưa có môn nào (1..4)
    const missingQuarters = [1, 2, 3, 4].filter(
        (q) => !regsForValidationYear.some(
            (reg) => String(reg.quarter) === String(q)
        )
    );

    if (loading) {
        return <Loading fullscreen={true} message="Đang tải dữ liệu..." />;
    }

    // ===================== RENDER =====================
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
                </div>

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
                                        setYearFilter(e.target.value); // "" = tất cả
                                    }}
                                >
                                    <option value="">Tất cả</option>
                                    {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                                        <option key={year} value={year}>
                                            {year}
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
                                        setQuarterFilter(e.target.value); // "" = tất cả
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
                                        setStatusFilter(e.target.value); // lưu ENUM
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
                                        setFiltersReset(true); // quay về hiển thị tất cả
                                    }}
                                    style={{ width: "100%" }}
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
                                    <th width="5%">#</th>
                                    <th width="10%">Mã môn</th>
                                    <th width="25%">Tên môn</th>
                                    <th width="12%">Năm</th>
                                    <th width="12%">Quý</th>
                                    <th width="12%">Ngày đăng ký</th>
                                    <th width="12%">Trạng thái</th>
                                    <th width="12%">Ghi chú</th>
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
                                            <td>
                          <span className="teacher-code">
                            {reg.subject_code || "N/A"}
                          </span>
                                            </td>
                                            <td>{reg.subject_name || "N/A"}</td>
                                            <td>{reg.year || "N/A"}</td>
                                            <td>{reg.quarter ? `QUY${reg.quarter}` : "N/A"}</td>
                                            <td>{reg.registration_date || "N/A"}</td>
                                            <td>{getStatusBadge(reg.status)}</td>
                                            <td>{reg.reason_for_carry_over || "-"}</td>
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
                                            currentPage === 1 ? "disabled" : ""
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
                                                        currentPage === page ? "active" : ""
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
                                            currentPage === totalPages ? "disabled" : ""
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

                {/* 🔥 CẢNH BÁO THEO QUY ĐỊNH */}
                {totalSubjectsInYear < 4 && (
                    <div className="alert alert-warning" style={{ marginBottom: "8px" }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Năm <strong>{validationYear}</strong> bạn mới đăng ký{" "}
                        <strong>{totalSubjectsInYear}</strong> môn. Yêu cầu tối thiểu{" "}
                        <strong>4 môn / năm</strong>.
                    </div>
                )}

                {missingQuarters.length > 0 && (
                    <div className="alert alert-warning" style={{ marginBottom: "20px" }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Năm <strong>{validationYear}</strong>, các quý sau{" "}
                        <strong>chưa có môn nào đăng ký</strong>:{" "}
                        {missingQuarters.map((q, idx) => (
                            <span key={q}>
                Quý {q}
                                {idx !== missingQuarters.length - 1 && ", "}
              </span>
                        ))}
                        .
                    </div>
                )}

                {/* REGISTER MODAL */}
                {showRegisterModal && (
                    <div
                        className="modal-overlay"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0,0,0,0.5)",
                            zIndex: 1000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            className="modal-content"
                            style={{
                                background: "white",
                                padding: "30px",
                                borderRadius: "8px",
                                width: "90%",
                                maxWidth: "600px",
                            }}
                        >
                            <h3 style={{ marginBottom: "20px" }}>Đăng ký Môn học Mới</h3>

                            {/* 🔍 TÌM KIẾM + CHỌN MÔN HỌC */}
                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Môn học</label>

                                {/* Ô tìm kiếm môn */}
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Tìm kiếm môn học (mã hoặc tên)..."
                                    value={subjectSearchTerm}
                                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                                />

                                {/* Select danh sách môn đã lọc */}
                                <select
                                    className="form-control"
                                    value={selectedSubject || ""}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="">-- Chọn môn học --</option>
                                    {filteredSubjectsForModal.length === 0 ? (
                                        <option value="" disabled>
                                            Không tìm thấy môn học phù hợp
                                        </option>
                                    ) : (
                                        filteredSubjectsForModal.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.subjectCode} - {subject.subjectName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Năm</label>
                                <select
                                    className="form-control"
                                    value={registerYear}
                                    onChange={(e) => setRegisterYear(e.target.value)}
                                >
                                    {[currentYear, currentYear + 1].map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Quý</label>
                                <select
                                    className="form-control"
                                    value={registerQuarter}
                                    onChange={(e) => setRegisterQuarter(e.target.value)}
                                >
                                    <option value="">-- Chọn quý --</option>
                                    <option value="0">Quý 1</option>
                                    <option value="1">Quý 2</option>
                                    <option value="2">Quý 3</option>
                                    <option value="3">Quý 4</option>
                                </select>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowRegisterModal(false);
                                        setSelectedSubject("");
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        selectedSubject &&
                                        registerQuarter &&
                                        handleRegister(selectedSubject, registerYear, registerQuarter)
                                    }
                                    disabled={!selectedSubject || !registerQuarter}
                                >
                                    Đăng ký
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
                    onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                />
            )}
        </MainLayout>
    );
};

export default TeacherSubjectRegistration;

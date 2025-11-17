import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getAllTeachingAssignments } from "../../api/teaching-assignments";

const TeachingAssignmentManagement = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        loadAssignments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [assignments, searchTerm, statusFilter, semesterFilter]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const res = await getAllTeachingAssignments();
            setAssignments(res || []);
            setFilteredAssignments(res || []);
        } catch (error) {
            console.error(error);
            showToast("Lỗi", "Không thể tải danh sách phân công", "danger");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...assignments];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((assignment) => {
                const teacherName = (assignment.teacherName || "").toLowerCase();
                const teacherCode = (assignment.teacherCode || "").toLowerCase();
                const subjectName = (assignment.subjectName || "").toLowerCase();
                const classCode = (assignment.classCode || "").toLowerCase();
                return (
                    teacherName.includes(term) ||
                    teacherCode.includes(term) ||
                    subjectName.includes(term) ||
                    classCode.includes(term)
                );
            });
        }

        if (statusFilter) {
            filtered = filtered.filter(
                (assignment) => assignment.status === statusFilter
            );
        }

        if (semesterFilter) {
            filtered = filtered.filter(
                (assignment) => assignment.semester === semesterFilter
            );
        }

        setFilteredAssignments(filtered);
        setCurrentPage(1);
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ASSIGNED: { label: "Đã phân công", class: "info" },
            COMPLETED: { label: "Hoàn thành", class: "success" },
            NOT_COMPLETED: { label: "Chưa hoàn thành", class: "warning" },
            FAILED: { label: "Không đạt", class: "danger" },
        };
        const statusInfo = statusMap[status] || {
            label: status,
            class: "secondary",
        };
        return (
            <span className={`badge badge-status bg-${statusInfo.class}`}>
        {statusInfo.label}
      </span>
        );
    };

    const totalPages = Math.ceil(filteredAssignments.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const pageAssignments = filteredAssignments.slice(
        startIndex,
        startIndex + pageSize
    );

    if (loading) {
        return (
            <Loading
                fullscreen={true}
                message="Đang tải danh sách phân công giảng dạy..."
            />
        );
    }

    return (
        <MainLayout>
            <div className="page-admin-trial">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Phân công Giảng dạy</h1>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/teaching-assignment-management-add")}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Thêm Phân công
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
                                        placeholder="Tên giáo viên, mã lớp, môn học..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Học kỳ</label>
                                <select
                                    className="filter-select"
                                    value={semesterFilter}
                                    onChange={(e) => setSemesterFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    {/* Nếu muốn dynamic, có thể lấy từ assignments.map(x => x.semester) rồi unique */}
                                    <option value="2024-1">2024-1</option>
                                    <option value="2024-2">2024-2</option>
                                    <option value="2023-2">2023-2</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="ASSIGNED">Đã phân công</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="NOT_COMPLETED">Chưa hoàn thành</option>
                                    <option value="FAILED">Không đạt</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("");
                                        setSemesterFilter("");
                                    }}
                                    style={{ width: "100%" }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Reset
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
                                    <th width="12%">Mã GV</th>
                                    <th width="18%">Tên Giáo viên</th>
                                    <th width="20%">Môn học</th>
                                    <th width="12%">Mã lớp</th>
                                    <th width="10%">Học kỳ</th>
                                    <th width="10%">Lịch học</th>
                                    <th width="8%">Trạng thái</th>
                                    <th width="5%" className="text-center">
                                        Thao tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageAssignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">
                                            <div className="empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>Không tìm thấy phân công nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageAssignments.map((assignment, index) => (
                                        <tr key={assignment.id} className="fade-in">
                                            <td>{startIndex + index + 1}</td>
                                            <td>
                          <span className="teacher-code">
                            {assignment.teacherCode || "N/A"}
                          </span>
                                            </td>
                                            <td>{assignment.teacherName || "N/A"}</td>
                                            <td>{assignment.subjectName || "N/A"}</td>
                                            <td>
                          <span className="teacher-code">
                            {assignment.classCode || "N/A"}
                          </span>
                                            </td>
                                            <td>{assignment.semester || "N/A"}</td>
                                            <td>{assignment.schedule || "N/A"}</td>
                                            <td>{getStatusBadge(assignment.status)}</td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-info btn-action"
                                                        onClick={() =>
                                                            navigate(
                                                                `/teaching-assignment-detail/${assignment.id}`
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

export default TeachingAssignmentManagement;

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getAllSkills, deleteSkill, updateSkill } from "../../api/skill";

const AdminManageSkill = () => {
    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [newFilter, setNewFilter] = useState("");
    const [sortBy, setSortBy] = useState("code_asc");

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    const [hasLoaded, setHasLoaded] = useState(false);

    const pageSize = 30;
    const [currentPage, setCurrentPage] = useState(1);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }, []);

    // LOAD SKILLS
    const loadSkills = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllSkills();
            const mapped = res.map((s) => ({
                id: s.id,
                skillCode: s.skillCode,
                skillName: s.skillName,
                isActive: s.isActive,
                isNew: s.isNew,
                creationTimestamp: s.creationTimestamp,
                status: s.isActive ? "active" : "inactive",
            }));
            setSkills(mapped);
            setHasLoaded(true);
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể tải danh sách Skill", "danger");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (!hasLoaded) loadSkills();
    }, [hasLoaded, loadSkills]);

    // FILTER + SEARCH + SORT
    const filtered = useMemo(() => {
        let list = [...skills];

        if (statusFilter)
            list = list.filter((s) => s.status === statusFilter);

        if (newFilter === "new")
            list = list.filter((s) => s.isNew);
        else if (newFilter === "old")
            list = list.filter((s) => !s.isNew);

        if (searchTerm.trim()) {
            const kw = searchTerm.toLowerCase();
            list = list.filter(
                (s) =>
                    s.skillName?.toLowerCase().includes(kw) ||
                    s.skillCode?.toLowerCase().includes(kw)
            );
        }

        list.sort((a, b) => {
            switch (sortBy) {
                case "code_asc":
                case "code_desc": {
                    const codeA = a.skillCode || "";
                    const codeB = b.skillCode || "";

                    // Try parsing as numbers for numeric comparison
                    const numA = parseInt(codeA, 10);
                    const numB = parseInt(codeB, 10);

                    // If both are valid numbers, compare numerically
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return sortBy === "code_asc" ? numA - numB : numB - numA;
                    }

                    // Otherwise, compare as strings
                    return sortBy === "code_asc"
                        ? codeA.localeCompare(codeB)
                        : codeB.localeCompare(codeA);
                }
                case "name_asc":
                    return (a.skillName || "").localeCompare(b.skillName || "");
                case "name_desc":
                    return (b.skillName || "").localeCompare(a.skillName || "");
                default:
                    return 0;
            }
        });

        return list;
    }, [skills, statusFilter, newFilter, searchTerm, sortBy]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageSkills = filtered.slice(startIndex, endIndex);

    // HANDLERS
    const handleToggleNew = async (skill) => {
        try {
            const newIsNew = !skill.isNew;
            await updateSkill(skill.id, { ...skill, isNew: newIsNew });
            showToast("Thành công", `Đã ${newIsNew ? 'đánh dấu' : 'bỏ đánh dấu'} skill mới`, "success");
            loadSkills();
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể cập nhật Skill", "danger");
        }
    };

    const handleToggleActive = async (skill) => {
        try {
            const newIsActive = !skill.isActive;
            await updateSkill(skill.id, { ...skill, isActive: newIsActive });
            showToast("Thành công", `Đã ${newIsActive ? 'kích hoạt' : 'vô hiệu hóa'} skill`, "success");
            loadSkills();
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể cập nhật Skill", "danger");
        }
    };

    const handleDelete = async (skill) => {
        if (!window.confirm(`Bạn có chắc muốn xóa skill "${skill.skillCode}"?`)) return;

        try {
            setLoading(true);
            await deleteSkill(skill.id);
            showToast("Thành công", "Đã xóa skill", "success");
            loadSkills();
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể xóa skill", "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("");
        setNewFilter("");
        setSortBy("code_asc");
        setCurrentPage(1);
    };

    return (
        <MainLayout>
            <div className="page-admin-manage-teacher">
                {/* Content Header */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Skill</h1>
                    </div>
                </div>

                {loading && <Loading fullscreen={true} message="Đang tải..." />}

                {hasLoaded && !loading && (
                    <div className="filter-table-wrapper">
                        {/* Filter Section */}
                        <div className="filter-section">
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label className="filter-label">Tìm kiếm</label>
                                    <div className="search-input-group">
                                        <i className="bi bi-search"></i>
                                        <input
                                            type="text"
                                            className="filter-input"
                                            placeholder="Tìm theo mã hoặc tên..."
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
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Skill mới</label>
                                    <select
                                        className="filter-select"
                                        value={newFilter}
                                        onChange={(e) => setNewFilter(e.target.value)}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="new">Chỉ skill mới</option>
                                        <option value="old">Chỉ skill cũ</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Sắp xếp</label>
                                    <select
                                        className="filter-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="code_asc">Mã tăng dần</option>
                                        <option value="code_desc">Mã giảm dần</option>
                                        <option value="name_asc">Tên A-Z</option>
                                        <option value="name_desc">Tên Z-A</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <button className="btn btn-secondary" onClick={handleReset} style={{ width: '100%' }}>
                                        <i className="bi bi-arrow-clockwise"></i> Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="table-container">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th width="10%">Skill No</th>
                                            <th width="40%">Skill Name</th>
                                            <th width="15%">Trạng thái</th>
                                            <th width="15%">Skill mới</th>
                                            <th width="20%" className="text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageSkills.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    <div className="empty-state">
                                                        <i className="bi bi-inbox"></i>
                                                        <p>Không tìm thấy skill nào</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            pageSkills.map((skill) => (
                                                <tr key={skill.id} className="fade-in">
                                                    <td>
                                                        <strong>{skill.skillCode}</strong>
                                                        {skill.isNew && (
                                                            <span className="subject-badge-new ms-2">NEW</span>
                                                        )}
                                                    </td>
                                                    <td>{skill.skillName}</td>
                                                    <td>
                                                        <span className={`badge badge-status ${skill.isActive ? 'active' : 'inactive'}`}>
                                                            {skill.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`btn btn-sm ${skill.isNew ? "btn-success" : "btn-outline-secondary"
                                                                }`}
                                                            onClick={() => handleToggleNew(skill)}
                                                            title={skill.isNew ? "Bỏ đánh dấu mới" : "Đánh dấu là mới"}
                                                        >
                                                            <i className={`bi ${skill.isNew ? "bi-star-fill" : "bi-star"}`}></i>
                                                        </button>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn btn-sm btn-primary btn-action"
                                                                onClick={() => navigate(`/manage-skills-edit/${skill.id}`)}
                                                                title="Sửa"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm btn-action ${skill.isActive ? "btn-warning" : "btn-success"
                                                                    }`}
                                                                onClick={() => handleToggleActive(skill)}
                                                                title={skill.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                                            >
                                                                <i className={`bi ${skill.isActive ? "bi-x-circle" : "bi-check-circle"}`}></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger btn-action"
                                                                onClick={() => handleDelete(skill)}
                                                                title="Xóa"
                                                            >
                                                                <i className="bi bi-trash"></i>
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
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                )}

                {/* TOAST */}
                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default AdminManageSkill;

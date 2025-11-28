import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import DeleteSubjectSystemModal from "../../components/Subject/DeleteSubjectSystemModal";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import {
    getAllSubjectSystems,
    deleteSubjectSystem,
    exportSubjectSystem,
    importSubjectSystem
} from "../../api/subjectSystem";

const AdminManageSubjectSystem = () => {
    const navigate = useNavigate();

    const [systems, setSystems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("code_asc");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    const [hasLoaded, setHasLoaded] = useState(false);
    const fileInputRef = useRef(null);
    const [importTarget, setImportTarget] = useState(null);

    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }, []);

    // MAP RESPONSE
    const mapResponse = (response) => {
        const mapped = response.map((s) => ({
            id: s.id,
            systemCode: s.systemCode,
            systemName: s.systemName,
            isActive: s.isActive,
            status: s.isActive ? "active" : "inactive",
        }));

        setSystems(mapped);
    };

    // LOAD SYSTEMS
    const loadSystems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllSubjectSystems();
            mapResponse(res);
            setHasLoaded(true);
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể tải hệ thống", "danger");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (!hasLoaded) loadSystems();
    }, [hasLoaded, loadSystems]);

    // FILTER + SEARCH + SORT
    const filtered = useMemo(() => {
        let list = [...systems];

        if (statusFilter)
            list = list.filter((s) => s.status === statusFilter);

        if (searchTerm.trim()) {
            const kw = searchTerm.toLowerCase();
            list = list.filter(
                (s) =>
                    s.systemName.toLowerCase().includes(kw) ||
                    s.systemCode.toLowerCase().includes(kw)
            );
        }

        list.sort((a, b) => {
            switch (sortBy) {
                case "code_asc":
                    return a.systemCode.localeCompare(b.systemCode);
                case "code_desc":
                    return b.systemCode.localeCompare(a.systemCode);
                case "name_asc":
                    return a.systemName.localeCompare(b.systemName);
                case "name_desc":
                    return b.systemName.localeCompare(a.systemName);
                default:
                    return 0;
            }
        });

        return list;
    }, [systems, searchTerm, statusFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const pageData = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleEdit = (sys) => navigate(`/manage-subject-system-edit/${sys.id}`);
    const handleAdd = () => navigate("/manage-subject-system-add");

    const handleDelete = (sys) => {
        setDeleteItem(sys);
        setShowDeleteModal(true);
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("");
        setSortBy("code_asc");
        setCurrentPage(1);
    };

    const handleExport = async (sys) => {
        if (!sys) return;
        try {
            setLoading(true);
            const res = await exportSubjectSystem(sys.id);

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `khung_${sys.systemCode || "subject-system"}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast("Thành công", "Đã xuất khung chương trình", "success");
        } catch (err) {
            console.error(err);
            showToast(
                "Lỗi",
                err.response?.data?.message || "Không thể xuất khung chương trình",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = (sys) => {
        setImportTarget(sys);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !importTarget) return;

        try {
            setLoading(true);
            await importSubjectSystem(importTarget.id, file);
            showToast(
                "Thành công",
                `Đã import khung cho ${importTarget.systemName}`,
                "success"
            );
        } catch (err) {
            console.error(err);
            showToast(
                "Lỗi",
                err.response?.data?.message || "Không thể import khung chương trình",
                "danger"
            );
        } finally {
            setLoading(false);
            setImportTarget(null);
            if (event.target) event.target.value = "";
        }
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await deleteSubjectSystem(deleteItem.id);
            showToast("Thành công", "Xóa hệ đào tạo thành công", "success");
            setShowDeleteModal(false);
            setDeleteItem(null);
            loadSystems();
        } catch (err) {
            showToast("Lỗi", err.response?.data?.message || "Không thể xóa hệ", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="page-admin-subject">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Hệ đào tạo</h1>
                    </div>

                    <div className="content-actions">
                        <button className="btn btn-primary" onClick={handleAdd}>
                            <i className="bi bi-plus-circle"></i> Thêm Hệ đào tạo
                        </button>
                    </div>
                </div>
                <p className="page-subtitle subject-count">
                    Tổng số hệ đào tạo: {filtered.length}
                </p>

                {loading && <Loading fullscreen={true} message="Đang tải hệ đào tạo..." />}

                <div className="filter-table-wrapper">
                    {/* FILTER */}
                    <div className="filter-section">
                        <div className="filter-row">

                            {/* STATUS */}
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

                            {/* SEARCH */}
                            <div className="filter-group">
                                <label className="filter-label">Tìm kiếm</label>
                                <div className="search-input-group">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Tìm kiếm theo mã hoặc tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* SORT */}
                            <div className="filter-group">
                                <label className="filter-label">Sắp xếp</label>
                                <select
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="code_asc">Code A → Z</option>
                                    <option value="code_desc">Code Z → A</option>
                                    <option value="name_asc">Name A → Z</option>
                                    <option value="name_desc">Name Z → A</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <button className="btn btn-secondary w-100" onClick={handleReset}>
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-container">
                        <div className="table-responsive mt-3 mt-md-0">
                            <table className="table table-hover table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã hệ đào tạo</th>
                                        <th>Tên hệ đào tạo</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">
                                                Không tìm thấy hệ đào tạo
                                            </td>
                                        </tr>
                                    )}

                                    {pageData.map((sys) => (
                                        <tr key={sys.id}>
                                            <td>{sys.systemCode}</td>
                                            <td>{sys.systemName}</td>
                                            <td>
                                                {sys.isActive ? (
                                                    <span className="badge bg-success">Active</span>
                                                ) : (
                                                    <span className="badge bg-secondary">Inactive</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleImportClick(sys)}
                                                        title="Import Excel khung chương trình"
                                                    >
                                                        <i className="bi bi-upload"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleExport(sys)}
                                                        title="Xuất khung chương trình"
                                                    >
                                                        <i className="bi bi-download"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-info text-white"
                                                        onClick={() => navigate(`/manage-subject-system-assign/${sys.id}`)}
                                                        title="Quản lý môn trong hệ"
                                                    >
                                                        <i className="bi bi-diagram-3"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleEdit(sys)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(sys)}
                                                        title="Xóa hệ"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <nav className="mt-3 mb-2">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li
                                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                                    >
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

                <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImportFile}
                />

                {/* DELETE MODAL */}
                {showDeleteModal && (
                    <DeleteSubjectSystemModal
                        system={deleteItem}
                        onConfirm={confirmDelete}
                        onClose={() => setShowDeleteModal(false)}
                    />
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

export default AdminManageSubjectSystem;

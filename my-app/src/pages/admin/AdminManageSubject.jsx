import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import DeleteSubjectModal from '../../components/Subject/DeleteSubjectModal';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllSubjects, deleteSubject } from '../../api/subject';
import { listActiveSystems } from '../../api/subjectSystem';
import { getFile } from '../../api/file';
import { exportSubjectsExcel, exportAllSkillsExcel, importSubjectsExcel } from "../../api/subjectExcel";

const AdminManageSubject = () => {
    const navigate = useNavigate();

    const [allSubjects, setAllSubjects] = useState([]);
    const [systemOptions, setSystemOptions] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [systemFilter, setSystemFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('code_asc');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSubjectItem, setDeleteSubjectItem] = useState(null);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [hasLoaded, setHasLoaded] = useState(false);

    const [subjectImages, setSubjectImages] = useState({});
    const fileInputRef = useRef(null);
    const pageSize = 12;
    const [currentPage, setCurrentPage] = useState(1);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // ⭐ MAP SUBJECT RESPONSE (Đã thêm isNewSubject)
    const mapSubjectResponse = (response) => {
        const mapped = (response || []).map((s) => ({
            id: s.id,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
            hours: s.hours,
            semester: s.semester,
            semesterLabel:
                s.semester === "SEMESTER_1" ? "Học kỳ 1" :
                    s.semester === "SEMESTER_2" ? "Học kỳ 2" :
                        s.semester === "SEMESTER_3" ? "Học kỳ 3" :
                            s.semester === "SEMESTER_4" ? "Học kỳ 4" : "",
            systemId: s.systemId || s.system?.id || "",
            systemName: s.systemName || s.system?.systemName || "Unknown system",
            isActive: s.isActive,
            status: s.isActive ? "active" : "inactive",
            imageFileId: s.imageFileId || s.image_subject?.id || null,

            // ⭐⭐ FIELD MỚI — LẤY TỪ BACKEND ⭐⭐
            isNewSubject: s.isNewSubject,
        }));

        setAllSubjects(mapped);
    };

    // Load systems
    useEffect(() => {
        const load = async () => {
            try {
                const res = await listActiveSystems();
                setSystemOptions(res);
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    // Load subjects
    const loadSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllSubjects();
            mapSubjectResponse(res);
            setHasLoaded(true);
        } catch (err) {
            showToast("Lỗi", "Không thể tải môn học", "danger");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (!hasLoaded) loadSubjects();
    }, [hasLoaded, loadSubjects]);

    // Load images
    useEffect(() => {
        const loadImg = async () => {
            const imgs = {};
            await Promise.all(
                allSubjects.map(async (s) => {
                    if (!s.imageFileId) return;
                    try {
                        const url = await getFile(s.imageFileId);
                        imgs[s.id] = url;
                    } catch { }
                })
            );
            setSubjectImages(imgs);
        };

        if (allSubjects.length > 0) loadImg();
    }, [allSubjects]);

    // Filter + sort
    const filteredSubjects = useMemo(() => {
        let f = [...allSubjects];

        if (systemFilter) f = f.filter(s => s.systemId === systemFilter);
        if (statusFilter) f = f.filter(s => s.status === statusFilter);

        if (searchTerm.trim()) {
            const kw = searchTerm.toLowerCase();
            f = f.filter(
                s =>
                    s.subjectCode?.toLowerCase().includes(kw) ||
                    s.subjectName?.toLowerCase().includes(kw)
            );
        }

        const safeValue = (value) => (value ?? '').toString();

        f.sort((a, b) => {
            const codeA = safeValue(a.subjectCode);
            const codeB = safeValue(b.subjectCode);
            const nameA = safeValue(a.subjectName);
            const nameB = safeValue(b.subjectName);

            switch (sortBy) {
                case 'code_asc': return codeA.localeCompare(codeB);
                case 'code_desc': return codeB.localeCompare(codeA);
                case 'name_asc': return nameA.localeCompare(nameB);
                case 'name_desc': return nameB.localeCompare(nameA);
                default: return 0;
            }
        });

        return f;
    }, [allSubjects, systemFilter, statusFilter, searchTerm, sortBy]);

    const totalPages = Math.ceil(filteredSubjects.length / pageSize);
    const pageSubjects = filteredSubjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleAdd = () => navigate('/manage-subject-add');
    const handleGoToSystems = () => navigate('/manage-subject-systems');
    const handleEdit = (s) => navigate(`/manage-subject-edit/${s.id}`);
    const handDetail = (s) => navigate(`/manage-subject-detail/${s.id}`);

    const handleDelete = (s) => {
        setDeleteSubjectItem(s);
        setShowDeleteModal(true);
    };

    const handleExport = async () => {
        try {
            const res = await exportSubjectsExcel();

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "subjects_export.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast("Thành công", "Xuất Excel thành công!", "success");
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Xuất Excel thất bại", "danger");
        }
    };

    const handleExportAllSkill = async () => {
        try {
            const res = await exportAllSkillsExcel();
            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "all_skill_in_aptech.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("Thành công", "Đã xuất danh sách All Skill", "success");
        } catch (err) {
            showToast("Lỗi", "Xuất All Skill thất bại", "danger");
        }
    };
    const confirmDelete = async () => {
        if (!deleteSubjectItem) return;

        try {
            setLoading(true);
            await deleteSubject(deleteSubjectItem.id);
            showToast("Thành công", "Xóa thành công", "success");
            setShowDeleteModal(false);
            setDeleteSubjectItem(null);
            loadSubjects();
        } catch (err) {
            showToast("Lỗi", "Không thể xóa môn học", "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTerm('');
        setSystemFilter('');
        setStatusFilter('');
        setSortBy('code_asc');
    };

    return (
        <MainLayout>
            <div className="page-admin-subject">

                {/* HEADER */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Quản lý Môn học</h1>
                    </div>

                    <div className="content-actions">
                        <div className="position-relative d-inline-block">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                                onBlur={() => setTimeout(() => setShowActionsDropdown(false), 200)}
                            >
                                <i className="bi bi-gear"></i> Tiện ích
                            </button>
                            {showActionsDropdown && (
                                <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                                    <button className="dropdown-item" onClick={handleGoToSystems}>
                                        <i className="bi bi-diagram-3 me-2"></i> Trang Hệ Đào Tạo
                                    </button>
                                    <button className="dropdown-item" onClick={handleExport}>
                                        <i className="bi bi-download me-2"></i> Xuất Excel
                                    </button>
                                    <button className="dropdown-item" onClick={handleExportAllSkill}>
                                        <i className="bi bi-cloud-download me-2"></i> Xuất All Skill
                                    </button>
                                    <button className="dropdown-item" onClick={() => navigate('/manage-skills')}>
                                        <i className="bi bi-list-ul me-2"></i> Quản lý Skill
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="bi bi-upload me-2"></i> Import All Skill
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-primary" onClick={handleAdd}>
                            <i className="bi bi-plus-circle"></i> Thêm Môn Học
                        </button>
                    </div>
                </div>

                <p className="page-subtitle subject-count">
                    Tổng số môn học: {filteredSubjects.length}
                </p>

                {loading && <Loading fullscreen={true} message="Đang tải..." />}

                {/* FILTER */}
                <div className="filter-table-wrapper">
                    <div className="filter-section">
                        <div className="filter-row">

                            {/* SYSTEM */}
                            <div className="filter-group">
                                <label className="filter-label">Hệ đào tạo</label>
                                <select
                                    className="filter-select"
                                    value={systemFilter}
                                    onChange={(e) => setSystemFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    {systemOptions.map((sys) => (
                                        <option key={sys.id} value={sys.id}>
                                            {sys.systemName}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                        placeholder="Tìm theo mã hoặc tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* RESET */}
                            <div className="filter-group">
                                <button className="btn btn-secondary w-100" onClick={handleReset}>
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SUBJECT GRID */}
                    <div className="table-container">
                        <div className="courses-grid">

                            {pageSubjects.map((subject) => {
                                const img = subjectImages[subject.id];

                                return (
                                    <div
                                        key={subject.id}
                                        className="course-card position-relative"
                                        onClick={() => handDetail(subject)}
                                    >

                                        <div className="course-image">
                                            {img ? (
                                                <img src={img} alt="img" />
                                            ) : (
                                                <div className="placeholder"></div>
                                            )}
                                        </div>

                                        <div className="course-card-body">
                                            <h3
                                                className="subject-title"
                                                title={subject.subjectName}
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    minHeight: "3.4rem",
                                                }}
                                            >
                                                {subject.subjectName}
                                            </h3>
                                            <p className="subject-meta" title={`${subject.subjectCode} • ${subject.semesterLabel} • ${subject.systemName}`}>
                                                <span className="subject-code">
                                                    {subject.subjectCode}
                                                    {subject.isNewSubject && (
                                                        <span className="subject-badge-new">NEW</span>
                                                    )}
                                                </span>
                                                <span className="subject-meta-divider">•</span>
                                                <span>{subject.hours} giờ</span>
                                                <span className="subject-meta-divider">•</span>
                                                <span>{subject.semesterLabel}</span>
                                                <span className="subject-meta-divider">•</span>
                                                <span className="subject-system" title={subject.systemName}>
                                                    {subject.systemName}
                                                </span>
                                            </p>

                                            <div className="action-buttons">

                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(subject);
                                                    }}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(subject);
                                                    }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <nav className="mt-4 mb-2">
                                <ul className="pagination justify-content-center">

                                    {/* PREV */}
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {/* Page 1 */}
                                    <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
                                    </li>

                                    {/* Dấu ... nếu cách xa */}
                                    {currentPage > 4 && (
                                        <li className="page-item disabled"><span className="page-link">...</span></li>
                                    )}

                                    {/* Các trang quanh currentPage */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p !== 1 && p !== totalPages)
                                        .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
                                        .map(p => (
                                            <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(p)}>
                                                    {p}
                                                </button>
                                            </li>
                                        ))}

                                    {/* Dấu ... trước trang cuối */}
                                    {currentPage < totalPages - 3 && (
                                        <li className="page-item disabled"><span className="page-link">...</span></li>
                                    )}

                                    {/* Last page */}
                                    {totalPages > 1 && (
                                        <li className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                                                {totalPages}
                                            </button>
                                        </li>
                                    )}

                                    {/* NEXT */}
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}

                    </div>
                </div>

                {/* DELETE MODAL */}
                {showDeleteModal && (
                    <DeleteSubjectModal
                        subject={deleteSubjectItem}
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
                        onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    />
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                            setLoading(true);
                            const res = await importSubjectsExcel(file);
                            showToast("Thành công", res || "Import hoàn tất");
                            loadSubjects();
                        } catch (err) {
                            console.error(err);
                            showToast("Lỗi", err.response?.data?.message || "Import thất bại", "danger");
                        } finally {
                            setLoading(false);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }
                    }}
                />
            </div>
        </MainLayout >
    );
};

export default AdminManageSubject;

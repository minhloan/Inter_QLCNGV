import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import DeleteModal from '../../components/Teacher/DeleteModal';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllSubjects, deleteSubject } from '../../api/subject';
import { listActiveSystems } from '../../api/subjectSystem';
import { getFile } from '../../api/file';

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

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const [hasLoaded, setHasLoaded] = useState(false);

    const [subjectImages, setSubjectImages] = useState({});

    const pageSize = 9;
    const [currentPage, setCurrentPage] = useState(1);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    const mapSubjectResponse = (response) => {
        const mappedSubjects = (response || []).map((s) => ({
            id: s.id,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,

            hours: s.hours,
            semester: s.semester,
            semesterLabel:
                s.semester === "SEMESTER_1" ? "Học kỳ 1" :
                    s.semester === "SEMESTER_2" ? "Học kỳ 2" :
                        s.semester === "SEMESTER_3" ? "Học kỳ 3" :
                            s.semester === "SEMESTER_4" ? "Học kỳ 4" :
                                "",

            systemId: s.systemId || s.system?.id || "",
            systemName: s.systemName || s.system?.systemName || "Unknown system",

            isActive: s.isActive,
            status: s.isActive ? "active" : "inactive",

            imageFileId: s.imageFileId || s.image_subject?.id || null
        }));

        setAllSubjects(mappedSubjects);
    };

    // ⭐ LOAD ALL SYSTEMS
    useEffect(() => {
        const loadSystems = async () => {
            try {
                const res = await listActiveSystems();
                setSystemOptions(res);
            } catch (err) {
                console.error("Error loading systems:", err);
            }
        };
        loadSystems();
    }, []);

    // ⭐ LOAD ALL SUBJECTS
    const loadSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllSubjects();
            mapSubjectResponse(response);
            setHasLoaded(true);
        } catch (error) {
            console.error('Error loading subjects:', error);
            showToast('Lỗi', 'Không thể tải danh sách môn học', 'danger');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (!hasLoaded) loadSubjects();
    }, [hasLoaded, loadSubjects]);

    // ⭐ LOAD IMAGES
    useEffect(() => {
        const fetchImages = async () => {
            const newImages = {};

            await Promise.all(
                allSubjects.map(async (s) => {
                    if (!s.imageFileId) return;
                    try {
                        const url = await getFile(s.imageFileId);
                        newImages[s.id] = url;
                    } catch { }
                })
            );

            setSubjectImages(newImages);
        };

        if (allSubjects.length > 0) fetchImages();
    }, [allSubjects]);

    // ⭐ FILTER + SORT
    const filteredSubjects = useMemo(() => {
        let filtered = [...allSubjects];

        if (systemFilter)
            filtered = filtered.filter((s) => s.systemId === systemFilter);

        if (statusFilter)
            filtered = filtered.filter((s) => s.status === statusFilter);

        if (searchTerm.trim()) {
            const kw = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.subjectCode?.toLowerCase().includes(kw) ||
                    s.subjectName?.toLowerCase().includes(kw)
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'code_asc': return a.subjectCode.localeCompare(b.subjectCode);
                case 'code_desc': return b.subjectCode.localeCompare(a.subjectCode);
                case 'name_asc': return a.subjectName.localeCompare(b.subjectName);
                case 'name_desc': return b.subjectName.localeCompare(a.subjectName);
                default: return 0;
            }
        });

        return filtered;
    }, [allSubjects, systemFilter, statusFilter, searchTerm, sortBy]);

    const totalPages = Math.ceil(filteredSubjects.length / pageSize);
    const pageSubjects = filteredSubjects.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleAdd = () => navigate('/manage-subject-add');
    const handleGoToSystems = () => navigate('/manage-subject-systems');
    const handleEdit = (s) => navigate(`/manage-subject-edit/${s.id}`);

    const handleDelete = (s) => {
        setDeleteSubjectItem(s);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteSubjectItem) return;

        try {
            setLoading(true);
            await deleteSubject(deleteSubjectItem.id);
            showToast("Thành công", "Xóa môn học thành công", "success");
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
                        <button onClick={handleGoToSystems} className="btn btn-outline-primary me-2">
                            <i className="bi bi-diagram-3"></i> Trang Hệ Đào Tạo
                        </button>
                        <button onClick={handleAdd} className="btn btn-primary">
                            <i className="bi bi-plus-circle"></i> Thêm Môn Học
                        </button>
                    </div>
                </div>
                <p className="page-subtitle subject-count">
                    Tổng số môn học: {filteredSubjects.length}
                </p>

                {loading && <Loading fullscreen={true} message="Đang tải..." />}

                <div className="filter-table-wrapper">
                    {/* FILTERS */}
                    <div className="filter-section">
                        <div className="filter-row">

                            {/* SYSTEM FILTER */}
                            <div className="filter-group">
                                <label className="filter-label">Hệ đào tạo</label>
                                <select
                                    className="filter-select"
                                    value={systemFilter}
                                    onChange={(e) => setSystemFilter(e.target.value)}
                                >
                                    <option value="">Tất cả hệ thống</option>

                                    {systemOptions.map((sys) => (
                                        <option key={sys.id} value={sys.id}>
                                            {sys.systemName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* STATUS FILTER */}
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

                            {/* RESET */}
                            <div className="filter-group">
                                <button className="btn btn-secondary w-100" onClick={handleReset}>
                                    <i className="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        {/* COURSES GRID */}
                        <div className="courses-grid">
                            {pageSubjects.map((subject) => {
                                const imageUrl = subjectImages[subject.id];

                                return (
                                    <div
                                        key={subject.id}
                                        className="course-card"
                                        onClick={() => handleEdit(subject)}
                                    >
                                        {/* IMAGE */}
                                        <div className="course-image">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="img" />
                                            ) : (
                                                <div className="placeholder"></div>
                                            )}
                                        </div>

                                        {/* BODY */}
                                        <div className="course-card-body">
                                            <h3>{subject.subjectName}</h3>
                                            <p>
                                                {subject.subjectCode} • {subject.hours} giờ • {subject.semesterLabel} •{" "}
                                                {subject.systemName}
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
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                        >
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

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
                    <DeleteModal
                        teacher={deleteSubjectItem}
                        onConfirm={confirmDelete}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setDeleteSubjectItem(null);
                        }}
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
            </div>
        </MainLayout>
    );
};

export default AdminManageSubject;

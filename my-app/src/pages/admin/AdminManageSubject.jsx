import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import DeleteModal from '../../components/Teacher/DeleteModal';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllSubjects, deleteSubject } from '../../api/subject';
import { getFile } from '../../api/file';

const AdminManageSubject = () => {
    const navigate = useNavigate();

    const [allSubjects, setAllSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [systemFilter, setSystemFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('code_asc');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSubjectItem, setDeleteSubjectItem] = useState(null);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info',
    });
    const [hasLoaded, setHasLoaded] = useState(false);

    const [subjectImages, setSubjectImages] = useState({});

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }, []);

    // MAP RESPONSE
    const mapSubjectResponse = (response) => {
        const mappedSubjects = (response || []).map((subject) => ({
            id: subject.id,
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            credit: subject.credit,
            system: subject.system,
            isActive: subject.isActive,
            status: subject.isActive ? 'active' : 'inactive',
            imageFileId:
                subject.imageFileId ||
                subject.image_subject?.id ||
                null,
        }));

        setAllSubjects(mappedSubjects);
    };

    // LOAD ALL SUBJECTS
    const loadSubjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllSubjects();
            mapSubjectResponse(response);
            setHasLoaded(true);
        } catch (error) {
            console.error('Error loading subjects:', error);
            showToast('Lỗi', 'Không thể tải danh sách môn học', 'danger');
            setAllSubjects([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // LOAD IMAGES
    useEffect(() => {
        const fetchImages = async () => {
            if (!allSubjects || allSubjects.length === 0) {
                setSubjectImages({});
                return;
            }

            const newImages = {};

            await Promise.all(
                allSubjects.map(async (sub) => {
                    if (!sub.imageFileId) return;
                    try {
                        const blobUrl = await getFile(sub.imageFileId);
                        newImages[sub.id] = blobUrl;
                    } catch (error) {
                        if (error.response?.status !== 404) {
                            console.error('Error loading subject image:', error);
                        }
                    }
                })
            );

            setSubjectImages(newImages);
        };

        fetchImages();
    }, [allSubjects]);

    // LOAD ONCE
    useEffect(() => {
        if (!hasLoaded) {
            loadSubjects();
        }
    }, [hasLoaded, loadSubjects]);

    // FILTER + SORT
    const filteredSubjects = useMemo(() => {
        if (allSubjects.length === 0) return [];

        let filtered = [...allSubjects];

        if (systemFilter) filtered = filtered.filter((sub) => sub.system === systemFilter);
        if (statusFilter) filtered = filtered.filter((sub) => sub.status === statusFilter);

        if (searchTerm.trim()) {
            const kw = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (sub) =>
                    (sub.subjectCode || '').toLowerCase().includes(kw) ||
                    (sub.subjectName || '').toLowerCase().includes(kw)
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'code_asc': return (a.subjectCode || '').localeCompare(b.subjectCode || '');
                case 'code_desc': return (b.subjectCode || '').localeCompare(a.subjectCode || '');
                case 'name_asc': return (a.subjectName || '').localeCompare(b.subjectName || '');
                case 'name_desc': return (b.subjectName || '').localeCompare(a.subjectName || '');
                default: return 0;
            }
        });

        return filtered;
    }, [allSubjects, systemFilter, statusFilter, searchTerm, sortBy]);

    // RESET PAGE WHEN FILTER CHANGES
    useEffect(() => setCurrentPage(1), [
        systemFilter,
        statusFilter,
        searchTerm,
        sortBy
    ]);

    // PAGINATED SUBJECTS
    const totalPages = Math.ceil(filteredSubjects.length / pageSize);

    const pageSubjects = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSubjects.slice(start, start + pageSize);
    }, [filteredSubjects, currentPage]);

    // ACTIONS
    const handleAdd = () => navigate('/manage-subject-add');
    const handleEdit = (subject) => navigate(`/manage-subject-edit/${subject.id}`);

    const handleDelete = (subject) => {
        setDeleteSubjectItem(subject);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteSubjectItem) return;

        try {
            setLoading(true);
            await deleteSubject(deleteSubjectItem.id);
            showToast('Thành công', 'Xóa môn học thành công', 'success');
            setShowDeleteModal(false);
            setDeleteSubjectItem(null);
            await loadSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            showToast(
                'Lỗi',
                error.response?.data?.message || 'Không thể xóa môn học',
                'danger'
            );
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

    const getGradientForSubject = (subject) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        ];
        if (!subject.subjectCode) return colors[0];
        const index = subject.subjectCode.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <MainLayout>
            <div className="content-header">
                <div className="content-title">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="page-title">
                        Admin Courses ({filteredSubjects.length})
                    </h1>
                </div>
                <button onClick={handleAdd} className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i>
                    Thêm Môn Học
                </button>
            </div>

            {loading && <Loading fullscreen={true} message="Đang tải danh sách môn học..." />}

            {hasLoaded && !loading && (
                <>
                    {/* FILTER SECTION */}
                    <div className="filter-section">
                        <div className="filter-row">

                            {/* SYSTEM FILTER */}
                            <div className="filter-group">
                                <label className="filter-label">Select System</label>
                                <select
                                    className="filter-select"
                                    value={systemFilter}
                                    onChange={(e) => setSystemFilter(e.target.value)}
                                >
                                    <option value="">Tất cả hệ thống</option>
                                    <option value="ACN_PRO_OV7096">ACN Pro OV 7096</option>
                                    <option value="ARENA_OV6899">Skill Arena OV 6899</option>
                                    <option value="APTECH_OV7091">Skill Aptech OV 7091</option>
                                    <option value="APTECH_OV7195">Skill Aptech OV 7195</option>
                                </select>
                            </div>

                            {/* STATUS FILTER */}
                            <div className="filter-group">
                                <label className="filter-label">Status</label>
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
                                <label className="filter-label">Search</label>
                                <div className="search-input-group">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Search by code or name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* RESET */}
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleReset}
                                    style={{ width: '100%' }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COURSES GRID */}
                    {pageSubjects.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <p>No courses found</p>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {pageSubjects.map((subject) => {
                                const imageUrl = subjectImages[subject.id];

                                return (
                                    <div
                                        key={subject.id}
                                        className="course-card"
                                        onClick={() => navigate(`/manage-subject-detail/${subject.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div
                                            className="course-image"
                                            style={{
                                                background: imageUrl ? 'transparent' : getGradientForSubject(subject),
                                            }}
                                        >
                                            {imageUrl && (
                                                <img
                                                    src={imageUrl}
                                                    alt={subject.subjectName || subject.subjectCode}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="course-card-body">
                                            <h3 className="course-title">
                                                {subject.subjectName || 'Unnamed Subject'}
                                            </h3>
                                            <p className="course-subtitle">
                                                {subject.subjectCode || 'N/A'} •{' '}
                                                {subject.credit != null
                                                    ? `${subject.credit} tín chỉ`
                                                    : 'No credit info'}{' '}
                                                • {subject.system || 'Unknown system'}
                                            </p>

                                            {/* ACTION BUTTONS */}
                                            <div className="action-buttons" style={{ marginTop: '8px' }}>
                                                <button
                                                    className="btn btn-sm btn-primary btn-action"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(subject);
                                                    }}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger btn-action"
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
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <nav aria-label="Page navigation" className="mt-4 mb-4">
                            <ul className="pagination justify-content-center">

                                {/* Previous */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>

                                {/* PAGE NUMBERS */}
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

                                {/* Next */}
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
                </>
            )}

            {showDeleteModal && deleteSubjectItem && (
                <DeleteModal
                    teacher={deleteSubjectItem}
                    onConfirm={confirmDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeleteSubjectItem(null);
                    }}
                />
            )}

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

export default AdminManageSubject;
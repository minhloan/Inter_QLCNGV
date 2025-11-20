import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import DeleteModal from '../../components/Teacher/DeleteModal';

import { getSubjectById, deleteSubject } from '../../api/subject';
import { getFile } from '../../api/file';

const AdminManageSubjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // ================== FORMATTERS ==================
    const formatSystem = (system) => {
        if (!system) return "Chưa có hệ đào tạo";
        return system.systemName || "Unknown";
    };

    const formatStatus = (isActive) =>
        isActive ? "Hoạt động" : "Không hoạt động";

    const formatSemester = (s) => {
        if (!s) return "Chưa có";
        switch (s) {
            case "SEMESTER_1": return "Học kỳ 1";
            case "SEMESTER_2": return "Học kỳ 2";
            case "SEMESTER_3": return "Học kỳ 3";
            case "SEMESTER_4": return "Học kỳ 4";
            default: return s;
        }
    };

    // ================= LOAD DATA =================
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const data = await getSubjectById(id);

                const mapped = {
                    id: data.id,
                    subjectCode: data.subjectCode,
                    subjectName: data.subjectName,

                    hours: data.hours,                   // ⭐ credit → hours
                    semester: data.semester,             // ⭐ thêm học kỳ

                    description: data.description,

                    system: {
                        id: data.systemId || null,
                        systemName: data.systemName || null
                    },

                    isActive: data.isActive,
                    imageFileId: data.imageFileId || null
                };

                setSubject(mapped);

                if (mapped.imageFileId) {
                    try {
                        const blobUrl = await getFile(mapped.imageFileId);
                        setImageUrl(blobUrl);
                    } catch {
                        setImageUrl(null);
                    }
                }
            } catch (error) {
                showToast(
                    "Lỗi",
                    error.response?.data?.message || "Không thể tải chi tiết môn học",
                    "danger"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id, showToast]);

    // ================= DELETE =================
    const handleEdit = () => navigate(`/manage-subject-edit/${subject.id}`);
    const handleDeleteClick = () => setShowDeleteModal(true);

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await deleteSubject(subject.id);
            showToast("Thành công", "Xóa môn học thành công", "success");
            navigate("/manage-subjects");
        } catch (error) {
            showToast("Lỗi", error.response?.data?.message || "Không thể xóa môn học", "danger");
        } finally {
            setLoading(false);
        }
    };

    // ================= LOADING =================
    if (loading) {
        return <Loading fullscreen={true} message="Đang tải chi tiết môn học..." />;
    }

    if (!subject) {
        return (
            <MainLayout>
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết môn học</h1>
                    </div>
                </div>
                <div className="empty-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>Không tìm thấy môn học</p>
                </div>
            </MainLayout>
        );
    }

    // ==================== UI ====================
    return (
        <MainLayout>

            {/* HEADER */}
            <div className="content-header">
                <div className="content-title">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h1 className="page-title">Chi tiết môn học</h1>
                </div>

                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={handleEdit}>
                        <i className="bi bi-pencil"></i> Sửa
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteClick} style={{ marginLeft: 8 }}>
                        <i className="bi bi-trash"></i> Xóa
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="edit-profile-container">
                <div className="edit-profile-content">

                    {/* LEFT COLUMN */}
                    <div className="edit-profile-main">
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN MÔN HỌC</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã môn học</label>
                                    <input type="text" className="form-control" value={subject.subjectCode} disabled />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tên môn học</label>
                                    <input type="text" className="form-control" value={subject.subjectName} disabled />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Số giờ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={subject.hours ?? "Chưa có"}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Học kỳ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formatSemester(subject.semester)}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Hệ đào tạo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formatSystem(subject.system)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formatStatus(subject.isActive)}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={subject.description || "Chưa có mô tả"}
                                    disabled
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN — IMAGE */}
                    <div className="edit-profile-sidebar">
                        <div className="image-upload-section">
                            <h3 className="section-title">ẢNH MÔN HỌC</h3>

                            <div className="image-placeholder profile-picture-placeholder">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={subject.subjectName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />
                                ) : (
                                    <i className="bi bi-book" style={{ fontSize: 40 }}></i>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    teacher={subject}
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
        </MainLayout>
    );
};

export default AdminManageSubjectDetail;

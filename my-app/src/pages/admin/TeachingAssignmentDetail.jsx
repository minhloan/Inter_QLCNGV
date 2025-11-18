import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getTeachingAssignmentById } from "../../api/teaching-assignments";

const statusMap = {
    ASSIGNED: { label: "ĐÃ PHÂN CÔNG", className: "info" },
    COMPLETED: { label: "HOÀN THÀNH", className: "success" },
    NOT_COMPLETED: { label: "CHƯA HOÀN THÀNH", className: "warning" },
    FAILED: { label: "THẤT BẠI", className: "danger" },
};

const TeachingAssignmentDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // /teaching-assignment-detail/:id

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "",
    });

    const [detail, setDetail] = useState(null);

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await getTeachingAssignmentById(id);
                setDetail(res);
            } catch (err) {
                console.error(err);
                showToast(
                    "Lỗi",
                    "Không thể tải chi tiết phân công giảng dạy.",
                    "danger"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        }
    }, [id]);

    const formatDateTime = (value) => {
        if (!value) return "—";
        try {
            return new Date(value).toLocaleString("vi-VN");
        } catch {
            return value;
        }
    };

    const renderStatusBadge = (status) => {
        if (!status) return null;
        const info =
            statusMap[status] || {
                label: status,
                className: "secondary",
            };

        return (
            <span className={`badge badge-status ${info.className}`}>
                <i className="bi bi-circle-fill me-1 small-dot" />
                {info.label}
            </span>
        );
    };

    return (
        <MainLayout>
            <div className="page-admin-teaching-assignment-detail page-align-with-form">
                <div className="content-header">
                    <div className="content-title">
                        <button
                            className="back-button"
                            onClick={() => navigate(-1)}
                            aria-label="Quay lại"
                        >
                            <i className="bi bi-arrow-left" />
                        </button>
                        <div>
                            <h1 className="page-title">Chi tiết phân công giảng dạy</h1>
                            {detail && (
                                <div className="status-wrapper">{renderStatusBadge(detail.status)}</div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/teaching-assignment-management")}
                    >
                        <i className="bi bi-list-ul me-2" />
                        Danh sách phân công
                    </button>
                </div>

                <div className="detail-card-grid">
                    {!detail ? (
                        <div className="detail-card text-center text-muted">
                            Đang tải dữ liệu phân công...
                        </div>
                    ) : (
                        <>
                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-person-badge" /> Giáo viên
                                    </h5>
                                </div>
                                <div className="detail-section-body">
                                    <div className="info-row">
                                        <span className="label">Tên</span>
                                        <strong>{detail.teacherName || "—"}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Mã GV</span>
                                        <span>{detail.teacherCode || "—"}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-book" /> Môn học & lớp
                                    </h5>
                                </div>
                                <div className="detail-section-body">
                                    <div className="info-row">
                                        <span className="label">Môn học</span>
                                        <strong>{detail.subjectName || "—"}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Mã lớp</span>
                                        <span>{detail.classCode || "—"}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Học kỳ</span>
                                        <span>{detail.quarterLabel || "—"}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Năm học</span>
                                        <span>{detail.year || "—"}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-card detail-card-wide">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-calendar-week" /> Thời khóa biểu
                                    </h5>
                                </div>
                                <div className="detail-section-body muted-box">
                                    {detail.scheduleText && detail.scheduleText.trim() !== ""
                                        ? detail.scheduleText
                                        : "Chưa có thông tin lịch học."}
                                </div>
                            </section>

                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-sticky" /> Ghi chú
                                    </h5>
                                </div>
                                <div className="detail-section-body note-box">
                                    {detail.notes && detail.notes.trim() !== ""
                                        ? detail.notes
                                        : "Không có ghi chú."}
                                </div>
                            </section>

                            <section className="detail-card">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-exclamation-triangle" /> Lý do thất bại
                                    </h5>
                                </div>
                                <div
                                    className={`detail-section-body note-box ${detail.status === "FAILED" ? "danger" : ""}`}
                                >
                                    {detail.failureReason && detail.failureReason.trim() !== ""
                                        ? detail.failureReason
                                        : "Không có lý do thất bại hoặc phân công không ở trạng thái THẤT BẠI."}
                                </div>
                            </section>

                            <section className="detail-card detail-card-wide">
                                <div className="detail-section-header">
                                    <h5>
                                        <i className="bi bi-clock-history" /> Thời gian
                                    </h5>
                                </div>
                                <div className="detail-section-body timeline-grid">
                                    <div>
                                        <span className="label">Thời điểm phân công</span>
                                        <div>{formatDateTime(detail.assignedAt)}</div>
                                    </div>
                                    <div>
                                        <span className="label">Thời điểm hoàn thành</span>
                                        <div>{formatDateTime(detail.completedAt)}</div>
                                    </div>
                                    <div>
                                        <span className="label">Cập nhật gần nhất</span>
                                        <div>{formatDateTime(detail.updatedAt)}</div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>

            {loading && <Loading />}

            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() =>
                        setToast((prev) => ({
                            ...prev,
                            show: false,
                        }))
                    }
                />
            )}
        </MainLayout>
    );
};

export default TeachingAssignmentDetail;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getTeachingAssignmentById } from "../../api/teaching-assignments";

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

    const cardStyle = {
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(20,20,20,0.05)",
        background: "#fff",
    };

    const pillStyle = {
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
    };

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

        let bg = "#ecf0f1";
        let color = "#2c3e50";
        let label = status;

        switch (status) {
            case "ASSIGNED":
                bg = "rgba(46, 204, 113, 0.12)";
                color = "#27ae60";
                label = "ĐÃ PHÂN CÔNG";
                break;
            case "COMPLETED":
                bg = "rgba(52, 152, 219, 0.15)";
                color = "#2980b9";
                label = "HOÀN THÀNH";
                break;
            case "NOT_COMPLETED":
                bg = "rgba(241, 196, 15, 0.15)";
                color = "#f39c12";
                label = "CHƯA HOÀN THÀNH";
                break;
            case "FAILED":
                bg = "rgba(231, 76, 60, 0.15)";
                color = "#e74c3c";
                label = "THẤT BẠI";
                break;
            default:
                label = status;
        }

        return (
            <span style={{ ...pillStyle, background: bg, color }}>
        <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />
                {label}
      </span>
        );
    };

    return (
        <MainLayout>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "none",
                        background: "#fff",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                        marginRight: 18,
                    }}
                    aria-label="back"
                >
                    <i className="bi bi-arrow-left" style={{ fontSize: 18 }} />
                </button>

                <div>
                    <h1 style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>
                        Chi tiết phân công giảng dạy
                    </h1>
                    {detail && (
                        <div style={{ marginTop: 6 }}>
                            {renderStatusBadge(detail.status)}
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 980 }}>
                    <div style={{ ...cardStyle, padding: 28 }}>
                        {!detail ? (
                            <div className="text-center text-muted">
                                Đang tải dữ liệu phân công...
                            </div>
                        ) : (
                            <>
                                {/* Thông tin chính */}
                                <div className="row gx-4">
                                    <div className="col-md-6 mb-4">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 16,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-person-badge" /> Giáo viên
                                        </h5>
                                        <div style={{ lineHeight: 1.8 }}>
                                            <div>
                                                <span className="text-muted">Tên: </span>
                                                <strong>{detail.teacherName}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted">Mã GV: </span>
                                                <span>{detail.teacherCode || "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 16,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-book" /> Môn học & lớp
                                        </h5>
                                        <div style={{ lineHeight: 1.8 }}>
                                            <div>
                                                <span className="text-muted">Môn học: </span>
                                                <strong>{detail.subjectName}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted">Mã lớp: </span>
                                                <span>{detail.classCode}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted">Học kỳ: </span>
                                                <span>{detail.quarterLabel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thời khóa biểu */}
                                    <div className="col-12 mb-4">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-calendar-week" /> Thời khóa biểu
                                        </h5>
                                        <div
                                            style={{
                                                borderRadius: 10,
                                                padding: 14,
                                                background: "#f8f9fa",
                                                fontSize: 14,
                                            }}
                                        >
                                            {detail.scheduleText && detail.scheduleText.trim() !== ""
                                                ? detail.scheduleText
                                                : "Chưa có thông tin lịch học."}
                                        </div>
                                    </div>

                                    {/* Ghi chú & Lý do thất bại */}
                                    <div className="col-md-6 mb-4">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-sticky" /> Ghi chú
                                        </h5>
                                        <div
                                            style={{
                                                borderRadius: 10,
                                                padding: 14,
                                                background: "#fdfdfd",
                                                border: "1px solid #eee",
                                                minHeight: 80,
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {detail.notes && detail.notes.trim() !== ""
                                                ? detail.notes
                                                : "Không có ghi chú."}
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-exclamation-triangle" /> Lý do thất bại
                                        </h5>
                                        <div
                                            style={{
                                                borderRadius: 10,
                                                padding: 14,
                                                background: "#fdf2f2",
                                                border: "1px solid #f5c6cb",
                                                minHeight: 80,
                                                whiteSpace: "pre-wrap",
                                                color: "#c0392b",
                                            }}
                                        >
                                            {detail.failureReason && detail.failureReason.trim() !== ""
                                                ? detail.failureReason
                                                : "Không có lý do thất bại hoặc phân công không ở trạng thái THẤT BẠI."}
                                        </div>
                                    </div>

                                    {/* Thời gian */}
                                    <div className="col-12">
                                        <h5
                                            style={{
                                                fontWeight: 700,
                                                marginBottom: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <i className="bi bi-clock-history" /> Thời gian
                                        </h5>
                                        <div
                                            className="row gx-3"
                                            style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}
                                        >
                                            <div className="col-md-4">
                                                <span className="text-muted">Thời điểm phân công: </span>
                                                <div>{formatDateTime(detail.assignedAt)}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <span className="text-muted">Thời điểm hoàn thành: </span>
                                                <div>{formatDateTime(detail.completedAt)}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <span className="text-muted">Năm học: </span>
                                                <div>{detail.year}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons dưới cùng */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 12,
                                        marginTop: 24,
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => navigate("/teaching-assignment-management")}
                                        style={{
                                            borderRadius: 10,
                                            padding: "10px 20px",
                                            border: "1px solid #ddd",
                                            background: "#f6f6f6",
                                        }}
                                    >
                                        <i className="bi bi-list-ul me-2" />
                                        Danh sách phân công
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
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

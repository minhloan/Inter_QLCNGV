import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Common/Loading";
import Toast from "../../components/Common/Toast";
import { getTeachingAssignmentById } from "../../api/teaching-assignments";

const statusMap = {
  ASSIGNED: { label: "ĐÃ PHÂN CÔNG", className: "info" },
  COMPLETED: { label: "HOÀN THÀNH", className: "success" },
  NOT_COMPLETED: { label: "CHƯA HOÀN THÀNH", className: "warning" },
  FAILED: { label: "THẤT BẠI", className: "danger" },
};

const TeacherTeachingAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });
  const [assignment, setAssignment] = useState(null);

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getTeachingAssignmentById(id);
        setAssignment(res);
      } catch (error) {
        console.error(error);
        showToast("Lỗi", "Không thể tải chi tiết phân công", "danger");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

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

  if (loading || !assignment) {
    return (
      <Loading
        fullscreen={true}
        message="Đang tải chi tiết phân công giảng dạy..."
      />
    );
  }

  return (
    <MainLayout>
      <div className="page-admin-teaching-assignment-detail page-align-with-form page-teacher-teaching-assignment-detail">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" />
            </button>
            <div>
              <h1 className="page-title">Chi tiết Phân công Giảng dạy</h1>
              <div className="status-wrapper">{renderStatusBadge(assignment.status)}</div>
            </div>
          </div>
        </div>

        <div className="detail-card-grid">
          <section className="detail-card">
            <div className="detail-section-header">
              <h5>
                <i className="bi bi-book" /> Thông tin môn học & lớp
              </h5>
            </div>
            <div className="detail-section-body">
              <div className="info-row">
                <span className="label">Môn học</span>
                <strong>{assignment.subjectName || "—"}</strong>
              </div>
              <div className="info-row">
                <span className="label">Lớp</span>
                <span>{assignment.classCode || "—"}</span>
              </div>
              <div className="info-row">
                <span className="label">Học kỳ</span>
                <span>{assignment.semester || "—"}</span>
              </div>
              <div className="info-row">
                <span className="label">Năm</span>
                <span>{assignment.year || "—"}</span>
              </div>
            </div>
          </section>

          <section className="detail-card detail-card-wide">
            <div className="detail-section-header">
              <h5>
                <i className="bi bi-calendar-week" /> Lịch học
              </h5>
            </div>
            <div className="detail-section-body muted-box">
              {assignment.schedule && assignment.schedule.trim() !== ""
                ? assignment.schedule
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
              {assignment.notes && assignment.notes.trim() !== ""
                ? assignment.notes
                : "Không có ghi chú."}
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-section-header">
              <h5>
                <i className="bi bi-exclamation-triangle" /> Lý do / Thất bại
              </h5>
            </div>
            <div
              className={`detail-section-body note-box ${
                assignment.status === "FAILED" ? "danger" : ""
              }`}
            >
              {assignment.failureReason && assignment.failureReason.trim() !== ""
                ? assignment.failureReason
                : "Không có lý do hoặc phân công không ở trạng thái THẤT BẠI."}
            </div>
          </section>
        </div>

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

export default TeacherTeachingAssignmentDetail;



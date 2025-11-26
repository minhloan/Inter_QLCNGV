import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Common/Loading";
import Toast from "../../components/Common/Toast";
import { getTeachingAssignmentById } from "../../api/teaching-assignments";
import { getAptechExamsByTeacherForAdmin } from "../../api/aptechExam";
import { getFile } from "../../api/file";

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
  const [aptechExams, setAptechExams] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certPage, setCertPage] = useState(1);
  const CERT_PAGE_SIZE = 10;

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

        // Load Aptech exams for this teacher to show certificates
        if (res?.teacherId) {
          try {
            setLoadingCertificates(true);
            const exams = await getAptechExamsByTeacherForAdmin(res.teacherId);
            // Ưu tiên hiển thị những kỳ thi cùng môn (nếu có), còn lại vẫn hiển thị đầy đủ
            const subjectName = res.subjectName;
            const prioritized = (exams || []).sort((a, b) => {
              const aMatch = subjectName && a.subjectName === subjectName ? 0 : 1;
              const bMatch = subjectName && b.subjectName === subjectName ? 0 : 1;
              return aMatch - bMatch;
            });
            setAptechExams(prioritized);
          } finally {
            setLoadingCertificates(false);
          }
        } else {
          setAptechExams([]);
        }
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

  const handleOpenFileById = async (fileId) => {
    if (!fileId) return;
    try {
      const url = await getFile(fileId);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      showToast("Lỗi", "Không thể mở file chứng nhận", "danger");
    }
  };

  const totalCertPages = Math.ceil(aptechExams.length / CERT_PAGE_SIZE) || 1;
  const currentCertPage = Math.min(certPage, totalCertPages);
  const certStart = (currentCertPage - 1) * CERT_PAGE_SIZE;
  const pagedExams = aptechExams.slice(certStart, certStart + CERT_PAGE_SIZE);

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

          {/* Aptech Certificates Section for assigned teacher */}
          <section className="detail-card detail-card-wide">
            <div className="detail-section-header">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0">
                  <i className="bi bi-award" /> Chứng nhận & Bằng Aptech của giảng viên
                </h5>
                {aptechExams.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowCertificates((prev) => !prev)}
                  >
                    <i
                      className={`bi ${
                        showCertificates ? "bi-chevron-up" : "bi-chevron-down"
                      } me-1`}
                    ></i>
                    {showCertificates ? "Thu gọn" : "Hiển thị danh sách"}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-section-body">
              {loadingCertificates ? (
                <p className="text-muted mb-0">Đang tải dữ liệu chứng chỉ...</p>
              ) : aptechExams.length === 0 ? (
                <p className="text-muted mb-0">
                  Chưa ghi nhận kỳ thi Aptech nào cho giảng viên này trong hệ thống.
                </p>
              ) : showCertificates ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped align-middle mb-2">
                      <thead>
                        <tr>
                          <th>Môn thi</th>
                          <th>Ngày thi</th>
                          <th>Lần thi</th>
                          <th>Điểm</th>
                          <th>Kết quả</th>
                          <th>Chứng nhận thi</th>
                          <th>Bằng Aptech</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedExams.map((exam) => (
                          <tr key={exam.id}>
                            <td className="text-break">
                              {(exam.subjectCode ? `${exam.subjectCode} - ` : "") +
                                (exam.subjectName || "")}
                            </td>
                            <td>{exam.examDate || ""}</td>
                            <td>{exam.attempt}</td>
                            <td>{exam.score != null ? exam.score : "—"}</td>
                            <td>{exam.result || "—"}</td>
                            <td>
                              {exam.examProofFileId ? (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleOpenFileById(exam.examProofFileId)}
                                >
                                  <i className="bi bi-file-earmark-richtext me-1" />
                                  Xem chứng nhận
                                </button>
                              ) : (
                                <span className="text-muted small">Không có</span>
                              )}
                            </td>
                            <td>
                              {exam.certificateFileId ? (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleOpenFileById(exam.certificateFileId)}
                                >
                                  <i className="bi bi-patch-check me-1" />
                                  Xem bằng
                                </button>
                              ) : (
                                <span className="text-muted small">Không có</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalCertPages > 1 && (
                    <nav aria-label="Aptech certificates pagination">
                      <ul className="pagination pagination-sm justify-content-end mb-0 flex-wrap">
                        <li className={`page-item ${currentCertPage === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() =>
                              setCertPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentCertPage === 1}
                          >
                            <i className="bi bi-chevron-left" />
                          </button>
                        </li>
                        {Array.from({ length: totalCertPages }).map((_, idx) => {
                          const page = idx + 1;
                          return (
                            <li
                              key={page}
                              className={`page-item ${
                                page === currentCertPage ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCertPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        })}
                        <li
                          className={`page-item ${
                            currentCertPage === totalCertPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCertPage((prev) =>
                                Math.min(totalCertPages, prev + 1)
                              )
                            }
                            disabled={currentCertPage === totalCertPages}
                          >
                            <i className="bi bi-chevron-right" />
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">
                  Có {aptechExams.length} lần thi Aptech. Bấm "Hiển thị danh sách" để xem chi tiết.
                </p>
              )}
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



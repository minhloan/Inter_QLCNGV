import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAllAptechExams, downloadCertificate, uploadCertificate, updateExamScore } from '../../api/aptechExam';

const AptechExamDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  const [score, setScore] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (exam) {
      setScore(exam.score ?? "");
      setResult(exam.result ?? "");
    }
  }, [exam]);

  const handleScoreKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveScore();
    }
  };

  const saveScore = async () => {
    try {
      await updateExamScore(id, Number(score), result);
      showToast('Thành công', 'Đã lưu điểm', 'success');
      // reload detail
      await loadExamDetail();
    } catch (err) {
      showToast('Lỗi', 'Lỗi khi lưu điểm', 'danger');
    }
  };

  const handleScoreChange = (e) => {
    let value = e.target.value;

    // Allow only numbers
    if (value === "") {
      setScore("");
      setResult("");
      return;
    }

    if (!/^\d+$/.test(value)) return; // prevent invalid input

    value = Number(value);
    if (value > 100) value = 100;
    if (value < 0) value = 0;

    setScore(value);

    if (value >= 80) setResult("PASS");
    else setResult("FAIL");
  };

  useEffect(() => {
    loadExamDetail();
  }, [id]);

  const loadExamDetail = async () => {
    try {
      setLoading(true);
      const exams = await getAllAptechExams();
      const examData = exams.find(e => e.id === id);
      setExam(examData);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải chi tiết kỳ thi', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await downloadCertificate(exam.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${exam.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Thành công', 'Chứng chỉ đã được tải xuống', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể tải chứng chỉ', 'danger');
    }
  };

  const handleUploadCertificate = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadCertificate(exam.id, file);
      showToast('Thành công', 'Chứng chỉ đã được tải lên', 'success');
      // Reload exam data
      loadExamDetail();
    } catch (error) {
      showToast('Lỗi', 'Không thể tải lên chứng chỉ', 'danger');
    } finally {
      setUploading(false);
    }
  };

  const renderStatusBadge = (result) => {
    if (!result) return null;
    const map = {
      PASS: { label: "Đạt", className: "success" },
      FAIL: { label: "Không đạt", className: "danger" },
    };
    const info = map[result] || { label: result, className: "warning" };
    return (
      <span className={`badge badge-status ${info.className}`}>
        <i className="bi bi-circle-fill me-1 small-dot" />
        {info.label}
      </span>
    );
  };

  const renderAptechStatusBadge = (status) => {
    if (!status) return null;
    const map = {
      APPROVED: { label: "ĐÃ DUYỆT", className: "success" },
      REJECTED: { label: "TỪ CHỐI", className: "danger" },
    };
    const info = map[status] || { label: "ĐỢI DUYỆT", className: "warning" };
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
              <h1 className="page-title">Chi tiết Kỳ thi Aptech</h1>
              {exam && (
                <div className="status-wrapper">{renderStatusBadge(exam.result)}</div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-list-ul me-2" />
            Danh sách kỳ thi
          </button>
        </div>

        <div className="detail-card-grid">
          {!exam ? (
            <div className="detail-card text-center text-muted">
              {loading ? 'Đang tải dữ liệu kỳ thi...' : 'Không tìm thấy kỳ thi'}
            </div>
          ) : (
            <>
              <section className="detail-card">
                <div className="detail-section-header">
                  <h5>
                    <i className="bi bi-calendar-event" /> Thông tin Kỳ thi
                  </h5>
                </div>
                <div className="detail-section-body">
                  <div className="info-row">
                    <span className="label">Phiên thi</span>
                    <span>{exam.sessionId || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày thi</span>
                    <span>{exam.examDate || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Giờ thi</span>
                    <span>{exam.examTime || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phòng thi</span>
                    <span>{exam.room || "—"}</span>
                  </div>
                </div>
              </section>

              <section className="detail-card">
                <div className="detail-section-header">
                  <h5>
                    <i className="bi bi-person-badge" /> Thông tin Giáo viên
                  </h5>
                </div>
                <div className="detail-section-body">
                  <div className="info-row">
                    <span className="label">Tên giảng viên</span>
                    <strong>{exam.teacherName || "—"}</strong>
                  </div>
                  <div className="info-row">
                    <span className="label">Môn thi</span>
                    <span>{exam.subjectName || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Điểm</span>
                    <div>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "200px", display: "inline-block" }}
                        min="0"
                        max="100"
                        value={score}
                        onChange={handleScoreChange}
                        onKeyDown={handleScoreKeyDown}
                        placeholder="Nhập điểm (0-100)"
                      />
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="label">Kết quả</span>
                    <div>{renderStatusBadge(result)}</div>
                  </div>
                  <div className="info-row">
                    <span className="label">Hiện trạng</span>
                    <div>{renderAptechStatusBadge(exam.aptechStatus)}</div>
                  </div>
                </div>
              </section>

              <section className="detail-card">
                <div className="detail-section-header">
                  <h5>
                    <i className="bi bi-sticky" /> Ghi chú
                  </h5>
                </div>
                <div className="detail-section-body note-box">
                  {exam.note && exam.note.trim() !== ""
                    ? exam.note
                    : "Không có ghi chú."}
                </div>
              </section>

              <section className="detail-card detail-card-wide">
                <div className="detail-section-header">
                  <h5>
                    <i className="bi bi-file-earmark-pdf" /> Tệp chứng chỉ
                  </h5>
                </div>
                <div className="detail-section-body">
                  <div className="info-row">
                    <span className="label">Chứng chỉ</span>
                    <div className="d-flex gap-2">
                      {exam.certificateFileId ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleDownloadCertificate}
                        >
                          <i className="bi bi-download"></i> Tải xuống
                        </button>
                      ) : (
                        <span className="text-muted">Chưa có chứng chỉ</span>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleUploadCertificate}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="certificate-upload"
                      />
                      <label htmlFor="certificate-upload" className="btn btn-sm btn-success">
                        <i className="bi bi-upload"></i> {uploading ? 'Đang tải...' : 'Tải lên'}
                      </label>
                    </div>
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
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </MainLayout>
  );
};

export default AptechExamDetail;

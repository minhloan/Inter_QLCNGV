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

  const getStatusBadge = (result) => {
    const map = {
      PASS: { label: "Đạt", class: "success" },
      FAIL: { label: "Không đạt", class: "danger" },
      null: { label: "Chờ thi", class: "warning" }
    };
    const status = map[result] || { label: "Chờ thi", class: "warning" };
    return <span className={`badge badge-status ${status.class}`}>{status.label}</span>;
  };

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải chi tiết kỳ thi..." />;
  }

  if (!exam) {
    return (
      <MainLayout>
        <div className="container-fluid">
{/*         <div className="page-trial-teaching-detail"> */}
          <div className="content-header d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <button className="back-button" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <h1 className="page-title mb-0">Chi tiết Kỳ thi Aptech</h1>
            </div>
          </div>
          <div className="text-center">
            <p>Không tìm thấy kỳ thi</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="content-header d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title mb-0">Chi tiết Kỳ thi Aptech</h1>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
              <div className="row mb-4">
                  <div className="col-md-6">
                      <h5>Thông tin Kỳ thi</h5>
                      <table className="table table-borderless">
                          <tbody>
                              <tr><td><strong>Phiên thi:</strong></td><td>{exam.sessionId || 'N/A'}</td></tr>
                              <tr><td><strong>Ngày thi:</strong></td><td>{exam.examDate || 'N/A'}</td></tr>
                              <tr><td><strong>Giờ thi:</strong></td><td>{exam.examTime || 'N/A'}</td></tr>
                              <tr><td><strong>Phòng thi:</strong></td><td>{exam.room || 'N/A'}</td></tr>
                              <tr><td><strong>Ghi chú:</strong></td><td>{exam.note || 'N/A'}</td></tr>
                          </tbody>
                      </table>
                  </div>
                  <div className="col-md-6">
                      <h5>Thông tin Giáo viên</h5>
                        <table className="table table-borderless">
                          <tbody>
                              <tr><td><strong>Tên giảng viên:</strong></td><td>{exam.teacherName || 'N/A'}</td></tr>
                              <tr><td><strong>Môn thi:</strong></td><td>{exam.subjectName || 'N/A'}</td></tr>
                              <tr>
                                <td className="fw-bold">Điểm</td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ width: "200px" }}
                                    min="0"
                                    max="100"
                                    value={score}
                                    onChange={handleScoreChange}
                                    onKeyDown={handleScoreKeyDown}
                                    placeholder="Nhập điểm (0-100)"
                                  />
                                </td>
                              </tr>

                              <tr>
                                <td className="fw-bold">Trạng thái</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      result === "PASS"
                                        ? "bg-success"
                                        : result === "FAIL"
                                        ? "bg-danger"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {result || "Chưa có"}
                                  </span>
                                </td>
                              </tr>

                              <tr><td><strong>Hiện trạng:</strong></td><td>
                                {exam.aptechStatus === 'APPROVED' ? (
                                  <span className="badge bg-success">ĐÃ DUYỆT</span>
                                ) : exam.aptechStatus === 'REJECTED' ? (
                                  <span className="badge bg-danger">TỪ CHỐI</span>
                                ) : (
                                  <span className="badge bg-warning">ĐỢI DUYỆT</span>
                                )}
                              </td></tr>
                          </tbody>
                        </table>
                  </div>
              </div>

              <div className="col-md-6">
                <h5 >Tệp chứng chỉ</h5>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-value">
                            {exam.certificateFileId ? (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={handleDownloadCertificate}
                                >
                                    <i className="bi bi-download"></i> Tải xuống
                                </button>
                            ) : (
                                    ' '
                                )}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-value">
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
                            </span>
                        </div>
                    </div>
              </div>
          </div>
        </div>
      </div>

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

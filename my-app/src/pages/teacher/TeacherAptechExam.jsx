import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getTeacherAptechExams, downloadCertificate } from '../../api/aptechExam';

const TeacherAptechExam = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [resultFilter, setResultFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exams, resultFilter]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await getTeacherAptechExams();
      setExams(data);
      setFilteredExams(data);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách kỳ thi', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exams];

    if (resultFilter) {
      filtered = filtered.filter(exam => exam.result === resultFilter);
    }

    setFilteredExams(filtered);
    setCurrentPage(1);
  };

  const handleDownloadCertificate = async (examId) => {
    try {
      const response = await downloadCertificate(examId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${examId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Thành công', 'Chứng chỉ đã được tải xuống', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể tải chứng chỉ', 'danger');
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getResultBadge = (result) => {
    const resultMap = {
      PASS: { label: 'ĐẠT', class: 'success' },
      FAIL: { label: 'KHÔNG ĐẠT', class: 'danger' }
    };
    const resultInfo = resultMap[result] || { label: result, class: 'secondary' };
    return <span className={`badge badge-status ${resultInfo.class}`}>{resultInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredExams.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageExams = filteredExams.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách kỳ thi Aptech..." />;
  }

  return (
    <MainLayout>
      <div className="page-teacher-aptech-exam">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Kỳ thi Aptech</h1>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/teacher/aptech-exam-add')}>
            <i className="bi bi-plus-circle"></i>
            Đăng ký thi
          </button>
        </div>

        <div className="filter-table-wrapper">
          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Kết quả</label>
                <select
                  className="filter-select"
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="PASS">Đạt</option>
                  <option value="FAIL">Không đạt</option>
                </select>
              </div>
              <div className="filter-group">
                <button className="btn btn-secondary" onClick={() => setResultFilter('')} style={{ width: '100%' }}>
                  <i className="bi bi-arrow-clockwise"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Exams Table */}
          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th width="25%">Môn thi</th>
                    <th width="12%">Ngày thi</th>
                    <th width="10%">Giờ thi</th>
                    <th width="10%">Phòng</th>
                    <th width="8%">Lần thi</th>
                    <th width="8%">Điểm</th>
                    <th width="10%">Kết quả</th>
                    <th width="12%" className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pageExams.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        <div className="empty-state">
                          <i className="bi bi-inbox"></i>
                          <p>Không tìm thấy kỳ thi nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageExams.map((exam, index) => (
                      <tr key={exam.id} className="fade-in">
                        <td>{startIndex + index + 1}</td>
                        <td>{exam.subjectName || 'N/A'}</td>
                        <td>{exam.examDate || 'N/A'}</td>
                        <td>{exam.examTime || 'N/A'}</td>
                        <td>{exam.room || 'N/A'}</td>
                        <td>{exam.attempt || 1}</td>
                        <td>
                          {exam.score !== null && exam.score !== undefined ? (
                            <span className={exam.score >= 80 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                              {exam.score}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{getResultBadge(exam.result)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            {exam.score == null ? (
                              <button
                                className="btn btn-sm btn-warning btn-action"
                                onClick={() => showToast('Thông tin', 'Bài thi chưa chấm điểm', 'info')}
                                title="Chưa chấm điểm"
                              >
                                <i className="bi bi-exclamation-circle"></i>
                              </button>
                            ) : (exam.score < 80) ? (
                              <button
                                className="btn btn-sm btn-warning btn-action"
                                onClick={() => showToast('Thông tin', 'Có thể đăng ký thi lại', 'info')}
                                title="Có thể đăng ký thi lại"
                              >
                                <i className="bi bi-exclamation-triangle"></i>
                              </button>
                            ) : (exam.score >= 80) ? (
                              exam.aptechStatus === 'PENDING' ? (
                                <button
                                  className="btn btn-sm btn-warning btn-action"
                                  onClick={() => showToast('Thông tin', 'Chứng chỉ bài thi chưa được phê duyệt', 'warning')}
                                  title="Chờ phê duyệt chứng chỉ"
                                >
                                  <i className="bi bi-hourglass-split"></i>
                                </button>
                              ) : exam.aptechStatus === 'REJECTED' ? (
                                <button
                                  className="btn btn-sm btn-danger btn-action"
                                  onClick={() => showToast('Lỗi', 'Bài thi bị từ chối cấp chứng chỉ', 'danger')}
                                  title="Bị từ chối cấp chứng chỉ"
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              ) : exam.aptechStatus === 'APPROVED' ? (
                                <button
                                  className="btn btn-sm btn-success btn-action"
                                  onClick={() => {
                                    if (exam.certificateFileId) {
                                      handleDownloadCertificate(exam.id);
                                    } else {
                                      showToast('Lỗi', 'Chưa có chứng chỉ để tải về', 'danger');
                                    }
                                  }}
                                  title="Tải chứng chỉ"
                                >
                                  <i className="bi bi-download"></i>
                                </button>
                              ) : null
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
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

export default TeacherAptechExam;

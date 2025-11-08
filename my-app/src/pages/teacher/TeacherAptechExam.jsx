import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';

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
      // Demo data - replace with actual API call
      const demoExams = [
        {
          id: 1,
          session_id: 1,
          subject_id: 1,
          subject_name: 'Elementary Programming in C-INTL',
          exam_date: '2024-02-15',
          exam_time: '09:00',
          room: 'Phòng 101',
          attempt: 1,
          score: 85,
          result: 'PASS',
          certificate_file_id: 1,
          certificate_path: '/certificates/cert_001.pdf',
          can_retake: false,
          retake_condition: null
        },
        {
          id: 2,
          session_id: 2,
          subject_id: 2,
          subject_name: 'Intelligent Data Management with SQL Server',
          exam_date: '2024-02-16',
          exam_time: '14:00',
          room: 'Phòng 102',
          attempt: 1,
          score: 72,
          result: 'PASS',
          certificate_file_id: 2,
          certificate_path: '/certificates/cert_002.pdf',
          can_retake: false,
          retake_condition: null
        },
        {
          id: 3,
          session_id: 3,
          subject_id: 3,
          subject_name: 'Elegant and Effective Website Design with UI and UX',
          exam_date: '2024-02-17',
          exam_time: '09:00',
          room: 'Phòng 101',
          attempt: 1,
          score: 65,
          result: 'FAIL',
          certificate_file_id: null,
          certificate_path: null,
          can_retake: true,
          retake_condition: 'Có thể thi lại sau 30 ngày'
        }
      ];
      
      setExams(demoExams);
      setFilteredExams(demoExams);
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

  const downloadCertificate = (examId) => {
    const exam = exams.find(e => e.id === examId);
    if (exam && exam.certificate_path) {
      showToast('Thành công', 'Đang tải chứng chỉ...', 'info');
      // Simulate download
      console.log(`Downloading certificate: ${exam.certificate_path}`);
    } else {
      showToast('Lỗi', 'Không tìm thấy chứng chỉ', 'danger');
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

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Kỳ thi Aptech</h1>
        </div>
      </div>

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
                    <td>{exam.subject_name || 'N/A'}</td>
                    <td>{exam.exam_date || 'N/A'}</td>
                    <td>{exam.exam_time || 'N/A'}</td>
                    <td>{exam.room || 'N/A'}</td>
                    <td>{exam.attempt || 1}</td>
                    <td>
                      {exam.score !== null && exam.score !== undefined ? (
                        <span className={exam.score >= 70 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {exam.score}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{getResultBadge(exam.result)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        {exam.result === 'PASS' && exam.certificate_path && (
                          <button
                            className="btn btn-sm btn-success btn-action"
                            onClick={() => downloadCertificate(exam.id)}
                            title="Tải chứng chỉ"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        )}
                        {exam.can_retake && (
                          <button
                            className="btn btn-sm btn-warning btn-action"
                            onClick={() => showToast('Thông tin', exam.retake_condition || 'Có thể thi lại', 'info')}
                            title="Điều kiện thi lại"
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>
                        )}
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


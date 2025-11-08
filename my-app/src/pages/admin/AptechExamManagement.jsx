import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const AptechExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exams, searchTerm, statusFilter]);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoExams = [
        {
          id: 1,
          teacher_code: 'GV001',
          teacher_name: 'Nguyễn Văn A',
          exam_date: '2024-02-15',
          exam_time: '09:00',
          location: 'Phòng 101',
          subject: 'Elementary Programming in C-INTL',
          score: 85,
          status: 'passed',
          notes: ''
        },
        {
          id: 2,
          teacher_code: 'GV002',
          teacher_name: 'Trần Thị B',
          exam_date: '2024-02-16',
          exam_time: '14:00',
          location: 'Phòng 102',
          subject: 'Intelligent Data Management with SQL Server',
          score: 72,
          status: 'passed',
          notes: ''
        },
        {
          id: 3,
          teacher_code: 'GV003',
          teacher_name: 'Lê Văn C',
          exam_date: '2024-02-17',
          exam_time: '09:00',
          location: 'Phòng 101',
          subject: 'Elegant and Effective Website Design with UI and UX',
          score: 65,
          status: 'failed',
          notes: 'Cần thi lại'
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exam =>
        (exam.teacher_name && exam.teacher_name.toLowerCase().includes(term)) ||
        (exam.teacher_code && exam.teacher_code.toLowerCase().includes(term)) ||
        (exam.subject && exam.subject.toLowerCase().includes(term))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    setFilteredExams(filtered);
    setCurrentPage(1);
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      passed: { label: 'Đạt', class: 'success' },
      failed: { label: 'Không đạt', class: 'danger' },
      pending: { label: 'Chờ thi', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredExams.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageExams = filteredExams.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách kỳ thi Aptech..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Quản lý Kỳ thi Aptech</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/aptech-exam-add')}>
          <i className="bi bi-plus-circle"></i>
          Thêm Kỳ thi
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Tìm kiếm</label>
            <div className="search-input-group">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="filter-input"
                placeholder="Tên giáo viên, mã giáo viên, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Trạng thái</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
              <option value="pending">Chờ thi</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }} style={{ width: '100%' }}>
              <i className="bi bi-arrow-clockwise"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="12%">Mã GV</th>
                <th width="18%">Tên Giáo viên</th>
                <th width="20%">Môn thi</th>
                <th width="12%">Ngày thi</th>
                <th width="10%">Giờ thi</th>
                <th width="8%">Điểm</th>
                <th width="10%">Trạng thái</th>
                <th width="5%" className="text-center">Thao tác</th>
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
                    <td><span className="teacher-code">{exam.teacher_code || 'N/A'}</span></td>
                    <td>{exam.teacher_name || 'N/A'}</td>
                    <td>{exam.subject || 'N/A'}</td>
                    <td>{exam.exam_date || 'N/A'}</td>
                    <td>{exam.exam_time || 'N/A'}</td>
                    <td>
                      {exam.score !== null && exam.score !== undefined ? (
                        <span className={exam.score >= 70 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {exam.score}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{getStatusBadge(exam.status)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-info btn-action"
                          onClick={() => navigate(`/aptech-exam-detail/${exam.id}`)}
                          title="Chi tiết"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
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

export default AptechExamManagement;


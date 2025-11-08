import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const TrialTeachingManagement = () => {
  const navigate = useNavigate();
  const [trials, setTrials] = useState([]);
  const [filteredTrials, setFilteredTrials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadTrials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trials, searchTerm, statusFilter]);

  const loadTrials = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoTrials = [
        {
          id: 1,
          teacher_code: 'GV001',
          teacher_name: 'Nguyễn Văn A',
          subject_id: 1,
          subject_name: 'Elementary Programming in C-INTL',
          trial_date: '2024-03-15',
          trial_time: '09:00',
          location: 'Phòng 201',
          evaluators: 'Nguyễn Thị X, Trần Văn Y',
          score: 8.5,
          status: 'passed',
          feedback: 'Giảng dạy tốt, có kiến thức vững',
          notes: ''
        },
        {
          id: 2,
          teacher_code: 'GV002',
          teacher_name: 'Trần Thị B',
          subject_id: 2,
          subject_name: 'Intelligent Data Management with SQL Server',
          trial_date: '2024-03-16',
          trial_time: '14:00',
          location: 'Phòng 202',
          evaluators: 'Lê Văn Z',
          score: 7.0,
          status: 'passed',
          feedback: 'Cần cải thiện phương pháp giảng dạy',
          notes: ''
        },
        {
          id: 3,
          teacher_code: 'GV003',
          teacher_name: 'Lê Văn C',
          subject_id: 3,
          subject_name: 'Elegant and Effective Website Design with UI and UX',
          trial_date: '2024-03-17',
          trial_time: '09:00',
          location: 'Phòng 201',
          evaluators: 'Nguyễn Thị X',
          score: 6.0,
          status: 'failed',
          feedback: 'Cần chuẩn bị kỹ hơn',
          notes: 'Yêu cầu giảng thử lại'
        }
      ];
      
      setTrials(demoTrials);
      setFilteredTrials(demoTrials);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách giảng thử', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trials];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trial =>
        (trial.teacher_name && trial.teacher_name.toLowerCase().includes(term)) ||
        (trial.teacher_code && trial.teacher_code.toLowerCase().includes(term)) ||
        (trial.subject_name && trial.subject_name.toLowerCase().includes(term))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(trial => trial.status === statusFilter);
    }

    setFilteredTrials(filtered);
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
      pending: { label: 'Chờ đánh giá', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredTrials.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageTrials = filteredTrials.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách giảng thử..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Quản lý Giảng thử</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/trial-teaching-add')}>
          <i className="bi bi-plus-circle"></i>
          Thêm Lịch Giảng thử
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
              <option value="pending">Chờ đánh giá</option>
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
                <th width="20%">Môn học</th>
                <th width="12%">Ngày giảng thử</th>
                <th width="10%">Giờ</th>
                <th width="8%">Điểm</th>
                <th width="10%">Trạng thái</th>
                <th width="5%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageTrials.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>Không tìm thấy giảng thử nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageTrials.map((trial, index) => (
                  <tr key={trial.id} className="fade-in">
                    <td>{startIndex + index + 1}</td>
                    <td><span className="teacher-code">{trial.teacher_code || 'N/A'}</span></td>
                    <td>{trial.teacher_name || 'N/A'}</td>
                    <td>{trial.subject_name || 'N/A'}</td>
                    <td>{trial.trial_date || 'N/A'}</td>
                    <td>{trial.trial_time || 'N/A'}</td>
                    <td>
                      {trial.score !== null && trial.score !== undefined ? (
                        <span className={trial.score >= 7 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {trial.score}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{getStatusBadge(trial.status)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-info btn-action"
                          onClick={() => navigate(`/trial-teaching-detail/${trial.id}`)}
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

export default TrialTeachingManagement;


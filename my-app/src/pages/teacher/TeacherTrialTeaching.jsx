import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';

const TeacherTrialTeaching = () => {
  const navigate = useNavigate();
  const [trials, setTrials] = useState([]);
  const [filteredTrials, setFilteredTrials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadTrials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trials, statusFilter]);

  const loadTrials = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoTrials = [
        {
          id: 1,
          subject_id: 1,
          subject_name: 'Elementary Programming in C-INTL',
          teaching_date: '2024-03-15',
          location: 'Phòng 201',
          status: 'REVIEWED',
          aptech_exam_id: 1,
          score: 8.5,
          conclusion: 'PASS',
          comments: 'Giảng dạy tốt, có kiến thức vững',
          file_report_id: 1,
          file_report_path: '/reports/trial_001.pdf',
          attendees: [
            { name: 'Nguyễn Thị X', role: 'Chủ tọa' },
            { name: 'Trần Văn Y', role: 'Thư ký' }
          ]
        },
        {
          id: 2,
          subject_id: 2,
          subject_name: 'Intelligent Data Management with SQL Server',
          teaching_date: '2024-03-16',
          location: 'Phòng 202',
          status: 'REVIEWED',
          aptech_exam_id: 2,
          score: 7.0,
          conclusion: 'PASS',
          comments: 'Cần cải thiện phương pháp giảng dạy',
          file_report_id: 2,
          file_report_path: '/reports/trial_002.pdf',
          attendees: [
            { name: 'Lê Văn Z', role: 'Chủ tọa' }
          ]
        },
        {
          id: 3,
          subject_id: 3,
          subject_name: 'Elegant and Effective Website Design with UI and UX',
          teaching_date: '2024-03-17',
          location: 'Phòng 201',
          status: 'PENDING',
          aptech_exam_id: null,
          score: null,
          conclusion: null,
          comments: null,
          file_report_id: null,
          file_report_path: null,
          attendees: []
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

    if (statusFilter) {
      filtered = filtered.filter(trial => trial.status === statusFilter);
    }

    setFilteredTrials(filtered);
    setCurrentPage(1);
  };

  const downloadReport = (trialId) => {
    const trial = trials.find(t => t.id === trialId);
    if (trial && trial.file_report_path) {
      showToast('Thành công', 'Đang tải biên bản...', 'info');
      // Simulate download
      console.log(`Downloading report: ${trial.file_report_path}`);
    } else {
      showToast('Lỗi', 'Biên bản chưa có sẵn', 'warning');
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ đánh giá', class: 'warning' },
      REVIEWED: { label: 'Đã đánh giá', class: 'info' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getConclusionBadge = (conclusion) => {
    if (!conclusion) return '-';
    const conclusionMap = {
      PASS: { label: 'ĐẠT', class: 'success' },
      FAIL: { label: 'KHÔNG ĐẠT', class: 'danger' }
    };
    const conclusionInfo = conclusionMap[conclusion] || { label: conclusion, class: 'secondary' };
    return <span className={`badge badge-status ${conclusionInfo.class}`}>{conclusionInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredTrials.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageTrials = filteredTrials.slice(startIndex, startIndex + pageSize);

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Giảng thử</h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Trạng thái</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ đánh giá</option>
              <option value="REVIEWED">Đã đánh giá</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary" onClick={() => setStatusFilter('')} style={{ width: '100%' }}>
              <i className="bi bi-arrow-clockwise"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Trials Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="25%">Môn học</th>
                <th width="12%">Ngày giảng thử</th>
                <th width="10%">Địa điểm</th>
                <th width="8%">Điểm</th>
                <th width="10%">Trạng thái</th>
                <th width="10%">Kết luận</th>
                <th width="10%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageTrials.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
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
                    <td>{trial.subject_name || 'N/A'}</td>
                    <td>{trial.teaching_date || 'N/A'}</td>
                    <td>{trial.location || 'N/A'}</td>
                    <td>
                      {trial.score !== null && trial.score !== undefined ? (
                        <span className={trial.score >= 7 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {trial.score}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{getStatusBadge(trial.status)}</td>
                    <td>{getConclusionBadge(trial.conclusion)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        {trial.status === 'REVIEWED' && trial.file_report_path && (
                          <button
                            className="btn btn-sm btn-info btn-action"
                            onClick={() => downloadReport(trial.id)}
                            title="Xem biên bản"
                          >
                            <i className="bi bi-file-text"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-primary btn-action"
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

export default TeacherTrialTeaching;


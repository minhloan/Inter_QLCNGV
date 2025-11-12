import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const TeacherTeachingAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, statusFilter, yearFilter]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoAssignments = [
        {
          id: 1,
          subject_id: 1,
          subject_name: 'Elementary Programming in C-INTL',
          year: 2024,
          quarter: 1,
          status: 'ASSIGNED',
          failure_reason: null,
          assigned_at: '2024-01-20',
          completed_at: null,
          notes: '',
          missing_requirements: []
        },
        {
          id: 2,
          subject_id: 2,
          subject_name: 'Intelligent Data Management with SQL Server',
          year: 2024,
          quarter: 1,
          status: 'COMPLETED',
          failure_reason: null,
          assigned_at: '2024-01-20',
          completed_at: '2024-05-31',
          notes: '',
          missing_requirements: []
        },
        {
          id: 3,
          subject_id: 3,
          subject_name: 'Elegant and Effective Website Design with UI and UX',
          year: 2024,
          quarter: 2,
          status: 'FAILED',
          failure_reason: 'Chưa đủ điều kiện: Thi Aptech chưa đạt, Giảng thử chưa đạt',
          assigned_at: null,
          completed_at: null,
          notes: '',
          missing_requirements: [
            'Thi Aptech chưa đạt',
            'Giảng thử chưa đạt'
          ]
        }
      ];
      
      setAssignments(demoAssignments);
      setFilteredAssignments(demoAssignments);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách phân công', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignments];

    if (statusFilter) {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(assignment => assignment.year === parseInt(yearFilter));
    }

    setFilteredAssignments(filtered);
    setCurrentPage(1);
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ASSIGNED: { label: 'Đã phân công', class: 'info' },
      COMPLETED: { label: 'Hoàn thành', class: 'success' },
      NOT_COMPLETED: { label: 'Chưa hoàn thành', class: 'warning' },
      FAILED: { label: 'Thất bại', class: 'danger' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredAssignments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageAssignments = filteredAssignments.slice(startIndex, startIndex + pageSize);
  const currentYear = new Date().getFullYear();

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách phân công giảng dạy..." />;
  }

  return (
    <MainLayout>
      <div className="page-teacher-teaching-assignment">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Phân công Giảng dạy</h1>
          </div>
        </div>

        <div className="filter-table-wrapper">
          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Năm</label>
                <select
                  className="filter-select"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Trạng thái</label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="ASSIGNED">Đã phân công</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="NOT_COMPLETED">Chưa hoàn thành</option>
                  <option value="FAILED">Thất bại</option>
                </select>
              </div>
              <div className="filter-group">
                <button className="btn btn-secondary" onClick={() => {
                  setStatusFilter('');
                  setYearFilter('');
                }} style={{ width: '100%' }}>
                  <i className="bi bi-arrow-clockwise"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th width="30%">Môn học</th>
                    <th width="10%">Năm</th>
                    <th width="10%">Quý</th>
                    <th width="15%">Ngày phân công</th>
                    <th width="10%">Trạng thái</th>
                    <th width="20%">Ghi chú / Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {pageAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="empty-state">
                          <i className="bi bi-inbox"></i>
                          <p>Không tìm thấy phân công nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageAssignments.map((assignment, index) => (
                      <tr key={assignment.id} className="fade-in">
                        <td>{startIndex + index + 1}</td>
                        <td>{assignment.subject_name || 'N/A'}</td>
                        <td>{assignment.year || 'N/A'}</td>
                        <td>Q{assignment.quarter || 'N/A'}</td>
                        <td>{assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString('vi-VN') : '-'}</td>
                        <td>{getStatusBadge(assignment.status)}</td>
                        <td>
                          {assignment.status === 'FAILED' && assignment.failure_reason && (
                            <div>
                              <div className="text-danger" style={{ fontSize: '12px', marginBottom: '5px' }}>
                                <i className="bi bi-exclamation-triangle"></i> {assignment.failure_reason}
                              </div>
                              {assignment.missing_requirements && assignment.missing_requirements.length > 0 && (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  <strong>Yêu cầu còn thiếu:</strong>
                                  <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                    {assignment.missing_requirements.map((req, idx) => (
                                      <li key={idx}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          {assignment.status === 'COMPLETED' && assignment.completed_at && (
                            <div className="text-success" style={{ fontSize: '12px' }}>
                              <i className="bi bi-check-circle"></i> Hoàn thành: {new Date(assignment.completed_at).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                          {assignment.notes && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {assignment.notes}
                            </div>
                          )}
                          {!assignment.failure_reason && !assignment.completed_at && !assignment.notes && '-'}
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

export default TeacherTeachingAssignment;


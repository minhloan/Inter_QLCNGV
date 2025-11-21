import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getMyTeachingAssignments, updateTeachingAssignmentStatus } from '../../api/teaching-assignments';

const TeacherTeachingAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, yearFilter, keyword]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await getMyTeachingAssignments({
        page: currentPage - 1,
        size: pageSize,
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        year: yearFilter ? parseInt(yearFilter, 10) : undefined,
      });

      setAssignments(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách phân công', 'danger');
    } finally {
      setLoading(false);
    }
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
    return (
      <span className={`badge badge-status bg-${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentYear = new Date().getFullYear();

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách phân công giảng dạy..." />;
  }

  return (
    <MainLayout>
      <div className="page-admin-trial page-teacher-teaching-assignment">
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
                <label className="filter-label">Tìm kiếm</label>
                <div className="search-input-group">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Môn học, mã lớp..."
                    value={keyword}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setKeyword(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Năm</label>
                <select
                  className="filter-select"
                  value={yearFilter}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setYearFilter(e.target.value);
                  }}
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
                  onChange={(e) => {
                    setCurrentPage(1);
                    setStatusFilter(e.target.value);
                  }}
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
                  setKeyword('');
                  setCurrentPage(1);
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
                    <th width="25%">Môn học</th>
                    <th width="15%">Lớp</th>
                    <th width="15%">Học kỳ</th>
                    <th width="20%">Lịch học</th>
                    <th width="10%">Trạng thái</th>
                    <th width="10%" className="text-center">Chi tiết</th>
                    <th width="20%">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="empty-state">
                          <i className="bi bi-inbox"></i>
                          <p>Không tìm thấy phân công nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment, index) => (
                      <tr key={assignment.id} className="fade-in">
                        <td>{startIndex + index + 1}</td>
                        <td>{assignment.subjectName || 'N/A'}</td>
                        <td>{assignment.classCode || 'N/A'}</td>
                        <td>{assignment.semester || 'N/A'}</td>
                        <td>{assignment.schedule || '-'}</td>
                        <td>{getStatusBadge(assignment.status)}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => navigate(`/teacher-teaching-assignment-detail/${assignment.id}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </td>
                        <td>
                          {(assignment.status === 'ASSIGNED' || assignment.status === 'NOT_COMPLETED') && (
                            <div className="action-buttons icon-buttons">
                              <button
                                className="btn btn-sm btn-success btn-icon"
                                title="Đánh dấu hoàn thành"
                                aria-label="Đánh dấu hoàn thành"
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    await updateTeachingAssignmentStatus(assignment.id, {
                                      status: 'COMPLETED',
                                    });
                                    showToast('Thành công', 'Đã cập nhật trạng thái HOÀN THÀNH', 'success');
                                    loadAssignments();
                                  } catch (error) {
                                    showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                <i className="bi bi-check2-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-warning btn-icon"
                                title="Đánh dấu chưa hoàn thành"
                                aria-label="Đánh dấu chưa hoàn thành"
                                onClick={async () => {
                                  const reason = window.prompt('Nhập lý do chưa hoàn thành (tuỳ chọn):') || '';
                                  try {
                                    setLoading(true);
                                    await updateTeachingAssignmentStatus(assignment.id, {
                                      status: 'NOT_COMPLETED',
                                      failureReason: reason || undefined,
                                    });
                                    showToast('Thành công', 'Đã cập nhật trạng thái CHƯA HOÀN THÀNH', 'success');
                                    loadAssignments();
                                  } catch (error) {
                                    showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </div>
                          )}
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


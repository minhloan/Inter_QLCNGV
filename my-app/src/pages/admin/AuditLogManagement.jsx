import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getAuditLogs } from '../../api/auditLog';

const AuditLogManagement = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage,submittedSearchTerm]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs(currentPage, pageSize, submittedSearchTerm || null);
      setAuditLogs(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      showToast('Lỗi', 'Không thể tải danh sách nhật ký hoạt động', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
        e.preventDefault();
        // 1. Cập nhật từ khóa đã submit
        setSubmittedSearchTerm(searchTerm);

        // 2. Nếu đang ở trang 0, `setSubmittedSearchTerm` sẽ kích hoạt useEffect ở bước 3.
        //    Nếu ở trang khác, set page về 0, nó cũng sẽ kích hoạt useEffect.
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
  };

  const handleReset = () => {
        setSearchTerm('');
        setSubmittedSearchTerm('');
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
  };

  const handleRefresh = () => {
        loadAuditLogs();
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getTeacherName = (actorUser) => {
    if (!actorUser) return 'N/A';
    if (actorUser.userDetails) {
      const firstName = actorUser.userDetails.firstName || '';
      const lastName = actorUser.userDetails.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || actorUser.username || 'N/A';
    }
    return actorUser.username || actorUser.teacherCode || 'N/A';
  };

  const getTeacherCode = (actorUser) => {
    if (!actorUser) return 'N/A';
    return actorUser.teacherCode || 'N/A';
  };

  const formatAction = (action) => {
    const actionMap = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'DELETE': 'Xóa',
      'LOGIN': 'Đăng nhập',
      'LOGOUT': 'Đăng xuất',
      'UPLOAD': 'Tải lên',
      'DOWNLOAD': 'Tải xuống',
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'SUBMIT': 'Nộp',
      'VIEW': 'Xem'
    };
    return actionMap[action] || action;
  };

  const formatEntity = (entity) => {
    const entityMap = {
      'User': 'Người dùng',
      'Subject': 'Môn học',
      'SubjectRegistration': 'Đăng ký môn học',
      'AptechExam': 'Kỳ thi Aptech',
      'TrialTeaching': 'Giảng thử',
      'Evidence': 'Minh chứng',
      'TeachingAssignment': 'Phân công giảng dạy',
      'File': 'Tệp tin',
      'Report': 'Báo cáo'
    };
    return entityMap[entity] || entity;
  };

  const parseMetaJson = (metaJson) => {
    if (!metaJson) return null;
    try {
      return JSON.parse(metaJson);
    } catch (error) {
      return null;
    }
  };

  if (loading && auditLogs.length === 0) {
    return <Loading fullscreen={true} message="Đang tải nhật ký hoạt động..." />;
  }

  return (
    <MainLayout>
      <div className="page-admin-audit-log">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Nhật ký Hoạt động</h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className="bi bi-arrow-repeat"></i>
              Làm mới
            </button>
          </div>
        </div>

        <div className="filter-table-wrapper">
          <div className="filter-section">
            <form onSubmit={handleSearch} className="filter-row">
              <div className="filter-group" style={{ flex: 1 }}>
                <label className="filter-label">Tìm kiếm</label>
                <div className="search-input-group">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Tên giáo viên, mã giáo viên, hành động, thực thể..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-group">
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '25px' }}>
                  <i className="bi bi-search"></i>
                  Tìm kiếm
                </button>
              </div>
              <div className="filter-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{ width: '100%', marginTop: '25px' }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th width="12%">Mã GV</th>
                    <th width="15%">Tên Giáo viên</th>
                    <th width="12%">Hành động</th>
                    <th width="15%">Thực thể</th>
                    <th width="10%">ID Thực thể</th>
                    <th width="18%">Thời gian</th>
                    <th width="13%" className="text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="empty-state">
                          <i className="bi bi-inbox"></i>
                          <p>Không tìm thấy nhật ký hoạt động nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, index) => {
                      const meta = parseMetaJson(log.metaJson);
                      return (
                        <tr key={log.id} className="fade-in">
                          <td>{currentPage * pageSize + index + 1}</td>
                          <td><span className="teacher-code">{getTeacherCode(log.actorUser)}</span></td>
                          <td>{getTeacherName(log.actorUser)}</td>
                          <td>
                            <span className="badge badge-status info">
                              {formatAction(log.action)}
                            </span>
                          </td>
                          <td>{formatEntity(log.entity)}</td>
                          <td>
                            <span className="text-muted" style={{ fontSize: '12px' }}>
                              {log.entityId ? (log.entityId.length > 10 ? `${log.entityId.substring(0, 10)}...` : log.entityId) : 'N/A'}
                            </span>
                          </td>
                          <td>{formatDateTime(log.creationTimestamp)}</td>
                          <td className="text-center">
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-info btn-action"
                                onClick={() => {
                                  const details = {
                                    id: log.id,
                                    teacher: getTeacherName(log.actorUser),
                                    teacherCode: getTeacherCode(log.actorUser),
                                    action: formatAction(log.action),
                                    entity: formatEntity(log.entity),
                                    entityId: log.entityId,
                                    timestamp: formatDateTime(log.creationTimestamp),
                                    meta: meta
                                  };
                                  alert(`Chi tiết hoạt động:\n\n` +
                                    `Giáo viên: ${details.teacher} (${details.teacherCode})\n` +
                                    `Hành động: ${details.action}\n` +
                                    `Thực thể: ${details.entity}\n` +
                                    `ID Thực thể: ${details.entityId}\n` +
                                    `Thời gian: ${details.timestamp}\n` +
                                    (meta ? `\nThông tin bổ sung:\n${JSON.stringify(meta, null, 2)}` : ''));
                                }}
                                title="Xem chi tiết"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i;
                    if (page === 0 || page === totalPages - 1 || (page >= currentPage - 2 && page <= currentPage + 2)) {
                      return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(page)}>
                            {page + 1}
                          </button>
                        </li>
                      );
                    }
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                  <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            {totalElements > 0 && (
              <div className="text-center mt-3 text-muted" style={{ fontSize: '14px' }}>
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements} bản ghi
              </div>
            )}
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
      </div>
    </MainLayout>
  );
};

export default AuditLogManagement;


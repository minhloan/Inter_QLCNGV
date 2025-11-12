import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const EvidenceManagement = () => {
  const navigate = useNavigate();
  const [evidences, setEvidences] = useState([]);
  const [filteredEvidences, setFilteredEvidences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadEvidences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [evidences, searchTerm, typeFilter, statusFilter]);

  const loadEvidences = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoEvidences = [
        {
          id: 1,
          teacher_code: 'GV001',
          teacher_name: 'Nguyễn Văn A',
          evidence_type: 'degree',
          evidence_name: 'Bằng Đại học Công nghệ Thông tin',
          file_path: '/evidences/gv001_degree.pdf',
          ocr_text: 'Đại học Công nghệ Thông tin - Nguyễn Văn A - 2020',
          ocr_status: 'verified',
          uploaded_date: '2024-01-10',
          verified_date: '2024-01-12',
          status: 'approved',
          notes: ''
        },
        {
          id: 2,
          teacher_code: 'GV002',
          teacher_name: 'Trần Thị B',
          evidence_type: 'certificate',
          evidence_name: 'Chứng chỉ SQL Server',
          file_path: '/evidences/gv002_cert.pdf',
          ocr_text: 'Microsoft SQL Server Certification - Trần Thị B',
          ocr_status: 'pending',
          uploaded_date: '2024-01-15',
          verified_date: null,
          status: 'pending',
          notes: ''
        },
        {
          id: 3,
          teacher_code: 'GV003',
          teacher_name: 'Lê Văn C',
          evidence_type: 'experience',
          evidence_name: 'Giấy xác nhận kinh nghiệm',
          file_path: '/evidences/gv003_exp.pdf',
          ocr_text: 'Kinh nghiệm 5 năm - Lê Văn C',
          ocr_status: 'failed',
          uploaded_date: '2024-01-20',
          verified_date: null,
          status: 'rejected',
          notes: 'Chất lượng ảnh kém, không đọc được'
        }
      ];
      
      setEvidences(demoEvidences);
      setFilteredEvidences(demoEvidences);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách minh chứng', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...evidences];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(evidence =>
        (evidence.teacher_name && evidence.teacher_name.toLowerCase().includes(term)) ||
        (evidence.teacher_code && evidence.teacher_code.toLowerCase().includes(term)) ||
        (evidence.evidence_name && evidence.evidence_name.toLowerCase().includes(term))
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(evidence => evidence.evidence_type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(evidence => evidence.status === statusFilter);
    }

    setFilteredEvidences(filtered);
    setCurrentPage(1);
  };

  const handleVerifyOCR = async (evidenceId) => {
    try {
      setLoading(true);
      setEvidences(prev => prev.map(ev =>
        ev.id === evidenceId ? { ...ev, ocr_status: 'verified', verified_date: new Date().toISOString().split('T')[0] } : ev
      ));
      showToast('Thành công', 'Xác minh OCR thành công', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể xác minh OCR', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (evidenceId, newStatus) => {
    try {
      setLoading(true);
      setEvidences(prev => prev.map(ev =>
        ev.id === evidenceId ? { ...ev, status: newStatus } : ev
      ));
      showToast('Thành công', 'Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể cập nhật trạng thái', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      degree: 'Bằng cấp',
      certificate: 'Chứng chỉ',
      experience: 'Kinh nghiệm',
      other: 'Khác'
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { label: 'Đã duyệt', class: 'success' },
      rejected: { label: 'Từ chối', class: 'danger' },
      pending: { label: 'Chờ duyệt', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getOCRStatusBadge = (status) => {
    const statusMap = {
      verified: { label: 'Đã xác minh', class: 'success' },
      pending: { label: 'Chờ xác minh', class: 'warning' },
      failed: { label: 'Lỗi OCR', class: 'danger' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredEvidences.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageEvidences = filteredEvidences.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách minh chứng..." />;
  }

  return (
    <MainLayout>
      <div className="page-admin-evidence">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Quản lý Minh chứng & OCR</h1>
          </div>
        </div>

        <div className="filter-table-wrapper">
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Tìm kiếm</label>
                <div className="search-input-group">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Tên giáo viên, mã giáo viên, tên minh chứng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Loại minh chứng</label>
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="degree">Bằng cấp</option>
                  <option value="certificate">Chứng chỉ</option>
                  <option value="experience">Kinh nghiệm</option>
                  <option value="other">Khác</option>
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
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              </div>
              <div className="filter-group">
                <button className="btn btn-secondary" onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
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
                    <th width="15%">Loại</th>
                    <th width="20%">Tên Minh chứng</th>
                    <th width="10%">Trạng thái OCR</th>
                    <th width="10%">Trạng thái</th>
                    <th width="10%" className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEvidences.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="empty-state">
                          <i className="bi bi-inbox"></i>
                          <p>Không tìm thấy minh chứng nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageEvidences.map((evidence, index) => (
                      <tr key={evidence.id} className="fade-in">
                        <td>{startIndex + index + 1}</td>
                        <td><span className="teacher-code">{evidence.teacher_code || 'N/A'}</span></td>
                        <td>{evidence.teacher_name || 'N/A'}</td>
                        <td>{getTypeLabel(evidence.evidence_type)}</td>
                        <td>{evidence.evidence_name || 'N/A'}</td>
                        <td>{getOCRStatusBadge(evidence.ocr_status)}</td>
                        <td>{getStatusBadge(evidence.status)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            {evidence.ocr_status === 'pending' && (
                              <button
                                className="btn btn-sm btn-primary btn-action"
                                onClick={() => handleVerifyOCR(evidence.id)}
                                title="Xác minh OCR"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                            )}
                            {evidence.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success btn-action"
                                  onClick={() => handleStatusChange(evidence.id, 'approved')}
                                  title="Duyệt"
                                >
                                  <i className="bi bi-check"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger btn-action"
                                  onClick={() => handleStatusChange(evidence.id, 'rejected')}
                                  title="Từ chối"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-sm btn-info btn-action"
                              onClick={() => navigate(`/evidence-detail/${evidence.id}`)}
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

export default EvidenceManagement;


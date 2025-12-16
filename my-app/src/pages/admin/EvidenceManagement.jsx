import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getAllEvidences, 
  getEvidencesByStatus, 
  verifyEvidence, 
  updateOCRText,
  reprocessOCR
} from '../../api/evidence';

const EvidenceManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      let data = [];
      
      if (statusFilter) {
        data = await getEvidencesByStatus(statusFilter);
      } else {
        data = await getAllEvidences();
      }
      
      // Map API response to component format
      const mappedEvidences = (data || []).map(evidence => ({
        id: evidence.id,
        teacher_code: evidence.teacherId, // You may need to adjust this based on your API
        teacher_name: evidence.teacherName || 'N/A',
        evidence_type: 'certificate', // Default type, adjust as needed
        evidence_name: evidence.subjectName || 'Minh chứng',
        file_path: evidence.fileId,
        ocr_text: evidence.ocrText,
        ocr_status: evidence.ocrText ? 'verified' : 'pending',
        uploaded_date: evidence.submittedDate,
        verified_date: evidence.verifiedAt,
        status: evidence.status || 'PENDING',
        ocr_full_name: evidence.ocrFullName,
        ocr_evaluator: evidence.ocrEvaluator,
        ocr_result: evidence.ocrResult,
        notes: ''
      }));
      
      setEvidences(mappedEvidences);
      setFilteredEvidences(mappedEvidences);
    } catch (error) {
      console.error('Error loading evidences:', error);
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
      filtered = filtered.filter(evidence => evidence.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredEvidences(filtered);
    setCurrentPage(1);
  };

  const handleVerifyOCR = async (evidenceId) => {
    try {
      setLoading(true);
      // This would typically update OCR text manually if needed
      // For now, we'll just reload to get latest OCR status
      await loadEvidences();
      showToast('Thành công', 'Đã cập nhật trạng thái OCR', 'success');
    } catch (error) {
      console.error('Error verifying OCR:', error);
      showToast('Lỗi', 'Không thể xác minh OCR', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (evidenceId, newStatus) => {
    if (!user?.userId) {
      showToast('Lỗi', 'Không tìm thấy thông tin người dùng', 'danger');
      return;
    }

    try {
      setLoading(true);
      const approved = newStatus === 'approved' || newStatus === 'verified';
      await verifyEvidence(evidenceId, user.userId, approved);
      
      // Reload to get updated data
      await loadEvidences();
      showToast('Thành công', 'Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật trạng thái';
      showToast('Lỗi', errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReprocessOCR = async (evidenceId) => {
    try {
      setLoading(true);
      await reprocessOCR(evidenceId);
      showToast('Thành công', 'Đang xử lý OCR lại...', 'success');
      setTimeout(() => {
        loadEvidences();
      }, 2000);
    } catch (error) {
      console.error('Error reprocessing OCR:', error);
      showToast('Lỗi', 'Không thể xử lý OCR lại', 'danger');
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
    return typeMap[type] || 'Chứng chỉ';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      verified: { label: 'Đã xác minh', class: 'success' },
      rejected: { label: 'Từ chối', class: 'danger' },
      pending: { label: 'Chờ xác minh', class: 'warning' },
      approved: { label: 'Đã duyệt', class: 'success' }
    };
    const statusUpper = status?.toUpperCase();
    const statusInfo = statusMap[statusUpper?.toLowerCase()] || statusMap[status?.toLowerCase()] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getOCRStatusBadge = (evidence) => {
    if (evidence.ocr_text) {
      return <span className="badge badge-status success">Đã xác minh</span>;
    } else if (evidence.status === 'PENDING' || evidence.status === 'pending') {
      return <span className="badge badge-status warning">Chờ xác minh</span>;
    } else {
      return <span className="badge badge-status danger">Chưa có OCR</span>;
    }
  };

  const totalPages = Math.ceil(filteredEvidences.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageEvidences = filteredEvidences.slice(startIndex, startIndex + pageSize);

  if (loading && evidences.length === 0) {
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
                  <option value="VERIFIED">Đã xác minh</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="PENDING">Chờ xác minh</option>
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
                    {/*<th width="12%">Mã GV</th>*/}
                    <th width="20%">Tên Giáo viên</th>
                    <th width="17%">Loại</th>
                    <th width="22%">Tên Minh chứng</th>
                    <th width="12%">Trạng thái OCR</th>
                    <th width="12%">Trạng thái</th>
                    <th width="12%" className="text-center">Thao tác</th>
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
                        {/*<td><span className="teacher-code">{evidence.teacher_code || 'N/A'}</span></td>*/}
                        <td>{evidence.teacher_name || 'N/A'}</td>
                        <td>{getTypeLabel(evidence.evidence_type)}</td>
                        <td>{evidence.evidence_name || 'N/A'}</td>
                        <td>{getOCRStatusBadge(evidence)}</td>
                        <td>{getStatusBadge(evidence.status)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            {(evidence.status === 'PENDING' || evidence.status === 'pending') && (
                              <>
                                <button
                                  className="btn btn-sm btn-success btn-action"
                                  onClick={() => handleStatusChange(evidence.id, 'verified')}
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


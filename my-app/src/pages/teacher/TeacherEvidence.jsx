import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import {
  uploadEvidence,
  getEvidencesByTeacher,
  reprocessOCR
} from '../../api/evidence';
import { getAllSubjects } from '../../api/subject';

const TeacherEvidence = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const [evidences, setEvidences] = useState([]);
  const [filteredEvidences, setFilteredEvidences] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (user?.userId) {
      loadEvidences();
      loadSubjects();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [evidences, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSubjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadSubjects = async () => {
    try {
      const subjectsData = await getAllSubjects();
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadEvidences = async () => {
    if (!user?.userId) {
      return;
    }
    try {
      setLoading(true);
      const data = await getEvidencesByTeacher(user.userId);
      // Map API response to component format
      const mappedEvidences = (data || []).map(evidence => ({
        id: evidence.id,
        subject_id: evidence.subjectId,
        subject_name: evidence.subjectName || 'N/A',
        file_id: evidence.fileId,
        ocr_full_name: evidence.ocrFullName,
        ocr_evaluator: evidence.ocrEvaluator,
        ocr_result: evidence.ocrResult,
        ocr_text: evidence.ocrText,
        status: evidence.status,
        submitted_date: evidence.submittedDate,
        verified_at: evidence.verifiedAt
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

    if (statusFilter) {
      filtered = filtered.filter(evidence => evidence.status === statusFilter);
    }

    setFilteredEvidences(filtered);
    setCurrentPage(1);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast('Lỗi', 'Vui lòng chọn file', 'danger');
      return;
    }

    if (!user?.userId) {
      showToast('Lỗi', 'Không tìm thấy thông tin người dùng', 'danger');
      return;
    }

    try {
      setUploading(true);
      const submittedDate = new Date().toISOString().split('T')[0];
      
      // Upload evidence with OCR processing
      const response = await uploadEvidence(
        selectedFile,
        user.userId,
        selectedSubject || null,
        submittedDate
      );

      // Map response to component format
      const newEvidence = {
        id: response.id,
        subject_id: response.subjectId,
        subject_name: response.subjectName || 'N/A',
        file_id: response.fileId,
        ocr_full_name: response.ocrFullName,
        ocr_evaluator: response.ocrEvaluator,
        ocr_result: response.ocrResult,
        ocr_text: response.ocrText,
        status: response.status,
        submitted_date: response.submittedDate,
        verified_at: response.verifiedAt
      };

      // Add to list (will be at top after reload)
      setEvidences(prev => [newEvidence, ...prev]);
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedSubject('');
      showToast('Thành công', 'Upload minh chứng thành công. OCR đang được xử lý...', 'success');
      
      // Reload after a short delay to get OCR results
      setTimeout(() => {
        loadEvidences();
      }, 2000);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể upload minh chứng';
      showToast('Lỗi', errorMessage, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleReprocessOCR = async (evidenceId) => {
    try {
      setLoading(true);
      await reprocessOCR(evidenceId);
      showToast('Thành công', 'Đang xử lý OCR lại...', 'success');
      // Reload after a delay
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

  const getStatusBadge = (status) => {
    const statusMap = {
      VERIFIED: { label: 'Đã xác minh', class: 'success' },
      REJECTED: { label: 'Từ chối', class: 'danger' },
      PENDING: { label: 'Chờ xác minh', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const filteredSubjects = subjects.filter(subject =>
    (subject.subjectName || '').toLowerCase().includes(subjectSearch.toLowerCase()) ||
    (subject.subjectCode || '').toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const getSelectedSubjectName = () => {
    if (!selectedSubject) return '';
    const subject = subjects.find(s => String(s.id) === selectedSubject);
    return subject ? (subject.subjectName || subject.subjectCode) : '';
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setSubjectSearch('');
    setShowSubjectDropdown(false);
  };

  const handleSubjectSearchChange = (e) => {
    setSubjectSearch(e.target.value);
    setShowSubjectDropdown(true);
  };

  const totalPages = Math.ceil(filteredEvidences.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageEvidences = filteredEvidences.slice(startIndex, startIndex + pageSize);

  if (loading && evidences.length === 0) {
    return <Loading fullscreen={true} message="Đang tải danh sách minh chứng..." />;
  }

  return (
    <MainLayout>
      <div className="page-teacher-evidence">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Minh chứng</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <i className="bi bi-upload"></i>
            Upload Minh chứng
          </button>
        </div>

      <div className="filter-table-wrapper">
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
                <option value="VERIFIED">Đã xác minh</option>
                <option value="REJECTED">Từ chối</option>
                <option value="PENDING">Chờ xác minh</option>
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

        {/* Evidences Table */}
        <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="25%">Môn học</th>
                <th width="15%">Ngày nộp</th>
                <th width="15%">OCR - Họ tên</th>
                <th width="15%">OCR - Kết quả</th>
                <th width="10%">Trạng thái</th>
                <th width="15%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageEvidences.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
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
                    <td>{evidence.subject_name || 'N/A'}</td>
                    <td>{evidence.submitted_date || 'N/A'}</td>
                    <td>{evidence.ocr_full_name || '-'}</td>
                    <td>
                      {evidence.ocr_result ? (
                        <span className={`badge badge-status ${evidence.ocr_result === 'PASS' ? 'success' : 'danger'}`}>
                          {evidence.ocr_result === 'PASS' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{getStatusBadge(evidence.status)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-info btn-action"
                          onClick={() => navigate(`/evidence-detail/${evidence.id}`)}
                          title="Chi tiết & OCR"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '20px' }}>Upload Minh chứng</h3>
            <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
              <label className="form-label">Chọn Môn học (Tùy chọn)</label>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="-- Tìm kiếm môn học --"
                  value={selectedSubject ? getSelectedSubjectName() : subjectSearch}
                  onChange={handleSubjectSearchChange}
                  onFocus={() => setShowSubjectDropdown(true)}
                />
                {selectedSubject && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '2px 6px'
                    }}
                    onClick={() => {
                      setSelectedSubject('');
                      setSubjectSearch('');
                    }}
                    title="Xóa lựa chọn"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
                {showSubjectDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1001,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {filteredSubjects.length === 0 ? (
                      <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                        Không tìm thấy môn học nào
                      </div>
                    ) : (
                      filteredSubjects.map((subject) => (
                        <div
                          key={subject.id}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            background: selectedSubject === subject.id ? '#f8f9fa' : 'white'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubjectSelect(subject.id);
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.background = selectedSubject === subject.id ? '#f8f9fa' : 'white'}
                        >
                          <div style={{ fontWeight: 'bold' }}>
                            {subject.subjectName || subject.subjectCode}
                          </div>
                          {subject.subjectCode && subject.subjectName && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>
                              Mã: {subject.subjectCode}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Chọn File</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setSelectedSubject('');
                setSubjectSearch('');
                setShowSubjectDropdown(false);
              }}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Đang upload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
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

export default TeacherEvidence;


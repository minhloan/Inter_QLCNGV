import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const TeacherSubjectRegistration = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [quarterFilter, setQuarterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadRegistrations();
    loadAvailableSubjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [registrations, yearFilter, quarterFilter, statusFilter]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoRegistrations = [
        {
          id: 1,
          subject_id: 1,
          subject_name: 'Elementary Programming in C-INTL',
          subject_code: 'PRF192',
          year: 2024,
          quarter: 1,
          status: 'REGISTERED',
          reason_for_carry_over: null,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          subject_id: 2,
          subject_name: 'Intelligent Data Management with SQL Server',
          subject_code: 'DBI202',
          year: 2024,
          quarter: 1,
          status: 'COMPLETED',
          reason_for_carry_over: null,
          created_at: '2024-01-16'
        },
        {
          id: 3,
          subject_id: 3,
          subject_name: 'Elegant and Effective Website Design with UI and UX',
          subject_code: 'WEB101',
          year: 2023,
          quarter: 4,
          status: 'NOT_COMPLETED',
          reason_for_carry_over: 'Chưa đủ điều kiện thi Aptech',
          created_at: '2023-10-15'
        }
      ];
      
      setRegistrations(demoRegistrations);
      setFilteredRegistrations(demoRegistrations);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách đăng ký', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSubjects = async () => {
    try {
      // Demo data - replace with actual API call
      const demoSubjects = [
        { id: 1, subject_code: 'PRF192', subject_name: 'Elementary Programming in C-INTL', credit: 3 },
        { id: 2, subject_code: 'DBI202', subject_name: 'Intelligent Data Management with SQL Server', credit: 3 },
        { id: 3, subject_code: 'WEB101', subject_name: 'Elegant and Effective Website Design with UI and UX', credit: 3 },
        { id: 4, subject_code: 'PRO192', subject_name: 'Object-Oriented Programming', credit: 3 }
      ];
      setAvailableSubjects(demoSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...registrations];

    if (yearFilter) {
      filtered = filtered.filter(reg => reg.year === parseInt(yearFilter));
    }

    if (quarterFilter) {
      filtered = filtered.filter(reg => reg.quarter === parseInt(quarterFilter));
    }

    if (statusFilter) {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  };

  const handleRegister = async (subjectId, year, quarter) => {
    try {
      setLoading(true);
      // Check minimum requirements
      const yearRegistrations = registrations.filter(r => r.year === year);
      const quarterRegistrations = registrations.filter(r => r.year === year && r.quarter === quarter);

      if (yearRegistrations.length >= 4) {
        showToast('Cảnh báo', 'Bạn đã đăng ký tối đa 4 môn trong năm này', 'warning');
        return;
      }

      if (quarterRegistrations.length >= 1) {
        showToast('Cảnh báo', 'Bạn đã đăng ký 1 môn trong quý này', 'warning');
        return;
      }

      // Simulate API call
      const newRegistration = {
        id: Date.now(),
        subject_id: subjectId,
        subject_name: availableSubjects.find(s => s.id === subjectId)?.subject_name || 'N/A',
        subject_code: availableSubjects.find(s => s.id === subjectId)?.subject_code || 'N/A',
        year: year,
        quarter: quarter,
        status: 'REGISTERED',
        reason_for_carry_over: null,
        created_at: new Date().toISOString().split('T')[0]
      };

      setRegistrations(prev => [newRegistration, ...prev]);
      setShowRegisterModal(false);
      showToast('Thành công', 'Đăng ký môn học thành công', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể đăng ký môn học', 'danger');
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
      REGISTERED: { label: 'Đã đăng ký', class: 'info' },
      COMPLETED: { label: 'Hoàn thành', class: 'success' },
      NOT_COMPLETED: { label: 'Chưa hoàn thành', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRegistrations = filteredRegistrations.slice(startIndex, startIndex + pageSize);
  const currentYear = new Date().getFullYear();

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải danh sách đăng ký môn học..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Đăng ký Môn học</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
          <i className="bi bi-plus-circle"></i>
          Đăng ký Môn mới
        </button>
      </div>

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
              {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Quý</label>
            <select
              className="filter-select"
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="1">Quý 1</option>
              <option value="2">Quý 2</option>
              <option value="3">Quý 3</option>
              <option value="4">Quý 4</option>
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
              <option value="REGISTERED">Đã đăng ký</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="NOT_COMPLETED">Chưa hoàn thành</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary" onClick={() => {
              setYearFilter(currentYear);
              setQuarterFilter('');
              setStatusFilter('');
            }} style={{ width: '100%' }}>
              <i className="bi bi-arrow-clockwise"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="alert alert-info" style={{ marginBottom: '20px' }}>
        <i className="bi bi-info-circle"></i>
        <strong>Lưu ý:</strong> Tối thiểu 4 môn/năm và 1 môn/quý. Môn chưa hoàn thành có thể được dời sang năm khác.
      </div>

      {/* Registrations Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="15%">Mã môn</th>
                <th width="30%">Tên Môn học</th>
                <th width="10%">Năm</th>
                <th width="10%">Quý</th>
                <th width="15%">Trạng thái</th>
                <th width="15%">Lý do dời môn</th>
              </tr>
            </thead>
            <tbody>
              {pageRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>Không tìm thấy đăng ký nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRegistrations.map((reg, index) => (
                  <tr key={reg.id} className="fade-in">
                    <td>{startIndex + index + 1}</td>
                    <td><span className="teacher-code">{reg.subject_code || 'N/A'}</span></td>
                    <td>{reg.subject_name || 'N/A'}</td>
                    <td>{reg.year || 'N/A'}</td>
                    <td>Q{reg.quarter || 'N/A'}</td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td>{reg.reason_for_carry_over || '-'}</td>
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

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '20px' }}>Đăng ký Môn học Mới</h3>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Chọn Môn học</label>
              <select
                className="form-control"
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
              >
                <option value="">-- Chọn môn học --</option>
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_code} - {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Năm</label>
              <select className="form-control" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {[currentYear, currentYear + 1].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Quý</label>
              <select className="form-control" value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)}>
                <option value="">-- Chọn quý --</option>
                <option value="1">Quý 1</option>
                <option value="2">Quý 2</option>
                <option value="3">Quý 3</option>
                <option value="4">Quý 4</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => {
                setShowRegisterModal(false);
                setSelectedSubject(null);
              }}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => selectedSubject && quarterFilter && handleRegister(selectedSubject, parseInt(yearFilter), parseInt(quarterFilter))}
                disabled={!selectedSubject || !quarterFilter}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

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

export default TeacherSubjectRegistration;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const TeacherPersonalReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reportType, setReportType] = useState('');
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalExams: 0,
    totalTrials: 0,
    totalAssignments: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, reportType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoReports = [
        {
          id: 1,
          year: 2024,
          quarter: 1,
          report_type: 'QUARTER',
          file_id: 1,
          file_path: '/reports/personal_2024_Q1.pdf',
          status: 'GENERATED',
          generated_at: '2024-04-01 10:00:00'
        },
        {
          id: 2,
          year: 2024,
          quarter: null,
          report_type: 'YEAR',
          file_id: 2,
          file_path: '/reports/personal_2024_year.pdf',
          status: 'GENERATED',
          generated_at: '2024-12-31 15:00:00'
        },
        {
          id: 3,
          year: 2024,
          quarter: null,
          report_type: 'APTECH',
          file_id: 3,
          file_path: '/reports/personal_aptech_2024.pdf',
          status: 'GENERATED',
          generated_at: '2024-02-20 09:00:00'
        }
      ];
      
      setReports(demoReports);
      setFilteredReports(demoReports);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách báo cáo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Demo stats - replace with actual API call
      setStats({
        totalSubjects: 8,
        totalExams: 5,
        totalTrials: 3,
        totalAssignments: 6,
        passRate: 85.5
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (reportType) {
      filtered = filtered.filter(report => report.report_type === reportType);
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const downloadReport = (reportId, format = 'pdf') => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.file_path) {
      showToast('Thành công', `Đang tải báo cáo định dạng ${format.toUpperCase()}...`, 'info');
      // Simulate download
      console.log(`Downloading report ${reportId} as ${format}`);
    } else {
      showToast('Lỗi', 'Không tìm thấy báo cáo', 'danger');
    }
  };

  const generateReport = async (type, year, quarter = null) => {
    try {
      setLoading(true);
      // Simulate API call
      const newReport = {
        id: Date.now(),
        year: year || new Date().getFullYear(),
        quarter: quarter,
        report_type: type,
        file_id: Date.now(),
        file_path: `/reports/personal_${type}_${year}_${quarter || 'all'}.pdf`,
        status: 'GENERATED',
        generated_at: new Date().toISOString()
      };
      
      setReports(prev => [newReport, ...prev]);
      showToast('Thành công', 'Tạo báo cáo thành công', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể tạo báo cáo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const getReportTypeLabel = (type) => {
    const typeMap = {
      QUARTER: 'Báo cáo Quý',
      YEAR: 'Báo cáo Năm',
      APTECH: 'Báo cáo Kỳ thi Aptech',
      TRIAL: 'Báo cáo Giảng thử'
    };
    return typeMap[type] || type;
  };

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageReports = filteredReports.slice(startIndex, startIndex + pageSize);
  const currentYear = new Date().getFullYear();

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải báo cáo cá nhân..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Báo cáo Cá nhân</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalSubjects}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Môn đã đăng ký</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalExams}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Kỳ thi Aptech</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalTrials}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Giảng thử</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalAssignments}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phân công</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.passRate}%</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tỷ lệ đạt</div>
        </div>
      </div>

      {/* Generate Report Section */}
      <div className="card" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>Tạo Báo cáo Mới</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Loại báo cáo</label>
            <select
              className="filter-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">Chọn loại báo cáo</option>
              <option value="QUARTER">Báo cáo Quý</option>
              <option value="YEAR">Báo cáo Năm</option>
              <option value="APTECH">Báo cáo Kỳ thi Aptech</option>
              <option value="TRIAL">Báo cáo Giảng thử</option>
            </select>
          </div>
          <div className="filter-group">
            <button
              className="btn btn-primary"
              onClick={() => generateReport(reportType, currentYear)}
              disabled={!reportType}
              style={{ width: '100%', marginTop: '25px' }}
            >
              <i className="bi bi-file-earmark-text"></i>
              Tạo Báo cáo
            </button>
          </div>
        </div>
      </div>

      <div className="filter-table-wrapper">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Loại báo cáo</label>
              <select
                className="filter-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="QUARTER">Báo cáo Quý</option>
                <option value="YEAR">Báo cáo Năm</option>
                <option value="APTECH">Báo cáo Kỳ thi Aptech</option>
                <option value="TRIAL">Báo cáo Giảng thử</option>
              </select>
            </div>
            <div className="filter-group">
              <button className="btn btn-secondary" onClick={() => setReportType('')} style={{ width: '100%' }}>
                <i className="bi bi-arrow-clockwise"></i>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="20%">Loại báo cáo</th>
                <th width="10%">Năm</th>
                <th width="10%">Quý</th>
                <th width="20%">Ngày tạo</th>
                <th width="10%">Trạng thái</th>
                <th width="25%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>Không tìm thấy báo cáo nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageReports.map((report, index) => (
                  <tr key={report.id} className="fade-in">
                    <td>{startIndex + index + 1}</td>
                    <td>{getReportTypeLabel(report.report_type)}</td>
                    <td>{report.year || 'N/A'}</td>
                    <td>{report.quarter ? `Q${report.quarter}` : 'N/A'}</td>
                    <td>{report.generated_at ? new Date(report.generated_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>
                      <span className={`badge badge-status ${report.status === 'GENERATED' ? 'success' : 'danger'}`}>
                        {report.status === 'GENERATED' ? 'Đã tạo' : 'Lỗi'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-success btn-action"
                          onClick={() => downloadReport(report.id, 'pdf')}
                          title="Tải PDF"
                        >
                          <i className="bi bi-file-pdf"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-primary btn-action"
                          onClick={() => downloadReport(report.id, 'excel')}
                          title="Tải Excel"
                        >
                          <i className="bi bi-file-excel"></i>
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
    </MainLayout>
  );
};

export default TeacherPersonalReports;


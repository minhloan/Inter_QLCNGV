import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const ReportingExport = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reportType, setReportType] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  // Dashboard stats
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSubjects: 0,
    totalRegistrations: 0,
    totalExams: 0,
    totalTrials: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, reportType, yearFilter, quarterFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoReports = [
        {
          id: 1,
          teacher_id: 1,
          teacher_name: 'Nguyễn Văn A',
          year: 2024,
          quarter: 1,
          report_type: 'QUARTER',
          status: 'GENERATED',
          generated_at: '2024-01-15 10:30:00',
          generated_by: 'admin@example.com',
          file_path: '/reports/2024-Q1-report.pdf'
        },
        {
          id: 2,
          teacher_id: 2,
          teacher_name: 'Trần Thị B',
          year: 2024,
          quarter: null,
          report_type: 'YEAR',
          status: 'GENERATED',
          generated_at: '2024-12-31 15:00:00',
          generated_by: 'admin@example.com',
          file_path: '/reports/2024-year-report.pdf'
        },
        {
          id: 3,
          teacher_id: 1,
          teacher_name: 'Nguyễn Văn A',
          year: 2024,
          quarter: null,
          report_type: 'APTECH',
          status: 'GENERATED',
          generated_at: '2024-02-20 09:15:00',
          generated_by: 'admin@example.com',
          file_path: '/reports/aptech-exam-report.pdf'
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
        totalTeachers: 25,
        totalSubjects: 15,
        totalRegistrations: 120,
        totalExams: 45,
        totalTrials: 30,
        totalAssignments: 80
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

    if (yearFilter) {
      filtered = filtered.filter(report => report.year === parseInt(yearFilter));
    }

    if (quarterFilter) {
      filtered = filtered.filter(report => report.quarter === parseInt(quarterFilter));
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const generateReport = async (type, year, quarter = null) => {
    try {
      setLoading(true);
      // Simulate API call
      const newReport = {
        id: Date.now(),
        teacher_id: null,
        teacher_name: 'Tất cả',
        year: year || new Date().getFullYear(),
        quarter: quarter,
        report_type: type,
        status: 'GENERATED',
        generated_at: new Date().toISOString(),
        generated_by: 'admin@example.com',
        file_path: `/reports/${type}-${year}-${quarter || 'all'}.pdf`
      };
      
      setReports(prev => [newReport, ...prev]);
      showToast('Thành công', 'Tạo báo cáo thành công', 'success');
    } catch (error) {
      showToast('Lỗi', 'Không thể tạo báo cáo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportId, format) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      showToast('Thành công', `Đang xuất báo cáo định dạng ${format.toUpperCase()}`, 'info');
      // Simulate export
      console.log(`Exporting report ${reportId} as ${format}`);
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
    return <Loading fullscreen={true} message="Đang tải báo cáo..." />;
  }

  return (
    <MainLayout>
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Báo cáo & Xuất dữ liệu</h1>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalTeachers}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tổng Giáo viên</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalSubjects}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tổng Môn học</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalRegistrations}</div>
          <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Đăng ký Môn</div>
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
            <label className="filter-label">Năm</label>
            <select
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">Chọn năm</option>
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
              disabled={reportType !== 'QUARTER'}
            >
              <option value="">Tất cả</option>
              <option value="1">Quý 1</option>
              <option value="2">Quý 2</option>
              <option value="3">Quý 3</option>
              <option value="4">Quý 4</option>
            </select>
          </div>
          <div className="filter-group">
            <button
              className="btn btn-primary"
              onClick={() => generateReport(reportType, parseInt(yearFilter), quarterFilter ? parseInt(quarterFilter) : null)}
              disabled={!reportType || !yearFilter}
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
              <button className="btn btn-secondary" onClick={() => {
                setReportType('');
                setYearFilter('');
                setQuarterFilter('');
              }} style={{ width: '100%' }}>
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
                <th width="15%">Loại báo cáo</th>
                <th width="15%">Giáo viên</th>
                <th width="10%">Năm</th>
                <th width="10%">Quý</th>
                <th width="15%">Ngày tạo</th>
                <th width="10%">Trạng thái</th>
                <th width="20%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
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
                    <td>{report.teacher_name || 'Tất cả'}</td>
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
                          onClick={() => exportReport(report.id, 'pdf')}
                          title="Xuất PDF"
                        >
                          <i className="bi bi-file-pdf"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-primary btn-action"
                          onClick={() => exportReport(report.id, 'excel')}
                          title="Xuất Excel"
                        >
                          <i className="bi bi-file-excel"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-info btn-action"
                          onClick={() => exportReport(report.id, 'word')}
                          title="Xuất Word"
                        >
                          <i className="bi bi-file-word"></i>
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

export default ReportingExport;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getDashboardStats, getReports, generateReport as apiGenerateReport, downloadReport } from '../../api/reports';

const ReportingExport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [reportType, setReportType] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [quarterFilter, setQuarterFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState([]);
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
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            // Fetch subjects for dropdown - assuming an API exists or we can mock/fetch from stats
            // For now, we might need to add a getSubjects API or use existing data
            // Let's assume we can get it from somewhere or just leave it empty if no API
            // Actually, we can use the dashboard stats or a separate API call if available
            // For now, let's just initialize empty and maybe fetch if needed
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [reports, reportType, yearFilter, quarterFilter]);

    useEffect(() => {
        if (['QUARTER', 'YEAR', 'APTECH', 'TRIAL'].includes(reportType)) {
            setYearFilter((currentYear - 1).toString());
        }
        if (reportType === 'QUARTER') {
            setQuarterFilter('1');
        } else if (['APTECH', 'TRIAL', 'YEAR'].includes(reportType)) {
            setQuarterFilter('');
        }
    }, [reportType]);

    const loadReports = async () => {
        try {
            setLoading(true);
            // Filter reports by current user's userId (teacherId)
            const response = await getReports({ teacherId: user?.userId });
            setReports(response);
            setFilteredReports(response);
        } catch (error) {
            console.error('Error loading reports:', error);
            showToast('Lỗi', 'Không thể tải danh sách báo cáo', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await getDashboardStats();
            setStats({
                totalTeachers: response.totalTeachers || 0,
                totalSubjects: response.totalSubjects || 0,
                totalRegistrations: response.totalRegistrations || 0,
                totalExams: response.totalExams || 0,
                totalTrials: response.totalTrials || 0,
                totalAssignments: response.totalAssignments || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
            showToast('Lỗi', 'Không thể tải thống kê', 'danger');
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        if (reportType) {
            filtered = filtered.filter(report => report.reportType === reportType);
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
            const reportRequest = {
                reportType: type,
                year: year,
                quarter: quarter,
                teacherId: user?.userId, // Use current user's userId
                startDate: startDate || null,
                endDate: endDate || null,
                subjectId: subjectId || null
            };

            const response = await apiGenerateReport(reportRequest);
            await loadReports(); // Reload reports to show the new report with creation date immediately
            showToast('Thành công', 'Tạo báo cáo thành công', 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            showToast('Lỗi', 'Không thể tạo báo cáo', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const generateFilename = (report, format) => {
        const typeMap = {
            QUARTER: 'Quy',
            YEAR: 'Nam',
            APTECH: 'Aptech',
            TRIAL: 'Trial',
            SUBJECT_ANALYSIS: 'SubjectAnalysis',
            TEACHER_PERFORMANCE: 'TeacherPerformance',
            PERSONAL_SUMMARY: 'PersonalSummary'
        };

        const reportType = typeMap[report.reportType] || report.reportType;
        let filename = `BaoCao_${reportType}_${report.year}`;

        if (report.quarter && ['QUARTER', 'APTECH', 'TRIAL'].includes(report.reportType)) {
            filename += `_Q${report.quarter}`;
        }

        const extension = format === 'excel' ? '.xlsx' : '.docx';
        return filename + extension;
    };

    const exportReport = async (report, format) => {
        try {
            const blob = await downloadReport(report.id, format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = generateFilename(report, format);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast('Thành công', `Đã tải báo cáo định dạng ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast('Lỗi', 'Không thể tải báo cáo', 'danger');
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
                            <option value="SUBJECT_ANALYSIS">Phân tích Môn học</option>
                        </select>
                    </div>

                    {['QUARTER', 'YEAR', 'APTECH', 'TRIAL'].includes(reportType) && (
                        <>
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
                            {['QUARTER', 'APTECH', 'TRIAL', 'YEAR'].includes(reportType) && (
                                <div className="filter-group">
                                    <label className="filter-label">Quý</label>
                                    <select
                                        className="filter-select"
                                        value={quarterFilter}
                                        onChange={(e) => setQuarterFilter(e.target.value)}
                                    >
                                        {['APTECH', 'TRIAL', 'YEAR'].includes(reportType) && <option value="">Tất cả</option>}
                                        {['QUARTER', 'APTECH', 'TRIAL'].includes(reportType) && (
                                            <>
                                                <option value="1">Quý 1</option>
                                                <option value="2">Quý 2</option>
                                                <option value="3">Quý 3</option>
                                                <option value="4">Quý 4</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {['SUBJECT_ANALYSIS'].includes(reportType) && (
                        <>
                            <div className="filter-group">
                                <label className="filter-label">Từ ngày</label>
                                <input
                                    type="date"
                                    className="filter-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Đến ngày</label>
                                <input
                                    type="date"
                                    className="filter-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {reportType === 'SUBJECT_ANALYSIS' && (
                        <div className="filter-group">
                            <label className="filter-label">Mã Môn học (ID)</label>
                            <input
                                type="text"
                                className="filter-input"
                                value={subjectId}
                                onChange={(e) => setSubjectId(e.target.value)}
                                placeholder="Nhập ID môn học"
                            />
                        </div>
                    )}

                    <div className="filter-group">
                        <button
                            className="btn btn-primary"
                            onClick={() => generateReport(reportType, parseInt(yearFilter), quarterFilter ? parseInt(quarterFilter) : null)}
                            disabled={
                                !reportType ||
                                loading ||
                                (['QUARTER', 'YEAR', 'APTECH', 'TRIAL'].includes(reportType) && !yearFilter) ||
                                (['SUBJECT_ANALYSIS'].includes(reportType) && (!startDate || !endDate)) ||
                                (reportType === 'SUBJECT_ANALYSIS' && !subjectId)
                            }
                            style={{ width: '100%', marginTop: '25px' }}
                        >
                            {loading ? (
                                <>
                                    <Loading fullscreen={false} message="" />
                                    <span style={{ marginLeft: '8px' }}>Đang tạo...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-text"></i>
                                    Tạo Báo cáo
                                </>
                            )}
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
                                <option value="SUBJECT_ANALYSIS">Phân tích Môn học</option>
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
                        {['QUARTER', 'APTECH', 'TRIAL'].includes(reportType) && (
                            <div className="filter-group">
                                <label className="filter-label">Quý</label>
                                <select
                                    className="filter-select"
                                    value={quarterFilter}
                                    onChange={(e) => setQuarterFilter(e.target.value)}
                                >
                                    {['APTECH', 'TRIAL'].includes(reportType) && <option value="">Tất cả</option>}
                                    <option value="1">Quý 1</option>
                                    <option value="2">Quý 2</option>
                                    <option value="3">Quý 3</option>
                                    <option value="4">Quý 4</option>
                                </select>
                            </div>
                        )}
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
                                        <td>{getReportTypeLabel(report.reportType)}</td>
                                        <td>{report.teacherName || 'Tất cả'}</td>
                                        <td>{report.year || 'N/A'}</td>
                                        <td>{report.quarter ? `Q${report.quarter}` : 'N/A'}</td>
                                        <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td>
                                                <span className={`badge badge-status ${report.status === 'GENERATED' ? 'success' : 'danger'}`}>
                                                    {report.status === 'GENERATED' ? 'Đã tạo' : 'Lỗi'}
                                                </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="action-buttons">
                                                {['QUARTER', 'YEAR', 'APTECH', 'TRIAL', 'SUBJECT_ANALYSIS', 'TEACHER_PERFORMANCE', 'PERSONAL_SUMMARY'].includes(report.reportType) && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-primary btn-action"
                                                            onClick={() => exportReport(report, 'excel')}
                                                            title="Xuất Excel"
                                                        >
                                                            <i className="bi bi-file-excel"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-info btn-action"
                                                            onClick={() => exportReport(report, 'word')}
                                                            title="Xuất Word"
                                                        >
                                                            <i className="bi bi-file-word"></i>
                                                        </button>
                                                    </>
                                                )}
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

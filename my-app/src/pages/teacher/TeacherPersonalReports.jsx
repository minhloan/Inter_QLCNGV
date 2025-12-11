import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import {
    getPersonalReports,
    generatePersonalReport,
    getPersonalSubjects,
    getPersonalPassRates,
    getPersonalExams,
    getPersonalTrials,
    getPersonalEvidence,
    getPersonalAssignments,
    downloadReport
} from '../../api/reports';

const TeacherPersonalReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [reportType, setReportType] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [quarter, setQuarter] = useState('');
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalExams: 0,
        totalTrials: 0,
        totalAssignments: 0,
        totalEvidence: 0,
        passRate: 0
    });
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            const response = await getPersonalReports();
            setReports(response);
            setFilteredReports(response);
        } catch (error) {
            console.error('Error loading personal reports:', error);
            showToast('Lỗi', 'Không thể tải danh sách báo cáo', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Load multiple stats in parallel
            const [subjectsResponse, passRatesResponse, examsResponse, trialsResponse, evidenceResponse, assignmentsResponse] = await Promise.all([
                getPersonalSubjects(),
                getPersonalPassRates(),
                getPersonalExams(),
                getPersonalTrials(),
                getPersonalEvidence(),
                getPersonalAssignments()
            ]);

            setStats({
                totalSubjects: subjectsResponse?.length || 0,
                totalExams: examsResponse?.length || 0,
                totalTrials: trialsResponse?.length || 0,
                totalAssignments: assignmentsResponse?.length || 0,
                totalEvidence: evidenceResponse?.length || 0,
                passRate: passRatesResponse?.overallPassRate || 0
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

        setFilteredReports(filtered);
        setCurrentPage(1);
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

    const handleDownloadReport = async (report, format = 'pdf') => {
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

    const generateReport = async () => {
        try {
            setLoading(true);
            const reportRequest = {
                reportType,
                year: parseInt(year),
                quarter: reportType === 'QUARTER' ? parseInt(quarter) : null,
                startDate: startDate || null,
                endDate: endDate || null
            };

            const response = await generatePersonalReport(reportRequest);
            // Ensure createdAt is set to current date/time for immediate display
            const reportWithDate = {
                ...response,
                createdAt: response.createdAt || new Date().toISOString()
            };
            setReports(prev => [reportWithDate, ...prev]);
            showToast('Thành công', 'Tạo báo cáo thành công', 'success');
        } catch (error) {
            console.error('Error generating personal report:', error);
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
            TRIAL: 'Báo cáo Giảng thử',
            TEACHER_PERFORMANCE: 'Hiệu suất Giảng dạy',
            PERSONAL_SUMMARY: 'Tổng kết Cá nhân'
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
                    <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--orange-primary)' }}>{stats.totalEvidence}</div>
                    <div className="stat-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Minh chứng</div>
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
                            <option value="TEACHER_PERFORMANCE">Hiệu suất Giảng dạy</option>
                            <option value="PERSONAL_SUMMARY">Tổng kết Cá nhân</option>
                        </select>
                    </div>

                    {['QUARTER', 'YEAR', 'APTECH', 'TRIAL'].includes(reportType) && (
                        <div className="filter-group">
                            <label className="filter-label">Năm</label>
                            <select
                                className="filter-select"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reportType === 'QUARTER' && (
                        <div className="filter-group">
                            <label className="filter-label">Quý</label>
                            <select
                                className="filter-select"
                                value={quarter}
                                onChange={(e) => setQuarter(e.target.value)}
                            >
                                <option value="">Chọn quý</option>
                                <option value="1">Quý 1</option>
                                <option value="2">Quý 2</option>
                                <option value="3">Quý 3</option>
                                <option value="4">Quý 4</option>
                            </select>
                        </div>
                    )}

                    {reportType === 'TEACHER_PERFORMANCE' && (
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

                    <div className="filter-group">
                        <button
                            className="btn btn-primary"
                            onClick={generateReport}
                            disabled={
                                !reportType ||
                                (reportType === 'QUARTER' && !quarter) ||
                                (reportType === 'TEACHER_PERFORMANCE' && (!startDate || !endDate)) ||
                                loading
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
                                <option value="TEACHER_PERFORMANCE">Hiệu suất Giảng dạy</option>
                                <option value="PERSONAL_SUMMARY">Tổng kết Cá nhân</option>
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
                                        <td>{getReportTypeLabel(report.reportType)}</td>
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
                                                {['QUARTER', 'YEAR', 'APTECH', 'TRIAL', 'TEACHER_PERFORMANCE', 'PERSONAL_SUMMARY'].includes(report.reportType) && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-primary btn-action"
                                                            onClick={() => handleDownloadReport(report, 'excel')}
                                                            title="Tải Excel"
                                                        >
                                                            <i className="bi bi-file-excel"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-info btn-action"
                                                            onClick={() => handleDownloadReport(report, 'word')}
                                                            title="Tải Word"
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

export default TeacherPersonalReports;

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import DeleteModal from '../components/Teacher/DeleteModal';
import ExportImportModal from '../components/Teacher/ExportImportModal';
import Toast from '../components/Common/Toast';
import Loading from '../components/Common/Loading';
import { getAllUsers, searchUsers, deleteUser, exportUsers, importUsers } from '../api/user';

const ManageTeacher = () => {
  const navigate = useNavigate();

  // List states
  const [allTeachers, setAllTeachers] = useState([]); // Lưu tất cả dữ liệu từ server để filter client-side
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Số items hiển thị mỗi trang (client-side pagination)
  const [serverPageSize] = useState(1000); // Load tất cả data từ server một lần
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const searchTimeoutRef = useRef(null);

  const showToast = useCallback((title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  const loadTeachers = useCallback(async (page, size) => {
    try {
      setLoading(true);
      const response = await getAllUsers(page, size);

      const mappedTeachers = (response.content || []).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phoneNumber,
        status: user.active === 'ACTIVE' || user.active === 'active' ? 'active' : 'inactive'
      }));

      setAllTeachers(mappedTeachers);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading teachers:', error);
      showToast('Lỗi', 'Không thể tải danh sách giáo viên', 'danger');
      setAllTeachers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleSearch = useCallback(async (term, page, size) => {
    if (!term.trim()) {
      return;
    }

    try {
      setLoading(true);
      const response = await searchUsers(term.trim(), page, size);

      const mappedTeachers = (response.content || []).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phoneNumber,
        status: user.active === 'ACTIVE' || user.active === 'active' ? 'active' : 'inactive'
      }));

      setAllTeachers(mappedTeachers);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error searching teachers:', error);
      showToast('Lỗi', 'Không thể tìm kiếm giáo viên', 'danger');
      setAllTeachers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Filter và sort client-side sử dụng useMemo để tránh re-render không cần thiết
  const filteredTeachers = useMemo(() => {
    if (allTeachers.length === 0) return [];

    let filtered = [...allTeachers];

    // Apply status filter nếu có
    if (statusFilter) {
      filtered = filtered.filter(teacher => teacher.status === statusFilter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.username || '').localeCompare(b.username || '');
        case 'name_desc':
          return (b.username || '').localeCompare(a.username || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTeachers, statusFilter, sortBy]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [statusFilter, sortBy]);

  // Tự động load dữ liệu khi vào trang (chỉ 1 lần) - load tất cả data với pageSize lớn
  useEffect(() => {
    if (!hasLoaded) {
      loadTeachers(1, serverPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý search - chỉ chạy sau khi đã load lần đầu
  // Khi searchTerm thay đổi, gọi API để load data mới
  // Khi currentPage thay đổi, KHÔNG gọi API
  useEffect(() => {
    // Bỏ qua nếu chưa load lần đầu
    if (!hasLoaded) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm, 1, serverPageSize); // Load tất cả kết quả search
      } else {
        loadTeachers(1, serverPageSize); // Load tất cả data
      }
      // Reset về trang 1 khi search thay đổi
      setCurrentPage(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleAdd = () => {
    navigate('/add-teacher');
  };

  const handleEdit = (teacher) => {
    navigate(`/add-teacher?mode=edit&id=${teacher.id}`);
  };

  const handleDelete = (teacher) => {
    setDeleteTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTeacher) return;

    try {
      setLoading(true);
      // Call API to delete user
      await deleteUser(deleteTeacher.id);
      showToast('Thành công', 'Xóa giáo viên thành công', 'success');
      setShowDeleteModal(false);
      const deletedId = deleteTeacher.id;
      setDeleteTeacher(null);
      setLoading(false);
      if (searchTerm.trim()) {
        await handleSearch(searchTerm, 1, serverPageSize);
      } else {
        await loadTeachers(1, serverPageSize);
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showToast('Lỗi', error.response?.data?.message || 'Không thể xóa giáo viên', 'danger');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSortBy('name_asc');
    setCurrentPage(1);
  };

  // Handler cho Export Excel từ modal
  const handleExport = async (activeStatus) => {
    try {
      setExporting(true);
      const blob = await exportUsers(activeStatus);

      // Tạo URL từ blob và trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().getTime();
      const statusSuffix = activeStatus ? `_${activeStatus.toLowerCase()}` : '';
      link.setAttribute('download', `users_export${statusSuffix}_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const statusText = activeStatus === 'ACTIVE' ? 'đang hoạt động' :
        activeStatus === 'INACTIVE' ? 'không hoạt động' : 'tất cả';
      showToast('Thành công', `Export danh sách giáo viên ${statusText} thành công`, 'success');

      // Đóng modal sau khi export thành công
      setTimeout(() => {
        setShowExportImportModal(false);
      }, 1000);
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('Lỗi', error.response?.data?.message || 'Không thể export danh sách giáo viên', 'danger');
    } finally {
      setExporting(false);
    }
  };

  // Handler cho Import Excel từ modal
  const handleImport = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showToast('Lỗi', 'File phải là định dạng Excel (.xlsx hoặc .xls)', 'danger');
      return;
    }

    try {
      setImporting(true);
      const result = await importUsers(file);

      // Hiển thị kết quả
      const successCount = result.created + result.updated;
      const errorCount = result.errors ? result.errors.length : 0;

      let message = `Import thành công: ${result.created} tạo mới, ${result.updated} cập nhật`;
      if (errorCount > 0) {
        message += `. Có ${errorCount} lỗi`;
      }

      showToast(
        'Thành công',
        message,
        errorCount > 0 ? 'warning' : 'success'
      );

      // Hiển thị chi tiết lỗi nếu có
      if (result.errors && result.errors.length > 0) {
        console.error('Import errors:', result.errors);
        const errorDetails = result.errors
          .map(err => `Dòng ${err.rowNumber}: ${err.message}`)
          .join('\n');
        alert('Chi tiết lỗi:\n' + errorDetails);
      }

      // Reload danh sách sau khi import
      if (searchTerm.trim()) {
        await handleSearch(searchTerm, 1, serverPageSize);
      } else {
        await loadTeachers(1, serverPageSize);
      }

      // Đóng modal sau khi import thành công
      setTimeout(() => {
        setShowExportImportModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error importing users:', error);
      showToast('Lỗi', error.response?.data?.message || 'Không thể import danh sách giáo viên', 'danger');
    } finally {
      setImporting(false);
    }
  };

  const totalFilteredElements = filteredTeachers.length;
  const totalFilteredPages = Math.ceil(totalFilteredElements / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageTeachers = filteredTeachers.slice(startIndex, endIndex);

  return (
    <MainLayout>
      <div className="page-admin-manage-teacher">
        {/* Content Header */}
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Quản lý Giáo viên</h1>
          </div>
          <div className="content-actions">
            <button
              onClick={() => setShowExportImportModal(true)}
              className="btn btn-success btn-export-import"
              disabled={loading || !hasLoaded}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-file-earmark-spreadsheet"></i>
              <span className="btn-text">Xuất / Nhập Excel</span>
            </button>
            <Link to="/add-teacher" className="btn btn-primary">
              <i className="bi bi-plus-circle"></i>
              <span className="btn-text">Thêm Giáo viên</span>
            </Link>
          </div>
        </div>

        {/* List Content */}
        <>
          {loading && (
            <Loading fullscreen={true} message="Đang tải danh sách giáo viên..." />
          )}

          {hasLoaded && !loading && (
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
                        placeholder="Tìm kiếm theo username, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Trạng thái</label>
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Sắp xếp</label>
                    <select
                      className="filter-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name_asc">Username A-Z</option>
                      <option value="name_desc">Username Z-A</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <button className="btn btn-secondary" onClick={handleReset} style={{ width: '100%' }}>
                      <i className="bi bi-arrow-clockwise"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="table-container">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th width="5%">#</th>
                        <th width="20%">Username</th>
                        <th width="20%">Email</th>
                        <th width="15%">Số điện thoại</th>
                        <th width="10%">Trạng thái</th>
                        <th width="15%" className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageTeachers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            <div className="empty-state">
                              <i className="bi bi-inbox"></i>
                              <p>Không tìm thấy giáo viên nào</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pageTeachers.map((teacher, index) => (
                          <tr key={teacher.id} className="fade-in">
                            <td><span className="teacher-code">{startIndex + index + 1}</span></td>
                            <td>{teacher.username || 'N/A'}</td>
                            <td>{teacher.email || 'N/A'}</td>
                            <td>{teacher.phone || 'N/A'}</td>
                            <td>
                              <span className={`badge badge-status ${teacher.status === 'active' ? 'active' : 'inactive'}`}>
                                {teacher.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="action-buttons">
                                <button
                                  className="btn btn-sm btn-primary btn-action"
                                  onClick={() => handleEdit(teacher)}
                                  title="Sửa"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger btn-action"
                                  onClick={() => handleDelete(teacher)}
                                  title="Xóa"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalFilteredPages > 1 && (
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
                      {[...Array(totalFilteredPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalFilteredPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
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
                      <li className={`page-item ${currentPage === totalFilteredPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
                          disabled={currentPage === totalFilteredPages}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          )}
        </>

        {showDeleteModal && deleteTeacher && (
          <DeleteModal
            teacher={deleteTeacher}
            onConfirm={confirmDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setDeleteTeacher(null);
            }}
          />
        )}

        {showExportImportModal && (
          <ExportImportModal
            isOpen={showExportImportModal}
            onClose={() => !exporting && !importing && setShowExportImportModal(false)}
            onExport={handleExport}
            onImport={handleImport}
            exporting={exporting}
            importing={importing}
            title="Xuất / Nhập dữ liệu Giáo viên"
            exportTitle="Xuất danh sách giáo viên ra Excel"
            exportDescription="Chọn trạng thái để xuất dữ liệu. File Excel sẽ chứa tất cả thông tin của giáo viên."
            filterOptions={[
              { label: "Tất cả giáo viên", value: "" },
              { label: "Chỉ giáo viên đang hoạt động", value: "ACTIVE" },
              { label: "Chỉ giáo viên không hoạt động", value: "INACTIVE" }
            ]}
          />
        )}

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

export default ManageTeacher;


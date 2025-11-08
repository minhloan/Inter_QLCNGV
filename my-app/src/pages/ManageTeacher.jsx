import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import TeacherModal from '../components/Teacher/TeacherModal';
import DeleteModal from '../components/Teacher/DeleteModal';
import Toast from '../components/Common/Toast';

const ManageTeacher = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [teachers, searchTerm, statusFilter, sortBy]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      // Demo data - replace with actual API call
      const demoTeachers = [
        { id: 1, code: 'GV001', full_name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0123456789', status: 'active' },
        { id: 2, code: 'GV002', full_name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0987654321', status: 'active' },
        { id: 3, code: 'GV003', full_name: 'Lê Văn C', email: 'levanc@example.com', phone: '0123456780', status: 'inactive' }
      ];
      
      setTeachers(demoTeachers);
      setFilteredTeachers(demoTeachers);
    } catch (error) {
      showToast('Lỗi', 'Không thể tải danh sách giáo viên', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...teachers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(teacher =>
        (teacher.full_name && teacher.full_name.toLowerCase().includes(term)) ||
        (teacher.email && teacher.email.toLowerCase().includes(term)) ||
        (teacher.code && teacher.code.toLowerCase().includes(term)) ||
        (teacher.phone && teacher.phone.includes(term))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(teacher => teacher.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'name_desc':
          return (b.full_name || '').localeCompare(a.full_name || '');
        case 'created_desc':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'created_asc':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    setFilteredTeachers(filtered);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    navigate('/add-teacher');
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setDeleteTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleSave = async (teacherData) => {
    try {
      setLoading(true);
      // Simulate API call
      if (editingTeacher) {
        // Update
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherData } : t));
        showToast('Thành công', 'Cập nhật giáo viên thành công', 'success');
      } else {
        // Create
        const newTeacher = { id: Date.now(), ...teacherData };
        setTeachers(prev => [...prev, newTeacher]);
        showToast('Thành công', 'Thêm giáo viên thành công', 'success');
      }
      setShowModal(false);
      setEditingTeacher(null);
    } catch (error) {
      showToast('Lỗi', 'Không thể lưu thông tin giáo viên', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTeacher) return;
    
    try {
      setLoading(true);
      setTeachers(prev => prev.filter(t => t.id !== deleteTeacher.id));
      showToast('Thành công', 'Xóa giáo viên thành công', 'success');
      setShowDeleteModal(false);
      setDeleteTeacher(null);
    } catch (error) {
      showToast('Lỗi', 'Không thể xóa giáo viên', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSortBy('name_asc');
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  return (
    <MainLayout>
      {/* Content Header */}
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Danh sách Giáo viên</h1>
        </div>
        <Link to="/add-teacher" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i>
          Thêm Giáo viên
        </Link>
      </div>

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
                placeholder="Tên, email, mã giáo viên..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Sắp xếp</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="created_desc">Mới nhất</option>
              <option value="created_asc">Cũ nhất</option>
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

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="15%">Mã GV</th>
                <th width="20%">Họ và Tên</th>
                <th width="20%">Email</th>
                <th width="15%">Số điện thoại</th>
                <th width="10%">Trạng thái</th>
                <th width="15%" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageTeachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>Không tìm thấy giáo viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="fade-in">
                    <td>{startIndex + index + 1}</td>
                    <td><span className="teacher-code">{teacher.code || 'N/A'}</span></td>
                    <td>{teacher.full_name || 'N/A'}</td>
                    <td>{teacher.email || 'N/A'}</td>
                    <td>{teacher.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-status ${teacher.status === 'active' ? 'active' : 'inactive'}`}>
                        {teacher.status === 'active' ? 'Active' : 'Inactive'}
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
                if (
                  page === 1 ||
                  page === totalPages ||
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

      {showModal && (
        <TeacherModal
          teacher={editingTeacher}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingTeacher(null);
          }}
        />
      )}

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

export default ManageTeacher;


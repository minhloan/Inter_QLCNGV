import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { createTrial } from '../../api/trial';
import { getAllUsers, searchUsersByTeaching } from '../../api/user';
import { getAllSubjectsByTrial } from '../../api/subject';
import { getUserInfo } from '../../api/auth';


const TrialTeachingAdd = () => {
    const navigate = useNavigate();
    const formSectionWidth = '1200px';
    const [formData, setFormData] = useState({
        teacherId: '',
        subjectId: '',
        teachingDate: '',
        teachingTime: '',
        location: '',
        note: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (subjectSearch.trim() === '') {
            setFilteredSubjects(subjects);
        } else {
            setFilteredSubjects(subjects.filter(sub =>
                sub.subjectName.toLowerCase().includes(subjectSearch.toLowerCase())
            ));
        }
    }, [subjectSearch, subjects]);

    useEffect(() => {
        const filterTeachers = async () => {
            if (teacherSearch.trim() === '') {
                setFilteredTeachers(teachers);
            } else {
                try {
                    const result = await searchUsersByTeaching(teacherSearch);
                    setFilteredTeachers(result || []);
                } catch (error) {
                    console.error('Error searching teachers:', error);
                    setFilteredTeachers(teachers);
                }
            }
        };
        filterTeachers();
    }, [teacherSearch, teachers]);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = getUserInfo();
            setCurrentUser(user);

            const teachersData = await getAllUsers(1, 1000);
            setTeachers((teachersData?.content || []).filter(u => u.role === 'TEACHER' && u.active === 'ACTIVE'));

            const subjectsData = await getAllSubjectsByTrial();
            setSubjects(subjectsData || []);
            setFilteredSubjects(subjectsData || []);

            if (user?.role === 'TEACHER') {
                setFormData(prev => ({ ...prev, teacherId: user.id }));
            }
        } catch (error) {
            console.error(error);
            showToast('Lỗi', 'Không thể tải dữ liệu', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.teacherId) newErrors.teacherId = 'Vui lòng chọn giảng viên';
        if (!formData.subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';
        if (!formData.teachingDate) {
            newErrors.teachingDate = 'Vui lòng chọn ngày giảng';
        } else {
            const selectedDate = new Date(formData.teachingDate);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.teachingDate = 'Ngày giảng không được là ngày quá khứ';
            }
        }
        if (!formData.location) newErrors.location = 'Vui lòng nhập địa điểm';
        return newErrors;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            showToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        try {
            setLoading(true);
            await createTrial(formData);
            showToast('Thành công', 'Tạo buổi giảng thử thành công', 'success');
            setTimeout(() => navigate('/trial-teaching-management'), 1500);
        } catch (error) {
            console.error(error);
            showToast('Lỗi', 'Không thể tạo buổi giảng thử', 'danger');
        } finally { setLoading(false); }
    };

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    return (
        <MainLayout>
            <div
                className="page-admin-add-teacher page-align-with-form"
                style={{ '--page-section-width': formSectionWidth }}
            >
                {/* Header giống ManageSubjectAdd */}
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate('/trial-teaching-management')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Tạo Buổi Giảng Thử</h1>
                    </div>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row gy-4">
                            <div className="col-md-6">
                                <div className="form-group mb-0">
                                    <label className="form-label">Giảng viên <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Tìm kiếm giảng viên..."
                                        value={teacherSearch}
                                        onChange={e => setTeacherSearch(e.target.value)}
                                    />
                                    <select
                                        className={`form-select ${errors.teacherId ? 'is-invalid' : ''}`}
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleChange}
                                        disabled={currentUser?.role === 'TEACHER'}
                                    >
                                        <option value="">Chọn giảng viên</option>
                                        {filteredTeachers.sort((a, b) => a.username.localeCompare(b.username)).map(t => (
                                            <option key={t.id} value={t.id}>{t.username} ({t.teacherCode})</option>
                                        ))}
                                    </select>
                                    {errors.teacherId && <div className="invalid-feedback d-block">{errors.teacherId}</div>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group mb-0">
                                    <label className="form-label">Môn học <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Tìm kiếm môn học..."
                                        value={subjectSearch}
                                        onChange={e => setSubjectSearch(e.target.value)}
                                    />
                                    <select
                                        className={`form-select ${errors.subjectId ? 'is-invalid' : ''}`}
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Chọn môn học</option>
                                        {filteredSubjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.subjectName}</option>
                                        ))}
                                    </select>
                                    {errors.subjectId && <div className="invalid-feedback d-block">{errors.subjectId}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row gy-4 mt-1">
                            <div className="col-md-4">
                                <div className="form-group mb-0">
                                    <label className="form-label">Ngày giảng <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.teachingDate ? 'is-invalid' : ''}`}
                                        name="teachingDate"
                                        value={formData.teachingDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.teachingDate && <div className="invalid-feedback d-block">{errors.teachingDate}</div>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-0">
                                    <label className="form-label">Giờ giảng</label>
                                    <input type="time" className="form-control" name="teachingTime" value={formData.teachingTime} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-0">
                                    <label className="form-label">Địa điểm <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Nhập địa điểm giảng dạy"
                                    />
                                    {errors.location && <div className="invalid-feedback d-block">{errors.location}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">Ghi chú</label>
                            <textarea className="form-control" name="note" value={formData.note} onChange={handleChange} rows="3" />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/trial-teaching-management')}>
                                <i className="bi bi-x-circle"></i> Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-check-circle"></i> Tạo buổi giảng thử
                            </button>
                        </div>
                    </form>
                </div>

                {toast.show && <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}
                {loading && <Loading fullscreen={true} message="Đang xử lý..." />}
            </div>
        </MainLayout>
    );
};

export default TrialTeachingAdd;
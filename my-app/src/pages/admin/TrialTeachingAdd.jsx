import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { createTrial } from '../../api/trial';
import { getAllUsers } from '../../api/user';
import {getAllSubjectsByTrial} from '../../api/subject';

const TrialTeachingAdd = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        teacherId: '',
        subjectId: '',
        teachingDate: '',
        teachingTime: '',
        location: '',
        note: '',
        aptechExamId: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Filter subjects based on search term
        if (subjectSearch.trim() === '') {
            setFilteredSubjects(subjects);
        } else {
            const filtered = subjects.filter(subject =>
                subject.subjectName.toLowerCase().includes(subjectSearch.toLowerCase())
            );
            setFilteredSubjects(filtered);
        }
    }, [subjects, subjectSearch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [teachersData, subjectsData] = await Promise.all([
                getAllUsers(1, 1000), // Get all users with large page size
                getAllSubjectsByTrial()
            ]);
            console.log('Teachers data:', teachersData);
            console.log('Subjects data:', subjectsData);
            setTeachers(teachersData?.content || []);
            setSubjects(subjectsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Lỗi', 'Không thể tải dữ liệu', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.teacherId || !formData.subjectId || !formData.teachingDate) {
            showToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        // Validate teaching date is not in the past
        const selectedDate = new Date(formData.teachingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast('Lỗi', 'Ngày giảng thử không được là ngày trong quá khứ', 'warning');
            return;
        }

        try {
            setLoading(true);
            await createTrial(formData);
            showToast('Thành công', 'Tạo buổi giảng thử thành công', 'success');
            setTimeout(() => navigate('/trial-teaching-management'), 2000);
        } catch (error) {
            showToast('Lỗi', 'Không thể tạo buổi giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    return (
        <MainLayout>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title mb-0">Tạo buổi giảng thử</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group mb-3">
                                                <label className="form-label">
                                                    Giảng viên <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    name="teacherId"
                                                    value={formData.teacherId}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Chọn giảng viên</option>
                                                    {teachers
                                                        .filter(teacher => teacher.role === 'TEACHER')
                                                        .sort((a, b) => a.username.localeCompare(b.username))
                                                        .map(teacher => (
                                                            <option key={teacher.id} value={teacher.id}>
                                                                {teacher.username} ({teacher.teacherCode})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group mb-3">
                                                <label className="form-label">
                                                    Môn học <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    placeholder="Tìm kiếm môn học..."
                                                    value={subjectSearch}
                                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                                />
                                                <select
                                                    className="form-select"
                                                    name="subjectId"
                                                    value={formData.subjectId}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Chọn môn học</option>
                                                    {filteredSubjects.map(subject => (
                                                        <option key={subject.id} value={subject.id}>
                                                            {subject.subjectName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group mb-3">
                                                <label className="form-label">
                                                    Ngày giảng <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="teachingDate"
                                                    value={formData.teachingDate}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group mb-3">
                                                <label className="form-label">Giờ giảng</label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    name="teachingTime"
                                                    value={formData.teachingTime}
                                                    onChange={handleInputChange}
                                                    placeholder="Chọn giờ giảng thử"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group mb-3">
                                                <label className="form-label">Địa điểm</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập địa điểm giảng thử"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">Ghi chú</label>
                                        <textarea
                                            className="form-control"
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Nhập ghi chú về buổi giảng thử"
                                        />
                                    </div>

                                    <div className="form-group mb-4">
                                        <label className="form-label">Liên kết với kỳ thi Aptech (tùy chọn)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="aptechExamId"
                                            value={formData.aptechExamId}
                                            onChange={handleInputChange}
                                            placeholder="Nhập ID kỳ thi Aptech nếu có"
                                        />
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Đang tạo...' : 'Tạo buổi giảng thử'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/trial-teaching-management')}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
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

            {loading && <Loading />}
        </MainLayout>
    );
};

export default TrialTeachingAdd;

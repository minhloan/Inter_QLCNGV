import { useState, useEffect } from 'react';
import { addAttendee, removeAttendee } from '../api/trial';
import { getAllUsers } from '../api/user';

const TrialAttendeeModal = ({ trialId, attendees, onClose, onSuccess, onToast }) => {
    const [newAttendee, setNewAttendee] = useState({
        attendeeUserId: '',
        attendeeRole: ''
    });
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setLoadingTeachers(true);
            const response = await getAllUsers(1, 1000); // Load tất cả giáo viên
            const teachersList = (response.content || [])
                .filter(user => user.active === 'ACTIVE')
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                }));
            setTeachers(teachersList);
        } catch (error) {
            console.error('Error loading teachers:', error);
            onToast('Lỗi', 'Không thể tải danh sách giáo viên', 'danger');
        } finally {
            setLoadingTeachers(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAttendee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Lọc bỏ các giáo viên đã được thêm vào danh sách attendees và tìm kiếm
    const getAvailableTeachers = () => {
        const addedTeacherIds = attendees
            .filter(attendee => attendee.attendeeUserId)
            .map(attendee => attendee.attendeeUserId);
        return teachers
            .filter(teacher => !addedTeacherIds.includes(teacher.id))
            .filter(teacher =>
                teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    };

    const handleAddAttendee = async (e) => {
        e.preventDefault();

        if (!newAttendee.attendeeUserId || !newAttendee.attendeeRole) {
            onToast('Lỗi', 'Vui lòng chọn giáo viên và vai trò', 'warning');
            return;
        }

        try {
            setLoading(true);
            // Tìm thông tin giáo viên được chọn
            const selectedTeacher = teachers.find(t => t.id === newAttendee.attendeeUserId);
            if (!selectedTeacher) {
                onToast('Lỗi', 'Không tìm thấy thông tin giáo viên', 'danger');
                return;
            }

            const attendeeData = {
                trialId,
                attendeeUserId: newAttendee.attendeeUserId,
                attendeeName: selectedTeacher.username, // Lấy tên từ username
                attendeeRole: newAttendee.attendeeRole
            };

            await addAttendee(attendeeData);
            setNewAttendee({ attendeeUserId: '', attendeeRole: '' });
            onToast('Thành công', 'Thêm người tham dự thành công', 'success');
            onSuccess();
        } catch (error) {
            console.error('Error adding attendee:', error);
            onToast('Lỗi', 'Không thể thêm người tham dự', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttendee = async (attendeeId) => {
        if (!window.confirm('Bạn có chắc muốn xóa người tham dự này?')) return;

        try {
            setLoading(true);
            await removeAttendee(attendeeId);
            onToast('Thành công', 'Xóa người tham dự thành công', 'success');
            onSuccess();
        } catch (error) {
            onToast('Lỗi', 'Không thể xóa người tham dự', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'CHU_TOA': return 'Chủ tọa';
            case 'THU_KY': return 'Thư ký';
            case 'THANH_VIEN': return 'Thành viên';
            default: return role;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content attendee-modal"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '700px', width: '90%', overflow: 'hidden' }}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Quản lý người tham dự</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto', overflowX: 'hidden', padding: '20px' }}>
                    {/* Add New Attendee Form */}
                    <div className="add-attendee-section" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Thêm người tham dự</h4>

                            {/* Search Bar */}
                            <div style={{ flex: 1, maxWidth: '400px', marginLeft: '20px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm kiếm giáo viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <form onSubmit={handleAddAttendee}>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label">Vai trò</label>
                                    <select
                                        className="form-select"
                                        name="attendeeRole"
                                        value={newAttendee.attendeeRole}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Chọn vai trò</option>
                                        <option value="CHU_TOA">Chủ tọa</option>
                                        <option value="THU_KY">Thư ký</option>
                                        <option value="THANH_VIEN">Thành viên</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Giáo viên</label>
                                    {loadingTeachers ? (
                                        <div className="form-control">
                                            <span className="text-muted">Đang tải danh sách giáo viên...</span>
                                        </div>
                                    ) : (
                                        <select
                                            className="form-select"
                                            name="attendeeUserId"
                                            value={newAttendee.attendeeUserId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Chọn giáo viên</option>
                                            {getAvailableTeachers().map(teacher => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.username}
                                                    {teacher.email && ` (${teacher.email})`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {getAvailableTeachers().length === 0 && !loadingTeachers && (
                                        <small className="form-text text-muted">
                                            Tất cả giáo viên đã được thêm vào danh sách
                                        </small>
                                    )}
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading || loadingTeachers || getAvailableTeachers().length === 0}
                                    >
                                        <i className="bi bi-plus"></i>
                                        Thêm
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Attendees List */}
                    <div className="attendees-list-section">
                        <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Danh sách người tham dự</h4>
                        {attendees.length === 0 ? (
                            <p className="text-muted">Chưa có người tham dự nào</p>
                        ) : (
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    width: '100%'
                                }}
                            >
                                <table
                                    className="table table-sm table-hover"
                                    style={{
                                        marginBottom: 0,
                                        minWidth: 'auto',
                                        width: '100%',
                                        tableLayout: 'fixed'
                                    }}
                                >
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ width: 'auto' }}>Tên</th>
                                            <th style={{ width: 'auto' }}>Vai trò</th>
                                            <th style={{ width: '80px', minWidth: '60px', textAlign: 'center' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.map(attendee => (
                                            <tr key={attendee.id}>
                                                <td style={{
                                                    wordBreak: 'break-word',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: 0
                                                }}>
                                                    {attendee.attendeeName}
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <span className="badge badge-status secondary">
                                                        {getRoleLabel(attendee.attendeeRole)}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '80px', minWidth: '60px' }}>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRemoveAttendee(attendee.id)}
                                                        disabled={loading}
                                                        style={{
                                                            minWidth: '36px',
                                                            width: '36px',
                                                            height: '36px',
                                                            padding: '0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="Xóa"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialAttendeeModal;

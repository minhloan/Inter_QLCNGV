import { useState } from 'react';
import { addAttendee, removeAttendee } from '../api/trial';

const TrialAttendeeModal = ({ trialId, attendees, onClose, onSuccess, onToast }) => {
    const [newAttendee, setNewAttendee] = useState({
        attendeeName: '',
        attendeeRole: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAttendee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAttendee = async (e) => {
        e.preventDefault();

        if (!newAttendee.attendeeName || !newAttendee.attendeeRole) {
            onToast('Lỗi', 'Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        try {
            setLoading(true);
            const attendeeData = {
                trialId,
                attendeeName: newAttendee.attendeeName,
                attendeeRole: newAttendee.attendeeRole
            };

            await addAttendee(attendeeData);
            setNewAttendee({ attendeeName: '', attendeeRole: '' });
            onToast('Thành công', 'Thêm người tham dự thành công', 'success');
            onSuccess();
        } catch (error) {
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
            <div className="modal-content attendee-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Quản lý người tham dự</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Add New Attendee Form */}
                    <div className="add-attendee-section">
                        <h4>Thêm người tham dự</h4>
                        <form onSubmit={handleAddAttendee}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tên người tham dự</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="attendeeName"
                                        value={newAttendee.attendeeName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên người tham dự"
                                        required
                                    />
                                </div>
                                <div className="form-group">
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
                                <div className="form-group">
                                    <label className="form-label visually-hidden">Thêm</label>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
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
                        <h4>Danh sách người tham dự</h4>
                        {attendees.length === 0 ? (
                            <p className="text-muted">Chưa có người tham dự nào</p>
                        ) : (
                            <div className="attendees-table">
                                <table className="table table-sm">
                                    <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Vai trò</th>
                                        <th>Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {attendees.map(attendee => (
                                        <tr key={attendee.id}>
                                            <td>{attendee.attendeeName}</td>
                                            <td>
                                                <span className="badge badge-secondary">
                                                    {getRoleLabel(attendee.attendeeRole)}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveAttendee(attendee.id)}
                                                    disabled={loading}
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

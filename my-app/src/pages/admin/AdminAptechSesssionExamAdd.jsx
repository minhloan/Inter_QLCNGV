import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { createAptechExamSession, getAptechExamSessions } from '../../api/aptechExam';

const initialForm = {
    examDate: '',
    examTime: '',
    room: '',
    note: ''
};

const AdminAptechSesssionExamAdd = () => {
    const navigate = useNavigate();
    const isMountedRef = useRef(true);
    const [form, setForm] = useState(initialForm);
    const [sessions, setSessions] = useState([]);
    const [initializing, setInitializing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
    const formSectionWidth = '1200px';

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        fetchSessions(true);
    }, []);

    const fetchSessions = async (initial = false) => {
        try {
            if (initial) setInitializing(true);
            const data = await getAptechExamSessions();
            setSessions(data || []);
        } catch (error) {
            showToast('Lỗi', 'Không thể tải danh sách đợt thi Aptech', 'danger');
        } finally {
            if (initial) setInitializing(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: field === 'room' ? value.toUpperCase() : value
        }));
    };

    const normalizeTimePayload = (value) => {
        if (!value) return null;
        return value.length === 5 ? `${value}:00` : value;
    };

    const hasRoomConflict = useMemo(() => {
        if (!form.examDate || !form.room.trim()) return false;
        return sessions.some(session =>
            session.examDate === form.examDate &&
            (session.room || '').toUpperCase() === form.room.trim().toUpperCase()
        );
    }, [form.examDate, form.room, sessions]);

    const validateForm = () => {
        if (!form.examDate) {
            showToast('Thiếu thông tin', 'Vui lòng chọn ngày thi', 'warning');
            return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(form.examDate);
        if (selectedDate < today) {
            showToast('Không hợp lệ', 'Ngày thi phải từ hôm nay trở đi', 'warning');
            return false;
        }
        if (!form.examTime) {
            showToast('Thiếu thông tin', 'Vui lòng chọn giờ thi', 'warning');
            return false;
        }
        if (!form.room.trim()) {
            showToast('Thiếu thông tin', 'Vui lòng nhập phòng thi', 'warning');
            return false;
        }
        if (hasRoomConflict) {
            showToast('Trùng lịch', 'Phòng này đã được đặt trong ngày đã chọn', 'danger');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            await createAptechExamSession({
                examDate: form.examDate,
                examTime: normalizeTimePayload(form.examTime),
                room: form.room.trim().toUpperCase(),
                note: form.note?.trim() || ''
            });
            showToast('Thành công', 'Đã tạo đợt thi Aptech mới', 'success');
            console.log('Đã tạo đợt thi Aptech mới');

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setForm(initialForm);
                setSubmitting(false);
            }

            // Navigate immediately (don't wait for re-renders or state updates)
            navigate('/admin/aptech-exam/sessions');
            return;
        } catch (error) {
            const serverMessage = error?.response?.data;
            const message = typeof serverMessage === 'string' && serverMessage.trim()
                ? serverMessage
                : 'Không thể tạo đợt thi Aptech';
            showToast('Lỗi', message, 'danger');
            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setSubmitting(false);
            }
        }
    };

    const resetForm = () => setForm(initialForm);

    if (initializing) {
        return <Loading fullscreen={true} message="Đang tải thông tin đợt thi Aptech..." />;
    }

    return (
        <MainLayout>
            <div
                className="page-admin-add-teacher page-align-with-form"
                style={{ '--page-section-width': formSectionWidth }}
            >
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Tạo đợt thi Aptech</h1>
                    </div>
                </div>

                <div className="form-container" style={{ width: '100%', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3 className="section-title">Thông tin đợt thi</h3>
                            <div className="form-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '24px'
                            }}>
                                <div className="form-group">
                                    <label className="form-label">Ngày thi *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.examDate}
                                        onChange={(e) => handleFieldChange('examDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Giờ thi *</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={form.examTime}
                                        onChange={(e) => handleFieldChange('examTime', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phòng thi *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${hasRoomConflict ? 'is-invalid' : ''}`}
                                        placeholder="VD: LAB01"
                                        value={form.room}
                                        onChange={(e) => handleFieldChange('room', e.target.value)}
                                        maxLength={50}
                                        required
                                    />
                                    {hasRoomConflict && (
                                        <div className="invalid-feedback d-block">
                                            Phòng đã có lịch trong ngày này.
                                        </div>
                                    )}
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={form.note}
                                        onChange={(e) => handleFieldChange('note', e.target.value)}
                                        placeholder="Thông tin bổ sung (tùy chọn)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-light" onClick={resetForm} disabled={submitting}>
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Làm mới
                            </button>
                            <div style={{ flex: 1 }} />
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
                                <i className="bi bi-arrow-left"></i>
                                Quay lại
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle"></i>
                                        Tạo đợt thi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
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

export default AdminAptechSesssionExamAdd;

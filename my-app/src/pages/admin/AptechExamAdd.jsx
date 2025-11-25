import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { createAptechExamSession } from '../../api/aptechExam';

const AptechExamAdd = () => {
    const navigate = useNavigate();
    const [examDate, setExamDate] = useState('');
    const [examTime, setExamTime] = useState('');
    const [room, setRoom] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const parseDateToISO = (dateStr, timeStr) => {
        if (!dateStr) return null;
        // Accept YYYY-MM-DD or DD/MM/YYYY
        let date = dateStr;
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        const time = timeStr || '00:00';
        return new Date(`${date}T${time}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = parseDateToISO(examDate, examTime);
        if (!start || isNaN(start.getTime())) {
            showToast('Lỗi', 'Vui lòng nhập ngày giờ hợp lệ', 'danger');
            return;
        }

        const now = new Date();
        if (start.getTime() < now.getTime()) {
            showToast('Lỗi', 'Không thể tạo phiên thi với thời gian trong quá khứ', 'danger');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                examDate: examDate,
                examTime: examTime,
                room: room,
                note: note
            };
            await createAptechExamSession(payload);
            showToast('Thành công', 'Đã tạo phiên thi mới', 'success');
            setTimeout(() => navigate('/aptech-exam-management'), 1500);
        } catch (err) {
            const resp = err?.response?.data;
            let message = 'Không thể tạo phiên thi';
            if (resp) {
                if (typeof resp === 'string') message = resp;
                else if (resp.detail) message = resp.detail;
                else if (resp.message) message = resp.message;
                else message = JSON.stringify(resp);
            } else if (err?.message) {
                message = err.message;
            }

            if (err?.response?.status === 405) {
                message = 'Backend không hỗ trợ tạo phiên thi (405 Method Not Allowed).';
            }

            showToast('Lỗi', message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="page-admin-add-aptech page-align-with-form" style={{ '--page-section-width': '900px' }}>
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Thêm phiên thi Aptech</h1>
                    </div>
                </div>

                <div className="form-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3 className="section-title">Thông tin Phiên thi</h3>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Ngày thi *</label>
                                    <input type="date" className="form-control" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Giờ thi *</label>
                                    <input type="time" className="form-control" value={examTime} onChange={(e) => setExamTime(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phòng thi</label>
                                    <input type="text" className="form-control" value={room} onChange={(e) => setRoom(e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ghi chú</label>
                                    <input type="text" className="form-control" value={note} onChange={(e) => setNote(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/aptech-exam-management')}>
                                <i className="bi bi-arrow-left"></i>
                                Quay lại
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-check-circle"></i>
                                Tạo phiên thi
                            </button>
                        </div>
                    </form>
                </div>

                {loading && <Loading />}
                {toast.show && (
                    <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
                )}
            </div>
        </MainLayout>
    );
};

export default AptechExamAdd;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getTrialById, evaluateTrial, getEvaluationByAttendee, uploadTrialReport } from '../../api/trial';

const TrialEvaluationForm = () => {
    const { trialId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { attendeeId, evaluation: existingEvaluation, readOnly } = location.state || {};

    const [trial, setTrial] = useState(null);
    const [formData, setFormData] = useState({
        score: '',
        comments: '',
        conclusion: '',
        imageFile: null
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        if (trialId) {
            loadTrialData();
        }
    }, [trialId]);

    useEffect(() => {
        if (existingEvaluation) {
            setFormData({
                score: existingEvaluation.score || '',
                comments: existingEvaluation.comments || '',
                conclusion: existingEvaluation.conclusion || '',
                imageFile: null
            });
        }
    }, [existingEvaluation]);

    const loadTrialData = async () => {
        try {
            setLoading(true);
            const trialData = await getTrialById(trialId);
            setTrial(trialData);

            // If attendeeId is provided and no existing evaluation, try to load it
            if (attendeeId && !existingEvaluation) {
                try {
                    const evalData = await getEvaluationByAttendee(attendeeId);
                    setFormData({
                        score: evalData.score || '',
                        comments: evalData.comments || '',
                        conclusion: evalData.conclusion || '',
                        imageFile: null
                    });
                } catch (error) {
                    // Evaluation doesn't exist yet, that's fine
                }
            }
        } catch (error) {
            console.error('Error loading trial:', error);
            showToast('Lỗi', 'Không thể tải thông tin giảng thử', 'danger');
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            imageFile: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!attendeeId) {
            showToast('Lỗi', 'Thông tin người chấm không hợp lệ', 'danger');
            return;
        }

        if (!formData.score || !formData.conclusion) {
            showToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        const score = parseInt(formData.score);
        if (isNaN(score) || score < 0 || score > 100) {
            showToast('Lỗi', 'Điểm số phải từ 0 đến 100', 'warning');
            return;
        }

        try {
            setSubmitting(true);

            let imageFileId = null;

            // Upload file first if provided
            if (formData.imageFile) {
                const fileResponse = await uploadTrialReport(formData.imageFile, trialId);
                imageFileId = fileResponse.id || fileResponse.fileId;
            } else if (existingEvaluation?.imageFileId) {
                // Keep existing image if no new file uploaded
                imageFileId = existingEvaluation.imageFileId;
            }

            // Submit evaluation
            const evaluationData = {
                attendeeId: attendeeId,
                trialId: trialId,
                score: score,
                comments: formData.comments,
                conclusion: formData.conclusion,
                imageFileId: imageFileId
            };

            await evaluateTrial(evaluationData);

            showToast('Thành công', 'Đánh giá giảng thử thành công', 'success');
            setTimeout(() => {
                navigate('/my-reviews');
            }, 1500);
        } catch (error) {
            console.error('Error evaluating trial:', error);
            showToast('Lỗi', error.response?.data?.message || 'Không thể đánh giá giảng thử', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    if (loading) {
        return <MainLayout><Loading /></MainLayout>;
    }

    if (!trial) {
        return (
            <MainLayout>
                <div className="container-fluid py-4">
                    <div className="alert alert-danger">Không tìm thấy thông tin giảng thử</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="page-admin-trial page-teacher-trial-evaluation">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">{readOnly ? 'Xem đánh giá' : 'Chấm giảng thử'}</h1>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-6 detail-section">
                                <h5>Thông tin buổi giảng thử</h5>
                                <div className="table-responsive">
                                    <table className="table table-borderless detail-table mb-0">
                                        <tbody>
                                            <tr>
                                                <td>Giảng viên:</td>
                                                <td className="text-break">
                                                    {trial.teacherName}
                                                    {trial.teacherCode && ` (${trial.teacherCode})`}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Môn học:</td>
                                                <td className="text-break">{trial.subjectName}</td>
                                            </tr>
                                            <tr>
                                                <td>Ngày giảng:</td>
                                                <td className="text-break">
                                                    {trial.teachingDate && new Date(trial.teachingDate).toLocaleDateString('vi-VN')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Giờ:</td>
                                                <td className="text-break">{trial.teachingTime || 'N/A'}</td>
                                            </tr>
                                            {trial.location && (
                                                <tr>
                                                    <td>Địa điểm:</td>
                                                    <td className="text-break">{trial.location}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-md-6 detail-section">
                                <h5>Đánh giá</h5>
                                {readOnly && existingEvaluation ? (
                                    <div className="table-responsive">
                                        <table className="table table-borderless detail-table mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>Điểm số:</td>
                                                    <td>{formData.score}/100</td>
                                                </tr>
                                                <tr>
                                                    <td>Kết luận:</td>
                                                    <td>
                                                        {formData.conclusion === 'PASS' ? (
                                                            <span className="badge badge-status success">ĐẠT</span>
                                                        ) : formData.conclusion === 'FAIL' ? (
                                                            <span className="badge badge-status danger">KHÔNG ĐẠT</span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                </tr>
                                                {formData.comments && (
                                                    <tr>
                                                        <td>Nhận xét:</td>
                                                        <td className="text-break">{formData.comments}</td>
                                                    </tr>
                                                )}
                                                {existingEvaluation?.imageFileId && (
                                                    <tr>
                                                        <td>Biên bản:</td>
                                                        <td>
                                                            <a
                                                                href={`/api/file/get/${existingEvaluation.imageFileId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                <i className="bi bi-file-earmark me-1"></i>
                                                                Xem file
                                                            </a>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Điểm số <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="score"
                                                value={formData.score}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                required
                                                disabled={readOnly}
                                            />
                                            <small className="form-text text-muted">Điểm từ 0 đến 100</small>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Kết luận <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                name="conclusion"
                                                value={formData.conclusion}
                                                onChange={handleInputChange}
                                                required
                                                disabled={readOnly}
                                            >
                                                <option value="">Chọn kết luận</option>
                                                <option value="PASS">Đạt yêu cầu</option>
                                                <option value="FAIL">Không đạt yêu cầu</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nhận xét</label>
                                            <textarea
                                                className="form-control"
                                                name="comments"
                                                value={formData.comments}
                                                onChange={handleInputChange}
                                                rows="5"
                                                placeholder="Nhập nhận xét chi tiết về buổi giảng thử..."
                                                disabled={readOnly}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Upload ảnh biên bản</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                disabled={readOnly}
                                            />
                                            <small className="form-text text-muted">
                                                Chấp nhận file ảnh hoặc PDF (tối đa 10MB)
                                            </small>
                                            {existingEvaluation?.imageFileId && (
                                                <div className="mt-2">
                                                    <a
                                                        href={`/api/file/get/${existingEvaluation.imageFileId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        <i className="bi bi-file-earmark me-1"></i>
                                                        Xem file hiện tại
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {!readOnly && (
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate(-1)}
                                                    disabled={submitting}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Đang lưu...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-check-circle me-1"></i>
                                                            Lưu đánh giá
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default TrialEvaluationForm;


import { useState, useEffect } from 'react';
import { evaluateTrial, uploadTrialReport } from '../api/trial';

const TrialEvaluationModal = ({ trialId, trial, evaluation, onClose, onSuccess, onToast }) => {
    const [formData, setFormData] = useState({
        score: evaluation?.score || '',
        comments: evaluation?.comments || '',
        conclusion: evaluation?.conclusion || '',
        fileReport: null
    });
    const [loading, setLoading] = useState(false);

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
            fileReport: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.score || !formData.conclusion) {
            onToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }

        if (formData.score < 1 || formData.score > 100) {
            onToast('Lỗi', 'Điểm số phải từ 1 đến 100', 'warning');
            return;
        }

        try {
            setLoading(true);

            let imageFileId = null;

            // Upload file first if provided
            if (formData.fileReport) {
                imageFileId = await uploadTrialReport(formData.fileReport, trialId);
            }

            // Submit evaluation with file ID
            const evaluationData = {
                trialId,
                score: parseInt(formData.score),
                comments: formData.comments,
                conclusion: formData.conclusion,
                imageFileId: imageFileId
            };

            await evaluateTrial(evaluationData);

            onToast('Thành công', 'Đánh giá giảng thử thành công', 'success');
            onSuccess();
        } catch (error) {
            console.error('Error evaluating trial:', error);
            onToast('Lỗi', 'Không thể đánh giá giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content evaluation-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Đánh giá giảng thử</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="trial-info-summary">
                        <div className="info-row">
                            <span className="label">Giảng viên:</span>
                            <span className="value">{trial?.teacherName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Môn học:</span>
                            <span className="value">{trial?.subjectName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ngày giảng thử:</span>
                            <span className="value">{trial?.teachingDate}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Giờ giảng thử:</span>
                            <span className="value">{trial?.trialTime || 'N/A'}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Điểm số <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                name="score"
                                value={formData.score}
                                onChange={handleInputChange}
                                min="1"
                                max="100"
                                step="0.1"
                                required
                            />
                            <small className="form-text text-muted">Điểm từ 1 đến 100</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Kết luận <span className="required">*</span>
                            </label>
                            <select
                                className="form-select"
                                name="conclusion"
                                value={formData.conclusion}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn kết luận</option>
                                <option value="PASS">Đạt yêu cầu</option>
                                <option value="FAIL">Không đạt yêu cầu</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nhận xét</label>
                            <textarea
                                className="form-control"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Nhập nhận xét chi tiết về buổi giảng thử..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload biên bản</label>
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            <small className="form-text text-muted">
                                Chấp nhận file PDF, DOC, DOCX (tối đa 10MB)
                            </small>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu đánh giá'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TrialEvaluationModal;

import React, { useState, useEffect } from 'react';
import { evaluateTrial, uploadTrialReport } from '../api/trial';

// Danh sách 22 tiêu chí đánh giá (theo template BM06.40)
const EVALUATION_CRITERIA = [
    // 1-1 Explanation (Giải thích)
    { code: '1-1', label: 'Smooth Explanations / Proper Pause', labelVi: 'Giải thích trôi chảy / Dừng hợp lý', category: '1-1 Explanation (Giải thích)' },
    { code: '1-2', label: 'Easily Understanding Explanation of the Contents', labelVi: 'Giải thích nội dung bài giảng dễ hiểu', category: '1-1 Explanation (Giải thích)' },
    { code: '1-3', label: 'Emphasizing Important Points', labelVi: 'Nhấn mạnh những điểm quan trọng', category: '1-1 Explanation (Giải thích)' },
    { code: '1-4', label: 'Confidently Speaking', labelVi: 'Giảng bài có tự tin không?', category: '1-1 Explanation (Giải thích)' },
    { code: '1-5', label: 'Explanation so to Invoke Proper Question from Students', labelVi: 'Giảng bài có gợi ý sinh viên đặt những câu hỏi hợp lý?', category: '1-1 Explanation (Giải thích)' },
    
    // 1-2 Voice and Aural Presentation Method
    { code: '1-6', label: 'Volume of the Voice', labelVi: 'Âm lượng của giọng nói', category: '1-2 Voice and Aural Presentation Method' },
    { code: '1-7', label: 'Clarity of the Voice', labelVi: 'Giọng nói có rõ ràng không?', category: '1-2 Voice and Aural Presentation Method' },
    { code: '1-8', label: 'Explanation Speed', labelVi: 'Tốc độ giảng bài', category: '1-2 Voice and Aural Presentation Method' },
    
    // 2-1 Flow of the Lecture
    { code: '1-9', label: 'Explanation of Learning Objectives of the Chapter/Section', labelVi: 'Giải thích mục tiêu bài giảng', category: '2-1 Flow of the Lecture' },
    { code: '1-10', label: 'Using examples', labelVi: 'Sử dụng các ví dụ', category: '2-1 Flow of the Lecture' },
    { code: '1-11', label: 'Asking Questions to the Students', labelVi: 'Đặt những câu hỏi đối với sinh viên', category: '2-1 Flow of the Lecture' },
    { code: '1-12', label: 'Summarization of the Chapter/Section', labelVi: 'Tóm tắt bài giảng', category: '2-1 Flow of the Lecture' },
    
    // 2-2 Time Distribution & Time Management
    { code: '1-13', label: 'Time Frame Distribution', labelVi: 'Phân bổ thời gian bài giảng', category: '2-2 Time Distribution & Time Management' },
    { code: '1-14', label: 'Sufficient Time for Explaining Points', labelVi: 'Đủ thời gian để giải thích các điểm trong bài giảng', category: '2-2 Time Distribution & Time Management' },
    { code: '1-15', label: 'Closing lecture as planed', labelVi: 'Kết thúc bài giảng đúng kế hoạch', category: '2-2 Time Distribution & Time Management' },
    { code: '1-16', label: 'Appropriate Handling of Questions instructor can Answer Immediately', labelVi: 'Những câu hỏi hợp lý của sinh viên, giáo viên có thể trả lời ngay?', category: '2-2 Time Distribution & Time Management' },
    
    // 2-3 Question Handling
    { code: '1-17', label: 'Setting Time for students to Ask Questions', labelVi: 'Thiết lập thời gian cho sinh viên đặt câu hỏi', category: '2-3 Question Handling' },
    { code: '1-18', label: 'Appropriate Answers to Questions', labelVi: 'Trả lời thích hợp những câu hỏi của sinh viên', category: '2-3 Question Handling' },
    
    // 3 Use of Resources
    { code: '1-19', label: 'Use of Resources (OHP, Slides, Board writing...)', labelVi: 'Sử dụng tài nguyên', category: '3 Use of Resources' },
    
    // 4 Attitude (Điệu bộ)
    { code: '1-20', label: 'Eye Contact with Entire Class', labelVi: 'Nhìn bao quát lớp', category: '4 Attitude (Điệu bộ)' },
    { code: '1-21', label: 'Natural Posture', labelVi: 'Cử chỉ tự nhiên', category: '4 Attitude (Điệu bộ)' },
    { code: '1-22', label: 'Habitual Behaviours', labelVi: 'Giao tiếp thân thiện', category: '4 Attitude (Điệu bộ)' },
];

const TrialEvaluationModal = ({ trialId, trial, evaluation, attendeeId, attendees = [], onClose, onSuccess, onToast }) => {
    // State cho điểm từng tiêu chí
    const [criterionScores, setCriterionScores] = useState({});
    const [formData, setFormData] = useState({
        selectedAttendeeId: attendeeId || evaluation?.attendeeId || '',
        score: evaluation?.score || '',
        comments: evaluation?.comments || '',
        conclusion: evaluation?.conclusion || '',
        fileReport: null
    });
    const [loading, setLoading] = useState(false);
    const [showDetailedForm, setShowDetailedForm] = useState(true); // Mặc định hiển thị form chi tiết

    // Load điểm chi tiết từ evaluation nếu có
    useEffect(() => {
        if (evaluation?.items && evaluation.items.length > 0) {
            const scores = {};
            evaluation.items.forEach(item => {
                if (item.criterionCode && item.score) {
                    scores[item.criterionCode] = item.score;
                }
            });
            setCriterionScores(scores);
        }
    }, [evaluation]);

    // Cập nhật selectedAttendeeId khi attendeeId thay đổi
    useEffect(() => {
        if (attendeeId) {
            setFormData(prev => ({
                ...prev,
                selectedAttendeeId: attendeeId
            }));
        }
    }, [attendeeId]);

    // Tính điểm trung bình từ các tiêu chí (scale 1-5 -> 0-100)
    const calculateAverageScore = () => {
        const scores = Object.values(criterionScores).filter(s => s && s >= 1 && s <= 5);
        if (scores.length === 0) return null;
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        // Convert 1-5 scale to 0-100: (avg - 1) * 25
        return Math.round((avg - 1) * 25);
    };

    const handleCriterionScoreChange = (code, value) => {
        const score = value ? parseInt(value) : null;
        setCriterionScores(prev => {
            const updated = { ...prev };
            if (score && score >= 1 && score <= 5) {
                updated[code] = score;
            } else {
                delete updated[code];
            }
            
            // Auto-update tổng điểm và kết luận
            const avgScore = calculateAverageScore();
            if (avgScore !== null) {
                setFormData(prevData => ({
                    ...prevData,
                    score: avgScore,
                    conclusion: avgScore >= 60 ? 'PASS' : 'FAIL'
                }));
            }
            
            return updated;
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };

            // Auto-set conclusion based on score
            if (name === 'score') {
                const score = parseFloat(value);
                if (!isNaN(score)) {
                    if (score >= 0 && score <= 59) {
                        newData.conclusion = 'FAIL';
                    } else if (score >= 60 && score <= 100) {
                        newData.conclusion = 'PASS';
                    }
                }
            }

            return newData;
        });
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

        if (!formData.selectedAttendeeId) {
            onToast('Lỗi', 'Vui lòng chọn giáo viên đánh giá', 'warning');
            return;
        }

        // Nếu dùng form chi tiết, kiểm tra có ít nhất 1 tiêu chí được chấm
        if (showDetailedForm) {
            const hasAnyScore = Object.keys(criterionScores).length > 0;
            if (!hasAnyScore) {
                onToast('Lỗi', 'Vui lòng chấm ít nhất một tiêu chí', 'warning');
                return;
            }
        } else {
            // Form đơn giản: cần điểm và kết luận
            if (!formData.score || !formData.conclusion) {
                onToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
                return;
            }
            if (formData.score < 1 || formData.score > 100) {
                onToast('Lỗi', 'Điểm số phải từ 1 đến 100', 'warning');
                return;
            }
        }

        try {
            setLoading(true);

            let imageFileId = null;

            // Upload file first if provided
            if (formData.fileReport) {
                imageFileId = await uploadTrialReport(formData.fileReport, trialId);
            }

            // Build criteria list nếu dùng form chi tiết
            const criteria = showDetailedForm && Object.keys(criterionScores).length > 0
                ? Object.entries(criterionScores).map(([code, score]) => ({
                    code,
                    score,
                    comment: null // Có thể mở rộng thêm comment riêng cho từng tiêu chí sau
                }))
                : null;

            // Submit evaluation
            const evaluationData = {
                attendeeId: formData.selectedAttendeeId,
                trialId: trialId,
                score: formData.score || calculateAverageScore() || null, // Dùng điểm từ form hoặc tự tính
                comments: formData.comments,
                conclusion: formData.conclusion || (calculateAverageScore() >= 60 ? 'PASS' : 'FAIL'),
                imageFileId: imageFileId,
                criteria: criteria // Gửi kèm danh sách điểm chi tiết
            };

            await evaluateTrial(evaluationData);

            onToast('Thành công', 'Đánh giá giảng thử thành công', 'success');
            onSuccess();
        } catch (error) {
            console.error('Error evaluating trial:', error);
            onToast('Lỗi', error.response?.data?.message || 'Không thể đánh giá giảng thử', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Group criteria by category
    const groupedCriteria = EVALUATION_CRITERIA.reduce((acc, criterion) => {
        const category = criterion.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(criterion);
        return acc;
    }, {});

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content evaluation-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
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
                            <span className="value">{trial?.teachingTime || 'N/A'}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Giáo viên đánh giá <span className="required">*</span>
                            </label>
                            {attendees.length === 0 ? (
                                <div className="alert alert-warning">
                                    <i className="bi bi-exclamation-triangle"></i> Chưa có người tham dự nào. Vui lòng thêm người tham dự trước khi đánh giá.
                                </div>
                            ) : (
                                <select
                                    className="form-select"
                                    name="selectedAttendeeId"
                                    value={formData.selectedAttendeeId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!attendeeId}
                                >
                                    <option value="">Chọn giáo viên đánh giá</option>
                                    {attendees.map(attendee => (
                                        <option key={attendee.id} value={attendee.id}>
                                            {attendee.attendeeName}
                                            {attendee.attendeeRole && ` - ${attendee.attendeeRole === 'CHU_TOA' ? 'Chủ tọa' :
                                                attendee.attendeeRole === 'THU_KY' ? 'Thư ký' : 'Thành viên'}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <small className="form-text text-muted">
                                {attendeeId
                                    ? 'Bạn đang đánh giá với vai trò được phân công'
                                    : 'Chọn giáo viên từ danh sách người tham dự để thực hiện đánh giá'}
                            </small>
                        </div>

                        {/* Toggle giữa form chi tiết và form đơn giản */}
                        <div className="form-group">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="toggleDetailedForm"
                                    checked={showDetailedForm}
                                    onChange={(e) => setShowDetailedForm(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="toggleDetailedForm">
                                    <strong>Đánh giá chi tiết từng tiêu chí (17 tiêu chí)</strong>
                                </label>
                            </div>
                            <small className="form-text text-muted">
                                {showDetailedForm
                                    ? 'Chấm điểm từng tiêu chí (1-5), hệ thống sẽ tự tính điểm tổng'
                                    : 'Chấm điểm tổng trực tiếp (1-100)'}
                            </small>
                        </div>

                        {showDetailedForm ? (
                            /* FORM CHI TIẾT - Bảng các tiêu chí */
                            <>
                                <div className="form-group">
                                    <label className="form-label">
                                        <strong>Đánh giá chi tiết từng tiêu chí</strong> <span className="required">*</span>
                                    </label>
                                    <div className="alert alert-info mb-3">
                                        <i className="bi bi-info-circle me-2"></i>
                                        <strong>Thang điểm:</strong> 5 = Excellent, 4 = Good, 3 = Satisfactory, 2 = Need improvement, 1 = Need extensive improvement
                                    </div>
                                    
                                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table className="table table-sm table-bordered table-hover">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th style={{ width: '5%' }}>STT</th>
                                                    <th style={{ width: '60%' }}>Tiêu chí đánh giá</th>
                                                    <th style={{ width: '15%' }}>Điểm (1-5)</th>
                                                    <th style={{ width: '20%' }}>Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(groupedCriteria).map(([category, criteria]) => (
                                                    <React.Fragment key={category}>
                                                        <tr className="table-secondary">
                                                            <td colSpan="4" className="fw-bold">
                                                                {category}
                                                            </td>
                                                        </tr>
                                                        {criteria.map((criterion, idx) => (
                                                            <tr key={criterion.code}>
                                                                <td className="text-center">{criterion.code}</td>
                                                                <td>
                                                                    <div>
                                                                        <strong>{criterion.label}</strong>
                                                                        <br />
                                                                        <small className="text-muted">{criterion.labelVi}</small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={criterionScores[criterion.code] || ''}
                                                                        onChange={(e) => handleCriterionScoreChange(criterion.code, e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">—</option>
                                                                        <option value="5">5 - Excellent</option>
                                                                        <option value="4">4 - Good</option>
                                                                        <option value="3">3 - Satisfactory</option>
                                                                        <option value="2">2 - Need improvement</option>
                                                                        <option value="1">1 - Need extensive</option>
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="Ghi chú (tùy chọn)"
                                                                        maxLength={100}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Hiển thị điểm tổng tự động tính */}
                                    {Object.keys(criterionScores).length > 0 && (
                                        <div className="alert alert-success mt-2 mb-0">
                                            <i className="bi bi-calculator me-2"></i>
                                            <strong>Điểm trung bình tự động:</strong> {calculateAverageScore()} / 100
                                            <br />
                                            <small>
                                                (Từ {Object.keys(criterionScores).length} tiêu chí đã chấm, thang điểm 1-5)
                                            </small>
                                        </div>
                                    )}
                                </div>

                                {/* Kết luận (tự động hoặc cho phép chỉnh) */}
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
                                    <small className="form-text text-muted">
                                        Kết luận được tự động đặt dựa trên điểm số (tự động: &gt;= 60 = Đạt, &lt; 60 = Không đạt)
                                    </small>
                                </div>
                            </>
                        ) : (
                            /* FORM ĐƠN GIẢN - Chỉ điểm tổng */
                            <>
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
                                        disabled={formData.score !== '' && formData.score !== null && formData.score !== undefined}
                                    >
                                        <option value="">Chọn kết luận</option>
                                        <option value="PASS">Đạt yêu cầu</option>
                                        <option value="FAIL">Không đạt yêu cầu</option>
                                    </select>
                                    {formData.score !== '' && formData.score !== null && formData.score !== undefined && (
                                        <small className="form-text text-muted">
                                            Kết luận được tự động đặt dựa trên điểm số (0-59: Không đạt, 60-100: Đạt)
                                        </small>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Nhận xét chung */}
                        <div className="form-group">
                            <label className="form-label">Nhận xét tổng quát</label>
                            <textarea
                                className="form-control"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Nhập nhận xét tổng quát về buổi giảng thử..."
                            />
                        </div>

                        {/* Upload biên bản */}
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
                                disabled={loading || attendees.length === 0}
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

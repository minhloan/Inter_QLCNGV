import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { getTrialById, evaluateTrial, getEvaluationByAttendee, uploadTrialReport } from '../../api/trial';
import React from 'react';

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

const TrialEvaluationForm = () => {
    const { trialId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { attendeeId, attendees: initialAttendees, evaluation: existingEvaluation, readOnly } = location.state || {};

    const [trial, setTrial] = useState(null);
    const [attendees, setAttendees] = useState(initialAttendees || []);

    // State cho form
    const [formData, setFormData] = useState({
        selectedAttendeeId: attendeeId || existingEvaluation?.attendeeId || '',
        score: '',
        comments: '',
        conclusion: '',
        imageFile: null
    });

    // State cho điểm chi tiết
    const [criterionScores, setCriterionScores] = useState({});
    const [showDetailedForm, setShowDetailedForm] = useState(true);

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
            setFormData(prev => ({
                ...prev,
                score: existingEvaluation.score || '',
                comments: existingEvaluation.comments || '',
                conclusion: existingEvaluation.conclusion || '',
                imageFile: null
            }));

            // Load điểm chi tiết nếu có
            if (existingEvaluation.items && existingEvaluation.items.length > 0) {
                const scores = {};
                existingEvaluation.items.forEach(item => {
                    if (item.criterionCode && item.score) {
                        scores[item.criterionCode] = item.score;
                    }
                });
                setCriterionScores(scores);
                setShowDetailedForm(true);
            }
        }
    }, [existingEvaluation]);

    const loadTrialData = async () => {
        try {
            setLoading(true);
            const trialData = await getTrialById(trialId);
            setTrial(trialData);

            // Nếu không có attendees từ state, lấy từ trial data
            if (attendees.length === 0 && trialData.attendees) {
                setAttendees(trialData.attendees);
            }

            // Nếu đã chọn attendeeId (hoặc có sẵn) và chưa có evaluation, thử load
            const currentAttendeeId = formData.selectedAttendeeId || attendeeId;
            if (currentAttendeeId && !existingEvaluation) {
                try {
                    const evalData = await getEvaluationByAttendee(currentAttendeeId);
                    if (evalData) {
                        setFormData(prev => ({
                            ...prev,
                            score: evalData.score || '',
                            comments: evalData.comments || '',
                            conclusion: evalData.conclusion || '',
                            imageFile: null
                        }));

                        if (evalData.items && evalData.items.length > 0) {
                            const scores = {};
                            evalData.items.forEach(item => {
                                if (item.criterionCode && item.score) {
                                    scores[item.criterionCode] = item.score;
                                }
                            });
                            setCriterionScores(scores);
                            setShowDetailedForm(true);
                        }
                    }
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

    // Tính điểm trung bình từ các tiêu chí (scale 1-5 -> 0-100)
    const calculateAverageScore = () => {
        const scores = Object.values(criterionScores).filter(s => s && s >= 1 && s <= 5);
        if (scores.length === 0) return null;
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        // Convert 1-5 scale to 0-100: (avg - 1) * 25
        return Math.round((avg - 1) * 25);
    };

    const handleCriterionScoreChange = (code, value) => {
        if (readOnly) return;

        const score = value ? parseInt(value) : null;
        setCriterionScores(prev => {
            const updated = { ...prev };
            if (score && score >= 1 && score <= 5) {
                updated[code] = score;
            } else {
                delete updated[code];
            }

            // Auto-update tổng điểm và kết luận
            setTimeout(() => {
                // Calculate based on 'updated'
                const currentScores = Object.values(updated).filter(s => s && s >= 1 && s <= 5);
                if (currentScores.length > 0) {
                    const avg = currentScores.reduce((sum, s) => sum + s, 0) / currentScores.length;
                    const finalScore = Math.round((avg - 1) * 25);

                    setFormData(prevData => ({
                        ...prevData,
                        score: finalScore,
                        conclusion: finalScore >= 60 ? 'PASS' : 'FAIL'
                    }));
                }
            }, 0);

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

            // Auto-set conclusion based on score if manually entering score
            if (name === 'score' && !showDetailedForm) {
                const score = parseFloat(value);
                if (!isNaN(score)) {
                    if (score >= 0 && score <= 59) {
                        newData.conclusion = 'FAIL';
                    } else if (score >= 60 && score <= 100) {
                        newData.conclusion = 'PASS';
                    }
                }
            }

            // Handle attendee change -> reload evaluation if exists
            if (name === 'selectedAttendeeId') {
                // Logic to reload evaluation for selected attendee could be added here
                // For now just update state
            }

            return newData;
        });
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

        if (!formData.selectedAttendeeId) {
            showToast('Lỗi', 'Vui lòng chọn người đánh giá', 'warning');
            return;
        }

        // Nếu dùng form chi tiết, kiểm tra có ít nhất 1 tiêu chí được chấm
        if (showDetailedForm) {
            const hasAnyScore = Object.keys(criterionScores).length > 0;
            if (!hasAnyScore) {
                showToast('Lỗi', 'Vui lòng chấm ít nhất một tiêu chí', 'warning');
                return;
            }
        } else {
            if (!formData.score || !formData.conclusion) {
                showToast('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
                return;
            }
            const score = parseFloat(formData.score);
            if (isNaN(score) || score < 0 || score > 100) {
                showToast('Lỗi', 'Điểm số phải từ 0 đến 100', 'warning');
                return;
            }
        }

        try {
            setSubmitting(true);

            let imageFileId = null;

            // Upload file first if provided
            if (formData.imageFile) {
                const fileResponse = await uploadTrialReport(formData.imageFile, trialId);
                imageFileId = fileResponse.id || fileResponse.fileId;
            } else if (existingEvaluation?.imageFileId) {
                imageFileId = existingEvaluation.imageFileId;
            }

            // Build criteria list nếu dùng form chi tiết
            const criteria = showDetailedForm && Object.keys(criterionScores).length > 0
                ? Object.entries(criterionScores).map(([code, score]) => ({
                    code,
                    score,
                    comment: null
                }))
                : null;

            // Submit evaluation
            const evaluationData = {
                attendeeId: formData.selectedAttendeeId,
                trialId: trialId,
                score: formData.score,
                comments: formData.comments,
                conclusion: formData.conclusion,
                imageFileId: imageFileId,
                criteria: criteria
            };

            await evaluateTrial(evaluationData);

            showToast('Thành công', 'Đánh giá giảng thử thành công', 'success');
            setTimeout(() => {
                navigate(-1); // Go back to previous page
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

    // Group criteria by category
    const groupedCriteria = EVALUATION_CRITERIA.reduce((acc, criterion) => {
        const category = criterion.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(criterion);
        return acc;
    }, {});

    if (loading && !trial) {
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
                        <h1 className="page-title">{readOnly ? 'Xem đánh giá' : 'Chấm đánh giá'}</h1>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-12 mb-4">
                                <div className="p-3 bg-light rounded">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Giảng viên:</strong> {trial.teacherName} ({trial.teacherCode})</p>
                                            <p className="mb-1"><strong>Môn học:</strong> {trial.subjectName}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Ngày giảng:</strong> {trial.teachingDate ? new Date(trial.teachingDate).toLocaleDateString('vi-VN') : ''}</p>
                                            <p className="mb-1"><strong>Địa điểm:</strong> {trial.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Giáo viên đánh giá <span className="text-danger">*</span>
                                            </label>
                                            {attendees.length === 0 ? (
                                                <div className="alert alert-warning">
                                                    <i className="bi bi-exclamation-triangle"></i> Chưa có người tham dự nào.
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    name="selectedAttendeeId"
                                                    value={formData.selectedAttendeeId}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={!!attendeeId || readOnly}
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
                                        </div>

                                        <div className="col-md-6 mb-3 d-flex align-items-end">
                                            <div className="form-check form-switch mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="toggleDetailedForm"
                                                    checked={showDetailedForm}
                                                    onChange={(e) => setShowDetailedForm(e.target.checked)}
                                                    disabled={readOnly}
                                                />
                                                <label className="form-check-label" htmlFor="toggleDetailedForm">
                                                    <strong>Đánh giá chi tiết từng tiêu chí (17 tiêu chí)</strong>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {showDetailedForm ? (
                                        <div className="mb-4">
                                            <div className="alert alert-info mb-3">
                                                <i className="bi bi-info-circle me-2"></i>
                                                <strong>Thang điểm:</strong> 5 = Excellent, 4 = Good, 3 = Satisfactory, 2 = Need improvement, 1 = Need extensive improvement
                                            </div>

                                            {/* Desktop View: Table */}
                                            <div className="table-responsive d-none d-md-block">
                                                <table className="table table-sm table-bordered table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: '50px' }}>STT</th>
                                                            <th>Tiêu chí đánh giá</th>
                                                            <th style={{ width: '150px' }}>Điểm (1-5)</th>
                                                            <th style={{ width: '250px' }}>Ghi chú</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(groupedCriteria).map(([category, criteria]) => (
                                                            <React.Fragment key={category}>
                                                                <tr className="table-secondary">
                                                                    <td colSpan="4" className="fw-bold">{category}</td>
                                                                </tr>
                                                                {criteria.map((criterion) => (
                                                                    <tr key={criterion.code}>
                                                                        <td className="text-center">{criterion.code}</td>
                                                                        <td>
                                                                            <div className="fw-bold">{criterion.label}</div>
                                                                            <div className="text-muted small">{criterion.labelVi}</div>
                                                                        </td>
                                                                        <td>
                                                                            <select
                                                                                className="form-select form-select-sm"
                                                                                value={criterionScores[criterion.code] || ''}
                                                                                onChange={(e) => handleCriterionScoreChange(criterion.code, e.target.value)}
                                                                                disabled={readOnly}
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
                                                                                disabled={readOnly}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile View: Cards */}
                                            <div className="d-md-none">
                                                {Object.entries(groupedCriteria).map(([category, criteria]) => (
                                                    <div key={category} className="mb-3">
                                                        <div className="bg-light p-2 fw-bold border rounded-top">{category}</div>
                                                        <div className="border border-top-0 rounded-bottom p-2">
                                                            {criteria.map((criterion) => (
                                                                <div key={criterion.code} className="mb-3 pb-3 border-bottom last-no-border">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div>
                                                                            <span className="badge bg-secondary me-2">{criterion.code}</span>
                                                                            <span className="fw-bold">{criterion.label}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-muted small mb-2">{criterion.labelVi}</div>

                                                                    <div className="row g-2">
                                                                        <div className="col-12">
                                                                            <select
                                                                                className="form-select"
                                                                                value={criterionScores[criterion.code] || ''}
                                                                                onChange={(e) => handleCriterionScoreChange(criterion.code, e.target.value)}
                                                                                disabled={readOnly}
                                                                            >
                                                                                <option value="">Chọn điểm (1-5)</option>
                                                                                <option value="5">5 - Excellent</option>
                                                                                <option value="4">4 - Good</option>
                                                                                <option value="3">3 - Satisfactory</option>
                                                                                <option value="2">2 - Need improvement</option>
                                                                                <option value="1">1 - Need extensive</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="col-12">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="Ghi chú (tùy chọn)"
                                                                                disabled={readOnly}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {Object.keys(criterionScores).length > 0 && (
                                                <div className="alert alert-success mt-2">
                                                    <i className="bi bi-calculator me-2"></i>
                                                    <strong>Điểm trung bình tự động:</strong> {calculateAverageScore()} / 100
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Điểm số (0-100) <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="score"
                                                    value={formData.score}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="100"
                                                    required
                                                    disabled={readOnly}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Kết luận <span className="text-danger">*</span></label>
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
                                        <div className="col-md-6">
                                            <label className="form-label">Upload biên bản (Ảnh/PDF)</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                onChange={handleFileChange}
                                                disabled={readOnly}
                                                accept="image/*,.pdf,.doc,.docx"
                                            />
                                            {existingEvaluation?.imageFileId && (
                                                <div className="mt-1">
                                                    <a href={`/api/file/get/${existingEvaluation.imageFileId}`} target="_blank" rel="noreferrer" className="text-primary small">
                                                        <i className="bi bi-paperclip"></i> Xem file hiện tại
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Nhận xét chung</label>
                                        <textarea
                                            className="form-control"
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Nhập nhận xét tổng quát..."
                                            disabled={readOnly}
                                        />
                                    </div>

                                    {!readOnly && (
                                        <div className="d-flex gap-2 justify-content-end">
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { listAllSubjects } from "../../api/subject";
import { registerSubject } from "../../api/subjectRegistrationApi";

const TeacherRegisterNew = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [registerYear, setRegisterYear] = useState(currentYear);
    const [registerQuarter, setRegisterQuarter] = useState("");
    const [preparationMethod, setPreparationMethod] = useState("");
    const [teacherNote, setTeacherNote] = useState("");
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        loadAvailableSubjects();
    }, []);

    const loadAvailableSubjects = async () => {
        try {
            const subjects = await listAllSubjects();
            setAvailableSubjects((subjects || []).filter((s) => s.isActive));
        } catch {
            showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
    };

    const handleRegister = async () => {
        if (!selectedSubject || !registerQuarter) {
            showToast("Lỗi", "Vui lòng chọn môn và quý!", "danger");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                subjectId: selectedSubject,
                year: parseInt(registerYear),
                quarter: parseInt(registerQuarter),
                reasonForCarryOver: preparationMethod,
                teacherNotes: teacherNote,
                status: "REGISTERED",
            };

            await registerSubject(payload);

            showToast("Thành công", "Đăng ký môn học thành công!", "success");
            setTimeout(() => navigate("/teacher-subject-registration"), 800);
        } catch {
            showToast("Lỗi", "Không thể đăng ký môn học", "danger");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullscreen={true} message="Đang xử lý..." />;

    return (
        <MainLayout>
            <div className="edit-profile-container">

                {/* HEADER GIỐNG HỆ PROFILE */}
                <div
                    className="edit-profile-header"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "24px",
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-light back-button"
                        onClick={() => navigate(-1)}
                        aria-label="Quay lại"
                        style={{
                            borderRadius: "10px",
                            width: "44px",
                            height: "44px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #ddd",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <h1
                        style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}
                    >
                        Đăng ký Môn học
                    </h1>
                </div>

                {/* CARD GIỐNG PROFILE */}
                <div className="edit-profile-content">
                    <div className="edit-profile-main">

                        {/* SECTION: CHỌN MÔN */}
                        <div className="form-section">
                            <h3 className="section-title">CHỌN MÔN HỌC</h3>

                            <div className="form-row">

                                {/* Ô TÌM KIẾM */}
                                <div className="form-group">
                                    <label className="form-label">Tìm kiếm môn</label>
                                    <input
                                        className="form-control"
                                        placeholder="Nhập mã hoặc tên môn..."
                                        value={subjectSearchTerm}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            setSubjectSearchTerm(text);

                                            const matched = availableSubjects.filter((s) =>
                                                `${s.subjectCode} ${s.subjectName}`
                                                    .toLowerCase()
                                                    .includes(text.toLowerCase())
                                            );

                                            // Auto-select: chọn môn đầu tiên tìm được
                                            if (matched.length > 0) {
                                                setSelectedSubject(matched[0].id);
                                            } else {
                                                setSelectedSubject("");
                                            }
                                        }}
                                    />
                                </div>

                                {/* SELECT MÔN */}
                                <div className="form-group">
                                    <label className="form-label">Môn *</label>
                                    <select
                                        className="form-control"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                    >
                                        <option value="">-- Chọn môn --</option>
                                        {availableSubjects
                                            .filter((s) =>
                                                `${s.subjectCode} ${s.subjectName}`
                                                    .toLowerCase()
                                                    .includes(subjectSearchTerm.toLowerCase())
                                            )
                                            .map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.subjectCode} - {s.subjectName}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                            </div>


                            {/* NĂM + QUÝ */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Năm</label>
                                    <select
                                        className="form-control"
                                        value={registerYear}
                                        onChange={(e) => setRegisterYear(e.target.value)}
                                    >
                                        {[currentYear, currentYear + 1].map((y) => (
                                            <option key={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Quý *</label>
                                    <select
                                        className="form-control"
                                        value={registerQuarter}
                                        onChange={(e) => setRegisterQuarter(e.target.value)}
                                    >
                                        <option value="">-- Chọn quý --</option>
                                        <option value="1">Quý 1</option>
                                        <option value="2">Quý 2</option>
                                        <option value="3">Quý 3</option>
                                        <option value="4">Quý 4</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION: CHUẨN BỊ */}
                        <div className="form-section">
                            <h3 className="section-title">THÔNG TIN THÊM</h3>

                            <div className="form-group">
                                <label className="form-label">Hình thức chuẩn bị</label>
                                <input
                                    className="form-control"
                                    placeholder="VD: Thi chứng nhận, giảng thử..."
                                    value={preparationMethod}
                                    onChange={(e) => setPreparationMethod(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ghi chú</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Nhập ghi chú thêm..."
                                    value={teacherNote}
                                    onChange={(e) => setTeacherNote(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* SAVE BUTTON */}
                        <div className="save-button-container">
                            <button
                                className="btn-save"
                                onClick={handleRegister}
                                disabled={!selectedSubject || !registerQuarter}
                            >
                                ĐĂNG KÝ
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {toast.show && (
                <Toast title={toast.title} message={toast.message} type={toast.type} />
            )}
        </MainLayout>
    );
};

export default TeacherRegisterNew;

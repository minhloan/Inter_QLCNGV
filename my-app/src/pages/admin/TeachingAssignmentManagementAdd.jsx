import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { searchUsersByTeaching } from "../../api/user";
import { searchSubjects } from "../../api/subject";
import { createTeachingAssignment } from "../../api/teaching-assignments";

const dayOfWeekOptions = [
    { value: "", label: "Không chọn" },
    { value: 2, label: "Thứ 2" },
    { value: 3, label: "Thứ 3" },
    { value: 4, label: "Thứ 4" },
    { value: 5, label: "Thứ 5" },
    { value: 6, label: "Thứ 6" },
    { value: 7, label: "Thứ 7" },
];

const MAX_TEACHER_OPTIONS = 1000;
const MAX_SUBJECT_OPTIONS = 1000;

const TeachingAssignmentAdd = () => {
    const navigate = useNavigate();
    const formSectionWidth = "1200px";

    const [submitting, setSubmitting] = useState(false);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [subjectLoading, setSubjectLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "",
    });

    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teacherOverflow, setTeacherOverflow] = useState(false);
    const [subjectOverflow, setSubjectOverflow] = useState(false);

    // keyword search
    const [teacherKeyword, setTeacherKeyword] = useState("");
    const [subjectKeyword, setSubjectKeyword] = useState("");

    const [form, setForm] = useState({
        teacherId: "",
        subjectId: "",
        classCode: "",
        year: "",
        quarter: "",
        location: "",
        notes: "",
    });

    // Dynamic slots (bắt đầu 1 buổi)
    const [slots, setSlots] = useState([
        { dayOfWeek: "", startTime: "", endTime: "" },
    ]);

    // ========== LOAD DATA ==========
    const loadTeachers = async (keyword = "") => {
        try {
            setTeacherLoading(true);
            const res = await searchUsersByTeaching(keyword);
            const list = Array.isArray(res) ? res : res?.content || [];
            setTeacherOverflow(list.length > MAX_TEACHER_OPTIONS);
            setTeachers(list.slice(0, MAX_TEACHER_OPTIONS));
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể tải danh sách giáo viên", "danger");
        } finally {
            setTeacherLoading(false);
        }
    };

    const loadSubjects = async (keyword = "") => {
        try {
            setSubjectLoading(true);
            const res = await searchSubjects({
                keyword,
                isActive: true, // nếu muốn chỉ lấy môn đang active
            });
            const list = Array.isArray(res) ? res : [];
            setSubjectOverflow(list.length > MAX_SUBJECT_OPTIONS);
            setSubjects(list.slice(0, MAX_SUBJECT_OPTIONS));
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
        } finally {
            setSubjectLoading(false);
        }
    };

    // Lần đầu vào trang: gọi load với keyword rỗng
    useEffect(() => {
        loadTeachers("");
        loadSubjects("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto search giáo viên khi gõ keyword (debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadTeachers(teacherKeyword.trim());
        }, 400); // 0.4s sau khi dừng gõ

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacherKeyword]);

    // Auto search môn học khi gõ keyword (debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadSubjects(subjectKeyword.trim());
        }, 400);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectKeyword]);

    // ========== COMMON ==========
    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeSlot = (index, field, value) => {
        setSlots((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleAddSlot = () => {
        setSlots((prev) => [
            ...prev,
            { dayOfWeek: "", startTime: "", endTime: "" },
        ]);
    };

    const handleRemoveSlot = (index) => {
        setSlots((prev) => prev.filter((_, i) => i !== index));
    };

    // ========== VALIDATE & SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.teacherId ||
            !form.subjectId ||
            !form.classCode.trim() ||
            !form.year ||
            !form.quarter
        ) {
            showToast(
                "Thông báo",
                "Vui lòng điền đầy đủ các trường bắt buộc",
                "danger"
            );
            return;
        }

        // Build slots payload
        const slotsPayload = slots
            .filter((s) => s.dayOfWeek && s.startTime && s.endTime)
            .map((s) => ({
                dayOfWeek: Number(s.dayOfWeek),
                startTime: s.startTime, // "HH:mm"
                endTime: s.endTime,
            }));

        if (slotsPayload.length === 0) {
            showToast(
                "Thông báo",
                "Vui lòng chọn ít nhất 1 buổi học (thứ + giờ bắt đầu/kết thúc)",
                "danger"
            );
            return;
        }

        const yearNumber = Number(form.year);
        const quarterNumber = Number(form.quarter);

        if (
            Number.isNaN(yearNumber) ||
            Number.isNaN(quarterNumber) ||
            quarterNumber < 1 ||
            quarterNumber > 4
        ) {
            showToast("Lỗi", "Năm hoặc quý không hợp lệ", "danger");
            return;
        }

        const payload = {
            teacherId: form.teacherId,
            subjectId: form.subjectId,
            classCode: form.classCode.trim(),
            year: yearNumber,
            quarter: quarterNumber,
            location: form.location || "",
            notes: form.notes || "",
            slots: slotsPayload,
        };

        try {
            setSubmitting(true);
            const res = await createTeachingAssignment(payload);

            if (res.status === "FAILED") {
                showToast(
                    "Phân công thất bại",
                    res.failureReason ||
                    "Giáo viên chưa đủ điều kiện để được phân công giảng dạy.",
                    "danger"
                );
            } else {
                showToast(
                    "Thành công",
                    "Phân công giảng dạy đã được tạo thành công!",
                    "success"
                );
                setTimeout(
                    () => navigate("/teaching-assignment-management"),
                    800
                );
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Tạo phân công giảng dạy thất bại", "danger");
        } finally {
            setSubmitting(false);
        }
    };

    // ========== STYLE ==========
    const cardStyle = {
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(20,20,20,0.05)",
        background: "#fff",
    };

    const inputRadius = { borderRadius: 10, height: "48px" };
    const textareaRadius = { borderRadius: 10, minHeight: 140 };

    return (
        <MainLayout>
            <div
                className="page-admin-add-teacher page-align-with-form"
                style={{ "--page-section-width": formSectionWidth }}
            >
                <div className="content-header">
                    <div className="content-title">
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate("/teaching-assignment-management")
                            }
                            aria-label="back"
                        >
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Tạo Phân Công Giảng Dạy</h1>
                    </div>
                </div>

                <div className="form-container">
                    <div style={{ ...cardStyle, padding: 28 }}>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row gy-4">
                                {/* Giáo viên + Search */}
                                <div className="col-md-6 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Giáo viên{" "}
                                        <span
                                            style={{ color: "#e74c3c" }}
                                        >
                                            *
                                        </span>
                                    </label>

                                    {/* Input search nằm trên đầu select */}
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Tìm theo tên, email, mã giáo viên..."
                                        value={teacherKeyword}
                                        onChange={(e) =>
                                            setTeacherKeyword(e.target.value)
                                        }
                                        style={{ ...inputRadius }}
                                    />
                                    {teacherLoading && (
                                        <small className="text-muted">
                                            Đang tìm giáo viên...
                                        </small>
                                    )}
                                 

                                    <select
                                        name="teacherId"
                                        className="form-select"
                                        value={form.teacherId}
                                        onChange={handleChangeForm}
                                        style={{
                                            ...inputRadius,
                                            paddingTop: 10,
                                        }}
                                    >
                                        <option value="">
                                            Chọn giáo viên
                                        </option>
                                        {teachers.map((t) => {
                                            const displayName =
                                                t.username ||
                                                t.fullName ||
                                                t.name ||
                                                t.email ||
                                                "Không tên";
                                            const teacherCode =
                                                t.teacherCode ||
                                                t.code ||
                                                t.id?.slice(0, 8) ||
                                                "";
                                            return (
                                                <option
                                                    key={t.id}
                                                    value={t.id}
                                                >
                                                    {displayName}
                                                    {teacherCode
                                                        ? ` — ${teacherCode}`
                                                        : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Môn học + Search */}
                                <div className="col-md-6 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Môn học{" "}
                                        <span
                                            style={{ color: "#e74c3c" }}
                                        >
                                            *
                                        </span>
                                    </label>

                                    {/* Input search nằm trên đầu select */}
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Tìm theo tên hoặc mã môn học..."
                                        value={subjectKeyword}
                                        onChange={(e) =>
                                            setSubjectKeyword(e.target.value)
                                        }
                                        style={{ ...inputRadius }}
                                    />
                                    {subjectLoading && (
                                        <small className="text-muted">
                                            Đang tìm môn học...
                                        </small>
                                    )}
                                    {subjectOverflow && !subjectLoading && (
                                        <small className="text-muted">
                                            {`Hiển thị tối đa ${MAX_SUBJECT_OPTIONS} kết quả, hãy nhập cụ thể hơn để thu hẹp.`}
                                        </small>
                                    )}

                                    <select
                                        name="subjectId"
                                        className="form-select"
                                        value={form.subjectId}
                                        onChange={handleChangeForm}
                                        style={{
                                            ...inputRadius,
                                            paddingTop: 10,
                                        }}
                                    >
                                        <option value="">
                                            Chọn môn học
                                        </option>
                                        {subjects.map((s) => {
                                            const subjectName =
                                                s.subjectName ||
                                                s.name ||
                                                "Không tên";
                                            const subjectCode =
                                                s.subjectCode ||
                                                s.code ||
                                                s.id?.slice(0, 8) ||
                                                "";
                                            return (
                                                <option
                                                    key={s.id}
                                                    value={s.id}
                                                >
                                                    {subjectCode
                                                        ? `${subjectCode} - `
                                                        : ""}
                                                    {subjectName}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Mã lớp */}
                                <div className="col-md-6 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Mã lớp{" "}
                                        <span
                                            style={{ color: "#e74c3c" }}
                                        >
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="classCode"
                                        className="form-control"
                                        placeholder="Ví dụ: DISM-2025-01"
                                        value={form.classCode}
                                        onChange={handleChangeForm}
                                        style={{ ...inputRadius }}
                                    />
                                </div>

                                {/* Năm */}
                                <div className="col-md-3 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Năm{" "}
                                        <span
                                            style={{ color: "#e74c3c" }}
                                        >
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        className="form-control"
                                        placeholder="Ví dụ: 2025"
                                        min="2020"
                                        max="2035"
                                        value={form.year}
                                        onChange={handleChangeForm}
                                        style={{ ...inputRadius }}
                                    />
                                </div>

                                {/* Quý */}
                                <div className="col-md-3 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Quý{" "}
                                        <span
                                            style={{ color: "#e74c3c" }}
                                        >
                                            *
                                        </span>
                                    </label>
                                    <select
                                        name="quarter"
                                        className="form-select"
                                        value={form.quarter}
                                        onChange={handleChangeForm}
                                        style={{
                                            ...inputRadius,
                                            paddingTop: 10,
                                        }}
                                    >
                                        <option value="">
                                            Chọn quý
                                        </option>
                                        {[1, 2, 3, 4].map((q) => (
                                            <option
                                                key={q}
                                                value={q}
                                            >
                                                Quý {q}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phòng học */}
                                <div className="col-md-6 mb-3">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Phòng học
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        className="form-control"
                                        placeholder="Ví dụ: P101, Lab 2..."
                                        value={form.location}
                                        onChange={handleChangeForm}
                                        style={{ ...inputRadius }}
                                    />
                                </div>

                                {/* Ghi chú */}
                                <div className="col-12 mb-4">
                                    <label
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Ghi chú
                                    </label>
                                    <textarea
                                        name="notes"
                                        className="form-control"
                                        rows={5}
                                        value={form.notes}
                                        onChange={handleChangeForm}
                                        style={textareaRadius}
                                        placeholder="Nhập ghi chú..."
                                    />
                                </div>

                                {/* BUỔI HỌC */}
                                <div className="col-12 mb-2 d-flex justify-content-between align-items-center">
                                    <h5
                                        style={{
                                            fontWeight: 700,
                                            marginBottom: 12,
                                        }}
                                    >
                                        Buổi học
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleAddSlot}
                                        style={{ borderRadius: 10 }}
                                    >
                                        <i className="bi bi-plus-circle me-1"></i>{" "}
                                        Thêm buổi học
                                    </button>
                                </div>

                                {slots.map((slot, index) => (
                                    <div
                                        className="col-12 mb-3"
                                        key={index}
                                    >
                                        <div className="row gx-3 align-items-end">
                                            <div className="col-md-4 mb-2">
                                                <label
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Buổi {index + 1} - Thứ
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={slot.dayOfWeek}
                                                    onChange={(e) =>
                                                        handleChangeSlot(
                                                            index,
                                                            "dayOfWeek",
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{
                                                        ...inputRadius,
                                                        paddingTop: 10,
                                                    }}
                                                >
                                                    {dayOfWeekOptions.map(
                                                        (opt) => (
                                                            <option
                                                                key={
                                                                    opt.value ||
                                                                    "none"
                                                                }
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Giờ bắt đầu
                                                </label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    value={slot.startTime}
                                                    onChange={(e) =>
                                                        handleChangeSlot(
                                                            index,
                                                            "startTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ ...inputRadius }}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Giờ kết thúc
                                                </label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    value={slot.endTime}
                                                    onChange={(e) =>
                                                        handleChangeSlot(
                                                            index,
                                                            "endTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ ...inputRadius }}
                                                />
                                            </div>
                                            <div className="col-md-2 mb-2 d-flex flex-column">
                                                <small className="text-muted mb-1">
                                                    Chỉ tính nếu chọn đủ Thứ +
                                                    giờ
                                                </small>
                                                {slots.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() =>
                                                            handleRemoveSlot(
                                                                index
                                                            )
                                                        }
                                                        style={{
                                                            borderRadius: 10,
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* BUTTONS */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 12,
                                    marginTop: 6,
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() =>
                                        navigate(
                                            "/teaching-assignment-management"
                                        )
                                    }
                                    style={{
                                        borderRadius: 10,
                                        padding: "10px 20px",
                                        border: "1px solid #ddd",
                                        background: "#f6f6f6",
                                    }}
                                >
                                    <i className="bi bi-x-circle me-2"></i>Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="btn"
                                    style={{
                                        borderRadius: 10,
                                        padding: "10px 26px",
                                        background:
                                            "linear-gradient(90deg,#ff8a00,#ff6a00)",
                                        color: "#fff",
                                        boxShadow:
                                            "0 6px 18px rgba(255,105,0,0.18)",
                                        fontWeight: 700,
                                    }}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    LƯU
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {submitting && <Loading />}

            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() =>
                        setToast((prev) => ({
                            ...prev,
                            show: false,
                        }))
                    }
                />
            )}
        </MainLayout>
    );
};

export default TeachingAssignmentAdd;

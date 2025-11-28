import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Common/Loading";
import Toast from "../../components/Common/Toast";
import { getSubjectSystemById } from "../../api/subjectSystem";
import { getAllSubjects } from "../../api/subject";
import {
    deleteAssignment,
    getAssignmentsBySystem,
    upsertAssignment
} from "../../api/subjectAssignment";
import SearchableSelect from "../../components/Common/SearchableSelect";

const SEMESTER_OPTIONS = [
    { value: "", label: "Tất cả học kỳ" },
    { value: "SEMESTER_1", label: "Học kỳ 1" },
    { value: "SEMESTER_2", label: "Học kỳ 2" },
    { value: "SEMESTER_3", label: "Học kỳ 3" },
    { value: "SEMESTER_4", label: "Học kỳ 4" },
];

const DEFAULT_FORM = {
    id: null,
    subjectId: "",
    semester: "",
    hours: "",
    isActive: true,
    note: "",
};

const AdminManageSubjectAssignment = () => {
    const { systemId } = useParams();
    const navigate = useNavigate();

    const [system, setSystem] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("name_asc");

    const [formData, setFormData] = useState(DEFAULT_FORM);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, title: "", message: "", type: "info" });

    const showToast = useCallback((title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    const loadSystem = useCallback(async () => {
        try {
            const data = await getSubjectSystemById(systemId);
            setSystem(data);
        } catch (err) {
            showToast("Lỗi", "Không thể tải thông tin hệ đào tạo", "danger");
        }
    }, [systemId, showToast]);

    const loadSubjects = useCallback(async () => {
        try {
            const res = await getAllSubjects();
            setSubjects(res || []);
        } catch (err) {
            showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
        }
    }, [showToast]);

    const loadAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAssignmentsBySystem(systemId);
            setAssignments(res || []);
        } catch (err) {
            showToast("Lỗi", "Không thể tải danh sách môn của hệ", "danger");
        } finally {
            setLoading(false);
        }
    }, [systemId, showToast]);

    useEffect(() => {
        loadSystem();
        loadSubjects();
        loadAssignments();
    }, [loadSystem, loadSubjects, loadAssignments]);

    const filteredAssignments = useMemo(() => {
        let list = [...assignments];

        if (searchTerm.trim()) {
            const kw = searchTerm.toLowerCase();
            list = list.filter(
                (item) =>
                    item.subjectName?.toLowerCase().includes(kw) ||
                    item.subjectCode?.toLowerCase().includes(kw)
            );
        }

        if (semesterFilter) {
            list = list.filter((item) => item.semester === semesterFilter);
        }

        if (statusFilter) {
            const expected = statusFilter === "active";
            list = list.filter((item) => item.isActive === expected);
        }

        const safeValue = (value) => (value ?? "").toString();

        list.sort((a, b) => {
            const codeA = safeValue(a.subjectCode);
            const codeB = safeValue(b.subjectCode);
            const nameA = safeValue(a.subjectName);
            const nameB = safeValue(b.subjectName);

            switch (sortBy) {
                case "code_asc":
                    return codeA.localeCompare(codeB);
                case "code_desc":
                    return codeB.localeCompare(codeA);
                case "name_desc":
                    return nameB.localeCompare(nameA);
                case "name_asc":
                default:
                    return nameA.localeCompare(nameB);
            }
        });

        return list;
    }, [assignments, searchTerm, semesterFilter, statusFilter, sortBy]);

    const subjectOptions = useMemo(() => {
        return subjects.map((s) => ({
            value: s.id,
            label: s.subjectName,
            code: s.subjectCode,
        }));
    }, [subjects]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleToggleActive = (value) => {
        setFormData((prev) => ({
            ...prev,
            isActive: value,
        }));
    };

    const handleResetForm = () => {
        setFormData(DEFAULT_FORM);
    };

    const handleEdit = (assignment) => {
        setFormData({
            id: assignment.id,
            subjectId: assignment.subjectId,
            semester: assignment.semester || "",
            hours: assignment.hours ?? "",
            isActive: assignment.isActive,
            note: assignment.note ?? "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subjectId) {
            return showToast("Lỗi", "Vui lòng chọn môn học", "danger");
        }

        const payload = {
            id: formData.id,
            subjectId: formData.subjectId,
            systemId,
            semester: formData.semester || null,
            hours: formData.hours === "" ? null : Number(formData.hours),
            isActive: formData.isActive,
            note: formData.note || null,
        };

        try {
            setLoading(true);
            await upsertAssignment(payload);
            showToast("Thành công", formData.id ? "Đã cập nhật môn" : "Đã thêm môn", "success");
            handleResetForm();
            loadAssignments();
        } catch (err) {
            console.error(err);
            showToast("Lỗi", err.response?.data?.message || "Không thể lưu cấu hình môn", "danger");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (assignment) => {
        if (!assignment?.id) return;
        if (!window.confirm(`Xóa môn "${assignment.subjectName}" khỏi hệ này?`)) return;

        try {
            setLoading(true);
            await deleteAssignment(assignment.id);
            showToast("Thành công", "Đã xóa môn khỏi hệ", "success");
            if (formData.id === assignment.id) {
                handleResetForm();
            }
            loadAssignments();
        } catch (err) {
            console.error(err);
            showToast("Lỗi", "Không thể xóa môn", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="page-admin-subject">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Phân bổ môn cho hệ đào tạo</h1>
                    </div>
                    <div className="content-actions">
                        <button className="btn btn-secondary" onClick={handleResetForm}>
                            <i className="bi bi-arrow-clockwise"></i> Reset form
                        </button>
                    </div>
                </div>

                {system && (
                    <div className="system-summary mb-3">
                        <p>
                            <strong>Hệ đào tạo:</strong> {system.systemName} ({system.systemCode})
                        </p>
                    </div>
                )}

                {loading && <Loading fullscreen={true} message="Đang xử lý..." />}

                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title mb-3">
                                    {formData.id ? "Chỉnh sửa môn trong hệ" : "Thêm môn vào hệ"}
                                </h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Môn học *</label>
                                        <SearchableSelect
                                            options={subjectOptions}
                                            value={formData.subjectId}
                                            onChange={(val) =>
                                                setFormData((prev) => ({ ...prev, subjectId: val }))
                                            }
                                            placeholder="-- Chọn hoặc tìm kiếm môn học --"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Học kỳ</label>
                                        <select
                                            className="form-select"
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleFormChange}
                                        >
                                            {SEMESTER_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Số giờ</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="hours"
                                            min="0"
                                            value={formData.hours}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ghi chú</label>
                                        <textarea
                                            className="form-control"
                                            name="note"
                                            rows="2"
                                            value={formData.note}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="mb-3 form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="assignment-status"
                                            checked={formData.isActive}
                                            onChange={(e) => handleToggleActive(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="assignment-status">
                                            Hoạt động
                                        </label>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100">
                                        {formData.id ? (
                                            <>
                                                <i className="bi bi-save"></i> Cập nhật
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-circle"></i> Thêm vào hệ
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Danh sách môn trong hệ</h5>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Tìm kiếm</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Mã hoặc tên môn..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Học kỳ</label>
                                        <select
                                            className="form-select"
                                            value={semesterFilter}
                                            onChange={(e) => setSemesterFilter(e.target.value)}
                                        >
                                            {SEMESTER_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Trạng thái</label>
                                        <select
                                            className="form-select"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="active">Hoạt động</option>
                                            <option value="inactive">Không hoạt động</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Mã môn</th>
                                                <th>Tên môn</th>
                                                <th>Học kỳ</th>
                                                <th>Giờ học</th>
                                                <th>Trạng thái</th>
                                                <th style={{ width: "170px" }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAssignments.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-muted py-4">
                                                        Chưa có môn nào trong hệ
                                                    </td>
                                                </tr>
                                            )}
                                            {filteredAssignments.map((assignment) => (
                                                <tr key={assignment.id || assignment.subjectId}>
                                                    <td>{assignment.subjectCode || "--"}</td>
                                                    <td>{assignment.subjectName}</td>
                                                    <td>
                                                        {SEMESTER_OPTIONS.find(
                                                            (option) => option.value === assignment.semester
                                                        )?.label || "Chưa phân"}
                                                    </td>
                                                    <td>{assignment.hours ?? "--"}</td>
                                                    <td>
                                                        {assignment.isActive ? (
                                                            <span className="badge bg-success">Active</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2 flex-wrap">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleEdit(assignment)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(assignment)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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
            </div>
        </MainLayout>
    );
};

export default AdminManageSubjectAssignment;

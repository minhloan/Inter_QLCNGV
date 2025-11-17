// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import MainLayout from "../../components/Layout/MainLayout";
// import Toast from "../../components/Common/Toast";
// import Loading from "../../components/Common/Loading";
//
// // API
// import { getAllTeachers } from "../../api/teachers";
// import { listAllSubjects as getAllSubjects } from "../../api/subjects";
// import { createTeachingAssignment } from "../../api/teaching-assignments";
//
// const TeachingAssignmentAdd = () => {
//     const navigate = useNavigate();
//
//     const [loading, setLoading] = useState(false);
//     const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" });
//
//     const [teachers, setTeachers] = useState([]);
//     const [subjects, setSubjects] = useState([]);
//
//     const [form, setForm] = useState({
//         teacherId: "",
//         subjectId: "",
//         year: "",
//         quarter: "",
//         assigned_by: "",
//         notes: "",
//         status: "ASSIGNED",
//     });
//
//     const [teacherSearch, setTeacherSearch] = useState("");
//     const [subjectSearch, setSubjectSearch] = useState("");
//
//     useEffect(() => {
//         loadTeachers();
//         loadSubjects();
//
//         // Set assigned_by từ user login
//         const user = JSON.parse(localStorage.getItem("user"));
//         if (user) {
//             setForm((prev) => ({ ...prev, assigned_by: user.id }));
//         }
//     }, []);
//
//     const loadTeachers = async () => {
//         try {
//             const res = await getAllTeachers();
//             setTeachers(res || []);
//         } catch {
//             showToast("Lỗi", "Không thể tải danh sách giáo viên", "danger");
//         }
//     };
//
//     const loadSubjects = async () => {
//         try {
//             const res = await getAllSubjects();
//             setSubjects(res || []);
//         } catch {
//             showToast("Lỗi", "Không thể tải danh sách môn học", "danger");
//         }
//     };
//
//     const showToast = (title, message, type) => {
//         setToast({ show: true, title, message, type });
//         setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
//     };
//
//     const filteredTeachers = teachers.filter((t) =>
//         (t.name || "").toLowerCase().includes(teacherSearch.toLowerCase())
//     );
//
//     const filteredSubjects = subjects.filter((s) =>
//         (s.name || "").toLowerCase().includes(subjectSearch.toLowerCase())
//     );
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         if (!form.teacherId || !form.subjectId || !form.year || !form.quarter) {
//             showToast("Thông báo", "Vui lòng điền đầy đủ các trường bắt buộc", "danger");
//             return;
//         }
//
//         setLoading(true);
//         try {
//             const payload = {
//                 ...form,
//                 assigned_at: new Date().toISOString(), // Thời gian phân công
//             };
//
//             await createTeachingAssignment(payload);
//
//             showToast("Thành công", "Phân công giảng dạy đã được tạo!", "success");
//             setTimeout(() => navigate("/teaching-assignment-management"), 800);
//         } catch (err) {
//             console.error(err);
//             showToast("Lỗi", "Tạo phân công thất bại", "danger");
//         } finally {
//             setLoading(false);
//         }
//     };
// // Small helper styles used inline to match screenshot
//     const cardStyle = {
//         borderRadius: 14,
//         boxShadow: "0 6px 20px rgba(20,20,20,0.05)",
//         background: "#fff",
//     };
//
//     const inputRadius = { borderRadius: 10, height: "48px" };
//     const textareaRadius = { borderRadius: 10, minHeight: 140 };
//
//     return (
//         <MainLayout>
//             <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
//                 <button
//                     onClick={() => navigate(-1)}
//                     style={{
//                         width: 44,
//                         height: 44,
//                         borderRadius: "50%",
//                         border: "none",
//                         background: "#fff",
//                         boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
//                         cursor: "pointer",
//                         marginRight: 18,
//                     }}
//                     aria-label="back"
//                 >
//                     <i className="bi bi-arrow-left" style={{ fontSize: 18 }} />
//                 </button>
//
//                 <h1 style={{ fontSize: 40, margin: 0, fontWeight: 700 }}>Tạo phân công giảng dạy</h1>
//             </div>
//
//             <div style={{ display: "flex", justifyContent: "center" }}>
//                 <div style={{ width: "100%", maxWidth: 980 }}>
//                     <div style={{ ...cardStyle, padding: 28 }}>
//                         <form onSubmit={handleSubmit}>
//                             <div className="row gx-4">
//                                 {/* Row 1 */}
//                                 <div className="col-md-6 mb-3">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>
//                                         Giáo viên <span style={{ color: "#e74c3c" }}>*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         placeholder="Tìm giáo viên..."
//                                         value={teacherSearch}
//                                         onChange={(e) => setTeacherSearch(e.target.value)}
//                                         style={{ ...inputRadius }}
//                                     />
//
//                                     {teacherSearch && (
//                                         <ul
//                                             className="list-group position-absolute shadow-sm"
//                                             style={{
//                                                 zIndex: 30,
//                                                 maxHeight: 220,
//                                                 overflowY: "auto",
//                                                 width: "47%",
//                                                 marginTop: 6,
//                                                 borderRadius: 8,
//                                             }}
//                                         >
//                                             {filteredTeachers.length > 0 ? (
//                                                 filteredTeachers.map((t) => (
//                                                     <li
//                                                         key={t.id}
//                                                         className="list-group-item list-group-item-action"
//                                                         style={{ cursor: "pointer" }}
//                                                         onClick={() => {
//                                                             setTeacherSearch(`${t.name} — ${t.code || ""}`);
//                                                             setForm((prev) => ({ ...prev, teacherId: t.id }));
//                                                         }}
//                                                     >
//                                                         {t.name} {t.code ? `— ${t.code}` : ""}
//                                                     </li>
//                                                 ))
//                                             ) : (
//                                                 <li className="list-group-item text-muted">Không tìm thấy</li>
//                                             )}
//                                         </ul>
//                                     )}
//                                 </div>
//
//                                 <div className="col-md-6 mb-3">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>
//                                         Môn học <span style={{ color: "#e74c3c" }}>*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         placeholder="Tìm môn học..."
//                                         value={subjectSearch}
//                                         onChange={(e) => setSubjectSearch(e.target.value)}
//                                         style={{ ...inputRadius }}
//                                     />
//
//                                     {subjectSearch && (
//                                         <ul
//                                             className="list-group position-absolute shadow-sm"
//                                             style={{
//                                                 zIndex: 30,
//                                                 maxHeight: 220,
//                                                 overflowY: "auto",
//                                                 width: "47%",
//                                                 marginTop: 6,
//                                                 borderRadius: 8,
//                                                 right: 0,
//                                             }}
//                                         >
//                                             {filteredSubjects.length > 0 ? (
//                                                 filteredSubjects.map((s) => (
//                                                     <li
//                                                         key={s.id}
//                                                         className="list-group-item list-group-item-action"
//                                                         onClick={() => {
//                                                             setSubjectSearch(s.name);
//                                                             setForm((prev) => ({ ...prev, subjectId: s.id }));
//                                                         }}
//                                                         style={{ cursor: "pointer" }}
//                                                     >
//                                                         {s.name}
//                                                     </li>
//                                                 ))
//                                             ) : (
//                                                 <li className="list-group-item text-muted">Không tìm thấy</li>
//                                             )}
//                                         </ul>
//                                     )}
//                                 </div>
//
//                                 {/* Row 2 */}
//                                 <div className="col-md-6 mb-3">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>
//                                         Năm <span style={{ color: "#e74c3c" }}>*</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         className="form-control"
//                                         placeholder="Ví dụ: 2025"
//                                         min="2020"
//                                         max="2030"
//                                         value={form.year}
//                                         onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
//                                         style={{ ...inputRadius }}
//                                     />
//                                 </div>
//
//                                 <div className="col-md-6 mb-3">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>
//                                         Quý <span style={{ color: "#e74c3c" }}>*</span>
//                                     </label>
//                                     <select
//                                         className="form-select"
//                                         value={form.quarter}
//                                         onChange={(e) => setForm((prev) => ({ ...prev, quarter: e.target.value }))}
//                                         style={{ ...inputRadius, paddingTop: 10 }}
//                                     >
//                                         <option value="">Chọn quý</option>
//                                         {[1, 2, 3, 4].map((q) => (
//                                             <option key={q} value={q}>
//                                                 Quý {q}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//
//                                 {/* Notes full-width */}
//                                 <div className="col-12 mb-3">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>Ghi chú</label>
//                                     <textarea
//                                         className="form-control"
//                                         rows={6}
//                                         value={form.notes}
//                                         onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
//                                         style={textareaRadius}
//                                         placeholder="Nhập ghi chú..."
//                                     />
//                                 </div>
//
//                                 {/* Status full-width */}
//                                 <div className="col-12 mb-4">
//                                     <label style={{ fontSize: 14, fontWeight: 600 }}>
//                                         Trạng thái <span style={{ color: "#e74c3c" }}>*</span>
//                                     </label>
//                                     <select
//                                         className="form-select"
//                                         value={form.status}
//                                         onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
//                                         style={{ ...inputRadius, paddingTop: 10 }}
//                                     >
//                                         <option value="ASSIGNED">Đã lên lịch</option>
//                                         <option value="COMPLETED">Đã hoàn thành</option>
//                                         <option value="NOT_COMPLETED">Chưa hoàn thành</option>
//                                         <option value="FAILED">Không đạt yêu cầu</option>
//                                     </select>
//                                 </div>
//                             </div>
//
//                             {/* Buttons aligned bottom-right like screenshot */}
//                             <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
//                                 <button
//                                     type="button"
//                                     className="btn btn-light"
//                                     onClick={() => navigate("/teaching-assignment-management")}
//                                     style={{
//                                         borderRadius: 10,
//                                         padding: "10px 20px",
//                                         border: "1px solid #ddd",
//                                         background: "#f6f6f6",
//                                     }}
//                                 >
//                                     <i className="bi bi-x-circle me-2"></i>Hủy
//                                 </button>
//
//                                 <button
//                                     type="submit"
//                                     className="btn"
//                                     style={{
//                                         borderRadius: 10,
//                                         padding: "10px 26px",
//                                         background: "linear-gradient(90deg,#ff8a00,#ff6a00)",
//                                         color: "#fff",
//                                         boxShadow: "0 6px 18px rgba(255,105,0,0.18)",
//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     <i className="bi bi-check-circle me-2"></i>LƯU
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//
//             {loading && <Loading />}
//             {toast.show && <Toast {...toast} />}
//         </MainLayout>
//     );
// };
//
// export default TeachingAssignmentAdd;
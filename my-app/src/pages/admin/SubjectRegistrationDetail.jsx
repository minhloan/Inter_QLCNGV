import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/Layout/MainLayout";
import Toast from "../../components/Common/Toast";
import Loading from "../../components/Common/Loading";

import { getRegistrationDetailForAdmin } from "../../api/adminSubjectRegistrationApi";

// Map trạng thái
const mapStatusInfo = (status) => {
    const key = (status || "").toLowerCase();
    const map = {
        registered: { label: "Đang chờ duyệt", class: "warning" },
        completed: { label: "Đã duyệt", class: "success" },
        not_completed: { label: "Từ chối", class: "danger" },
    };
    return map[key] || { label: status, class: "secondary" };
};

// Format ngày
const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [datePart] = dateStr.split(/[T ]/);
    const [y, m, d] = datePart.split("-");
    return `${d}/${m}/${y}`;
};

const SubjectRegistrationDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        try {
            setLoading(true);
            const res = await getRegistrationDetailForAdmin(id);

            const normalized = {
                id: res.id,
                teacherCode: res.teacherCode || "N/A",
                teacherName: res.teacherName || "N/A",
                subjectName: res.subjectName || "N/A",
                subjectCode: res.subjectCode || "N/A",
                quarter: res.quarter || "N/A",
                year: res.year || "N/A",
                registrationDate: formatDate(res.registrationDate),
                status: (res.status || "").toLowerCase(),
                notes: res.notes || "Không có ghi chú.",
            };

            setData(normalized);
        } catch (err) {
            showToast("Lỗi", "Không thể tải chi tiết đăng ký", "danger");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (title, message, type) => {
        setToast({ show: true, title, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    if (loading) {
        return (
            <MainLayout>
                <Loading />
            </MainLayout>
        );
    }

    if (!data) {
        return (
            <MainLayout>
                <div className="container">
                    <div className="card my-5">
                        <div className="card-body text-center">
                            <h4>Không tìm thấy dữ liệu đăng ký</h4>
                            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const statusInfo = mapStatusInfo(data.status);

    return (
        <MainLayout>
            <div className="container mt-3">

                {/* Nút Back trên cùng */}
                <button
                    className="back-circle-btn"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>

                <div className="card shadow-sm">

                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h4 className="card-title mb-0">Chi tiết Đăng ký Môn học</h4>
                    </div>

                    <div className="card-body">

                        {/* THÔNG TIN GIÁO VIÊN - MÔN HỌC */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h5>Thông tin Giáo viên</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                    <tr>
                                        <td className="fw-bold">Mã giáo viên:</td>
                                        <td>{data.teacherCode}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-bold">Tên giáo viên:</td>
                                        <td>{data.teacherName}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-md-6">
                                <h5>Thông tin Môn học</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                    <tr>
                                        <td className="fw-bold">Tên môn:</td>
                                        <td>{data.subjectName}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-bold">Mã môn:</td>
                                        <td>{data.subjectCode}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr />

                        {/* QUÝ - NGÀY ĐĂNG KÝ - TRẠNG THÁI */}
                        <div className="row mb-4">

                            <div className="col-md-4 mb-2">
                                <strong>Quý:</strong><br />
                                {data.quarter}
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Ngày đăng ký:</strong><br />
                                {data.registrationDate}
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Trạng thái:</strong><br />
                                <span className={`badge bg-${statusInfo.class}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                        </div>

                        {/* GHI CHÚ */}
                        <div className="row">
                            <div className="col-12">
                                <h5>Ghi chú / Lý do</h5>
                                <p>{data.notes}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* TOAST */}
            {toast.show && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                />
            )}
        </MainLayout>
    );
};



export default SubjectRegistrationDetail;

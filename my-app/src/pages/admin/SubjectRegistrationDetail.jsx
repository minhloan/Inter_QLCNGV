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
        carryover: { label: "Dời môn", class: "info" },
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
            <div className="page-admin-subject-registration">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Chi tiết đăng ký môn học</h1>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-6 mb-4 mb-md-0 detail-section">
                                <h5>Thông tin giáo viên</h5>
                                <div className="table-responsive">
                                    <table className="table table-borderless detail-table mb-0">
                                        <tbody>
                                        <tr>
                                            <td>Mã giáo viên:</td>
                                            <td className="text-break">{data.teacherCode}</td>
                                        </tr>
                                        <tr>
                                            <td>Tên giáo viên:</td>
                                            <td className="text-break">{data.teacherName}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="col-md-6 detail-section">
                                <h5>Thông tin môn học</h5>
                                <div className="table-responsive">
                                    <table className="table table-borderless detail-table mb-0">
                                        <tbody>
                                        <tr>
                                            <td>Tên môn:</td>
                                            <td className="text-break">{data.subjectName}</td>
                                        </tr>
                                        <tr>
                                            <td>Mã môn:</td>
                                            <td className="text-break">{data.subjectCode}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="detail-meta-row mb-4">
                            <div className="detail-meta-item">
                                <strong>Quý</strong>
                                <p className="text-break">{data.quarter}</p>
                            </div>
                            <div className="detail-meta-item">
                                <strong>Ngày đăng ký</strong>
                                <p className="text-break">{data.registrationDate}</p>
                            </div>
                            <div className="detail-meta-item">
                                <strong>Trạng thái</strong>
                                <div className="mt-1">
                                    <span className={`badge badge-${statusInfo.class}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h5>Lý Do / Dời Môn</h5>
                            <p className="mb-0 text-break">{data.notes}</p>
                        </div>
                    </div>
                </div>

                {toast.show && (
                    <Toast
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                    />
                )}
            </div>
        </MainLayout>
    );
};



export default SubjectRegistrationDetail;

import React from 'react';
import { formatDate, getRoleName } from '../../utils/exportUtils';

/**
 * Template cho BM06.39 - Phân công đánh giá giáo viên giảng thử
 */
const AssignmentTemplate = ({ trial }) => {
    // Sắp xếp attendees: Chủ tọa -> Thư ký -> Thành viên
    const sortedAttendees = [...(trial.attendees || [])].sort((a, b) => {
        const order = { 'CHU_TOA': 1, 'THU_KY': 2, 'THANH_VIEN': 3 };
        return (order[a.attendeeRole] || 99) - (order[b.attendeeRole] || 99);
    });

    return (
        <div className="trial-document-template assignment-template">
            <style>{`
                .assignment-template {
                    font-family: 'Times New Roman', serif;
                    font-size: 13pt;
                    line-height: 1.6;
                    color: #000;
                    max-width: 100%;
                }
                .assignment-template .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                }
                .assignment-template .header-left {
                    flex: 1;
                }
                .assignment-template .header-right {
                    flex: 1;
                    text-align: right;
                }
                .assignment-template .header-center {
                    flex: 1;
                    text-align: center;
                }
                .assignment-template .logo {
                    max-width: 80px;
                    max-height: 80px;
                }
                .assignment-template .title {
                    text-align: center;
                    font-weight: bold;
                    font-size: 16pt;
                    text-transform: uppercase;
                    margin: 20px 0;
                    line-height: 1.8;
                }
                .assignment-template .info-section {
                    margin: 20px 0;
                }
                .assignment-template .info-row {
                    margin: 8px 0;
                    display: flex;
                }
                .assignment-template .info-label {
                    font-weight: bold;
                    min-width: 120px;
                }
                .assignment-template .info-value {
                    flex: 1;
                }
                .assignment-template .table-title {
                    font-weight: bold;
                    margin: 20px 0 10px 0;
                }
                .assignment-template table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .assignment-template table th,
                .assignment-template table td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
                .assignment-template table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .assignment-template .footer {
                    margin-top: 30px;
                    text-align: right;
                }
                .assignment-template .signature-section {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                }
                .assignment-template .signature-box {
                    text-align: center;
                    width: 30%;
                }
            `}</style>

            <div className="header">
                <div className="header-left">
                    <div style={{ fontWeight: 'bold' }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ GIAO THÔNG VẬN TẢI</div>
                    <div style={{ fontSize: '11pt' }}>KHOA CÔNG NGHỆ THÔNG TIN</div>
                </div>
                <div className="header-center">
                    <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>Độc lập - Tự do - Hạnh phúc</div>
                </div>
                <div className="header-right">
                    <div style={{ fontSize: '11pt' }}>Số: ………/BM06.39-ĐT</div>
                </div>
            </div>

            <div className="title">
                PHÂN CÔNG ĐÁNH GIÁ GIÁO VIÊN GIẢNG THỬ
            </div>

            <div className="info-section">
                <div className="info-row">
                    <span className="info-label">Giảng viên:</span>
                    <span className="info-value">
                        {trial.teacherName || ''}
                        {trial.teacherCode && ` (${trial.teacherCode})`}
                    </span>
                </div>
                <div className="info-row">
                    <span className="info-label">Môn học:</span>
                    <span className="info-value">{trial.subjectName || ''}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Ngày giảng:</span>
                    <span className="info-value">
                        {trial.teachingDate ? formatDate(trial.teachingDate) : ''}
                    </span>
                </div>
                <div className="info-row">
                    <span className="info-label">Giờ giảng:</span>
                    <span className="info-value">{trial.teachingTime || ''}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Địa điểm:</span>
                    <span className="info-value">{trial.location || ''}</span>
                </div>
            </div>

            <div className="table-title">Danh sách hội đồng đánh giá:</div>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>STT</th>
                        <th style={{ width: '40%' }}>Họ và tên</th>
                        <th style={{ width: '25%' }}>Vai trò</th>
                        <th style={{ width: '30%' }}>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAttendees.map((attendee, index) => (
                        <tr key={attendee.id || index}>
                            <td>{index + 1}</td>
                            <td>{attendee.attendeeName || ''}</td>
                            <td>{getRoleName(attendee.attendeeRole)}</td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="footer">
                <div>Ngày lập: {formatDate(new Date().toISOString())}</div>
            </div>
        </div>
    );
};

export default AssignmentTemplate;


import React from 'react';
import { formatDate, getRoleName, getConclusionName } from '../../utils/exportUtils';

/**
 * Template cho BM06.41 - Biên bản đánh giá giảng thử
 */
const MinutesTemplate = ({ trial }) => {
    // Tính điểm trung bình
    const evaluations = trial.evaluations || [];
    const scores = evaluations.filter(e => e.score != null).map(e => e.score);
    const avgScore = scores.length > 0 
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
        : null;

    // Tìm Chủ tọa và Thư ký
    const chuToa = trial.attendees?.find(a => a.attendeeRole === 'CHU_TOA');
    const thuKy = trial.attendees?.find(a => a.attendeeRole === 'THU_KY');

    return (
        <div className="trial-document-template minutes-template">
            <style>{`
                .minutes-template {
                    font-family: 'Times New Roman', serif;
                    font-size: 13pt;
                    line-height: 1.6;
                    color: #000;
                    max-width: 100%;
                }
                .minutes-template .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                }
                .minutes-template .header-left {
                    flex: 1;
                }
                .minutes-template .header-right {
                    flex: 1;
                    text-align: right;
                }
                .minutes-template .header-center {
                    flex: 1;
                    text-align: center;
                }
                .minutes-template .title {
                    text-align: center;
                    font-weight: bold;
                    font-size: 16pt;
                    text-transform: uppercase;
                    margin: 20px 0;
                    line-height: 1.8;
                }
                .minutes-template .info-section {
                    margin: 20px 0;
                }
                .minutes-template .info-row {
                    margin: 8px 0;
                    display: flex;
                }
                .minutes-template .info-label {
                    font-weight: bold;
                    min-width: 120px;
                }
                .minutes-template .info-value {
                    flex: 1;
                }
                .minutes-template .section-title {
                    font-weight: bold;
                    margin: 20px 0 10px 0;
                }
                .minutes-template table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .minutes-template table th,
                .minutes-template table td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
                .minutes-template table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .minutes-template .footer {
                    margin-top: 30px;
                    text-align: right;
                }
                .minutes-template .signature-section {
                    margin-top: 40px;
                }
                .minutes-template .signature-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                .minutes-template .signature-table td {
                    border: 1px solid #000;
                    padding: 15px;
                    text-align: center;
                    vertical-align: top;
                    width: 33.33%;
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
                    <div style={{ fontSize: '11pt' }}>Số: ………/BM06.41-ĐT</div>
                </div>
            </div>

            <div className="title">
                BIÊN BẢN ĐÁNH GIÁ GIẢNG THỬ
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

            {evaluations.length > 0 && (
                <>
                    <div className="section-title">Kết quả đánh giá:</div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>STT</th>
                                <th style={{ width: '35%' }}>Người đánh giá</th>
                                <th style={{ width: '20%' }}>Vai trò</th>
                                <th style={{ width: '15%' }}>Điểm</th>
                                <th style={{ width: '25%' }}>Kết luận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evaluations.map((evaluation, index) => (
                                <tr key={evaluation.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{evaluation.attendeeName || ''}</td>
                                    <td>{getRoleName(evaluation.attendeeRole)}</td>
                                    <td>{evaluation.score != null ? evaluation.score : ''}</td>
                                    <td>{getConclusionName(evaluation.conclusion)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {avgScore && (
                        <div className="info-section" style={{ marginTop: '20px' }}>
                            <div className="info-row">
                                <span className="info-label">Điểm trung bình:</span>
                                <span className="info-value">{avgScore}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Kết luận cuối cùng:</span>
                                <span className="info-value">
                                    {getConclusionName(trial.finalResult) || 'Chưa có'}
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="signature-section">
                <div className="section-title">Xác nhận:</div>
                <table className="signature-table">
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Chủ tọa</div>
                                <div style={{ marginTop: '60px' }}>(Ký và ghi rõ họ tên)</div>
                                {chuToa && (
                                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                        {chuToa.attendeeName}
                                    </div>
                                )}
                            </td>
                            <td>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Thư ký</div>
                                <div style={{ marginTop: '60px' }}>(Ký và ghi rõ họ tên)</div>
                                {thuKy && (
                                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                        {thuKy.attendeeName}
                                    </div>
                                )}
                            </td>
                            <td>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Giảng viên</div>
                                <div style={{ marginTop: '60px' }}>(Ký và ghi rõ họ tên)</div>
                                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                    {trial.teacherName || ''}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="footer">
                <div>Ngày lập: {formatDate(new Date().toISOString())}</div>
            </div>
        </div>
    );
};

export default MinutesTemplate;


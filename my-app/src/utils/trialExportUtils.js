import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import ImageModule from 'docxtemplater-image-module-free';
import { formatDate, getRoleName, getConclusionName } from './exportUtils';

/**
 * Fetch template file từ public folder
 */
const fetchTemplate = async (templatePath) => {
    const response = await fetch(templatePath);
    if (!response.ok) {
        throw new Error(`Failed to fetch template: ${templatePath}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
};

/**
 * Load logo CUSC và convert thành base64
 */
const loadLogoAsBase64 = async () => {
    try {
        const response = await fetch('/logo.png');
        if (!response.ok) {
            console.warn('Logo not found, continuing without logo');
            return null;
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:image/png;base64, prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Error loading logo:', error);
        return null;
    }
};

/**
 * Export Word document sử dụng docxtemplater
 */
export const exportWordFromTemplate = async (templatePath, data, filename) => {
    try {
        // Fetch template
        const templateBuffer = await fetchTemplate(templatePath);
        
        // Load logo nếu có trong data
        let logoBase64 = null;
        if (data.logo) {
            logoBase64 = await loadLogoAsBase64();
            if (logoBase64) {
                // Thêm logo vào data với format cho image module
                data.logo = {
                    _type: 'image',
                    _src: logoBase64,
                    _width: 80, // Width in pixels
                    _height: 80, // Height in pixels
                    _extension: 'png'
                };
            }
        }
        
        // Load template với PizZip
        const zip = new PizZip(templateBuffer);
        
        // Helper function để convert base64 thành Uint8Array (tương thích browser)
        const base64ToUint8Array = (base64) => {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        };
        
        // Cấu hình image module
        const imageModule = new ImageModule({
            centered: false,
            fileType: 'docx',
            getImage: (tagValue) => {
                // tagValue sẽ là object {_type: 'image', _src: base64, ...}
                if (tagValue && tagValue._type === 'image') {
                    const uint8Array = base64ToUint8Array(tagValue._src);
                    return Promise.resolve(uint8Array);
                }
                return Promise.resolve(null);
            },
            getSize: (img, tagValue) => {
                // Return size in pixels
                return [
                    tagValue._width || 80,
                    tagValue._height || 80
                ];
            }
        });
        
        // Tạo Docxtemplater instance với image module
        const doc = new Docxtemplater(zip, {
            modules: [imageModule],
            paragraphLoop: true,
            linebreaks: true,
        });
        
        // Render data vào template
        doc.render(data);
        
        // Generate document
        const blob = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE',
        });
        
        // Save file
        saveAs(blob, filename);
        
        return true;
    } catch (error) {
        console.error('Error exporting Word document:', error);
        throw error;
    }
};

/**
 * Export Excel document sử dụng exceljs
 */
export const exportExcelFromTemplate = async (templatePath, dataProcessor, filename) => {
    try {
        // Fetch template
        const templateBuffer = await fetchTemplate(templatePath);
        
        // Load workbook từ template
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        
        // Process data vào workbook (function được truyền vào)
        if (dataProcessor && typeof dataProcessor === 'function') {
            await dataProcessor(workbook);
        }
        
        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer({
            type: 'array',
        });
        
        // Create blob và save
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        
        saveAs(blob, filename);
        
        return true;
    } catch (error) {
        console.error('Error exporting Excel document:', error);
        throw error;
    }
};

/**
 * Chuẩn bị data cho BM06.39 - Phân công đánh giá (Word)
 */
const prepareAssignmentData = (trial) => {
    // Sắp xếp attendees: Chủ tọa -> Thư ký -> Thành viên
    const sortedAttendees = [...(trial.attendees || [])].sort((a, b) => {
        const order = { 'CHU_TOA': 1, 'THU_KY': 2, 'THANH_VIEN': 3 };
        return (order[a.attendeeRole] || 99) - (order[b.attendeeRole] || 99);
    });

    return {
        // Thông tin chung
        teacherName: trial.teacherName || '',
        teacherCode: trial.teacherCode || '',
        subjectName: trial.subjectName || '',
        date: trial.teachingDate ? formatDate(trial.teachingDate) : '',
        time: trial.teachingTime || '',
        location: trial.location || '',
        // Bảng "Danh sách hội đồng đánh giá" (STT, Họ và tên, Vai trò, Ghi chú)
        attendees: sortedAttendees.map((attendee, index) => ({
            stt: index + 1,
            name: attendee.attendeeName || '',
            role: getRoleName(attendee.attendeeRole),
            note: '' // Ghi chú (trống theo mẫu)
        })),
        // Ngày lập
        sign_date: formatDate(new Date().toISOString())
    };
};

/**
 * Export BM06.39 - Phân công đánh giá giáo viên giảng thử (Word)
 */
export const exportTrialAssignment = async (trial) => {
    const data = prepareAssignmentData(trial);
    const filename = `BM06.39-Phan_cong_danh_gia_GV_giang_thu_${trial.id || Date.now()}.docx`;
    
    // Thử .docx trước, nếu không có thì thử .doc
    try {
        await exportWordFromTemplate('/templates/BM06.39-Phan cong danh gia giao vien giang thu.docx', data, filename);
        return true;
    } catch (error) {
        console.warn('Template .docx not found, trying .doc:', error);
        try {
            await exportWordFromTemplate('/templates/BM06.39-Phan cong danh gia giao vien giang thu.doc', data, filename);
            return true;
        } catch (error2) {
            throw new Error('Template file BM06.39 không tồn tại. Vui lòng:\n1. Copy file từ references/Bieu mau danh gia giang day/BM06.39-Phan cong danh gia giao vien giang thu.doc vào public/templates/\n2. Mở file trong Word và chuyển đổi sang .docx (File → Save As → Word Document (*.docx))\n3. Đảm bảo file có tên: BM06.39-Phan cong danh gia giao vien giang thu.docx');
        }
    }
};

/**
 * Chuẩn bị data cho BM06.40 - Phiếu đánh giá giảng thử (Excel)
 */
const prepareEvaluationFormData = (trial, evaluation) => {
    return {
        teacherName: trial.teacherName || '',
        teacherCode: trial.teacherCode || '',
        teacherFullName: trial.teacherCode 
            ? `${trial.teacherName} (${trial.teacherCode})`
            : trial.teacherName || '',
        subjectName: trial.subjectName || '',
        teachingDate: trial.teachingDate ? formatDate(trial.teachingDate) : '',
        teachingTime: trial.teachingTime || '',
        location: trial.location || '',
        attendeeName: evaluation?.attendeeName || '',
        attendeeRole: getRoleName(evaluation?.attendeeRole),
        score: evaluation?.score || '',
        conclusion: getConclusionName(evaluation?.conclusion),
        comments: evaluation?.comments || ''
    };
};

/**
 * Export BM06.40 - Phiếu đánh giá giảng thử (Excel)
 */
export const exportTrialEvaluationForm = async (trial, evaluation) => {
    const data = prepareEvaluationFormData(trial, evaluation);
    const filename = `BM06.40-Phieu_danh_gia_giang_thu_${trial.id || Date.now()}_${evaluation?.attendeeId || Date.now()}.xlsx`;
    
    // Data processor function để điền data vào Excel
    const dataProcessor = async (workbook) => {
        const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
        
        if (!worksheet) {
            throw new Error('Worksheet not found in template');
        }
        
        // Tìm và thay thế các placeholder trong cells
        // Giả sử template có các placeholder như {teacherName}, {subjectName}, etc.
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                if (cell.value && typeof cell.value === 'string') {
                    let cellValue = cell.value;
                    
                    // Replace placeholders
                    cellValue = cellValue.replace(/{teacherFullName}/g, data.teacherFullName);
                    cellValue = cellValue.replace(/{teacherName}/g, data.teacherName);
                    cellValue = cellValue.replace(/{teacherCode}/g, data.teacherCode);
                    cellValue = cellValue.replace(/{subjectName}/g, data.subjectName);
                    cellValue = cellValue.replace(/{teachingDate}/g, data.teachingDate);
                    cellValue = cellValue.replace(/{teachingTime}/g, data.teachingTime);
                    cellValue = cellValue.replace(/{location}/g, data.location);
                    cellValue = cellValue.replace(/{attendeeName}/g, data.attendeeName);
                    cellValue = cellValue.replace(/{attendeeRole}/g, data.attendeeRole);
                    cellValue = cellValue.replace(/{score}/g, data.score);
                    cellValue = cellValue.replace(/{conclusion}/g, data.conclusion);
                    cellValue = cellValue.replace(/{comments}/g, data.comments);
                    
                    if (cellValue !== cell.value) {
                        cell.value = cellValue;
                    }
                }
            });
        });
        
        // Hoặc nếu template có cấu trúc cố định, điền vào các cell cụ thể
        // Ví dụ: worksheet.getCell('B2').value = data.teacherFullName;
    };
    
    try {
        await exportExcelFromTemplate('/templates/BM06.40-Phieu danh gia giang thu.xlsx', dataProcessor, filename);
        return true;
    } catch (error) {
        console.warn('Template .xlsx not found:', error);
        throw new Error('Template file BM06.40-Phieu danh gia giang thu.xlsx không tồn tại. Vui lòng đảm bảo file template đã được copy vào thư mục public/templates/');
    }
};

/**
 * Chuẩn bị data cho BM06.41 - Biên bản đánh giá giảng thử (Word)
 */
const prepareMinutesData = (trial) => {
    const evaluations = trial.evaluations || [];
    
    // Tính điểm trung bình
    const scores = evaluations.filter(e => e.score != null).map(e => e.score);
    const avgScore = scores.length > 0 
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
        : '0.00';
    
    // Sắp xếp attendees: Chủ tọa -> Thư ký -> Thành viên
    const sortedAttendees = [...(trial.attendees || [])].sort((a, b) => {
        const order = { 'CHU_TOA': 1, 'THU_KY': 2, 'THANH_VIEN': 3 };
        return (order[a.attendeeRole] || 99) - (order[b.attendeeRole] || 99);
    });
    
    // Tìm Chủ tọa và Thư ký
    const chuToa = trial.attendees?.find(a => a.attendeeRole === 'CHU_TOA');
    const thuKy = trial.attendees?.find(a => a.attendeeRole === 'THU_KY');

    // Tạo map để lấy role name từ attendee
    const attendeeMap = {};
    (trial.attendees || []).forEach(attendee => {
        attendeeMap[attendee.id] = {
            name: attendee.attendeeName,
            role: getRoleName(attendee.attendeeRole)
        };
    });

    // Tổng hợp góp ý từ các evaluation
    const comments = evaluations
        .map(e => e.comments)
        .filter(c => c && c.trim())
        .join('\n\n');

    return {
        // Thông tin chung
        date: trial.teachingDate ? formatDate(trial.teachingDate) : '',
        time: trial.teachingTime || '',
        location: trial.location || '',
        // Bảng "Thành phần tham dự" (STT, HỌ TÊN, CHỨC VỤ, CÔNG VIỆC)
        attendees: sortedAttendees.map((attendee, index) => ({
            stt: index + 1,
            name: attendee.attendeeName || '',
            position: getRoleName(attendee.attendeeRole),
            task: attendee.attendeeRole === 'CHU_TOA' 
                ? 'Đánh giá giảng thử, Chủ tọa'
                : attendee.attendeeRole === 'THU_KY'
                ? 'Đánh giá giảng thử, Thư ký'
                : 'Đánh giá giảng thử'
        })),
        // Nội dung
        teacherName: trial.teacherName || '',
        teacherCode: trial.teacherCode || '',
        subjectName: trial.subjectName || '',
        comments: comments || '',
        // Bảng kết quả đánh giá (5 cột: STT, Người đánh giá, Vai trò, Điểm, Kết luận)
        evaluations: evaluations.map((evaluation, index) => {
            const attendee = attendeeMap[evaluation.attendeeId];
            return {
                stt: index + 1,
                evaluatorName: attendee?.name || evaluation.attendeeName || '',
                role: attendee?.role || getRoleName(evaluation.attendeeRole) || '',
                score: evaluation.score != null ? evaluation.score.toString() : '',
                conclusion: getConclusionName(evaluation.conclusion) || ''
            };
        }),
        // Điểm trung bình và kết quả cuối cùng
        avgScore: avgScore,
        finalResult: getConclusionName(trial.finalResult) || 'Chưa có',
        // Chữ ký
        chuToaName: chuToa?.attendeeName || '',
        thuKyName: thuKy?.attendeeName || '',
        // Ngày lập
        createDate: formatDate(new Date().toISOString())
    };
};

/**
 * Export BM06.41 - Biên bản đánh giá giảng thử (Word)
 */
export const exportTrialMinutes = async (trial) => {
    const data = prepareMinutesData(trial);
    const filename = `BM06.41-BB_danh_gia_giang_thu_${trial.id || Date.now()}.docx`;
    
    // Thử .docx trước, nếu không có thì thử .doc
    try {
        await exportWordFromTemplate('/templates/BM06.41-BB danh gia giang thu.doc', data, filename);
        return true;
    } catch (error) {
        console.warn('Template .docx not found, trying .doc:', error);
        try {
            await exportWordFromTemplate('/templates/BM06.41-BB danh gia giang thu.doc', data, filename);
            return true;
        } catch (error2) {
            throw new Error('Template file BM06.41 không tồn tại. Vui lòng:\n1. Copy file từ references/Bieu mau danh gia giang day/BM06.41-BB danh gia giang thu.doc vào public/templates/\n2. Mở file trong Word và chuyển đổi sang .docx (File → Save As → Word Document (*.docx))\n3. Đảm bảo file có tên: BM06.41-BB danh gia giang thu.doc');
        }
    }
};

/**
 * Chuẩn bị data cho BM06.42 - Thống kê đánh giá GV giảng thử (Excel)
 */
const prepareStatisticsData = (trials) => {
    return {
        createDate: formatDate(new Date().toISOString()),
        trials: trials.map((trial, index) => {
            const evaluations = trial.evaluations || [];
            const scores = evaluations.filter(e => e.score != null).map(e => e.score);
            const avgScore = scores.length > 0 
                ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
                : '-';
            
            return {
                stt: index + 1,
                teacherName: trial.teacherName || '',
                teacherCode: trial.teacherCode || '',
                subjectName: trial.subjectName || '',
                teachingDate: trial.teachingDate ? formatDate(trial.teachingDate) : '',
                avgScore: avgScore,
                finalResult: getConclusionName(trial.finalResult) || 'Chưa có',
                status: trial.status || '',
                note: trial.note || ''
            };
        }),
        totalCount: trials.length
    };
};

/**
 * Export BM06.42 - Thống kê đánh giá GV giảng thử (Excel)
 */
export const exportTrialStatistics = async (trials) => {
    const data = prepareStatisticsData(trials);
    const filename = `BM06.42-Thong_ke_danh_gia_GV_giang_thu_${formatDate(new Date().toISOString()).replace(/\//g, '_')}.xlsx`;
    
    // Data processor function để điền data vào Excel
    const dataProcessor = async (workbook) => {
        const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
        
        if (!worksheet) {
            throw new Error('Worksheet not found in template');
        }
        
        // Tìm row bắt đầu để điền data (giả sử từ row 3)
        let startRow = 3;
        
        // Điền data cho từng trial
        data.trials.forEach((trial, index) => {
            const row = worksheet.getRow(startRow + index);
            row.getCell(1).value = trial.stt;
            row.getCell(2).value = trial.teacherName;
            row.getCell(3).value = trial.teacherCode;
            row.getCell(4).value = trial.subjectName;
            row.getCell(5).value = trial.teachingDate;
            row.getCell(6).value = trial.avgScore === '-' ? '-' : parseFloat(trial.avgScore);
            row.getCell(7).value = trial.finalResult;
            row.getCell(8).value = trial.status;
            row.getCell(9).value = trial.note;
        });
        
        // Điền tổng số ở cuối
        const totalRow = worksheet.getRow(startRow + data.trials.length + 1);
        totalRow.getCell(1).value = 'Tổng số:';
        totalRow.getCell(2).value = data.totalCount;
    };
    
    // Thử .xlsx trước, nếu không có thì thử .XLS
    try {
        await exportExcelFromTemplate('/templates/BM06.42-Thong ke danh gia GV giang thu.xlsx', dataProcessor, filename);
        return true;
    } catch (error) {
        console.warn('Template .xlsx not found, trying .XLS:', error);
        try {
            await exportExcelFromTemplate('/templates/BM06.42-Thong ke danh gia GV giang thu.XLS', dataProcessor, filename);
            return true;
        } catch (error2) {
            throw new Error('Template file BM06.42 không tồn tại. Vui lòng:\n1. Copy file từ references/Bieu mau danh gia giang day/BM06.42-Thong ke danh gia GV giang thu.XLS vào public/templates/\n2. Mở file trong Excel và chuyển đổi sang .xlsx (File → Save As → Excel Workbook (*.xlsx))\n3. Đảm bảo file có tên: BM06.42-Thong ke danh gia GV giang thu.xlsx');
        }
    }
};


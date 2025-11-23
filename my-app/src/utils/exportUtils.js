import html2pdf from 'html2pdf.js';

/**
 * Lấy HTML từ DOM element
 */
export const getHtmlFromElement = (element) => {
    if (typeof element === 'string') {
        return element;
    }
    if (element && element.outerHTML) {
        return element.outerHTML;
    }
    if (element && element.innerHTML) {
        return element.innerHTML;
    }
    return '';
};

/**
 * Xuất HTML thành file Word (.docx)
 */
export const exportToWord = async (htmlContent, filename) => {
    // Tạo HTML hoàn chỉnh với styles
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: A4;
                    margin: 2cm 2cm 2cm 2cm;
                }
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 13pt;
                    line-height: 1.5;
                    margin: 0;
                    padding: 0;
                }
                .document-container {
                    width: 100%;
                }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    try {
        // Sử dụng html-docx-js với dynamic import
        // html-docx-js là UMD module, cần import động để tương thích với Vite
        let htmlDocxLib;
        
        // Thử import từ dist
        try {
            const htmlDocxModule = await import('html-docx-js/dist/html-docx.js');
            htmlDocxLib = htmlDocxModule.default || htmlDocxModule;
        } catch (importError) {
            // Nếu import thất bại, thử từ window (nếu đã load qua script tag)
            if (window.htmlDocx) {
                htmlDocxLib = window.htmlDocx;
            } else {
                throw new Error('Cannot import html-docx-js: ' + importError.message);
            }
        }
        
        if (!htmlDocxLib || !htmlDocxLib.asBlob) {
            throw new Error('html-docx-js library not found or asBlob method not available');
        }
        
        const converted = htmlDocxLib.asBlob(fullHtml);

        const url = window.URL.createObjectURL(converted);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
    } catch (error) {
        console.error('Error exporting to Word:', error);
        // Fallback: sử dụng cách tạo file đơn giản hơn (HTML format)
        try {
            const htmlBlob = new Blob([fullHtml], { type: 'application/msword' });
            const url = window.URL.createObjectURL(htmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return true;
        } catch (fallbackError) {
            console.error('Fallback export also failed:', fallbackError);
            throw error;
        }
    }
};

/**
 * Xuất HTML thành file PDF
 */
export const exportToPdf = async (htmlContent, filename) => {
    try {
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        document.body.appendChild(element);

        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        
        document.body.removeChild(element);
        return true;
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
    }
};

/**
 * Format date theo định dạng dd/MM/yyyy
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Lấy tên vai trò
 */
export const getRoleName = (role) => {
    if (!role) return '';
    const roleMap = {
        'CHU_TOA': 'Chủ tọa',
        'THU_KY': 'Thư ký',
        'THANH_VIEN': 'Thành viên'
    };
    return roleMap[role] || role;
};

/**
 * Lấy tên trạng thái
 */
export const getStatusName = (status) => {
    if (!status) return '';
    const statusMap = {
        'PENDING': 'Chờ chấm',
        'REVIEWED': 'Đang chấm',
        'PASSED': 'Đạt',
        'FAILED': 'Không đạt'
    };
    return statusMap[status] || status;
};

/**
 * Lấy kết luận
 */
export const getConclusionName = (conclusion) => {
    if (!conclusion) return '';
    if (conclusion === 'PASS') return 'ĐẠT';
    if (conclusion === 'FAIL') return 'KHÔNG ĐẠT';
    return '';
};


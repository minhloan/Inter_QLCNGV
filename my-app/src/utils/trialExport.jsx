import React from 'react';
import { exportToWord, exportToPdf } from './exportUtils';
import AssignmentTemplate from '../components/TrialTemplates/AssignmentTemplate';
import MinutesTemplate from '../components/TrialTemplates/MinutesTemplate';
import { createRoot } from 'react-dom/client';

/**
 * Xuất BM06.39 - Phân công đánh giá (Word)
 */
export const exportAssignmentDocument = async (trial, filename) => {
    let container = null;
    let root = null;
    
    try {
        if (!trial) {
            throw new Error('Trial data is required');
        }

        // Tạo container tạm để render component
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '210mm'; // A4 width
        document.body.appendChild(container);

        // Render component
        root = createRoot(container);
        root.render(<AssignmentTemplate trial={trial} />);

        // Đợi một chút để component render xong
        await new Promise(resolve => setTimeout(resolve, 200));

        // Lấy HTML
        const htmlContent = container.innerHTML;

        if (!htmlContent || htmlContent.trim() === '') {
            throw new Error('Failed to render template: empty HTML content');
        }

        // Cleanup
        if (root) {
            root.unmount();
        }
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }

        // Xuất file
        const finalFilename = filename || `BM06.39-Phan_cong_danh_gia_GV_giang_thu_${trial.id}.docx`;
        await exportToWord(htmlContent, finalFilename);
        
        return true;
    } catch (error) {
        console.error('Error exporting assignment document:', error);
        // Cleanup on error
        if (root) {
            try {
                root.unmount();
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        if (container && container.parentNode) {
            try {
                document.body.removeChild(container);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        throw error;
    }
};

/**
 * Xuất BM06.41 - Biên bản đánh giá (Word)
 */
export const exportMinutesDocument = async (trial, filename) => {
    let container = null;
    let root = null;
    
    try {
        if (!trial) {
            throw new Error('Trial data is required');
        }

        // Tạo container tạm để render component
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '210mm'; // A4 width
        document.body.appendChild(container);

        // Render component
        root = createRoot(container);
        root.render(<MinutesTemplate trial={trial} />);

        // Đợi một chút để component render xong
        await new Promise(resolve => setTimeout(resolve, 200));

        // Lấy HTML
        const htmlContent = container.innerHTML;

        if (!htmlContent || htmlContent.trim() === '') {
            throw new Error('Failed to render template: empty HTML content');
        }

        // Cleanup
        if (root) {
            root.unmount();
        }
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }

        // Xuất file
        const finalFilename = filename || `BM06.41-BB_danh_gia_giang_thu_${trial.id}.docx`;
        await exportToWord(htmlContent, finalFilename);
        
        return true;
    } catch (error) {
        console.error('Error exporting minutes document:', error);
        // Cleanup on error
        if (root) {
            try {
                root.unmount();
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        if (container && container.parentNode) {
            try {
                document.body.removeChild(container);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        throw error;
    }
};


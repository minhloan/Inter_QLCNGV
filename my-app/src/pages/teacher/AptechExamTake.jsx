import MainLayout from '../../components/Layout/MainLayout';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AptechExamTake = () => {
    const navigate = useNavigate();
    const iframeRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleScreenshot = async () => {
        setIsCapturing(true);
        try {
            const iframeWidth = iframeRef.current ? Math.max(800, iframeRef.current.clientWidth) : window.innerWidth;

            const response = await fetch('http://localhost:3001/api/screenshot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: 'https://aptrack.asia/', width: iframeWidth })
            });

            if (!response.ok) {
                throw new Error('Không thể chụp màn hình từ server');
            }

            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aptech_screenshot_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('Ảnh chụp đã tải về thành công!');
        } catch (err) {
            console.error('Screenshot error:', err);
            alert('Không thể chụp màn hình. Vui lòng chắc chắn screenshot service đang chạy.');
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <MainLayout>
            <div className="page-align-with-form page-admin-add-teacher">
                <div className="content-header">
                    <div className="content-title">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h3 className="page-title">Tham gia Kỳ thi Aptech</h3>
                    </div>
                    <div className="aptech-header-actions">
                        <button 
                            className="btn btn-primary" 
                            onClick={handleScreenshot}
                            disabled={isCapturing}
                        >
                            <i className="bi bi-camera"></i>
                            <span> {isCapturing ? 'Đang chụp...' : 'Chụp màn hình'}</span>
                        </button>
                    </div>
                </div>

                <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, background: '#fff', marginTop: 12 }}>
                    <div style={{ width: '100%', height: 600, overflow: 'hidden' }}>
                        <iframe
                            ref={iframeRef}
                            title="aptrack-embed"
                            src="https://aptrack.asia/"
                            style={{ width: '100%', height: '100%', border: 0 }}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AptechExamTake;

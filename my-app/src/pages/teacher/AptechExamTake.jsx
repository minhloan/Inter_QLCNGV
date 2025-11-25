import MainLayout from '../../components/Layout/MainLayout';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const AptechExamTake = () => {
    const cardRef = useRef(null);

    const handleScreenshot = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { useCORS: true, logging: false });
            canvas.toBlob((blob) => {
                if (!blob) return;
                saveAs(blob, `aptech_screenshot_${Date.now()}.png`);
            });
        } catch (err) {
            // Cross-origin iframe content may prevent a full screenshot; capture may be blank due to browser policies
            alert('Không thể chụp nội dung trong iframe do chính sách trình duyệt (cross-origin).');
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: 24 }}>
                <h2>Tham gia Kỳ thi Aptech</h2>

                <div style={{ marginTop: 16, marginBottom: 12 }}>
                    <button className="btn btn-primary me-2" onClick={handleScreenshot}>
                        <i className="bi bi-camera"></i>
                        <span> Chụp màn hình</span>
                    </button>
                </div>

                <div ref={cardRef} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, background: '#fff' }}>
                    <div style={{ marginBottom: 12 }}>
                        <strong>Embedded site:</strong> https://aptrack.asia/
                    </div>
                    <div style={{ width: '100%', height: 600, overflow: 'hidden' }}>
                        <iframe
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

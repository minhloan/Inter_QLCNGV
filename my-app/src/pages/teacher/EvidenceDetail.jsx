import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Toast from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { getEvidenceById } from '../../api/evidence';
import { getFile, getFileAsDataUrl, downloadEvidenceFile } from '../../api/file';

const FilePreview = ({ evidence }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFile = async () => {
      if (!evidence.fileId) return;

      try {
        setLoading(true);
        setError(null);
        const url = await getFile(evidence.fileId);
        setFileUrl(url);
      } catch (err) {
        console.error('Error loading file for preview:', err);
        setError('Không thể tải file để xem trước');
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [evidence.fileId]);

  if (loading) {
    return (
      <div className="preview-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-error">
        <i className="bi bi-exclamation-triangle text-warning"></i>
        <p>{error}</p>
      </div>
    );
  }

  const fileExtension = evidence.fileName ? evidence.fileName.split('.').pop().toLowerCase() : 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  if (isImage) {
    return (
      <div className="image-preview">
        <img
          src={fileUrl}
          alt="Evidence Preview"
          className="preview-image"
          onError={() => setError('Không thể tải ảnh preview')}
        />
      </div>
    );
  } else if (isPdf) {
    return (
      <div className="pdf-preview">
        <iframe
          src={fileUrl}
          className="preview-pdf"
          title="PDF Preview"
        ></iframe>
      </div>
    );
  } else {
    return (
      <div className="file-preview">
        <div className="file-info">
          <i className="bi bi-file-earmark-text"></i>
          <div>
            <p><strong>Tên file:</strong> {evidence.fileName || 'N/A'}</p>
            <p><strong>Loại file:</strong> {fileExtension.toUpperCase()}</p>
            <p>File này không thể preview trực tiếp. Vui lòng tải xuống để xem.</p>
          </div>
        </div>
      </div>
    );
  }
};

const EvidenceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (id) {
      loadEvidenceDetail();
    }
  }, [id]);

  const loadEvidenceDetail = async () => {
    try {
      setLoading(true);
      const data = await getEvidenceById(id);
      setEvidence(data);
    } catch (error) {
      console.error('Error loading evidence detail:', error);
      showToast('Lỗi', 'Không thể tải chi tiết minh chứng', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleDownload = async () => {
    if (evidence.fileId) {
      try {
        await downloadEvidenceFile(evidence.fileId, evidence.id, evidence.fileName);
        showToast('Thành công', 'File đã được tải xuống', 'success');
      } catch (error) {
        console.error('Download failed:', error);
        showToast('Lỗi', 'Không thể tải xuống file', 'danger');
      }
    }
  };

  const handlePreview = async () => {
    if (evidence.fileId) {
      try {
        // Determine if it's an image or PDF based on file extension
        const fileExtension = evidence.fileName ? evidence.fileName.split('.').pop().toLowerCase() : 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';

        if (isImage || isPdf) {
          // Use the proper API function to get the file URL
          const fileUrl = await getFile(evidence.fileId);

          if (isImage) {
            // For images, open in new window with proper image display
            const previewWindow = window.open('', '_blank');
            if (previewWindow) {
              previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Xem trước - Minh chứng ${evidence.fileId}</title>
                    <meta charset="UTF-8">
                    <style>
                      body {
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                        text-align: center;
                        font-family: Arial, sans-serif;
                      }
                      .container {
                        max-width: 100%;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                      }
                      img {
                        max-width: 100%;
                        max-height: 80vh;
                        object-fit: contain;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      }
                      .loading {
                        font-size: 18px;
                        color: #666;
                        margin: 20px 0;
                      }
                      .error {
                        font-size: 18px;
                        color: #dc3545;
                        margin: 20px 0;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="loading">Đang tải ảnh...</div>
                      <img
                        src="${fileUrl}"
                        alt="Evidence Preview"
                        onload="document.querySelector('.loading').style.display='none';"
                        onerror="document.querySelector('.loading').innerHTML='Không thể tải ảnh'; document.querySelector('.loading').className='error';"
                      >
                    </div>
                  </body>
                </html>
              `);
              previewWindow.document.close();
            }
          } else if (isPdf) {
            // For PDFs, open in new tab
            window.open(fileUrl, '_blank');
          }
        } else {
          // For other files, open directly in new tab
          const fileUrl = await getFile(evidence.fileId);
          window.open(fileUrl, '_blank');
        }
      } catch (error) {
        console.error('Preview failed:', error);
        showToast('Lỗi', 'Không thể xem trước file', 'danger');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      VERIFIED: { label: 'Đã xác minh', class: 'success' },
      REJECTED: { label: 'Từ chối', class: 'danger' },
      PENDING: { label: 'Chờ xác minh', class: 'warning' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <Loading fullscreen={true} message="Đang tải chi tiết minh chứng..." />;
  }

  if (!evidence) {
    return (
      <MainLayout>
        <div className="page-evidence-detail">
          <div className="content-header">
            <div className="content-title">
              <button className="back-button" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <h1 className="page-title">Chi tiết Minh chứng</h1>
            </div>
          </div>
          <div className="text-center mt-5">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3">Không tìm thấy minh chứng</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-evidence-detail">
        <div className="content-header">
          <div className="content-title">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="page-title">Chi tiết Minh chứng</h1>
          </div>
        </div>

        <div className="detail-container">
          {/* Evidence Information */}
          <div className="detail-section">
            <h3 className="section-title">
              <i className="bi bi-info-circle"></i>
              Thông tin Minh chứng
            </h3>
            <div className="row">
              <div className="col-md-6 detail-item">
                <label>Môn học:</label>
                <span>{evidence.subjectName || 'N/A'}</span>
              </div>
              <div className="col-md-6 detail-item">
                <label>Ngày nộp:</label>
                <span>{evidence.submittedDate || 'N/A'}</span>
              </div>
              <div className="col-md-6 detail-item">
                <label>Trạng thái:</label>
                {getStatusBadge(evidence.status)}
              </div>
              <div className="col-md-6 detail-item">
                <label>Ngày xác minh:</label>
                <span>{evidence.verifiedAt || 'Chưa xác minh'}</span>
              </div>
            </div>
          </div>

          {/* OCR Results */}
          <div className="detail-section">
            <h3 className="section-title">
              <i className="bi bi-robot"></i>
              Kết quả OCR
            </h3>
            <div className="row">
              <div className="col-md-6 detail-item">
                <label>Họ tên (OCR):</label>
                <span>{evidence.ocrFullName || 'Chưa xử lý'}</span>
              </div>
              <div className="col-md-6 detail-item">
                <label>Người đánh giá (OCR):</label>
                <span>{evidence.ocrEvaluator || 'Chưa xử lý'}</span>
              </div>
              <div className="col-md-12 detail-item">
                <label>Kết quả OCR:</label>
                {evidence.ocrResult ? (
                  <span className={`badge badge-status ${evidence.ocrResult === 'PASS' ? 'success' : 'danger'}`}>
                    {evidence.ocrResult === 'PASS' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                  </span>
                ) : (
                  <span>Chưa xử lý</span>
                )}
              </div>
            </div>
          </div>

          {/* OCR Text */}
          {evidence.ocrText && (
            <div className="detail-section">
              <h3 className="section-title">
                <i className="bi bi-file-text"></i>
                Văn bản OCR
              </h3>
              <div className="ocr-text-container">
                <pre className="ocr-text">{evidence.ocrText}</pre>
              </div>
            </div>
          )}

          {/* File Preview */}
          <div className="detail-section">
            <h3 className="section-title">
              <i className="bi bi-file-earmark"></i>
              File Minh chứng
            </h3>
            <div className="file-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!evidence.fileId}
              >
                <i className="bi bi-eye"></i>
                {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleDownload}
                disabled={!evidence.fileId}
              >
                <i className="bi bi-download"></i>
                Tải xuống
              </button>
            </div>

            {showPreview && evidence.fileId && (
              <div className="preview-container">
                <FilePreview evidence={evidence} />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="detail-section">
            <h3 className="section-title">
              <i className="bi bi-info-square"></i>
              Thông tin bổ sung
            </h3>
            <div className="row">
              <div className="col-md-6 detail-item">
                <label>ID Minh chứng:</label>
                <span>{evidence.id || 'N/A'}</span>
              </div>
              <div className="col-md-6 detail-item">
                <label>ID File:</label>
                <span>{evidence.fileId || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

        {toast.show && (
          <Toast
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </div>

      <style jsx>{`
        .page-evidence-detail {
          padding: 20px;
          margin-top: 0px;
        }

        .detail-container {
          margin-top: -20px;
          margin-left: -20px;
         
        }

        .detail-section {
          background: white;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .section-title {
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .detail-item span {
          color: #333;
          font-size: 16px;
        }

        .ocr-text-container {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 16px;
          border: 1px solid #e9ecef;
        }

        .ocr-text {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          margin: 0;
        }

        .badge-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-status.success {
          background-color: #d4edda;
          color: #155724;
        }

        .badge-status.danger {
          background-color: #f8d7da;
          color: #721c24;
        }

        .badge-status.warning {
          background-color: #fff3cd;
          color: #856404;
        }

        .badge-status.secondary {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .text-center {
          text-align: center;
        }

        .mt-5 {
          margin-top: 3rem;
        }

        .mt-3 {
          margin-top: 1rem;
        }

        .text-warning {
          color: #ffc107;
        }

        .file-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .file-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .file-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .file-actions .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .file-actions .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .file-actions .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .file-actions .btn-secondary:hover:not(:disabled) {
          background-color: #545b62;
        }

        .preview-container {
          margin-top: 20px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .image-preview {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
        }

        .preview-image {
          max-width: 100%;
          max-height: 600px;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .preview-error {
          padding: 40px 20px;
          color: #dc3545;
          font-size: 16px;
        }

        .pdf-preview {
          height: 600px;
          background: #f8f9fa;
        }

        .preview-pdf {
          width: 100%;
          height: 100%;
          border: none;
        }

        .file-preview {
          padding: 40px 20px;
          background: #f8f9fa;
          text-align: center;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .file-info i {
          font-size: 3rem;
          color: #6c757d;
        }

        .file-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .preview-loading {
          padding: 40px 20px;
          background: #f8f9fa;
          text-align: center;
          color: #666;
          font-size: 16px;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  );
};

export default EvidenceDetail;

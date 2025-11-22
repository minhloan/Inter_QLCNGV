import { useState, useRef } from 'react';

const ExportImportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport, 
  exporting = false, 
  importing = false 
}) => {
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'import'
  const [exportFilter, setExportFilter] = useState(''); // '', 'ACTIVE', 'INACTIVE'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = () => {
    if (onExport) {
      onExport(exportFilter || null);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && onImport) {
      onImport(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <h5 className="modal-title">
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Xuất / Nhập dữ liệu Excel
          </h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={onClose}
            disabled={exporting || importing}
          ></button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e9ecef',
          padding: '0 20px'
        }}>
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
            disabled={exporting || importing}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'export' ? '600' : '400',
              color: activeTab === 'export' ? '#667eea' : '#6c757d',
              borderBottom: activeTab === 'export' ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s ease',
              position: 'relative',
              top: '2px'
            }}
          >
            <i className="bi bi-download me-2"></i>
            Xuất dữ liệu
          </button>
          <button
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
            disabled={exporting || importing}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'import' ? '600' : '400',
              color: activeTab === 'import' ? '#667eea' : '#6c757d',
              borderBottom: activeTab === 'import' ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s ease',
              position: 'relative',
              top: '2px'
            }}
          >
            <i className="bi bi-upload me-2"></i>
            Nhập dữ liệu
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '30px' }}>
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="export-content">
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h6 style={{ 
                  color: '#495057', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#667eea' }}></i>
                  Xuất danh sách giáo viên ra file Excel
                </h6>
                <p style={{ 
                  color: '#6c757d', 
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  Chọn trạng thái để xuất dữ liệu. File Excel sẽ chứa tất cả thông tin của giáo viên.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#495057'
                }}>
                  <i className="bi bi-funnel me-2" style={{ color: '#667eea' }}></i>
                  Lọc theo trạng thái
                </label>
                <select
                  className="form-select"
                  value={exportFilter}
                  onChange={(e) => setExportFilter(e.target.value)}
                  disabled={exporting}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    fontSize: '15px',
                    width: '100%'
                  }}
                >
                  <option value="">Tất cả giáo viên</option>
                  <option value="ACTIVE">Chỉ giáo viên đang hoạt động</option>
                  <option value="INACTIVE">Chỉ giáo viên không hoạt động</option>
                </select>
              </div>

              <div style={{ 
                background: '#e7f3ff', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'start' }}>
                  <i className="bi bi-lightbulb" style={{ 
                    color: '#0066cc', 
                    fontSize: '20px',
                    marginRight: '10px',
                    marginTop: '2px'
                  }}></i>
                  <div>
                    <strong style={{ color: '#0066cc', display: 'block', marginBottom: '5px' }}>
                      Lưu ý:
                    </strong>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '20px',
                      color: '#004d99',
                      fontSize: '14px'
                    }}>
                      <li>File Excel sẽ được tải xuống tự động</li>
                      <li>Bạn có thể chỉnh sửa file và import lại</li>
                      <li>Đảm bảo không thay đổi cấu trúc các cột</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="import-content">
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h6 style={{ 
                  color: '#495057', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#667eea' }}></i>
                  Nhập danh sách giáo viên từ file Excel
                </h6>
                <p style={{ 
                  color: '#6c757d', 
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  Chọn file Excel để nhập dữ liệu. Hệ thống sẽ tự động tạo mới hoặc cập nhật giáo viên dựa trên ID.
                </p>
              </div>

              <div style={{
                border: '2px dashed #667eea',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                background: '#f8f9ff',
                transition: 'all 0.3s ease',
                cursor: importing ? 'not-allowed' : 'pointer',
                opacity: importing ? 0.6 : 1
              }}
              onClick={!importing ? handleImportClick : undefined}
              >
                {importing ? (
                  <div>
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '15px' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ color: '#667eea', margin: 0, fontWeight: '500' }}>
                      Đang xử lý file...
                    </p>
                  </div>
                ) : (
                  <div>
                    <i className="bi bi-cloud-upload" style={{ 
                      fontSize: '48px', 
                      color: '#667eea',
                      marginBottom: '15px',
                      display: 'block'
                    }}></i>
                    <p style={{ 
                      color: '#495057', 
                      marginBottom: '10px',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}>
                      Nhấn để chọn file Excel
                    </p>
                    <p style={{ 
                      color: '#6c757d', 
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      Hỗ trợ định dạng .xlsx, .xls
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={importing}
              />

              <div style={{ 
                background: '#fff3cd', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #ffc107',
                marginTop: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'start' }}>
                  <i className="bi bi-exclamation-triangle" style={{ 
                    color: '#856404', 
                    fontSize: '20px',
                    marginRight: '10px',
                    marginTop: '2px'
                  }}></i>
                  <div>
                    <strong style={{ color: '#856404', display: 'block', marginBottom: '5px' }}>
                      Lưu ý khi import:
                    </strong>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '20px',
                      color: '#856404',
                      fontSize: '14px'
                    }}>
                      <li>File phải đúng định dạng Excel (.xlsx hoặc .xls)</li>
                      <li>Nếu user đã tồn tại (theo ID), hệ thống sẽ cập nhật</li>
                      <li>Nếu user chưa tồn tại, hệ thống sẽ tạo mới</li>
                      <li>Đảm bảo các cột bắt buộc được điền đầy đủ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ 
          padding: '20px 30px',
          borderTop: '1px solid #e9ecef'
        }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={exporting || importing}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500'
            }}
          >
            Đóng
          </button>
          {activeTab === 'export' && (
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleExport}
              disabled={exporting}
              style={{
                padding: '10px 30px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minWidth: '150px'
              }}
            >
              {exporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang xuất...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Xuất file Excel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;


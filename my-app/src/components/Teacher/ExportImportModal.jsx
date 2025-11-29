import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../../assets/styles/Common.css';

const ExportImportModal = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  exporting,
  importing,
  title = "Xuất / Nhập dữ liệu Excel",
  exportTitle = "Xuất dữ liệu ra Excel",
  exportDescription = "Chọn trạng thái để xuất dữ liệu.",
  importTitle = "Nhập dữ liệu từ Excel",
  importDescription = "Nhấn để chọn file Excel cần nhập.",
  filterOptions = [
    { label: "Tất cả", value: "" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Ngừng hoạt động", value: "INACTIVE" }
  ],
  icon = "bi-file-earmark-spreadsheet",
  headerStyle = {},
  children,
  importChildren,
  importTopChildren
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.value || "");

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={headerStyle}>
          <h5 className="modal-title">
            <i className={`bi ${icon} me-2`}></i>
            {title}
          </h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <i className="bi bi-download"></i> Xuất dữ liệu
          </button>
          <button
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <i className="bi bi-upload"></i> Nhập dữ liệu
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'export' && (
            <div className="d-flex flex-column gap-3">
              <div className="alert alert-info d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-info-circle fs-4"></i>
                <div>
                  <h6 className="mb-1 fw-bold">{exportTitle}</h6>
                  <p className="mb-0 small">{exportDescription}</p>
                </div>
              </div>

              {/* Render custom children for export tab if provided */}
              {children}

              {!children && (
                <div className="form-group">
                  <label className="form-label fw-bold">Lọc theo trạng thái</label>
                  <select
                    className="form-select"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    {filterOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="alert alert-primary mb-0">
                <ul className="mb-0 ps-3 small">
                  <li>File Excel sẽ tải xuống tự động</li>
                  <li>Bạn có thể chỉnh sửa và import lại</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="d-flex flex-column gap-3">
              <div className="alert alert-info d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-info-circle fs-4"></i>
                <div>
                  <h6 className="mb-1 fw-bold">{importTitle}</h6>
                  <p className="mb-0 small">{importDescription}</p>
                </div>
              </div>

              {/* Render custom top children for import tab if provided */}
              {importTopChildren}

              <label className="upload-box">
                <i className="bi bi-cloud-arrow-up"></i>
                <p className="mb-1 fw-bold">Nhấn để chọn file Excel</p>
                <span className="text-muted small">Hỗ trợ .xlsx, .xls</span>

                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onImport(e.target.files[0]);
                      e.target.value = ""; // Reset input
                    }
                  }}
                  disabled={importing}
                />
              </label>

              {importing && (
                <div className="text-center text-primary">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Đang xử lý import...
                </div>
              )}

              {/* Render custom children for import tab if provided */}
              {importChildren}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          {activeTab === 'export' && (
            <button
              className="btn btn-primary"
              onClick={() => onExport(selectedFilter)}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xuất...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i> Xuất file Excel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExportImportModal;

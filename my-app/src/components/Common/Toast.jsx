import { useEffect } from 'react';

const Toast = ({ title, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'bi-check-circle-fill text-success',
    danger: 'bi-exclamation-circle-fill text-danger',
    warning: 'bi-exclamation-triangle-fill text-warning',
    info: 'bi-info-circle-fill text-info'
  };

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className="toast show" role="alert">
        <div className="toast-header">
          <i className={`bi ${icons[type] || icons.info} me-2`}></i>
          <strong className="me-auto">{title}</strong>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
};

export default Toast;


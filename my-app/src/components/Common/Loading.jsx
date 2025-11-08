import './Loading.css';

/**
 * Loading Component - Hiển thị loading spinner với animation
 * 
 * @param {boolean} fullscreen - Nếu true, hiển thị fullscreen overlay. Nếu false, hiển thị inline
 * @param {string} message - Thông báo tùy chỉnh. Mặc định: "Chúng tôi đang xử lý yêu cầu của bạn..."
 * 
 * @example
 * // Fullscreen loading (mặc định)
 * <Loading />
 * <Loading message="Đang tải dữ liệu..." />
 * 
 * @example
 * // Inline loading
 * <Loading fullscreen={false} message="Đang xử lý..." />
 */
const Loading = ({ fullscreen = true, message = null }) => {
  const defaultMessage = "Chúng tôi đang xử lý yêu cầu của bạn...";
  const displayMessage = message || defaultMessage;

  if (fullscreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="loading-dot loading-dot-1"></div>
            <div className="loading-dot loading-dot-2"></div>
            <div className="loading-dot loading-dot-3"></div>
            <div className="loading-dot loading-dot-4"></div>
          </div>
          <div className="loading-text">
            <h2 className="loading-title">VUI LÒNG ĐỢI!</h2>
            <p className="loading-subtitle">{displayMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="loading-spinner">
        <div className="loading-dot loading-dot-1"></div>
        <div className="loading-dot loading-dot-2"></div>
        <div className="loading-dot loading-dot-3"></div>
        <div className="loading-dot loading-dot-4"></div>
      </div>
      {displayMessage && (
        <p className="loading-inline-text">{displayMessage}</p>
      )}
    </div>
  );
};

export default Loading;


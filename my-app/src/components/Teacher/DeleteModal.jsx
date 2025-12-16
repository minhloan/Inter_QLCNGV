const DeleteModal = ({ teacher, onConfirm, onClose }) => {
  const isActive = teacher?.status === 'active';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-header"
          style={{
            backgroundColor: isActive ? '#ffc107' : '#dc3545',
            color: 'white'
          }}
        >
          <h5 className="modal-title">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {isActive ? 'Xác nhận ngừng hoạt động' : 'Xác nhận xóa vĩnh viễn'}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          ></button>
        </div>

        <div className="modal-body">
          <p>
            {isActive ? (
              <>
                Bạn có chắc chắn muốn <strong>ngừng hoạt động</strong> giáo viên{' '}
                <strong>{teacher?.full_name || teacher?.code}</strong>?
              </>
            ) : (
              <>
                Giáo viên <strong>{teacher?.full_name || teacher?.code}</strong>{' '}
                đã không hoạt động.
                <br />
                <strong className="text-danger">
                  Bạn có chắc chắn muốn XÓA VĨNH VIỄN?
                </strong>
              </>
            )}
          </p>

          {!isActive && (
            <p className="text-danger mb-0">
              <small>Hành động này không thể hoàn tác!</small>
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            type="button"
            className={`btn ${isActive ? 'btn-warning' : 'btn-danger'}`}
            onClick={onConfirm}
          >
            {isActive ? 'Ngừng hoạt động' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

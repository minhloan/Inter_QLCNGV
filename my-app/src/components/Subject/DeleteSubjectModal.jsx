const DeleteSubjectModal = ({ subject, onConfirm, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ backgroundColor: '#dc3545', color: 'white' }}>
          <h5 className="modal-title">
            <i className="bi bi-exclamation-triangle me-2"></i>Xác nhận xóa Môn học
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>

        <div className="modal-body">
          <p>
            Bạn có chắc chắn muốn xoá môn học:
            <strong> {subject?.subjectName}</strong> (Mã: <strong>{subject?.subjectCode}</strong>)?
          </p>

          <p className="text-danger mb-0">
            <small>Hành động này không thể hoàn tác!</small>
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectModal;

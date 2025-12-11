import React from 'react';

const FaqModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal">
        <div className="custom-modal-header d-flex align-items-center justify-content-between">
          <h5 className="m-0">FAQs</h5>
          <button className="btn btn-sm btn-light" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="custom-modal-body">
          <div className="mb-3">
            <h6>What is Aptech ProConnect?</h6>
            <p>Aptech is a worldwide learning solutions provider. Aptech ProConnect showcases artworks, portfolios, and digital content, offering unique experiences for students and professionals. It enables social interaction, access to digital resources, placement services and more.</p>
          </div>

          <div className="mb-3">
            <h6>Who can use Aptech ProConnect?</h6>
            <p>All Aptech Centers, Students, Faculties, and Aptech employees.</p>
          </div>

          <div className="mb-3">
            <h6>How do I login to Aptech ProConnect?</h6>
            <ol>
              <li>Go to the site and enter your User ID and Password.</li>
              <li>Student – Student ID as User ID and Booking Confirmation as Password.</li>
              <li>Faculty – ApTrack username and password.</li>
              <li>First-time users will be prompted to reset password.</li>
            </ol>
          </div>

          <div className="mb-3">
            <h6>What if I forget my password?</h6>
            <ol>
              <li>Click "Forgot Password" on the login page</li>
              <li>Enter your User ID and submit</li>
              <li>Enter the OTP sent to your registered email</li>
              <li>Set a new password and login again</li>
            </ol>
          </div>

          <div className="mb-3">
            <h6>Digital Learning & eBooks</h6>
            <p>The Digital Learning Module includes eBooks, videos, blogs and tracking tools. eBooks are DRM-protected and can be accessed via Adobe Digital Edition; printing and transferring are restricted.</p>
          </div>

          <div className="text-muted small">For further help contact <a href="mailto:bopham935@gmail.com">bopham935@gmail.com</a></div>
        </div>
      </div>
      <style>{`
        .custom-modal-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1060;background:rgba(0,0,0,0.45);}
        .custom-modal{background:#fff;max-width:760px;width:92%;max-height:80vh;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.2);}
        .custom-modal-header{padding:12px 16px;border-bottom:1px solid #eef2f6;background:#f8f9fa}
        .custom-modal-body{padding:16px;overflow:auto;max-height:68vh}
      `}</style>
    </div>
  );
};

export default FaqModal;

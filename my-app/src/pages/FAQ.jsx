import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Common.css';

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5 mb-5">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Quay lại
      </button>

      <h1 className="mb-3">FAQs</h1>

      <section className="mb-4">
        <h4>What is Aptech ProConnect?</h4>
        <p>
          Aptech is a worldwide learning solutions provider across the globe. Aptech ProConnect showcases artworks, portfolios, and digital content, offering unique experiences specially designed for students and professionals. As a collaborative platform, it enables social interaction, access to digital resources, placement services, and more — making learning more engaging and interactive.
        </p>
      </section>

      <section className="mb-4">
        <h4>Who can use Aptech ProConnect?</h4>
        <p>
          Aptech ProConnect is accessible to: All Aptech Centers, Students, Faculties, Aptech employees.
        </p>
      </section>

      <section className="mb-4">
        <h4>How do I login to Aptech ProConnect?</h4>
        <ol>
          <li>Go to https://www.aptechproconnect.com/</li>
          <li>Enter your User ID and Password:</li>
          <ul>
            <li>Student – Student ID as the User ID and Booking Confirmation number as the Password</li>
            <li>Faculty – ApTrack username as the User ID and ApTrack password as the Password</li>
          </ul>
          <li>Reset password page will appear for all first-time users. Once reset, login again using the new credentials.</li>
        </ol>
      </section>

      <section className="mb-4">
        <h4>What if I forget my password?</h4>
        <ol>
          <li>Click the “Forgot Password” option on the login page</li>
          <li>Enter your User ID and click Submit</li>
          <li>An OTP will be sent to your registered email ID</li>
          <li>Enter the OTP and click Submit</li>
          <li>Set a new password — it can be used for the next login</li>
        </ol>
      </section>

      <section className="mb-4">
        <h4>What is Social Engagement?</h4>
        <p>
          Social Engagement is a module that allows students and faculties to upload work, create portfolios, participate in events, and engage socially with peers.
        </p>
      </section>

      <section className="mb-4">
        <h4>What is the Feed section?</h4>
        <p>
          The Feed section displays students’ published work that can be Liked, Commented on, and Followed by others across all Aptech centers.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can I interact with other students?</h4>
        <p>
          You cannot directly message other students, but you can like their posts, comment on their work, and follow their profiles.
        </p>
      </section>

      <section className="mb-4">
        <h4>How do I upload my work?</h4>
        <ol>
          <li>Click on Upload Work</li>
          <li>Fill in Title, Thumbnail, Image/Video, Category, and Description</li>
          <li>Add a Tagline (optional)</li>
          <li>Assign a faculty reviewer</li>
          <li>Click Submit</li>
        </ol>
      </section>

      <section className="mb-4">
        <h4>Where can I find my uploaded work?</h4>
        <p>
          Uploaded work appears under the Unpublished tab with tags like Under Review, Approved, or Not Approved. Once approved, it moves to the Work tab and becomes visible in the Feed section.
        </p>
      </section>

      <section className="mb-4">
        <h4>How can I create a portfolio?</h4>
        <p>
          Go to the Portfolio tab, click Create Now, enter details like Title, Description, Showreel/Demo Link, Thumbnail, and add your work, then click Create Portfolio.
        </p>
      </section>

      <section className="mb-4">
        <h4>How do I edit my profile?</h4>
        <p>
          Click on your profile picture, select My Profile, then click Edit Profile to update your email, phone, and bio.
        </p>
      </section>

      <section className="mb-4">
        <h4>How can I change my name and date of birth in my profile?</h4>
        <p>
          Name and Date of Birth are non-editable. Contact your center to make the required changes in ApTrack, which will then reflect in your ProConnect profile.
        </p>
      </section>

      <section className="mb-4">
        <h4>How does faculty review work?</h4>
        <p>
          Faculties can view all works tagged to them, click View Work, and approve or provide feedback for improvement.
        </p>
      </section>

      <section className="mb-4">
        <h4>How will I know if my work is approved?</h4>
        <p>
          A bell icon notification will appear once your work is approved. The tag under Unpublished will automatically change to Approved.
        </p>
      </section>

      <section className="mb-4">
        <h4>What is Digital Learning?</h4>
        <p>
          The Digital Learning Module lets students access eBooks, videos, blogs, and other resources, track academic progress, and make secure online payments.
        </p>
      </section>

      <section className="mb-4">
        <h4>How can I access the Digital Learning Module?</h4>
        <p>
          After login, click on the arrow under Digital Learning.
        </p>
      </section>

      <section className="mb-4">
        <h4>What kind of learning content is available?</h4>
        <p>
          Course eBooks, videos and tutorials, blogs, articles, and tips & tricks, and additional resources for continuous learning.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can I track my learning progress?</h4>
        <p>
          Yes, your dashboard displays course completion, assessments, and certificates.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can I download my certificates from ProConnect?</h4>
        <p>
          Yes, you can download eCertificates for completed courses or milestones directly from the Digital Learning Module.
        </p>
      </section>

      <section className="mb-4">
        <h4>How do I make course payments through ProConnect?</h4>
        <p>
          Use the secure payment gateway to make course fee payments and view your transaction history.
        </p>
      </section>

      <section className="mb-4">
        <h4>Whom should I contact if I face technical issues or login problems?</h4>
        <p>
          Contact <a href="mailto:bopham935@gmail.com">bopham935@gmail.com</a>.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can I access the Digital Learning Module on mobile devices?</h4>
        <p>
          Yes. Aptech ProConnect is mobile-responsive and also available as a dedicated Android and iOS app.
        </p>
      </section>

      <section className="mb-4">
        <h4>My eBooks are not displayed in ProConnect.</h4>
        <p>
          Check with your centre if eBooks have been assigned to you. Once assigned, you will receive an email from ProConnect.
        </p>
      </section>

      <section className="mb-4">
        <h4>I have checked with my centre, eBooks have been assigned but I still can’t view them.</h4>
        <p>
          Write to <a href="mailto:support@aptechproconnect.com">support@aptechproconnect.com</a> mentioning your Student ID.
        </p>
      </section>

      <section className="mb-4">
        <h4>Some eBooks appear as ‘Coming Soon’ in ProConnect.</h4>
        <p>
          These eBooks are not yet published. Contact your centre’s Academic Staff for release dates.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can we print eBooks?</h4>
        <p>
          eBooks are DRM-protected. Printing is restricted for security reasons. Once downloaded via Adobe Digital Edition, they can be accessed offline and on up to six devices.
        </p>
      </section>

      <section className="mb-4">
        <h4>Can we copy / email or transfer eBooks to another device?</h4>
        <p>No, DRM-protected eBooks cannot be copied, emailed, or transferred to other devices.</p>
      </section>

      <section className="mb-4">
        <h4>Can we convert eBooks to PDF format?</h4>
        <p>No, DRM-protected eBooks cannot be converted to any other format.</p>
      </section>

      <section className="mb-4">
        <h4>Why is the DRM process required to access eBooks?</h4>
        <p>
          DRM protects Aptech’s intellectual property. Adobe Digital Edition is a free software that only needs to be installed once.
        </p>
      </section>

      <section className="mb-4">
        <h4>After downloading the eBook, do I need Internet to view it?</h4>
        <p>No. Once downloaded, eBooks can be viewed offline via the Adobe Digital Edition (ADE) library.</p>
      </section>

      <div className="mt-5 text-muted">(Nội dung được thêm từ bộ câu hỏi hướng dẫn đăng nhập)</div>
    </div>
  );
};

export default FAQ;

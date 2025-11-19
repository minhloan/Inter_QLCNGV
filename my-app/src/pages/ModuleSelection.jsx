import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import '../assets/styles/ModuleSelection.css';

const ModuleSelection = () => {
  const { user, isManageLeader, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (isManageLeader) {
      setModules([
        {
          id: 'management',
          title: 'Quản lý giáo viên & môn học',
          description: 'Quản lý thông tin giáo viên, môn học và các hoạt động trong hệ thống. Bao gồm Teacher Management và Subject Management.',
          icon: 'bi bi-gear-fill',
          path: '/manage-teacher'
        },
        {
          id: 'teacher-module',
          title: 'Mô-đun giáo viên',
          description: 'Quản lý thông tin cá nhân, đăng ký môn học, kỳ thi và các hoạt động giảng dạy của bạn.',
          icon: 'bi bi-person-badge-fill',
          path: '/teacher-dashboard'
        }
      ]);
    } else if (isTeacher) {
      setModules([
        {
          id: 'teacher-module',
          title: 'Mô-đun giáo viên',
          description: 'Quản lý thông tin cá nhân, đăng ký môn học, kỳ thi và các hoạt động giảng dạy của bạn.',
          icon: 'bi bi-person-badge-fill',
          path: '/teacher-dashboard'
        }
      ]);
    }
  }, [isManageLeader, isTeacher]);

  const handleModuleClick = (module) => {
    navigate(module.path);
  };

  return (
    <div className="module-selection-page">
      <Header />
      
      <div className="main-content">
        <div className="container">
          <div className="page-header text-center mb-5">
            <h1 className="page-title">Trung tâm duy nhất giúp bạn xây dựng sự nghiệp và duy trì kết nối</h1>
            <p className="page-subtitle">Chọn mô-đun của bạn</p>
          </div>

          {/* Module Cards */}
          <div className="row justify-content-center" id="moduleCardsContainer">
            {modules.map((module) => (
              <div key={module.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div 
                  className="module-card"
                  onClick={() => handleModuleClick(module)}
                >
                  <div className="module-image">
                    <i className={`module-icon ${module.icon}`}></i>
                  </div>
                  <div className="module-content">
                    <h3 className="module-title">{module.title}</h3>
                    <p className="module-description">{module.description}</p>
                    <div className="module-action">
                      <span>Bắt đầu</span>
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelection;


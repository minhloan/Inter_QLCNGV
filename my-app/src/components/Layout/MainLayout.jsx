import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default MainLayout;


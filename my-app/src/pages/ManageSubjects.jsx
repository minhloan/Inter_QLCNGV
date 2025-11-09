import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

const ManageSubjects = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('DISM');
  const [termFilter, setTermFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const demoCourses = [
    {
      id: 1,
      title: 'Elementary Programming in C-INTL',
      subtitle: 'Elementary Programming in C-INTL',
      term: 1,
      course: 'DISM',
      imagePattern: 1,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      title: 'Intelligent Data Management with SQL Server',
      subtitle: 'Intelligent Data Management with SQL Server',
      term: 1,
      course: 'DISM',
      imagePattern: 2,
      gradient: 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)'
    },
    {
      id: 3,
      title: 'Elegant and Effective Website Design with UI and UX',
      subtitle: 'Elegant and Effective Website Design with UI and UX',
      term: 1,
      course: 'DISM',
      imagePattern: 3,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      title: 'PHP Web Development with Laravel',
      subtitle: 'PHP Web Development with Laravel',
      term: 1,
      course: 'ADSE',
      imagePattern: 1,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 5,
      title: 'Frontend Technologies for Beginners',
      subtitle: 'Frontend Technologies for Beginners',
      term: 1,
      course: 'ADSE',
      imagePattern: 2,
      gradient: 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)'
    },
    {
      id: 6,
      title: 'eProject Guide Build Responsive NextGen Websites',
      subtitle: 'eProject Guide Build Responsive NextGen Websites',
      term: 1,
      course: 'ADSE',
      imagePattern: 3,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 7,
      title: 'Advanced JavaScript and React',
      subtitle: 'Advanced JavaScript and React',
      term: 2,
      course: 'DISM',
      imagePattern: 1,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 8,
      title: 'Database Design and Optimization',
      subtitle: 'Database Design and Optimization',
      term: 2,
      course: 'DISM',
      imagePattern: 2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 9,
      title: 'Digital Image Processing',
      subtitle: 'Digital Image Processing',
      term: 2,
      course: 'DISM',
      imagePattern: 1,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 10,
      title: 'Professional Communication Skills',
      subtitle: 'Database Design and Optimization',
      term: 2,
      course: 'ADSE',
      imagePattern: 2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 11,
      title: 'Professional Communication Skills',
      subtitle: 'Introduction to Programming with Python',
      term: 2,
      course: 'ADSE',
      imagePattern: 3,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  useEffect(() => {
    setCourses(demoCourses);
    setFilteredCourses(demoCourses);
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courseFilter, termFilter, searchTerm, courses]);

  const filterCourses = () => {
    let filtered = courses.filter(course => {
      // Course filter
      if (courseFilter && course.course !== courseFilter) {
        return false;
      }
      
      // Term filter
      if (termFilter !== 'all' && course.term !== parseInt(termFilter)) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    setFilteredCourses(filtered);
  };

  return (
    <MainLayout>
      {/* Content Header */}
      <div className="content-header">
        <div className="content-title">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h1 className="page-title">Courses ({filteredCourses.length})</h1>
        </div>
        <Link to="/manage-subject-add" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i>
          Thêm Môn Học
        </Link>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Select Course</label>
            <select
              className="filter-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="DISM">DISM</option>
              <option value="ADSE">ADSE</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Terms :</label>
            <div className="term-buttons">
              <button
                type="button"
                className={`term-button ${termFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTermFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`term-button ${termFilter === '1' ? 'active' : ''}`}
                onClick={() => setTermFilter('1')}
              >
                1
              </button>
              <button
                type="button"
                className={`term-button ${termFilter === '2' ? 'active' : ''}`}
                onClick={() => setTermFilter('2')}
              >
                2
              </button>
              <button
                type="button"
                className={`term-button ${termFilter === '3' ? 'active' : ''}`}
                onClick={() => setTermFilter('3')}
              >
                3
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <div className="search-input-group">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="filter-input"
                placeholder="Books"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Term Label */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)' }}>
          ACCP-Term {termFilter === 'all' ? '1' : termFilter}
        </h3>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <p>No courses found</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <Link 
              key={course.id}
              to={`/manage-subject-detail/${course.id}`} 
              className="course-card"
            >
              <div 
                className="course-image"
                style={{ 
                  background: course.gradient
                }}
              >
                <div className={`course-image-pattern course-image-pattern-${course.imagePattern}`}></div>
              </div>
              <div className="course-card-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-subtitle">{course.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default ManageSubjects;

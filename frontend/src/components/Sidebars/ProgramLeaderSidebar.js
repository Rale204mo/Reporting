import React from 'react';
import FeedbackComponent from '../Sections/FeedbackComponent';
import './PRL.css';
const PrincipalLecturerSidebar = ({ activeSection, setActiveSection }) => {
  // Correct menu items for Principal Lecturer (PRL) according to requirements
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'courses', icon: 'fas fa-book', label: 'Courses', description: 'View all courses & lectures under my stream' },
    { id: 'reports', icon: 'fas fa-file-alt', label: 'Reports', description: 'View lectures reports & add feedback' },
    { id: 'monitoring', icon: 'fas fa-chart-line', label: 'Monitoring' },
    { id: 'rating', icon: 'fas fa-star', label: 'Rating' },
    { id: 'classes', icon: 'fas fa-users', label: 'Classes' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
    { id: 'settings', icon: 'fas fa-cogs', label: 'Settings' }
  ];

  return (
    <div className="sidebar text-white">
      {/* Principal Lecturer Header */}
      <div className="sidebar-header px-3 py-4 text-center">
        <div className="principal-badge mb-2">
          <i className="fas fa-user-tie fa-2x text-primary"></i>
        </div>
        <h5 className="mb-1">LUCT - PRL</h5>
        <small className="text-muted">Principal Lecturer Dashboard</small>
        <div className="mt-2">
          <span className="badge bg-primary">Stream Leader</span>
        </div>
      </div>
      
      <nav className="sidebar-nav mt-3">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(item.id);
            }}
            title={item.description} // Show description on hover
          >
            <i className={`${item.icon} me-3`}></i>
            <div className="d-flex flex-column">
              <span>{item.label}</span>
              {item.description && (
                <small className="sidebar-item-desc">{item.description}</small>
              )}
            </div>
            {/* Show badges for important sections */}
            {item.id === 'reports' && <span className="badge bg-info ms-2">Feedback</span>}
            {item.id === 'courses' && <span className="badge bg-success ms-2">Stream</span>}
          </a>
        ))}
      </nav>
      
      <div className="sidebar-footer px-3 py-3 text-center">
        <small className="text-muted">
          <i className="fas fa-graduation-cap me-1"></i>
          Academic Leadership Access
        </small>
        <div className="mt-1">
          <small className="text-warning">
            <i className="fas fa-shield-alt me-1"></i>
            Teaching Quality Oversight
          </small>
        </div>
      </div>
    </div>
  );
};

export default PrincipalLecturerSidebar;
import React from 'react';
import './Pl.css';

const PrincipalLecturerSidebar = ({ activeSection, setActiveSection, user }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
    { id: 'monitoring', icon: 'fas fa-chart-bar', label: 'Monitoring' },
    { id: 'rating', icon: 'fas fa-star', label: 'Rating' },
    { id: 'courses', icon: 'fas fa-book', label: 'Courses' },
    { id: 'feedback', icon: 'fas fa-clipboard-check', label: 'Feedback' }, // loads FeedbackComponent
    { id: 'classes', icon: 'fas fa-users', label: 'Classes' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="sidebar text-white bg-dark d-flex flex-column">
      {/* Sidebar Header */}
      <div className="sidebar-header px-3 py-4 border-bottom">
        <h5 className="mb-1 text-light">LUCT - PRINCIPAL LECTURER</h5>
        <small className="text-muted">
          Logged in as: <span className="text-info fw-semibold">
            {user?.name || 'Principal Lecturer'}
          </span>
        </small>
        <div className="small mt-1 text-secondary">
          Role: {user?.role || 'principal_lecturer'}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav flex-grow-1 mt-3">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`sidebar-link d-flex align-items-center px-3 py-2 ${
              activeSection === item.id ? 'active bg-primary text-white' : 'text-light'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(item.id);
            }}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer mt-auto px-3 py-3 border-top text-center small text-secondary">
        © {new Date().getFullYear()} LUCT Dashboard
      </div>
    </div>
  );
};

export default PrincipalLecturerSidebar;

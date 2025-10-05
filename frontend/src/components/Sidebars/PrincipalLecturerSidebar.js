import React from 'react';

const PrincipalLecturerSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
    { id: 'monitoring', icon: 'fas fa-chart-bar', label: 'Monitoring' },
    { id: 'rating', icon: 'fas fa-star', label: 'Rating' },
    { id: 'courses', icon: 'fas fa-book', label: 'Courses' },
    { id: 'reports_feedback', icon: 'fas fa-clipboard-check', label: 'Reports & Feedback' },
    { id: 'classes', icon: 'fas fa-users', label: 'Classes' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="sidebar text-white">
      <div className="sidebar-header px-3 py-4">
        <h5>LUCT - PRINCIPAL LECTURER</h5>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
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
    </div>
  );
};

export default PrincipalLecturerSidebar;
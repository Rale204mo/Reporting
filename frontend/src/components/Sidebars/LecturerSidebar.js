import React from 'react';

const LecturerSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
    { id: 'monitoring', icon: 'fas fa-chart-bar', label: 'Monitoring' },
    { id: 'rating', icon: 'fas fa-star', label: 'Rating' },
    { id: 'my_classes', icon: 'fas fa-file-alt', label: 'My Classes' },
    { id: 'my_reports', icon: 'fas fa-clipboard-list', label: 'My Reports' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="sidebar text-white">
      <div className="sidebar-header px-3 py-4">
        <h5>LUCT - LECTURER</h5>
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

export default LecturerSidebar;
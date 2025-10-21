import React, { useState } from 'react';
import PrincipalLecturerSidebar from './PrincipalLecturerSidebar';
import FeedbackComponent from './FeedbackComponent';
import Dashboard from './Dashboard';
import Profile from './Profile';
// ... other imports

const PLDashboard = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="d-flex">
      <PrincipalLecturerSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />
      <div className="content flex-grow-1 p-4">
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'feedback' && <FeedbackComponent user={user} />}
        {activeSection === 'profile' && <Profile user={user} />}
        {/* ... other sections */}
      </div>
    </div>
  );
};

export default PLDashboard;

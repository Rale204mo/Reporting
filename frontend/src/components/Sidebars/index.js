import React from 'react';
import StudentSidebar from './StudentSidebar';
import LecturerSidebar from './LecturerSidebar';
import PrincipalLecturerSidebar from './PrincipalLecturerSidebar';
import ProgramLeaderSidebar from './ProgramLeaderSidebar';

const Sidebar = ({ userRole, activeSection, setActiveSection }) => {
  const renderSidebar = () => {
    switch (userRole) {
      case 'student':
        return <StudentSidebar activeSection={activeSection} setActiveSection={setActiveSection} />;
      case 'lecturer':
        return <LecturerSidebar activeSection={activeSection} setActiveSection={setActiveSection} />;
      case 'principal_lecturer':
        return <PrincipalLecturerSidebar activeSection={activeSection} setActiveSection={setActiveSection} />;
      case 'program_leader':
        return <ProgramLeaderSidebar activeSection={activeSection} setActiveSection={setActiveSection} />;
      default:
        return <StudentSidebar activeSection={activeSection} setActiveSection={setActiveSection} />;
    }
  };

  return renderSidebar();
};

export default Sidebar;

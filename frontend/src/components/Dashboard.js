import React, {useEffect, useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'


// Import Components
import Sidebar from './Sidebars';
import DashboardSection from './Sections/DashboardSection';
import ReportsSection from './Sections/ReportsSection';
import ProfileSection from './Sections/ProfileSection';
import MonitoringSection from './Sections/MonitoringSection';
import RatingSection from './Sections/RatingSection';
import CoursesSection from './Sections/CoursesSection';
import LecturersSection from './Sections/LecturersSection';
import SettingsSection from './Sections/SettingsSection';
import FeedbackComponent from './Sections/FeedbackComponent';

export default function Dashboard(){
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // Changed from activeTab to activeSection
  const [editingReport, setEditingReport] = useState(null);
  const navigate = useNavigate();

  // Add Report Form State
  const [formData, setFormData] = useState({
    faculty_name: '',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    coursename: '',
    coursecode: '',
    lecturer: '',
    present: '',
    registered: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: ''
  });

  useEffect(() => { 
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      setError('Please login first');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
    
    await fetchReports();
  }

  async function fetchReports(){
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await API.get('/api/reports', { 
        headers: { 
          'Authorization': 'Bearer ' + token 
        } 
      });
      
      let filteredReports = response.data.reports || [];
      
      if (user?.role === 'lecturer') {
        filteredReports = filteredReports.filter(report => 
          report.lecturer === user.name
        );
      }
      
      setReports(filteredReports);
      
    } catch (err){
      console.error('Error fetching reports:', err);
      setError('Error: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user can perform actions
  const canEditDelete = (report) => {
    if (user?.role === 'program_leader' || user?.role === 'principal_lecturer') {
      return true;
    }
    if (user?.role === 'lecturer') {
      return report.lecturer === user.name;
    }
    return false;
  };

  const canCreateReport = () => {
    return ['lecturer', 'principal_lecturer', 'program_leader'].includes(user?.role);
  };

  const canViewAllReports = () => {
    return user?.role !== 'student';
  };

  // Submit new report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        ...formData,
        lecturer: formData.lecturer || user?.name || ''
      };
      
      const response = await API.post('/api/reports', submitData, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      alert('✅ Report created successfully!');
      setShowAddForm(false);
      setFormData({
        faculty_name: '',
        class_name: '',
        week_of_reporting: '',
        date_of_lecture: '',
        coursename: '',
        coursecode: '',
        lecturer: '',
        present: '',
        registered: '',
        venue: '',
        scheduled_time: '',
        topic_taught: '',
        learning_outcomes: '',
        recommendations: ''
      });
      fetchReports();
      
    } catch (err) {
      alert('Error creating report: ' + (err.response?.data?.error || err.message));
    }
  };

  // Edit report
  const handleEditReport = (report) => {
    if (!canEditDelete(report)) {
      alert('You do not have permission to edit this report');
      return;
    }
    
    setEditingReport(report);
    setFormData({
      faculty_name: report.faculty_name || '',
      class_name: report.class_name || '',
      week_of_reporting: report.week_of_reporting || '',
      date_of_lecture: report.date_of_lecture || '',
      coursename: report.coursename || '',
      coursecode: report.coursecode || '',
      lecturer: report.lecturer || '',
      present: report.present || '',
      registered: report.registered || '',
      venue: report.venue || '',
      scheduled_time: report.scheduled_time || '',
      topic_taught: report.topic_taught || '',
      learning_outcomes: report.learning_outcomes || '',
      recommendations: report.recommendations || ''
    });
    setShowAddForm(true);
  };

  // Update report
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const response = await API.put(`/api/reports/${editingReport.id}`, formData, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      alert('✅ Report updated successfully!');
      setShowAddForm(false);
      setEditingReport(null);
      setFormData({
        faculty_name: '',
        class_name: '',
        week_of_reporting: '',
        date_of_lecture: '',
        coursename: '',
        coursecode: '',
        lecturer: '',
        present: '',
        registered: '',
        venue: '',
        scheduled_time: '',
        topic_taught: '',
        learning_outcomes: '',
        recommendations: ''
      });
      fetchReports();
      
    } catch (err) {
      alert('Error updating report: ' + (err.response?.data?.error || err.message));
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId, report) => {
    if (!canEditDelete(report)) {
      alert('You do not have permission to delete this report');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const token = localStorage.getItem('token');
        
        await API.delete(`/api/reports/${reportId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        alert('✅ Report deleted successfully!');
        fetchReports();
        
      } catch (err) {
        alert('Error deleting report: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Download reports as Excel
  const downloadExcel = () => {
    if (reports.length === 0) {
      alert('No reports to download!');
      return;
    }

    const headers = [
      'ID', 'Faculty', 'Class', 'Week', 'Date', 'Course Name', 'Course Code',
      'Lecturer', 'Present', 'Registered', 'Venue', 'Scheduled Time',
      'Topic', 'Learning Outcomes', 'Recommendations', 'Last Updated'
    ];

    const csvContent = reports.map(report => {
      return [
        report.id,
        `"${(report.faculty_name || '').replace(/"/g, '""')}"`,
        `"${(report.class_name || '').replace(/"/g, '""')}"`,
        `"${(report.week_of_reporting || '').replace(/"/g, '""')}"`,
        report.date_of_lecture || 'N/A',
        `"${(report.coursename || '').replace(/"/g, '""')}"`,
        `"${(report.coursecode || '').replace(/"/g, '""')}"`,
        `"${(report.lecturer || '').replace(/"/g, '""')}"`,
        report.present || 0,
        report.registered || 0,
        `"${(report.venue || '').replace(/"/g, '""')}"`,
        `"${(report.scheduled_time || '').replace(/"/g, '""')}"`,
        `"${(report.topic_taught || '').replace(/"/g, '""')}"`,
        `"${(report.learning_outcomes || '').replace(/"/g, '""')}"`,
        `"${(report.recommendations || '').replace(/"/g, '""')}"`,
        report.updated_at ? new Date(report.updated_at).toLocaleDateString() : 'N/A'
      ].join(',');
    }).join('\n');

    const fullCSV = [headers.join(','), csvContent].join('\n');

    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('📊 Reports downloaded as Excel/CSV file!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Calculate statistics for graphs
  const stats = {
    totalReports: reports.length,
    totalStudents: reports.reduce((sum, report) => sum + (report.registered || 0), 0),
    averageAttendance: reports.length > 0 
      ? (reports.reduce((sum, report) => sum + (report.present || 0), 0) / 
         reports.reduce((sum, report) => sum + (report.registered || 1), 0) * 100).toFixed(1)
      : 0,
    courses: [...new Set(reports.map(r => r.coursename))].length
  };

  // Render active section
  const renderActiveSection = () => {
    const commonProps = {
      reports,
      user,
      showAddForm,
      setShowAddForm,
      fetchReports,
      downloadExcel
    };

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection 
          {...commonProps}
          canCreateReport={canCreateReport()}
          canViewAllReports={canViewAllReports()}
        />;
      case 'profile':
        return <ProfileSection user={user} />;
      case 'monitoring':
        return <MonitoringSection reports={reports} />;
      case 'rating':
        return <RatingSection />;
      case 'courses':
        return <CoursesSection />;
      case 'lecturers':
        return <LecturersSection />;
      case 'settings':
        return <SettingsSection user={user} />;
      case 'my_reports':
      case 'view_reports':
      case 'reports':
      case 'reports_feedback':
        return <ReportsSection 
          {...commonProps}
          loading={loading}
          handleEditReport={handleEditReport}
          handleDeleteReport={handleDeleteReport}
          canCreateReport={canCreateReport()}
          canViewAllReports={canViewAllReports()}
          canEditDelete={canEditDelete}
        />;
      case 'my_classes':
        return (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-file-alt me-2"></i>My Classes</h5>
            </div>
            <div className="card-body">
              <p>My Classes content will be displayed here.</p>
            </div>
          </div>
        );
      default:
        return <DashboardSection 
          {...commonProps}
          canCreateReport={canCreateReport()}
          canViewAllReports={canViewAllReports()}
        />;
    }
  };

  // Get page title based on active section
  const getPageTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard';
      case 'profile': return 'User Profile';
      case 'monitoring': return 'Monitoring';
      case 'rating': return 'Rating System';
      case 'courses': return 'Courses Management';
      case 'lecturers': return 'Lecturers Management';
      case 'settings': return 'Settings';
      case 'my_reports': return 'My Reports';
      case 'view_reports': return 'View Reports';
      case 'reports': return 'Reports';
      case 'reports_feedback': return 'Reports & Feedback';
      case 'my_classes': return 'My Classes';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="d-flex">
      <Sidebar 
        userRole={user?.role} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="content flex-grow-1 p-4">
        <div className="header d-flex justify-content-between align-items-center mb-4">
          <h3>{getPageTitle()}</h3>
          <div className="d-flex align-items-center">
            {user && (
              <span className="me-3 text-muted">
                Welcome, {user.name} ({user.role?.replace('_', ' ').toUpperCase()})
              </span>
            )}
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Role-based welcome message */}
        <div className="alert alert-info mb-4">
          <strong>Role Access:</strong> 
          {user?.role === 'student' && ' You can view reports and monitor progress.'}
          {user?.role === 'lecturer' && ' You can create, edit your own reports, and monitor classes.'}
          {user?.role === 'principal_lecturer' && ' You can view all courses, reports, add feedback, and monitor.'}
          {user?.role === 'program_leader' && ' You have full access to courses, reports, classes, and lecturers.'}
        </div>

        {error && (
          <div className="alert alert-warning">
            <strong>Note:</strong> {error}
          </div>
        )}
        
        {/* Add/Edit Report Form Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingReport ? 'Edit Report' : 'Add New Report'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingReport(null);
                    setFormData({
                      faculty_name: '',
                      class_name: '',
                      week_of_reporting: '',
                      date_of_lecture: '',
                      coursename: '',
                      coursecode: '',
                      lecturer: '',
                      present: '',
                      registered: '',
                      venue: '',
                      scheduled_time: '',
                      topic_taught: '',
                      learning_outcomes: '',
                      recommendations: ''
                    });
                  }}
                ></button>
              </div>
              <form onSubmit={editingReport ? handleUpdateReport : handleSubmitReport}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Faculty Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="faculty_name"
                        value={formData.faculty_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Class Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="class_name"
                        value={formData.class_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Week of Reporting *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="week_of_reporting"
                        value={formData.week_of_reporting}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date of Lecture *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date_of_lecture"
                        value={formData.date_of_lecture}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Scheduled Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="scheduled_time"
                        value={formData.scheduled_time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Course Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="coursename"
                        value={formData.coursename}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Course Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="coursecode"
                        value={formData.coursecode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lecturer's Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lecturer"
                        value={formData.lecturer || user?.name || ''}
                        onChange={handleInputChange}
                        required
                        readOnly={user?.role === 'lecturer'}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Present Students</label>
                      <input
                        type="number"
                        className="form-control"
                        name="present"
                        value={formData.present}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Registered Students</label>
                      <input
                        type="number"
                        className="form-control"
                        name="registered"
                        value={formData.registered}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Venue</label>
                      <input
                        type="text"
                        className="form-control"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Topic Taught *</label>
                    <textarea
                      className="form-control"
                      name="topic_taught"
                      value={formData.topic_taught}
                      onChange={handleInputChange}
                      rows="2"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Learning Outcomes *</label>
                    <textarea
                      className="form-control"
                      name="learning_outcomes"
                      value={formData.learning_outcomes}
                      onChange={handleInputChange}
                      rows="2"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Recommendations</label>
                    <textarea
                      className="form-control"
                      name="recommendations"
                      value={formData.recommendations}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingReport(null);
                      setFormData({
                        faculty_name: '',
                        class_name: '',
                        week_of_reporting: '',
                        date_of_lecture: '',
                        coursename: '',
                        coursecode: '',
                        lecturer: '',
                        present: '',
                        registered: '',
                        venue: '',
                        scheduled_time: '',
                        topic_taught: '',
                        learning_outcomes: '',
                        recommendations: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingReport ? 'Update Report' : 'Create Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Render active section */}
        {renderActiveSection()}
      </div>
    </div>
  );
}
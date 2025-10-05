import React from 'react';

const DashboardSection = ({ 
  reports, 
  user, 
  setShowAddForm, 
  fetchReports, 
  downloadExcel, 
  canCreateReport, 
  canViewAllReports 
}) => {
  const stats = {
    totalReports: reports.length,
    totalStudents: reports.reduce((sum, report) => sum + (report.registered || 0), 0),
    averageAttendance: reports.length > 0 
      ? (reports.reduce((sum, report) => sum + (report.present || 0), 0) / 
         reports.reduce((sum, report) => sum + (report.registered || 1), 0) * 100).toFixed(1)
      : 0,
    courses: [...new Set(reports.map(r => r.coursename))].length
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card bg-primary text-white">
            <div className="stat-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalReports}</h3>
              <p>Total Reports</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card bg-success text-white">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card bg-info text-white">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.averageAttendance}%</h3>
              <p>Avg Attendance</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card bg-warning text-white">
            <div className="stat-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.courses}</h3>
              <p>Courses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {canCreateReport && (
              <div className="col-md-3">
                <button 
                  className="btn btn-success w-100 mb-2"
                  onClick={() => setShowAddForm(true)}
                >
                  <i className="fas fa-plus me-2"></i>Add New Report
                </button>
              </div>
            )}
            <div className="col-md-3">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={fetchReports}
              >
                <i className="fas fa-sync me-2"></i>Refresh Data
              </button>
            </div>
            <div className="col-md-3">
              <button 
                className="btn btn-info w-100 mb-2"
                onClick={() => window.setActiveSection && window.setActiveSection('reports')}
              >
                <i className="fas fa-list me-2"></i>
                {user?.role === 'student' ? 'View Reports' : 'View All Reports'}
              </button>
            </div>
            {canViewAllReports && (
              <div className="col-md-3">
                <button 
                  className="btn btn-excel w-100 mb-2"
                  onClick={downloadExcel}
                  disabled={reports.length === 0}
                >
                  <i className="fas fa-file-excel me-2"></i>Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;

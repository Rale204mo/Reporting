import React from 'react';
import './Monitoring.css';
const MonitoringSection = ({ reports }) => {
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
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0"><i className="fas fa-chart-bar me-2"></i>Monitoring Dashboard</h5>
        </div>
        <div className="card-body">
          <div className="row">
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
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Recent Activity</h5>
        </div>
        <div className="card-body">
          <div className="activity-list">
            {reports.slice(0, 5).map((report, index) => (
              <div key={report.id} className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-clipboard-check text-success"></i>
                </div>
                <div className="activity-content">
                  <strong>{report.lecturer}</strong> submitted report for <strong>{report.coursename}</strong>
                  <div className="activity-time">
                    {report.updated_at ? new Date(report.updated_at).toLocaleString() : 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSection;
import React from 'react';

const ReportsSection = ({ 
  reports, 
  loading, 
  user, 
  setShowAddForm, 
  fetchReports, 
  downloadExcel, 
  handleEditReport, 
  handleDeleteReport, 
  canCreateReport, 
  canViewAllReports, 
  canEditDelete 
}) => {
  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {user?.role === 'student' ? 'Available Reports' : 'All Class Reports'}
          {user?.role === 'lecturer' && ' (My Reports)'}
        </h5>
        <div>
          {canCreateReport && (
            <button 
              className="btn btn-success btn-sm me-2"
              onClick={() => setShowAddForm(true)}
            >
              + Add New Report
            </button>
          )}
          {canViewAllReports && (
            <button 
              className="btn btn-excel btn-sm me-2"
              onClick={downloadExcel}
              disabled={reports.length === 0}
            >
              <i className="fas fa-file-excel me-1"></i>Export All
            </button>
          )}
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Code</th>
              <th>Lecturer</th>
              <th>Class</th>
              <th>Attendance</th>
              <th>Week</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading reports...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  <div>No reports found.</div>
                  <small>
                    {user?.role === 'student' 
                      ? 'No reports available for viewing.' 
                      : 'Click "Add New Report" to create your first report'
                    }
                  </small>
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1}</td>
                  <td>{report.coursename || 'N/A'}</td>
                  <td>{report.coursecode || 'N/A'}</td>
                  <td>{report.lecturer || 'N/A'}</td>
                  <td>{report.class_name || 'N/A'}</td>
                  <td>
                    <span className="badge bg-info">
                      {report.present || 0}/{report.registered || 0}
                    </span>
                  </td>
                  <td>{report.week_of_reporting || 'N/A'}</td>
                  <td>
                    {report.date_of_lecture ? 
                      new Date(report.date_of_lecture).toLocaleDateString() : 'N/A'
                    }
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      {canEditDelete(report) && (
                        <>
                          <button 
                            className="btn btn-warning btn-sm me-1"
                            onClick={() => handleEditReport(report)}
                            title="Edit Report"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm me-1"
                            onClick={() => handleDeleteReport(report.id, report)}
                            title="Delete Report"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => {
                          alert(`Report Details:\nCourse: ${report.coursename}\nLecturer: ${report.lecturer}\nTopic: ${report.topic_taught}`);
                        }}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsSection;
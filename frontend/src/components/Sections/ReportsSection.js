import React, { useState } from 'react';
import './Reports.css';

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
  canEditDelete,
  handleSubmitFeedback
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleAddFeedback = (report) => {
    setSelectedReport(report);
    setFeedback(report.feedback || '');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedbackAction = async () => {
    if (selectedReport && feedback.trim()) {
      if (handleSubmitFeedback) {
        const success = await handleSubmitFeedback(selectedReport.id, feedback);
        if (success) {
          setShowFeedbackModal(false);
          setFeedback('');
          setSelectedReport(null);
        }
      } else {
        console.log('Submitting feedback for report:', selectedReport.id, feedback);
        alert(`Feedback submitted for ${selectedReport.coursename}!\n\nFeedback: ${feedback}`);
        setShowFeedbackModal(false);
        setFeedback('');
        setSelectedReport(null);
        fetchReports();
      }
    }
  };

  // Enhanced role checks - PRL can do everything
  const canAddFeedback = () => {
    return user?.role === 'principal_lecturer' || user?.role === 'program_leader';
  };
  
  const canViewFeedback = () => {
    return user?.role === 'principal_lecturer' || user?.role === 'program_leader';
  };

  // PRL can edit any report in their stream
  const canEditReport = (report) => {
    if (user?.role === 'principal_lecturer') {
      return true; // PRL can edit ALL reports in their filtered view
    }
    return canEditDelete(report); // Use existing logic for other roles
  };

  // PRL can delete any report in their stream
  const canDeleteReport = (report) => {
    if (user?.role === 'principal_lecturer') {
      return true; // PRL can delete ALL reports in their filtered view
    }
    return canEditDelete(report); // Use existing logic for other roles
  };

  // PRL can create reports
  const canCreateReportEnhanced = () => {
    return canCreateReport || user?.role === 'principal_lecturer';
  };

  // Filter reports by user role
  const getFilteredReports = () => {
    if (!user || !reports) return reports;
    
    switch(user.role) {
      case 'principal_lecturer':
        // PRL sees all reports in their stream
        return reports.filter(report => 
          report.stream === user.stream || 
          !report.stream // Include reports without stream specified
        );
      case 'program_leader':
        return reports; // PL sees all reports
      case 'lecturer':
        return reports.filter(r => r.lecturer === user.name || r.lecturer_id === user.id);
      case 'student':
        return reports.filter(r => r.class_name === user.className);
      default:
        return reports;
    }
  };

  const filteredReports = getFilteredReports();

  const getHeaderTitle = () => {
    switch(user?.role) {
      case 'principal_lecturer': return 'Stream Reports - Full Management';
      case 'program_leader': return 'All Reports - Review Feedback';
      case 'lecturer': return 'My Reports';
      case 'student': return 'Available Reports';
      default: return 'Reports Overview';
    }
  };

  // Enhanced view details function
  const handleViewDetails = (report) => {
    const details = `
📊 REPORT DETAILS:

📚 Course Information:
• Course: ${report.coursename || 'N/A'}
• Code: ${report.coursecode || 'N/A'}
• Lecturer: ${report.lecturer || 'N/A'}
• Class: ${report.class_name || 'N/A'}
• Stream: ${report.stream || 'General'}

📅 Schedule:
• Week: ${report.week_of_reporting || 'N/A'}
• Date: ${report.date_of_lecture ? new Date(report.date_of_lecture).toLocaleDateString() : 'N/A'}

👥 Attendance:
• Present: ${report.present || 0}
• Registered: ${report.registered || 0}
• Percentage: ${report.registered ? Math.round((report.present / report.registered) * 100) : 0}%

📖 Teaching Content:
• Topic: ${report.topic_taught || 'Not specified'}
• Teaching Methods: ${report.teaching_methods || 'Not specified'}
• Learning Materials: ${report.learning_materials || 'Not specified'}

${report.feedback ? `💬 Feedback:\n${report.feedback}` : '💬 Feedback: Not provided yet'}

${report.remarks ? `📝 Remarks:\n${report.remarks}` : ''}
    `;
    alert(details);
  };

  // Debug function to check permissions
  const checkPermissions = (report) => {
    console.log('User role:', user?.role);
    console.log('Can edit delete:', canEditDelete(report));
    console.log('Can edit report:', canEditReport(report));
    console.log('Can delete report:', canDeleteReport(report));
    console.log('Report:', report);
  };

  return (
    <>
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{getHeaderTitle()}</h5>
          <div>
            {canCreateReportEnhanced() && (
              <button className="btn btn-success btn-sm me-2" onClick={() => setShowAddForm(true)}>
                + Add New Report
              </button>
            )}
            {canViewAllReports && (
              <button 
                className="btn btn-excel btn-sm me-2"
                onClick={downloadExcel}
                disabled={filteredReports.length === 0}
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

        {/* Enhanced role-specific instructions for PRL */}
        {user?.role === 'principal_lecturer' && (
          <div className="alert alert-info mb-3">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Principal Lecturer Access:</strong> You have full management capabilities for reports in your stream.
            <div className="mt-1">
              <small>
                <i className="fas fa-edit text-warning mx-1"></i> = Edit Report | 
                <i className="fas fa-trash text-danger mx-1"></i> = Delete Report |
                <i className="fas fa-comment-dots text-info mx-1"></i> = Add/Edit Feedback | 
                <i className="fas fa-eye text-primary mx-1"></i> = View Full Details
              </small>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Code</th>
                <th>Lecturer</th>
                <th>Class</th>
                <th>Stream</th>
                <th>Attendance</th>
                <th>Week</th>
                <th>Date</th>
                {canViewFeedback() && <th>Feedback Status</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canViewFeedback() ? "11" : "10"} className="text-center">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={canViewFeedback() ? "11" : "10"} className="text-center text-muted py-4">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, index) => {
                  // Debug: Check permissions for each report
                  if (index === 0) checkPermissions(report);
                  
                  return (
                    <tr key={report.id || index}>
                      <td>{index + 1}</td>
                      <td>{report.coursename || 'N/A'}</td>
                      <td>{report.coursecode || 'N/A'}</td>
                      <td>{report.lecturer || 'N/A'}</td>
                      <td>{report.class_name || 'N/A'}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {report.stream || 'General'}
                        </span>
                      </td>
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
                      {canViewFeedback() && (
                        <td>
                          {report.feedback ? (
                            <span 
                              className="badge bg-success" 
                              style={{cursor: 'pointer'}}
                              onClick={() => handleAddFeedback(report)}
                              title="Click to view/edit feedback"
                            >
                              <i className="fas fa-check me-1"></i>Provided
                            </span>
                          ) : (
                            <span className="badge bg-warning">Pending</span>
                          )}
                        </td>
                      )}
                      <td>
                        <div className="btn-group" role="group">
                          {/* SIMPLIFIED: Show Edit/Delete for PRL regardless of canEditDelete */}
                          {(user?.role === 'principal_lecturer' || canEditDelete(report)) && (
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

                          {/* Feedback button for PRL and PL */}
                          {canAddFeedback() && (
                            <button
                              className={`btn btn-sm me-1 ${
                                report.feedback ? 'btn-outline-info' : 'btn-info'
                              }`}
                              onClick={() => handleAddFeedback(report)}
                              title={report.feedback ? 'View/Edit Feedback' : 'Add Feedback'}
                            >
                              <i className="fas fa-comment-dots"></i>
                              {report.feedback ? ' Edit' : ' Add'}
                            </button>
                          )}

                          {/* Enhanced View Details button */}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetails(report)}
                            title="View Full Report Details"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-comment-dots me-2"></i>
                  {selectedReport?.feedback ? 'Edit Feedback' : 'Add Feedback'} for Report
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFeedbackModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedReport && (
                  <div className="mb-3 p-3 bg-dark rounded">
                    <h6>Report Information:</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Course:</strong> {selectedReport.coursename}<br/>
                        <strong>Code:</strong> {selectedReport.coursecode}<br/>
                        <strong>Lecturer:</strong> {selectedReport.lecturer}<br/>
                        <strong>Stream:</strong> {selectedReport.stream || 'General'}
                      </div>
                      <div className="col-md-6">
                        <strong>Class:</strong> {selectedReport.class_name}<br/>
                        <strong>Week:</strong> {selectedReport.week_of_reporting}<br/>
                        <strong>Date:</strong> {selectedReport.date_of_lecture ? new Date(selectedReport.date_of_lecture).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    {user?.role === 'principal_lecturer' ? 'Your Teaching Feedback:' : 'Review Comments:'}
                  </label>
                  <textarea
                    className="form-control"
                    rows="6"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      user?.role === 'principal_lecturer' 
                        ? "Provide constructive feedback on teaching methods, student engagement, areas for improvement, suggestions for enhancement..."
                        : "Add your review comments, observations, or recommendations..."
                    }
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                  <i className="fas fa-times me-1"></i>Cancel
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleSubmitFeedbackAction} 
                  disabled={!feedback.trim()}
                >
                  <i className="fas fa-check me-1"></i>
                  {selectedReport?.feedback ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsSection;
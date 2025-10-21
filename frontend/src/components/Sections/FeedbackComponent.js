import React, { useState } from 'react';
import './FeedbackComponent.css';

const FeedbackComponent = ({ user }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('lecturer');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    recipientType: 'lecturer',
    recipientId: '',
    recipientName: '',
    course: '',
    date: new Date().toISOString().split('T')[0],
    feedbackType: 'positive',
    subject: '',
    message: '',
    priority: 'medium',
    suggestions: '',
    followUpRequired: false,
    followUpDate: ''
  });

  // Sample data (replace with API later)
  const lecturers = [
    { id: 1, name: 'David', courses: ['DIT', 'COMMUNICATION'], email: 'david@luct.ac.za' },
    { id: 2, name: 'Lekhetho', courses: ['DIT', 'fss'], email: 'lekhetho@luct.ac.za' },
    { id: 3, name: 'Tshepo', courses: ['DIT'], email: 'tshepo@luct.ac.za' },
    { id: 4, name: 'Ten', courses: ['DIT'], email: 'ten@luct.ac.za' }
  ];

  const students = [
    { id: 101, name: 'John Doe', class: 'DPRL', course: 'COMMUNICATION', studentId: 'BCOM001' },
    { id: 102, name: 'Jane Smith', class: 'BSCIT', course: 'DIT', studentId: 'DIT001' },
    { id: 103, name: 'Mike Johnson', class: 'DSM', course: 'fss', studentId: 'FSS001' }
  ];

  const courses = ['DIT', 'COMMUNICATION', 'fss', 'BCOM12', 'IT901'];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Change between lecturer/student
  const handleRecipientTypeChange = (type) => {
    setFeedbackType(type);
    setFeedbackData(prev => ({
      ...prev,
      recipientType: type,
      recipientId: '',
      recipientName: ''
    }));
    setSelectedRecipient('');
  };

  // Select a recipient
  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient.id);
    setFeedbackData(prev => ({
      ...prev,
      recipientId: recipient.id,
      recipientName: recipient.name,
      course: recipient.courses?.[0] || recipient.course || ''
    }));
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackData.recipientId || !feedbackData.message.trim()) {
      alert('⚠️ Please select a recipient and enter your feedback message.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...feedbackData,
        sender_id: user?.id || 1, // default for demo
        sender_name: user?.name || 'Principal Lecturer',
      };

      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to send feedback');
      const data = await res.json();

      alert(`✅ Feedback sent successfully to ${data.recipient_name || feedbackData.recipientName}!`);

      // Reset form
      setFeedbackData({
        recipientType: 'lecturer',
        recipientId: '',
        recipientName: '',
        course: '',
        date: new Date().toISOString().split('T')[0],
        feedbackType: 'positive',
        subject: '',
        message: '',
        priority: 'medium',
        suggestions: '',
        followUpRequired: false,
        followUpDate: ''
      });
      setSelectedRecipient('');
      setShowFeedbackModal(false);
    } catch (error) {
      alert('❌ Error sending feedback: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getRecipients = () => feedbackType === 'lecturer' ? lecturers : students;
  const getFeedbackTypeColor = (type) => ({
    positive: 'success',
    constructive: 'warning',
    critical: 'danger'
  }[type] || 'primary');

  return (
    <div className="feedback-container">
      <div className="text-center mb-4">
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => setShowFeedbackModal(true)}
        >
          <i className="fas fa-comment-medical me-2"></i>
          Send Feedback
        </button>
        <p className="text-muted mt-2">
          Provide constructive feedback to lecturers or students
        </p>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content feedback-modal">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-comment-dots me-2"></i>
                Send Feedback - Principal Lecturer
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowFeedbackModal(false)}
              ></button>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              <div className="modal-body">
                {/* Recipient Type */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Feedback For:</label>
                  <div className="btn-group w-100">
                    <button
                      type="button"
                      className={`btn ${feedbackType === 'lecturer' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleRecipientTypeChange('lecturer')}
                    >
                      Lecturer
                    </button>
                    <button
                      type="button"
                      className={`btn ${feedbackType === 'student' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleRecipientTypeChange('student')}
                    >
                      Student
                    </button>
                  </div>
                </div>

                {/* Recipient List */}
                <div className="recipient-list mb-3">
                  {getRecipients().map(recipient => (
                    <div
                      key={recipient.id}
                      className={`recipient-item ${selectedRecipient === recipient.id ? 'selected' : ''}`}
                      onClick={() => handleRecipientSelect(recipient)}
                    >
                      <div>
                        <strong>{recipient.name}</strong><br />
                        <small className="text-muted">
                          {feedbackType === 'lecturer'
                            ? `Courses: ${recipient.courses.join(', ')}`
                            : `${recipient.class} • ${recipient.course}`}
                        </small>
                      </div>
                      <i className="fas fa-check select-indicator"></i>
                    </div>
                  ))}
                </div>

                {/* Feedback Fields */}
                {selectedRecipient && (
                  <>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Course</label>
                        <select
                          className="form-control"
                          name="course"
                          value={feedbackData.course}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Course</option>
                          {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          value={feedbackData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Feedback Message *</label>
                      <textarea
                        className="form-control"
                        name="message"
                        rows="5"
                        value={feedbackData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Suggestions</label>
                      <textarea
                        className="form-control"
                        name="suggestions"
                        rows="3"
                        value={feedbackData.suggestions}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={!selectedRecipient || isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;

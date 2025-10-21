import React, { useState } from 'react';
import './Lecture.css';

const LecturersSection = () => {
  const [lecturers, setLecturers] = useState([
    { 
      id: 1, 
      name: 'Tsepo', 
      email: 'tsepo@luct.ac.ls', 
      courses: ['DIT', 'Web Development'], 
      status: 'Active',
      rating: 4.2,
      totalRatings: 15
    },
    { 
      id: 2, 
      name: 'Lereko', 
      email: 'lereko@luct.ac.ls', 
      courses: ['CS101'], 
      status: 'Active',
      rating: 3.8,
      totalRatings: 8
    },
    { 
      id: 3, 
      name: 'Teboho', 
      email: 'teboho@luct.ac.ls', 
      courses: ['IT901'], 
      status: 'Active',
      rating: 4.5,
      totalRatings: 12
    }
  ]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRateLecturer = (lecturer) => {
    setSelectedLecturer(lecturer);
    setNewRating(0);
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (newRating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    const updatedLecturers = lecturers.map(lecturer => {
      if (lecturer.id === selectedLecturer.id) {
        const newTotalRatings = lecturer.totalRatings + 1;
        const newAverageRating = (
          (lecturer.rating * lecturer.totalRatings + newRating) / newTotalRatings
        ).toFixed(1);
        
        return {
          ...lecturer,
          rating: parseFloat(newAverageRating),
          totalRatings: newTotalRatings
        };
      }
      return lecturer;
    });

    setLecturers(updatedLecturers);
    setShowRatingModal(false);
    setSelectedLecturer(null);
    setNewRating(0);
  };

  const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${interactive ? 'interactive' : ''} ${
              star <= (interactive ? (hoverRating || newRating) : rating) ? 'filled' : ''
            }`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
            onMouseEnter={() => interactive && onStarHover && onStarHover(star)}
            onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
          >
            ★
          </span>
        ))}
        {!interactive && (
          <span className="rating-text ms-2">
            {rating} ({selectedLecturer?.totalRatings || lecturers.find(l => l.id === selectedLecturer?.id)?.totalRatings} ratings)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><i className="fas fa-chalkboard-teacher me-2"></i>Lecturers Management</h5>
        <button className="btn btn-success btn-sm">
          <i className="fas fa-plus me-1"></i>Add Lecturer
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Courses</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.map(lecturer => (
                <tr key={lecturer.id}>
                  <td>{lecturer.name}</td>
                  <td>{lecturer.email}</td>
                  <td>{lecturer.courses.join(', ')}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {renderStars(lecturer.rating)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${lecturer.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                      {lecturer.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm me-1"
                      onClick={() => handleRateLecturer(lecturer)}
                      title="Rate Lecturer"
                    >
                      <i className="fas fa-star"></i>
                    </button>
                    <button className="btn btn-warning btn-sm me-1">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-info btn-sm me-1">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn btn-danger btn-sm">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedLecturer && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rate Lecturer</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRatingModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <h6>Rate {selectedLecturer.name}</h6>
                <p className="text-muted">Current rating: {selectedLecturer.rating} ★</p>
                
                <div className="rating-stars mb-3">
                  {renderStars(
                    selectedLecturer.rating, 
                    true, 
                    setNewRating, 
                    setHoverRating
                  )}
                </div>
                
                <p className="text-muted">
                  {newRating === 0 ? 'Select a rating' : `You selected: ${newRating} stars`}
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRatingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmitRating}
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturersSection;
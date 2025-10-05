import React, { useState } from 'react';

const RatingSection = () => {
  const [ratings, setRatings] = useState([
    { id: 1, course: 'DIT', lecturer: 'Ishiepo', rating: 4.5, comments: 'Excellent teaching' },
    { id: 2, course: 'CS101', lecturer: 'Dr. Smith', rating: 4.2, comments: 'Good content' }
  ]);

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0"><i className="fas fa-star me-2"></i>Rating System</h5>
      </div>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-6">
            <h6>Submit New Rating</h6>
            <form>
              <div className="mb-3">
                <label className="form-label">Course</label>
                <select className="form-control">
                  <option>Select Course</option>
                  <option>DIT</option>
                  <option>CS101</option>
                  <option>IT901</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Rating (1-5)</label>
                <input type="number" className="form-control" min="1" max="5" step="0.1" />
              </div>
              <div className="mb-3">
                <label className="form-label">Comments</label>
                <textarea className="form-control" rows="3"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit Rating</button>
            </form>
          </div>
          <div className="col-md-6">
            <h6>Your Ratings</h6>
            <div className="ratings-list">
              {ratings.map(rating => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-header">
                    <strong>{rating.course}</strong>
                    <span className="badge bg-warning">{rating.rating} ★</span>
                  </div>
                  <div className="rating-lecturer">Lecturer: {rating.lecturer}</div>
                  <div className="rating-comments">{rating.comments}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingSection;
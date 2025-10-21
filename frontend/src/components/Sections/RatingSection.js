import React, { useState, useEffect } from 'react';
import './Rating.css';

const RatingSection = ({ userStatus = 'Student' }) => {
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({
    course: '',
    lecturer: '',
    rating: '',
    comments: ''
  });

  // Load ratings from localStorage on component mount
  useEffect(() => {
    const savedRatings = localStorage.getItem('courseRatings');
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    } else {
      // Initialize with some sample data if no ratings exist
      const initialRatings = [
        { id: 1, course: 'DIT', lecturer: 'Ishiepo', rating: 4.5, comments: 'Excellent teaching', date: new Date().toISOString() },
        { id: 2, course: 'CS101', lecturer: 'thiza', rating: 4.2, comments: 'Good content', date: new Date().toISOString() }
      ];
      setRatings(initialRatings);
      localStorage.setItem('courseRatings', JSON.stringify(initialRatings));
    }
  }, []);

  // Save ratings to localStorage whenever ratings change
  useEffect(() => {
    if (ratings.length > 0) {
      localStorage.setItem('courseRatings', JSON.stringify(ratings));
    }
  }, [ratings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newRating.course && newRating.rating) {
      const ratingToAdd = {
        id: Date.now(), // Use timestamp for unique ID
        course: newRating.course,
        lecturer: newRating.lecturer || 'Not specified',
        rating: parseFloat(newRating.rating),
        comments: newRating.comments,
        date: new Date().toISOString(),
        studentName: 'Current Student' // You can replace this with actual user name
      };
      
      const updatedRatings = [...ratings, ratingToAdd];
      setRatings(updatedRatings);
      setNewRating({ course: '', lecturer: '', rating: '', comments: '' });
      
      // Show success message
      alert('Rating submitted successfully!');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRating(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate statistics for lecturers
  const getLecturerStats = () => {
    const lecturerRatings = ratings.filter(rating => rating.lecturer.toLowerCase() !== 'your name');
    const averageRating = lecturerRatings.length > 0 
      ? (lecturerRatings.reduce((sum, rating) => sum + rating.rating, 0) / lecturerRatings.length).toFixed(1)
      : 0;
    
    return {
      averageRating,
      totalRatings: lecturerRatings.length,
      courses: [...new Set(lecturerRatings.map(r => r.course))].length
    };
  };

  const stats = getLecturerStats();

  // Render different content based on user status
  const renderRatingContent = () => {
    switch(userStatus) {
      case 'Student':
        return (
          <div className="row mb-4">
            <div className="col-md-6">
              <h6>Submit New Rating</h6>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <select 
                    className="form-control"
                    name="course"
                    value={newRating.course}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Course</option>
                    <option value="DIT">DIT</option>
                    <option value="CS101">CS101</option>
                    <option value="IT901">IT901</option>
                    <option value="MATH101">MATH101</option>
                    <option value="PHYS101">PHYS101</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Lecturer</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="lecturer"
                    value={newRating.lecturer}
                    onChange={handleInputChange}
                    placeholder="Enter lecturer name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rating (1-5)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1" 
                    max="5" 
                    step="0.1"
                    name="rating"
                    value={newRating.rating}
                    onChange={handleInputChange}
                    placeholder="Enter rating from 1 to 5"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    name="comments"
                    value={newRating.comments}
                    onChange={handleInputChange}
                    placeholder="Share your feedback about the course..."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-star me-2"></i>Submit Rating
                </button>
              </form>
            </div>
            <div className="col-md-6">
              <h6>Your Ratings ({ratings.length})</h6>
              <div className="ratings-list">
                {ratings.length === 0 ? (
                  <div className="text-muted text-center py-4">
                    <i className="fas fa-star fa-2x mb-3"></i>
                    <p>No ratings submitted yet.</p>
                  </div>
                ) : (
                  ratings.map(rating => (
                    <div key={rating.id} className="rating-item card mb-3">
                      <div className="card-body">
                        <div className="rating-header d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong className="h6">{rating.course}</strong>
                            <div className="text-muted small">Lecturer: {rating.lecturer}</div>
                          </div>
                          <span className="badge bg-warning fs-6">{rating.rating} ★</span>
                        </div>
                        <div className="rating-comments">{rating.comments}</div>
                        <div className="rating-date text-muted small mt-2">
                          {new Date(rating.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'Lecturer':
        const lecturerName = 'Your Name'; // Replace with actual lecturer name
        const myRatings = ratings.filter(rating => 
          rating.lecturer.toLowerCase() === lecturerName.toLowerCase()
        );
        
        return (
          <div className="row">
            <div className="col-12">
              <h6>Student Ratings for Your Classes</h6>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Rating</th>
                      <th>Comments</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRatings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No ratings received yet.
                        </td>
                      </tr>
                    ) : (
                      myRatings.map(rating => (
                        <tr key={rating.id}>
                          <td>{rating.course}</td>
                          <td>
                            <span className="badge bg-warning">{rating.rating} ★</span>
                          </td>
                          <td>{rating.comments}</td>
                          <td>{new Date(rating.date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <h6>Your Rating Statistics</h6>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-primary">{stats.averageRating}</h3>
                        <p>Average Rating</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-success">{stats.totalRatings}</h3>
                        <p>Total Ratings</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-info">{stats.courses}</h3>
                        <p>Courses Rated</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h3 className="text-warning">
                          {stats.averageRating >= 4 ? 'Excellent' : 
                           stats.averageRating >= 3 ? 'Good' : 'Needs Improvement'}
                        </h3>
                        <p>Performance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Principal Lecturer':
        return (
          <div className="row">
            <div className="col-md-6">
              <h6>Lecturer Ratings Overview</h6>
              <div className="ratings-list">
                {ratings.length === 0 ? (
                  <div className="text-muted text-center py-4">
                    <i className="fas fa-chart-line fa-2x mb-3"></i>
                    <p>No ratings data available.</p>
                  </div>
                ) : (
                  ratings.map(rating => (
                    <div key={rating.id} className="rating-item card mb-3">
                      <div className="card-body">
                        <div className="rating-header d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong className="h6">{rating.lecturer}</strong>
                            <div className="text-muted small">Course: {rating.course}</div>
                          </div>
                          <span className="badge bg-warning">{rating.rating} ★</span>
                        </div>
                        <div className="rating-comments">{rating.comments}</div>
                        <div className="mt-2">
                          <button className="btn btn-sm btn-outline-primary me-2">
                            <i className="fas fa-eye me-1"></i>View Details
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="fas fa-download me-1"></i>Generate Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="col-md-6">
              <h6>Rating Analytics</h6>
              <div className="card bg-light mb-3">
                <div className="card-body text-center">
                  <h5>Overall Department Rating</h5>
                  <h2 className="text-primary">{stats.averageRating} ★</h2>
                  <p>Based on {stats.totalRatings} ratings across {stats.courses} courses</p>
                </div>
              </div>
              <div className="card bg-light">
                <div className="card-body">
                  <h5>Top Performing Lecturers</h5>
                  <ul className="list-group">
                    {ratings
                      .reduce((acc, rating) => {
                        const existing = acc.find(item => item.lecturer === rating.lecturer);
                        if (existing) {
                          existing.ratings.push(rating.rating);
                        } else {
                          acc.push({
                            lecturer: rating.lecturer,
                            ratings: [rating.rating]
                          });
                        }
                        return acc;
                      }, [])
                      .map(item => ({
                        lecturer: item.lecturer,
                        average: (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1)
                      }))
                      .sort((a, b) => b.average - a.average)
                      .slice(0, 3)
                      .map((lecturer, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {lecturer.lecturer}
                          <span className="badge bg-success">{lecturer.average} ★</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Program Leader':
        return (
          <div className="row">
            <div className="col-12">
              <h6>Program Rating Dashboard</h6>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h3>{stats.averageRating}</h3>
                      <p>Program Rating</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h3>{[...new Set(ratings.map(r => r.lecturer))].length}</h3>
                      <p>Lecturers</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h3>{stats.totalRatings}</h3>
                      <p>Total Ratings</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h3>{stats.courses}</h3>
                      <p>Courses</p>
                    </div>
                  </div>
                </div>
              </div>

              <h6>Course Ratings Summary</h6>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Average Rating</th>
                      <th>Number of Ratings</th>
                      <th>Trend</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No rating data available.
                        </td>
                      </tr>
                    ) : (
                      ratings
                        .reduce((acc, rating) => {
                          const existing = acc.find(item => item.course === rating.course && item.lecturer === rating.lecturer);
                          if (existing) {
                            existing.ratings.push(rating.rating);
                          } else {
                            acc.push({
                              course: rating.course,
                              lecturer: rating.lecturer,
                              ratings: [rating.rating]
                            });
                          }
                          return acc;
                        }, [])
                        .map((item, index) => (
                          <tr key={index}>
                            <td>{item.course}</td>
                            <td>{item.lecturer}</td>
                            <td>
                              <span className="badge bg-warning">
                                {(item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1)} ★
                              </span>
                            </td>
                            <td>{item.ratings.length}</td>
                            <td>
                              <span className="text-success">↑ Improving</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-1">
                                <i className="fas fa-eye me-1"></i>View
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                <i className="fas fa-download me-1"></i>Export
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Rating system not available for your user type.
          </div>
        );
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><i className="fas fa-star me-2"></i>Rating System</h5>
        <div>
          <span className="badge bg-secondary me-2">{userStatus}</span>
          <span className="badge bg-info">{ratings.length} Ratings</span>
        </div>
      </div>
      <div className="card-body">
        {renderRatingContent()}
      </div>
    </div>
  );
};

export default RatingSection;
import React, { useState } from 'react';

const LecturersSection = () => {
  const [lecturers, setLecturers] = useState([
    { id: 1, name: 'Dr. Ishiepo', email: 'ishiepo@luct.ac.ls', courses: ['DIT', 'Web Development'], status: 'Active' },
    { id: 2, name: 'Dr. Smith', email: 'smith@luct.ac.ls', courses: ['CS101'], status: 'Active' },
    { id: 3, name: 'Prof. Rey', email: 'rey@luct.ac.ls', courses: ['IT901'], status: 'Active' }
  ]);

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
                    <span className={`badge ${lecturer.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                      {lecturer.status}
                    </span>
                  </td>
                  <td>
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
    </div>
  );
};

export default LecturersSection;
import React, { useState } from 'react';

const CoursesSection = () => {
  const [courses, setCourses] = useState([
    { id: 1, code: 'DIT', name: 'Diploma in IT', lecturer: 'Ishiepo', students: 45 },
    { id: 2, code: 'CS101', name: 'Computer Science 101', lecturer: 'Dr. Smith', students: 30 },
    { id: 3, code: 'IT901', name: 'Information Technology', lecturer: 'Rey', students: 25 }
  ]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><i className="fas fa-book me-2"></i>Courses Management</h5>
        <button className="btn btn-success btn-sm">
          <i className="fas fa-plus me-1"></i>Add Course
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Lecturer</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.lecturer}</td>
                  <td>{course.students}</td>
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

export default CoursesSection;
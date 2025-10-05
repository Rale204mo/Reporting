import React, { useState } from 'react';
import API from '../../api'; // Fixed import path

const ProfileSection = ({ user }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await API.put('/api/auth/profile', editForm, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      setMessage('✅ Profile updated successfully!');
      
      // Update local storage and parent component if needed
      const updatedUser = { ...user, ...editForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        setShowEditModal(false);
        window.location.reload(); // Refresh to show updated data
      }, 1500);

    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('❌ New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await API.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      setMessage('✅ Password changed successfully!');
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 1500);

    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.error || err.message || 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0"><i className="fas fa-user me-2"></i>User Profile</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="profile-info">
                <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Role:</strong> {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'N/A'}</p>
                <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile-actions">
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => {
                    setEditForm({
                      name: user?.name || '',
                      email: user?.email || ''
                    });
                    setShowEditModal(true);
                    setMessage('');
                  }}
                >
                  <i className="fas fa-edit me-1"></i>Edit Profile
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setShowPasswordModal(true);
                    setMessage('');
                  }}
                >
                  <i className="fas fa-key me-1"></i>Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Profile</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Password</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowPasswordModal(false)}
              ></button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-body">
                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                    minLength="6"
                  />
                  <div className="form-text">Password must be at least 6 characters long</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPasswordModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
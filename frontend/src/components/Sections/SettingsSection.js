import React, { useState, useEffect } from 'react';
import API from '../../api';
import './Settings.css';
export default function SettingsSection({ user }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    language: 'english',
    theme: 'auto'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/api/user/settings', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.log('No saved settings found, using defaults');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await API.post('/api/user/settings', settings, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      setMessage('✅ Settings saved successfully!');
      
      // Apply theme immediately
      if (settings.theme !== 'auto') {
        document.documentElement.setAttribute('data-theme', settings.theme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
    } catch (error) {
      setMessage('❌ Error saving settings: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      emailNotifications: true,
      desktopNotifications: false,
      language: 'english',
      theme: 'auto'
    });
    setMessage('🔄 Settings reset to defaults');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>Settings
              </h5>
            </div>
            <div className="card-body">
              {/* Role-based welcome message */}
              <div className="alert alert-info mb-4">
                <strong>Role Access:</strong> 
                {user?.role === 'student' && ' You can view reports and monitor progress.'}
                {user?.role === 'lecturer' && ' You can create, edit your own reports, and monitor classes.'}
                {user?.role === 'principal_lecturer' && ' You can view all courses, reports, add feedback, and monitor.'}
                {user?.role === 'program_leader' && ' You have full access to courses, reports, classes, and lecturers.'}
              </div>

              {message && (
                <div className={`alert ${message.includes('✅') ? 'alert-success' : message.includes('❌') ? 'alert-danger' : 'alert-warning'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSaveSettings}>
                {/* Notification Settings */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="fas fa-bell me-2"></i>Notification Settings
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="emailNotifications"
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      <small className="form-text text-muted">
                        Receive email alerts for new reports and updates
                      </small>
                    </div>

                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="desktopNotifications"
                          id="desktopNotifications"
                          checked={settings.desktopNotifications}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="desktopNotifications">
                          Desktop Notifications
                        </label>
                      </div>
                      <small className="form-text text-muted">
                        Show browser notifications for important updates
                      </small>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="fas fa-palette me-2"></i>Preferences
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="language" className="form-label">
                          <i className="fas fa-language me-2"></i>Language
                        </label>
                        <select
                          className="form-select"
                          name="language"
                          id="language"
                          value={settings.language}
                          onChange={handleInputChange}
                        >
                          <option value="english">English</option>
                          <option value="french">French</option>
                          <option value="spanish">Spanish</option>
                          <option value="german">German</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="theme" className="form-label">
                          <i className="fas fa-paint-brush me-2"></i>Theme
                        </label>
                        <select
                          className="form-select"
                          name="theme"
                          id="theme"
                          value={settings.theme}
                          onChange={handleInputChange}
                        >
                          <option value="auto">Auto</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="blue">Blue</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>Save Settings
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleResetDefaults}
                  >
                    <i className="fas fa-undo me-2"></i>Reset to Default
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
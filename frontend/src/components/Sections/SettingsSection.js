import React, { useState } from 'react';

const SettingsSection = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    language: 'english',
    theme: 'dark'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0"><i className="fas fa-cog me-2"></i>Settings</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>Notification Settings</h6>
            <div className="form-check form-switch mb-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              <label className="form-check-label">Email Notifications</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={settings.desktopNotifications}
                onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
              />
              <label className="form-check-label">Desktop Notifications</label>
            </div>
          </div>
          <div className="col-md-6">
            <h6>Preferences</h6>
            <div className="mb-3">
              <label className="form-label">Language</label>
              <select 
                className="form-control"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Theme</label>
              <select 
                className="form-control"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button className="btn btn-primary me-2">Save Settings</button>
          <button className="btn btn-secondary">Reset to Default</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
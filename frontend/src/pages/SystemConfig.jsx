import React, { useState } from 'react';
import { Settings, Save, Shield, Database, Check } from 'lucide-react';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    sessionTimeout: '30',
    maxUploadSize: '500',
    requireMFA: true,
    enableAuditLogging: true,
    backupFrequency: 'Daily'
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Configuration</h1>
          <p className="page-subtitle">Configure enterprise security policies, session thresholds, and automated backup schedules</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Security Settings Card */}
        <div className="card">
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div className="panel-title-group">
              <div className="panel-icon">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="panel-title">Security &amp; Authentication</h3>
                <p className="panel-subtitle">Session management and authentication factors</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Session Inactivity Timeout (minutes)</label>
              <input 
                type="number" 
                name="sessionTimeout" 
                value={config.sessionTimeout} 
                onChange={handleChange} 
                className="form-control" 
              />
              <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Officers will be automatically logged out after inactivity.
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '14px', 
              background: '#f8fafc', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Multi-Factor Authentication (MFA)</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Enforce TOTP / hardware key verification for all users</div>
              </div>
              <input 
                type="checkbox" 
                name="requireMFA" 
                checked={config.requireMFA} 
                onChange={handleChange} 
                id="mfa" 
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '14px', 
              background: '#f8fafc', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Hardware Audit Logging</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Log every cryptographic hash read and evidence access</div>
              </div>
              <input 
                type="checkbox" 
                name="enableAuditLogging" 
                checked={config.enableAuditLogging} 
                onChange={handleChange} 
                id="audit" 
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
              />
            </div>
          </div>
        </div>

        {/* Storage & Backup Card */}
        <div className="card">
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div className="panel-title-group">
              <div className="panel-icon" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                <Database size={20} />
              </div>
              <div>
                <h3 className="panel-title">Storage &amp; Backup Policies</h3>
                <p className="panel-subtitle">Evidence capacity limits and automated replication</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Maximum Evidence Upload Size (MB)</label>
              <input 
                type="number" 
                name="maxUploadSize" 
                value={config.maxUploadSize} 
                onChange={handleChange} 
                className="form-control" 
              />
              <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Upper file size limit for individual video, image, or document artifacts.
              </span>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Automated Backup Replication</label>
              <select 
                name="backupFrequency" 
                value={config.backupFrequency} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Hourly">Hourly Incremental Snapshots</option>
                <option value="Daily">Daily Full Immutable Archive</option>
                <option value="Weekly">Weekly Geo-Replicated Vault</option>
              </select>
              <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Copies stored in write-once-read-many (WORM) storage.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;

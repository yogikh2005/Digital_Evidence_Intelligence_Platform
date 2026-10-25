import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, User, ArrowRight, ShieldCheck, FileCheck, Database, Key } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid credentials or server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="login-wrapper">
      {/* Left Hero Pane (Light Enterprise Canvas) */}
      <div className="login-left">
        <div className="login-brand">
          <div className="shield-logo">
            <Shield size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div className="login-brand-text">
            <h2>DEIP Enterprise</h2>
            <p>Digital Evidence Intelligence Platform</p>
          </div>
        </div>

        <div className="login-hero-content">
          <div className="login-hero-badge">
            <ShieldCheck size={16} /> ISO/IEC 27037 &amp; CJIS Certified
          </div>
          <h1>End-to-End Forensic Integrity &amp; Chain of Custody</h1>
          <p className="hero-desc">
            A secure, auditable, and court-admissible digital evidence management platform designed for modern law enforcement and forensic investigators.
          </p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <FileCheck size={16} />
              </div>
              <span>Automated SHA-256 cryptographic evidence hashing &amp; verification</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Database size={16} />
              </div>
              <span>Immutable blockchain-style custody logs with tamper detection</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Key size={16} />
              </div>
              <span>Strict Role-Based Access Control (RBAC) with detailed audit trails</span>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          <span>&copy; {new Date().getFullYear()} DEIP Forensics System</span>
          <span>&bull;</span>
          <span>Security Protocol v3.8.4</span>
        </div>
      </div>

      {/* Right Login Box (Crisp White Card) */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              margin: '0 auto 16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
            }}>
              <Shield size={28} color="#2563eb" strokeWidth={2.2} />
            </div>
            <h2>Sign in to Account</h2>
            <p className="login-subtitle">Enter your official credentials to access the platform</p>
          </div>

          {/* Quick Demo Fill Buttons for convenience */}
          <div className="login-demo-helper">
            <div className="login-demo-label">
              <Key size={13} /> Quick Fill Demo Account
            </div>
            <div className="login-demo-pills">
              <button 
                type="button" 
                className="demo-role-btn" 
                onClick={() => handleQuickFill('admin', 'admin123')}
              >
                Admin
              </button>
              <button 
                type="button" 
                className="demo-role-btn" 
                onClick={() => handleQuickFill('investigator', 'password123')}
              >
                Investigator
              </button>
              <button 
                type="button" 
                className="demo-role-btn" 
                onClick={() => handleQuickFill('evidence_officer', 'password123')}
              >
                Evidence Officer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your username"
                  style={{ paddingLeft: '38px' }}
                  required 
                />
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  style={{ paddingLeft: '38px' }}
                  required 
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '6px' }} 
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: '#94a3b8' }}>
            Protected by end-to-end audit logging &amp; hardware-grade session security.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, CheckCircle, Activity, ShieldCheck, Zap } from 'lucide-react';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState({
    cpuUsage: 45,
    ramUsage: 62,
    storageUsage: 80,
    dbStatus: 'Connected',
    apiLatency: '38ms',
    uptime: '15d 4h 32m'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() * 8 - 4))),
        ramUsage: Math.min(100, Math.max(0, prev.ramUsage + (Math.random() * 3 - 1.5)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Health &amp; Infrastructure</h1>
          <p className="page-subtitle">Real-time resource utilization, database latency, and storage volume integrity</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', border: '1px solid #a7f3d0', fontSize: '0.85rem' }}>
          <CheckCircle size={17} /> All Systems Operational
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Cpu size={26} strokeWidth={2.2} /></div>
          <div className="stat-content">
            <div className="stat-label">CPU Compute Load</div>
            <div className="stat-value">{healthData.cpuUsage.toFixed(1)}%</div>
            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${healthData.cpuUsage}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><Server size={26} strokeWidth={2.2} /></div>
          <div className="stat-content">
            <div className="stat-label">RAM Memory Usage</div>
            <div className="stat-value">{healthData.ramUsage.toFixed(1)}%</div>
            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${healthData.ramUsage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow"><HardDrive size={26} strokeWidth={2.2} /></div>
          <div className="stat-content">
            <div className="stat-label">Storage Vault (NVMe)</div>
            <div className="stat-value">{healthData.storageUsage}%</div>
            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${healthData.storageUsage}%`, height: '100%', background: healthData.storageUsage > 75 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="panel-title">Service Fleet &amp; Latency Monitor</h3>
            <p className="panel-subtitle">Health ping and connectivity across platform microservices</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
            <Zap size={15} color="#2563eb" /> Active polling: 3s
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Infrastructure Service</th>
                <th>Health Status</th>
                <th>API / Query Latency</th>
                <th>Continuous Uptime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    PostgreSQL Enterprise Database
                  </div>
                </td>
                <td><span className="status-pill status-closed">Operational</span></td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500, color: '#1d4ed8' }}>12ms</td>
                <td style={{ color: '#475569' }}>{healthData.uptime}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    Backend REST API Service (Django)
                  </div>
                </td>
                <td><span className="status-pill status-closed">Operational</span></td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500, color: '#1d4ed8' }}>{healthData.apiLatency}</td>
                <td style={{ color: '#475569' }}>{healthData.uptime}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    Cryptographic Hashing Engine (SHA-256)
                  </div>
                </td>
                <td><span className="status-pill status-closed">Operational</span></td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500, color: '#1d4ed8' }}>8ms</td>
                <td style={{ color: '#475569' }}>{healthData.uptime}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    Evidence Storage Vault (Encrypted S3)
                  </div>
                </td>
                <td><span className="status-pill status-closed">Operational</span></td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500, color: '#1d4ed8' }}>26ms</td>
                <td style={{ color: '#475569' }}>{healthData.uptime}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    Tamper-Evident Audit Logger
                  </div>
                </td>
                <td><span className="status-pill status-closed">Operational</span></td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500, color: '#1d4ed8' }}>14ms</td>
                <td style={{ color: '#475569' }}>{healthData.uptime}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;

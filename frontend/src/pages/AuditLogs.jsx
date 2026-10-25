import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, Search, Shield, Clock } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit/');
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.username && log.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.ip_address && log.ip_address.includes(searchTerm))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Immutable Audit Trail</h1>
          <p className="page-subtitle">Hardware-synchronized records of every system access, hash verification, and custody transition</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search audit trail by user, action, or IP address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>Loading secure audit records...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '190px' }}>Timestamp (UTC)</th>
                  <th>Operating User</th>
                  <th>Audited Action</th>
                  <th>Origin IP</th>
                  <th>Cryptographic &amp; Event Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: '#475569', fontSize: '0.84rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="officer-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                          {log.user?.username ? log.user.username.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div style={{ color: '#0f172a' }}>{log.user?.username || 'System Daemon'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {log.user?.role ? log.user.role.replace('_', ' ') : 'CORE'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-open">
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>
                      {log.ip_address}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      <pre style={{ margin: 0, fontFamily: 'monospace', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No audit events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

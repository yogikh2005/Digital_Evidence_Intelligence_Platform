import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Folder, FileText, BarChart2, Plus, Clock, UploadCloud, Edit2, UserPlus, MoreVertical, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 5, cases: 0, evidence: 0, reports: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, evidenceRes, reportsRes] = await Promise.all([
          api.get('/cases/'),
          api.get('/evidence/'),
          api.get('/reports/')
        ]);
        setStats({
          users: 5,
          cases: casesRes.data.length,
          evidence: evidenceRes.data.length,
          reports: reportsRes.data.length
        });
        
        const formattedCases = casesRes.data.slice(0, 5).map(c => ({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          officer: c.investigating_officer?.username || 'Unassigned',
          role: c.investigating_officer?.role?.replace('_', ' ') || 'Officer',
          status: c.status === 'OPEN' ? 'Open' : (c.status === 'UNDER_REVIEW' ? 'Under Review' : 'Closed'),
          date: new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date(c.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
        setRecentCases(formattedCases);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    if(status === 'Open') return 'status-open';
    if(status === 'Under Review') return 'status-review';
    return 'status-closed';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time operational metrics and digital chain of custody status</p>
        </div>
        <Link to="/cases/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} /> New Investigation Case
        </Link>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Users size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">System Users</span>
              <span className="stat-trend">+1 this wk</span>
            </div>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-subtitle">Authorized personnel</div>
          </div>
          <div className="stat-bg-icon"><Users size={48} color="#eff6ff" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Folder size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">Active Cases</span>
              <span className="stat-trend">+3 active</span>
            </div>
            <div className="stat-value">{stats.cases}</div>
            <div className="stat-subtitle">Open investigations</div>
          </div>
          <div className="stat-bg-icon"><Folder size={48} color="#ecfdf5" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">
            <FileText size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">Total Evidence</span>
              <span className="stat-trend">100% verified</span>
            </div>
            <div className="stat-value">{stats.evidence}</div>
            <div className="stat-subtitle">SHA-256 hashed items</div>
          </div>
          <div className="stat-bg-icon"><FileText size={48} color="#fffbeb" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <BarChart2 size={26} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">Audit Reports</span>
              <span className="stat-trend">Compliant</span>
            </div>
            <div className="stat-value">{stats.reports}</div>
            <div className="stat-subtitle">Generated summaries</div>
          </div>
          <div className="stat-bg-icon"><BarChart2 size={48} color="#faf5ff" /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '24px' }}>
        {/* Recent Cases Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <div className="panel-title-group">
              <div className="panel-icon">
                <Folder size={20} />
              </div>
              <div>
                <h3 className="panel-title">Active Investigations</h3>
                <p className="panel-subtitle">Latest registered cases and chain-of-custody status</p>
              </div>
            </div>
            <button className="btn-outline" onClick={() => navigate('/cases')}>
              View All Cases &rarr;
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title &amp; Type</th>
                  <th>Assigned Officer</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{c.case_number}</td>
                    <td>
                      <div className="case-title">{c.title}</div>
                      <div className="case-subtitle">Cyber &amp; Forensic Review</div>
                    </td>
                    <td>
                      <div className="officer-profile">
                        <div className="officer-avatar">{c.officer.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="officer-name">{c.officer}</div>
                          <div className="officer-role">{c.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(c.status)}`}>{c.status}</span>
                    </td>
                    <td>
                      <div className="date-text">{c.date}</div>
                      <div className="time-text">{c.time}</div>
                    </td>
                    <td style={{ textAlign: 'right', color: '#94a3b8' }}>
                      <MoreVertical size={18} style={{ cursor: 'pointer' }} />
                    </td>
                  </tr>
                ))}
                {recentCases.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No cases recorded yet. Click "New Investigation Case" above to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="card">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="panel-icon" style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 className="panel-title">System Activities</h3>
                <p className="panel-subtitle">Real-time audit feed</p>
              </div>
            </div>
            <button className="btn-outline" onClick={() => navigate('/audit')}>
              Logs
            </button>
          </div>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon icon-green"><UploadCloud size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-title">Evidence verified</div>
                <div className="timeline-desc">video_cctv_001.mp4 &bull; SHA-256 match</div>
                <div className="timeline-author">by admin</div>
              </div>
              <div className="timeline-time">
                <div className="time-relative">2h ago</div>
                <div className="time-exact">Today</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon icon-blue"><Edit2 size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-title">Custody transferred</div>
                <div className="timeline-desc">CASE-2026-001 updated</div>
                <div className="timeline-author">by investigator</div>
              </div>
              <div className="timeline-time">
                <div className="time-relative">4h ago</div>
                <div className="time-exact">Today</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon icon-purple"><FileText size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-title">Report submitted</div>
                <div className="timeline-desc">Forensic analysis complete</div>
                <div className="timeline-author">by forensic_officer</div>
              </div>
              <div className="timeline-time">
                <div className="time-relative">1d ago</div>
                <div className="time-exact">Yesterday</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon icon-orange"><UserPlus size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-title">Access privilege granted</div>
                <div className="timeline-desc">Role: Evidence Officer</div>
                <div className="timeline-author">by system</div>
              </div>
              <div className="timeline-time">
                <div className="time-relative">2d ago</div>
                <div className="time-exact">24 Oct</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

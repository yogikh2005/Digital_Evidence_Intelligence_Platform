import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({ case_id: '', title: '', summary: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = () => {
    api.get('/reports/').then(res => {
      const formatted = res.data.map(r => ({
        id: r.id,
        report_id: `REP-${new Date(r.created_at).getFullYear()}-${r.id.toString().padStart(3, '0')}`,
        case_number: r.case?.case_number || 'N/A',
        title: r.title || 'Forensic Examination Report',
        author: r.generated_by?.username || 'Officer',
        role: r.generated_by?.role?.replace(/_/g, ' ') || 'Investigator',
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase(),
        date: new Date(r.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));
      setReports(formatted);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchReports();
    api.get('/cases/').then(res => setCases(res.data)).catch(console.error);
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReport.case_id) return setError('Please select an associated case.');
    setError('');
    setLoading(true);
    try {
      await api.post('/reports/', {
        case_id: parseInt(newReport.case_id, 10),
        title: newReport.title,
        summary: newReport.summary,
      });
      setShowModal(false);
      setNewReport({ case_id: '', title: '', summary: '' });
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create report. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if(status === 'Approved') return 'badge-green';
    if(status === 'Submitted') return 'badge-blue';
    if(status === 'Under Review') return 'badge-yellow';
    if(status === 'Rejected') return 'badge-red';
    return 'badge-blue'; // Draft
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.report_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Forensic &amp; Audit Reports</h1>
          <p className="page-subtitle">Official court-admissible reports, custody verification summaries, and case findings</p>
        </div>
        {['ADMIN', 'FORENSIC_OFFICER'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>
            <Plus size={18} /> Generate New Report
          </button>
        )}
      </div>

      {/* Create Report Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-dialog">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Generate Forensic Report</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Document official examination findings and case evidence</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {error && <div className="error-msg">{error}</div>}
              
              <form onSubmit={handleCreateReport}>
                <div className="input-group">
                  <label>Associated Case <span className="required">*</span></label>
                  <select 
                    required 
                    className="form-control" 
                    value={newReport.case_id} 
                    onChange={e => setNewReport({...newReport, case_id: e.target.value})}
                  >
                    <option value="">Select an associated investigation case...</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.case_number} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Report Title <span className="required">*</span></label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Digital Audio Forensic Verification & Analysis"
                    value={newReport.title} 
                    onChange={e => setNewReport({...newReport, title: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Executive Summary / Initial Findings</label>
                  <textarea 
                    rows={4}
                    className="form-control" 
                    placeholder="Enter preliminary forensic findings or evidence summaries..."
                    value={newReport.summary} 
                    onChange={e => setNewReport({...newReport, summary: e.target.value})} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }} 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Generate Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by report ID, title, case number, or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {(searchTerm || statusFilter !== 'ALL') && (
          <button 
            className="btn btn-outline" 
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th>Report ID</th>
                <th>Associated Case</th>
                <th>Report Title</th>
                <th>Generated By</th>
                <th>Submission Date</th>
                <th>Review Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, index) => (
                <tr key={r.id}>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{r.report_id}</td>
                  <td style={{ fontWeight: 500 }}>{r.case_number}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.title}</td>
                  <td>
                    <div style={{ lineHeight: 1.25 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{r.author}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.role}</div>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.84rem' }}>{r.date}</td>
                  <td><span className={`badge ${getStatusClass(r.status)}`}>{r.status}</span></td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-btn action-view" title="View Report"><Eye size={15} /></button>
                      <button className="action-btn action-download" title="Export PDF"><Download size={15} /></button>
                      {r.status === 'Draft' && <button className="action-btn action-delete" title="Delete Draft"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No investigation reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination-info">Showing {filteredReports.length} of {reports.length} reports</div>
          <div className="pagination-controls">
            <button className="page-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

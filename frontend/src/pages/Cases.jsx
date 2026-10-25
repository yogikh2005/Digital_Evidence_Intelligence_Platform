import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Folder } from 'lucide-react';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cases/').then(res => {
      const formatted = res.data.map(c => ({
        id: c.id,
        case_number: c.case_number,
        title: c.title,
        type: 'Cyber Crime',
        priority: 'Medium',
        officer: c.investigating_officer?.username || 'Unassigned',
        role: c.investigating_officer?.role?.replace('_', ' ') || 'Officer',
        status: c.status === 'OPEN' ? 'Open' : (c.status === 'UNDER_REVIEW' ? 'Under Review' : 'Closed'),
        created_on: new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }));
      setCases(formatted);
    }).catch(console.error);
  }, []);

  const getStatusClass = (status) => {
    if(status === 'Open') return 'status-open';
    if(status === 'Under Review') return 'status-review';
    return 'status-closed';
  };

  const getPriorityClass = (priority) => {
    if(priority === 'High') return 'badge-priority-high';
    if(priority === 'Medium') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.officer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'ALL' || c.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigation Cases</h1>
          <p className="page-subtitle">Track case files, assigned officers, and chain-of-custody milestones</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cases/new')}>
          <Plus size={18} /> Create Case
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by case number, title, officer..." 
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
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Closed">Closed</option>
        </select>

        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Case Types</option>
          <option value="Cyber Crime">Cyber Crime</option>
          <option value="Theft">Theft</option>
          <option value="Fraud">Fraud</option>
        </select>

        {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <button 
            className="btn btn-outline" 
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setTypeFilter('ALL'); }}
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
                <th style={{ width: '50px' }}>#</th>
                <th>Case Number</th>
                <th>Title</th>
                <th>Case Type</th>
                <th>Priority</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th>Created On</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, index) => (
                <tr key={c.id}>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: '#1d4ed8' }}>{c.case_number}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</td>
                  <td>
                    <span className="badge badge-blue">{c.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityClass(c.priority)}`}>{c.priority}</span>
                  </td>
                  <td>
                    <div style={{ lineHeight: 1.25 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{c.officer}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.role}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(c.status)}`}>{c.status}</span>
                  </td>
                  <td style={{ color: '#475569' }}>{c.created_on}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-btn action-view" title="View Evidence in Case" onClick={() => navigate('/evidence')}>
                        <Eye size={15} />
                      </button>
                      <button className="action-btn action-edit" title="Edit Case">
                        <Edit2 size={15} />
                      </button>
                      <button className="action-btn action-delete" title="Archive Case">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No investigation cases found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination-info">Showing {filteredCases.length} of {cases.length} cases</div>
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

export default Cases;

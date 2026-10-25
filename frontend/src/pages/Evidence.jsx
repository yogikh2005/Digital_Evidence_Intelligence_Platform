import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Plus, Eye, Download, Trash2, ChevronLeft, ChevronRight, FileVideo, Image as ImageIcon, FileAudio, FileText, File, Copy } from 'lucide-react';

const Evidence = () => {
  const [evidence, setEvidence] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/evidence/').then(res => {
      const formatted = res.data.map(e => ({
        id: e.id,
        filename: e.original_filename,
        file_type: e.evidence_type.charAt(0).toUpperCase() + e.evidence_type.slice(1).toLowerCase(),
        case_number: e.case?.case_number || 'N/A',
        sha: e.sha256_hash ? e.sha256_hash.substring(0, 14) + '...' : 'Pending...',
        full_sha: e.sha256_hash || '',
        status: e.status === 'UPLOADED' ? 'Uploaded' : (e.status === 'ANALYZED' ? 'Analyzed' : 'Under Review'),
        uploader: e.uploaded_by?.username || 'Officer',
        date: new Date(e.uploaded_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));
      setEvidence(formatted);
    }).catch(console.error);
  }, []);

  const getStatusClass = (status) => {
    if(status === 'Under Review') return 'status-review';
    if(status === 'Uploaded') return 'status-closed';
    if(status === 'Analyzed') return 'status-open';
    return 'status-closed';
  };

  const getFileTypeBadge = (type) => {
    if(type === 'Video') return <span className="badge badge-file-video"><FileVideo size={14}/> Video</span>;
    if(type === 'Image') return <span className="badge badge-file-image"><ImageIcon size={14}/> Image</span>;
    if(type === 'Audio') return <span className="badge badge-file-audio"><FileAudio size={14}/> Audio</span>;
    if(type === 'Document') return <span className="badge badge-file-document"><FileText size={14}/> Document</span>;
    return <span className="badge badge-file-other"><File size={14}/> Other</span>;
  };

  const copyHash = (id, hash) => {
    if (hash) {
      navigator.clipboard?.writeText(hash);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const filteredEvidence = evidence.filter(e => {
    const matchesSearch = e.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.full_sha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || e.file_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Evidence Vault</h1>
          <p className="page-subtitle">Secure repository with tamper-evident SHA-256 verification and custodial logs</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/evidence/new')}>
          <Plus size={18} /> Upload New Evidence
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by filename, case number, or SHA-256..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All File Types</option>
          <option value="Video">Video Files</option>
          <option value="Image">Image Files</option>
          <option value="Audio">Audio Files</option>
          <option value="Document">Documents</option>
        </select>

        {(searchTerm || typeFilter !== 'ALL') && (
          <button 
            className="btn btn-outline" 
            onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); }}
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
                <th>File Name</th>
                <th>Type</th>
                <th>Associated Case</th>
                <th>SHA-256 Checksum</th>
                <th>Status</th>
                <th>Uploaded By</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((e, index) => (
                <tr key={e.id}>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{e.filename}</div>
                  </td>
                  <td>{getFileTypeBadge(e.file_type)}</td>
                  <td style={{ fontWeight: 500, color: '#1d4ed8' }}>{e.case_number}</td>
                  <td>
                    <div 
                      onClick={() => copyHash(e.id, e.full_sha)}
                      title="Click to copy full SHA-256 hash"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: copiedId === e.id ? '#15803d' : '#334155'
                      }}
                    >
                      <span>{e.sha}</span>
                      <Copy size={13} color={copiedId === e.id ? '#15803d' : '#94a3b8'} />
                    </div>
                  </td>
                  <td><span className={`status-pill ${getStatusClass(e.status)}`}>{e.status}</span></td>
                  <td style={{ color: '#475569' }}>{e.uploader}</td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{e.date}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-btn action-view" title="Inspect Custody & Video" onClick={() => navigate(`/evidence/${e.id}`)}>
                        <Eye size={15} />
                      </button>
                      <button className="action-btn action-download" title="Download Original">
                        <Download size={15} />
                      </button>
                      <button className="action-btn action-delete" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvidence.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No evidence items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination-info">Showing {filteredEvidence.length} of {evidence.length} evidence items</div>
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

export default Evidence;

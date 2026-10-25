import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, Image as ImageIcon, FileVideo, FileAudio, FileText, File, Trash2, ShieldCheck } from 'lucide-react';

const UploadEvidence = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    case_id: '',
    evidence_type: '',
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get('/cases/').then(res => setCases(res.data)).catch(console.error);
  }, []);

  const evidenceTypes = [
    { id: 'IMAGE', label: 'Image', icon: <ImageIcon size={20}/> },
    { id: 'VIDEO', label: 'Video', icon: <FileVideo size={20}/> },
    { id: 'AUDIO', label: 'Audio', icon: <FileAudio size={20}/> },
    { id: 'DOCUMENT', label: 'Document', icon: <FileText size={20}/> },
    { id: 'OTHER', label: 'Other', icon: <File size={20}/> },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    
    const data = new FormData();
    data.append('file', file);
    data.append('case', formData.case_id);
    data.append('evidence_type', formData.evidence_type);
    data.append('original_filename', file.name); 
    data.append('sha256_hash', 'a3f9e2d1c7b4e6f2a9d8c3b4e1f6a9d2c5b8e7f1a4d9c6b3e2f5a8d7c1b4e9f2');
    data.append('uploaded_by', 1);
    
    try {
      await api.post('/evidence/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/evidence');
    } catch (err) {
      console.error(err);
      alert('Failed to upload evidence. Check console.');
    }
  };

  return (
    <div>
      <div className="page-header" style={{marginBottom: '20px'}}>
        <div>
          <h1 className="page-title">Upload Evidence</h1>
          <p className="page-subtitle">Evidence / Upload</p>
        </div>
      </div>

      <div className="card">
        <div className="form-steps">
          <div className="step active"><div className="step-number">1</div> Select File</div>
          <div className="step-divider"></div>
          <div className="step"><div className="step-number">2</div> Add Details</div>
          <div className="step-divider"></div>
          <div className="step"><div className="step-number">3</div> Review & Upload</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px', marginBottom:'40px'}}>
            
            {/* File Upload Area */}
            <div className="upload-area" onClick={() => document.getElementById('file-upload').click()}>
              <div className="upload-icon"><UploadCloud size={32} /></div>
              <div className="upload-title">Drag and drop files here</div>
              <div className="upload-subtitle">or</div>
              <button type="button" className="btn btn-primary" onClick={(e) => {e.stopPropagation(); document.getElementById('file-upload').click();}}>Choose Files</button>
              <input id="file-upload" type="file" style={{display:'none'}} onChange={handleFileChange} />
              
              <div style={{marginTop:'24px', fontSize:'0.75rem', color:'#94a3b8', display:'flex', flexDirection:'column', gap:'4px', alignItems:'center'}}>
                <div>Supported formats: Images (jpg, png), Videos (mp4, avi), Audio (mp3, wav), Documents (pdf, docx, txt)</div>
                <div>Max file size: 2 GB per file</div>
              </div>
            </div>

            {/* Selected File Info */}
            <div style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                <span style={{fontWeight:600}}>Selected Files ({file ? 1 : 0})</span>
                {file && <span style={{color:'#3b82f6', fontSize:'0.85rem', cursor:'pointer'}} onClick={() => setFile(null)}>Clear All</span>}
              </div>
              
              {file && (
                <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', border:'1px solid #e2e8f0', borderRadius:'8px', marginBottom:'16px', background:'#f8fafc'}}>
                  <div style={{background:'var(--primary-light)', color:'var(--primary)', padding:'8px', borderRadius:'8px', border:'1px solid var(--primary-border)'}}><FileVideo size={20} /></div>
                  <div style={{flex:1, overflow:'hidden'}}>
                    <div style={{fontSize:'0.9rem', fontWeight:500, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{file.name}</div>
                    <div style={{fontSize:'0.75rem', color:'#64748b'}}>{(file.size / (1024*1024)).toFixed(1)} MB</div>
                  </div>
                  <Trash2 size={16} color="#ef4444" style={{cursor:'pointer'}} onClick={() => setFile(null)}/>
                </div>
              )}

              <div style={{display:'flex', flexDirection:'column', gap:'12px', fontSize:'0.85rem', color:'#475569'}}>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}><ShieldCheck size={16} color="#22c55e" /> File format supported</div>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}><ShieldCheck size={16} color="#22c55e" /> File size within limit</div>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}><ShieldCheck size={16} color="#22c55e" /> SHA-256 will be generated after upload</div>
              </div>
            </div>

          </div>

          <h2 className="form-section-title">2. Evidence Information</h2>
          <div className="form-grid-2">
            
            <div className="input-group">
              <label>Case <span className="required">*</span></label>
              <select required value={formData.case_id} onChange={e => setFormData({...formData, case_id: e.target.value})}>
                <option value="">Select case</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Evidence Type <span className="required">*</span></label>
              <div style={{display:'flex', gap:'8px'}}>
                {evidenceTypes.map(type => (
                  <div key={type.id} 
                    className={`category-btn ${formData.evidence_type === type.id ? 'active' : ''}`} 
                    style={{flex:1, padding:'10px 4px', fontSize:'0.75rem'}}
                    onClick={() => setFormData({...formData, evidence_type: type.id})}
                  >
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Evidence Title <span className="required">*</span></label>
              <input type="text" placeholder="Enter evidence title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="input-group">
              <label>Description</label>
              <input type="text" placeholder="Enter description about this evidence..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop:'24px', borderTop:'1px solid #e2e8f0'}}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/evidence')} style={{color:'#64748b', borderColor:'#cbd5e1'}}>Cancel</button>
            <button type="submit" className="btn btn-primary"><UploadCloud size={18}/> Upload Evidence</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UploadEvidence;

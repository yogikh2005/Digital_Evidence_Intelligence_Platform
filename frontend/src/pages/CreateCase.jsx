import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Folder, ShieldAlert, FileText, Briefcase, RefreshCw, Calendar as CalendarIcon, Server, Shield, FileOutput, CheckCircle } from 'lucide-react';

const CreateCase = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    case_type: '',
    case_number: `CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    priority: '',
    description: '',
    incident_date: '',
    closure_date: '',
    category: '',
    forensic_officer: '',
    supervisor: '',
    location: '',
    tags: ''
  });

  useEffect(() => {
    api.get('/auth/users/').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const categories = [
    { id: 'cyber', label: 'Cyber Crime', icon: <Server size={24}/> },
    { id: 'theft', label: 'Theft', icon: <Folder size={24}/> },
    { id: 'fraud', label: 'Fraud', icon: <ShieldAlert size={24}/> },
    { id: 'forgery', label: 'Document Forgery', icon: <FileText size={24}/> },
    { id: 'other', label: 'Other', icon: <Briefcase size={24}/> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    // Final Step 4 Submission
    try {
      await api.post('/cases/', {
        case_number: formData.case_number,
        title: formData.title,
        description: formData.description,
        status: "OPEN",
        forensic_officer: formData.forensic_officer || null,
        supervisor: formData.supervisor || null
      });
      navigate('/cases');
    } catch (err) {
      console.error(err);
      alert('Failed to create case. Check console for details.');
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <h2 className="form-section-title">1. Basic Information</h2>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Case Title <span className="required">*</span></label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Case Type <span className="required">*</span></label>
                <select required value={formData.case_type} onChange={e => setFormData({...formData, case_type: e.target.value})}>
                  <option value="">Select case type</option>
                  <option>Cyber Crime</option>
                  <option>Theft</option>
                  <option>Fraud</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Case Number</label>
                <div style={{display:'flex', gap:'8px'}}>
                  <input type="text" value={formData.case_number} readOnly style={{background:'#f8fafc', color:'#64748b'}} />
                  <button type="button" className="btn btn-outline" style={{padding:'10px'}} onClick={() => setFormData({...formData, case_number: `CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`})}><RefreshCw size={18} /></button>
                </div>
              </div>
              <div className="input-group">
                <label>Priority <span className="required">*</span></label>
                <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="">Select priority</option>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <div className="input-group">
                <label>Incident Date</label>
                <input type="date" value={formData.incident_date} onChange={e => setFormData({...formData, incident_date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Expected Closure Date</label>
                <input type="date" value={formData.closure_date} onChange={e => setFormData({...formData, closure_date: e.target.value})} />
              </div>
            </div>
            <div style={{marginTop: '24px'}}>
              <label style={{display:'block', marginBottom:'12px', fontSize:'0.85rem', fontWeight:500, color:'#475569'}}>Case Category</label>
              <div className="category-grid">
                {categories.map(cat => (
                  <div key={cat.id} className={`category-btn ${formData.category === cat.id ? 'active' : ''}`} onClick={() => setFormData({...formData, category: cat.id})}>
                    {cat.icon}<span>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="form-section-title">2. Assign Officers</h2>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Assign Forensic Officer</label>
                <select value={formData.forensic_officer} onChange={e => setFormData({...formData, forensic_officer: e.target.value})}>
                  <option value="">Select Forensic Officer</option>
                  {users.filter(u => u.role === 'FORENSIC_OFFICER' || u.role === 'ADMIN').map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Assign Supervisor</label>
                <select value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})}>
                  <option value="">Select Supervisor</option>
                  {users.filter(u => u.role === 'SUPERVISOR' || u.role === 'ADMIN').map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{background:'#eff6ff', padding:'16px', borderRadius:'8px', marginTop:'24px', border:'1px solid #bfdbfe', color:'#1d4ed8'}}>
              <div style={{fontWeight:600, marginBottom:'4px'}}>Role Requirements</div>
              <div style={{fontSize:'0.85rem'}}>Forensic Officers are responsible for AI analysis of evidence. Supervisors oversee the case and approve the final Investigation Report.</div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="form-section-title">3. Additional Details</h2>
            <div className="input-group" style={{marginBottom:'24px'}}>
              <label>Detailed Description <span className="required">*</span></label>
              <textarea placeholder="Enter detailed description of the case events, suspects, and background..." rows="6" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Incident Location</label>
                <input type="text" placeholder="e.g. 123 Main St, New York" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Keywords / Tags</label>
                <input type="text" placeholder="e.g. urgent, financial, cyber" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="form-section-title">4. Review & Create</h2>
            <div style={{background:'#f8fafc', padding:'24px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
              <h3 style={{fontSize:'1rem', marginBottom:'16px'}}>Case Summary</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', fontSize:'0.9rem'}}>
                <div><strong style={{color:'#64748b'}}>Title:</strong> {formData.title}</div>
                <div><strong style={{color:'#64748b'}}>Case Number:</strong> {formData.case_number}</div>
                <div><strong style={{color:'#64748b'}}>Type:</strong> {formData.case_type}</div>
                <div><strong style={{color:'#64748b'}}>Priority:</strong> {formData.priority}</div>
                <div><strong style={{color:'#64748b'}}>Forensic Officer:</strong> {users.find(u => u.id == formData.forensic_officer)?.username || 'None Assigned'}</div>
                <div><strong style={{color:'#64748b'}}>Supervisor:</strong> {users.find(u => u.id == formData.supervisor)?.username || 'None Assigned'}</div>
              </div>
              <div style={{marginTop:'16px', fontSize:'0.9rem'}}>
                <strong style={{color:'#64748b', display:'block', marginBottom:'4px'}}>Description:</strong>
                <p style={{background:'white', padding:'12px', borderRadius:'6px', border:'1px solid #e2e8f0', margin:0}}>{formData.description}</p>
              </div>
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header" style={{marginBottom: '20px'}}>
        <div>
          <h1 className="page-title">Create Investigation Case</h1>
          <p className="page-subtitle">Investigation Cases / Create Case</p>
        </div>
      </div>

      <div className="card">
        <div className="form-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}><div className="step-number">{step > 1 ? <CheckCircle size={14}/> : '1'}</div> Basic Information</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}><div className="step-number">{step > 2 ? <CheckCircle size={14}/> : '2'}</div> Assign Officers</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}><div className="step-number">{step > 3 ? <CheckCircle size={14}/> : '3'}</div> Additional Details</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}><div className="step-number">4</div> Review & Create</div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {renderStepContent()}

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px', paddingTop:'24px', borderTop:'1px solid #e2e8f0'}}>
            {step > 1 ? (
              <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)} style={{color:'#64748b', borderColor:'#cbd5e1'}}>Back</button>
            ) : (
              <button type="button" className="btn btn-outline" onClick={() => navigate('/cases')} style={{color:'#64748b', borderColor:'#cbd5e1'}}>Cancel</button>
            )}
            <button type="submit" className="btn btn-primary">{step === 4 ? 'Create Case' : 'Next >'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateCase;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PlayCircle, ChevronLeft, ChevronRight, Download, ShieldCheck, FolderOpen, RefreshCcw, Copy, CheckCircle } from 'lucide-react';

const EvidenceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState(null);
  const [activeTab, setActiveTab] = useState('custody');

  useEffect(() => {
    setEvidence({
      id: id || '1',
      evidence_id: 'EVD-2026-0018',
      filename: 'cctv_footage_001.mp4',
      file_type: 'Video',
      case_number: 'CASE-2026-001',
      case_title: 'Cyber Fraud Investigation',
      file_size: '45.2 MB',
      sha: 'a3f9e2d1c7b4e6f2a9d8...',
      full_sha: 'a3f9e2d1c7b4e6f2a9d8c3b4e1f6a9d2c5b8e7f1a4d9c6b3e2f5a8d7c1b4e9f2',
      status: 'Uploaded',
      uploaded_by: 'Evidence Officer1',
      uploaded_on: '10 Oct 2024 14:32:10',
      description: 'CCTV footage from bank entrance showing suspect at 10:15 PM.'
    });
  }, [id]);

  if (!evidence) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{marginBottom: '20px'}}>
        <div>
          <h1 className="page-title">Evidence Details</h1>
          <p className="page-subtitle">Evidence / Evidence Details</p>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 300px', gap:'24px'}}>
        
        {/* Left Column (Video & Info & Tabs) */}
        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          
          <div className="card" style={{padding:'20px', display:'flex', gap:'24px'}}>
            {/* Video Player Mock */}
            <div style={{width: '45%', display:'flex', flexDirection:'column', gap:'12px'}}>
              <div style={{width:'100%', aspectRatio:'16/9', background:'#000', borderRadius:'8px', position:'relative', display:'flex', justifyContent:'center', alignItems:'center', overflow:'hidden'}}>
                <div style={{position:'absolute', top:'10px', right:'10px', color:'white', fontSize:'0.8rem', fontFamily:'monospace'}}>2024-10-05 22:14:36</div>
                <div style={{position:'absolute', bottom:'10px', left:'10px', color:'white', fontSize:'0.8rem', fontWeight:600}}>CAM-01</div>
                <PlayCircle size={48} color="white" style={{opacity: 0.8, cursor:'pointer'}} />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', justifyContent:'center'}}>
                <ChevronLeft size={20} color="#94a3b8" style={{cursor:'pointer'}} />
                <div style={{width:'60px', height:'40px', background:'#333', borderRadius:'4px', border:'2px solid #3b82f6'}}></div>
                <div style={{width:'60px', height:'40px', background:'#333', borderRadius:'4px', opacity:0.5}}></div>
                <div style={{width:'60px', height:'40px', background:'#333', borderRadius:'4px', opacity:0.5}}></div>
                <ChevronRight size={20} color="#94a3b8" style={{cursor:'pointer'}} />
              </div>
            </div>

            {/* Basic Info */}
            <div style={{flex: 1}}>
              <h3 style={{fontSize:'1rem', fontWeight:600, margin:'0 0 16px 0'}}>Basic Information</h3>
              <div style={{display:'grid', gridTemplateColumns:'120px 1fr', rowGap:'12px', fontSize:'0.85rem'}}>
                <div style={{color:'#64748b'}}>Evidence ID</div><div style={{fontWeight:500}}>{evidence.evidence_id}</div>
                <div style={{color:'#64748b'}}>Filename</div><div style={{fontWeight:500, color:'#1d4ed8'}}>{evidence.filename}</div>
                <div style={{color:'#64748b'}}>File Type</div><div><span className="badge badge-file-video">{evidence.file_type}</span></div>
                <div style={{color:'#64748b'}}>Case Number</div><div>{evidence.case_number}</div>
                <div style={{color:'#64748b'}}>Case Title</div><div>{evidence.case_title}</div>
                <div style={{color:'#64748b'}}>File Size</div><div>{evidence.file_size}</div>
                <div style={{color:'#64748b'}}>SHA-256</div><div style={{fontFamily:'monospace', color:'#475569'}}>{evidence.sha}</div>
                <div style={{color:'#64748b'}}>Status</div><div><span className="status-pill status-closed">{evidence.status}</span></div>
                <div style={{color:'#64748b'}}>Uploaded By</div><div>{evidence.uploaded_by}</div>
                <div style={{color:'#64748b'}}>Uploaded On</div><div>{evidence.uploaded_on}</div>
                <div style={{color:'#64748b'}}>Description</div><div style={{color:'#475569', lineHeight:1.4}}>{evidence.description}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div style={{display:'flex', borderBottom:'1px solid #e2e8f0'}}>
              <div onClick={()=>setActiveTab('custody')} style={{padding:'16px 24px', fontSize:'0.9rem', fontWeight:600, color: activeTab==='custody' ? '#1d4ed8' : '#64748b', borderBottom: activeTab==='custody' ? '2px solid #1d4ed8' : 'none', cursor:'pointer'}}>Chain of Custody</div>
              <div onClick={()=>setActiveTab('analysis')} style={{padding:'16px 24px', fontSize:'0.9rem', fontWeight:500, color: activeTab==='analysis' ? '#1d4ed8' : '#64748b', borderBottom: activeTab==='analysis' ? '2px solid #1d4ed8' : 'none', cursor:'pointer'}}>Analysis Results</div>
              <div onClick={()=>setActiveTab('metadata')} style={{padding:'16px 24px', fontSize:'0.9rem', fontWeight:500, color: activeTab==='metadata' ? '#1d4ed8' : '#64748b', borderBottom: activeTab==='metadata' ? '2px solid #1d4ed8' : 'none', cursor:'pointer'}}>Metadata</div>
            </div>
            <div style={{padding:'24px'}}>
              {activeTab === 'custody' && (
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-icon icon-green"><ShieldCheck size={16} /></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Uploaded</div>
                      <div className="timeline-desc">10 Oct 2024 14:32:10<br/>by Evidence Officer1</div>
                      <div className="timeline-author">Evidence file uploaded to the system.</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-icon icon-blue"><PlayCircle size={16} /></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Assigned for Analysis</div>
                      <div className="timeline-desc">10 Oct 2024 15:05:22<br/>by Forensic Officer1</div>
                      <div className="timeline-author">Sent to AI analysis agents.</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-icon icon-orange"><RefreshCcw size={16} /></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Analysis Completed</div>
                      <div className="timeline-desc">10 Oct 2024 17:20:18<br/>by System</div>
                      <div className="timeline-author">AI analysis completed. Results available.</div>
                    </div>
                  </div>
                  <div className="timeline-item" style={{marginBottom: 0}}>
                    <div className="timeline-icon icon-purple"><CheckCircle size={16} /></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Reviewed</div>
                      <div className="timeline-desc">11 Oct 2024 09:15:44<br/>by Forensic Officer1</div>
                      <div className="timeline-author">Evidence reviewed and validated.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Actions) */}
        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          
          <div className="card" style={{padding:'24px'}}>
            <h3 style={{fontSize:'1rem', fontWeight:600, margin:'0 0 16px 0'}}>Actions</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <button className="btn btn-primary" style={{width:'100%'}}><Download size={18}/> Download Evidence</button>
              <button className="btn btn-outline" style={{width:'100%', borderColor:'#cbd5e1', color:'#3b82f6'}}><ShieldCheck size={18}/> Verify Hash</button>
              <button className="btn btn-outline" style={{width:'100%', borderColor:'#cbd5e1', color:'#3b82f6'}}><FolderOpen size={18}/> View in Case</button>
              <button className="btn btn-outline" style={{width:'100%', borderColor:'#cbd5e1', color:'#3b82f6'}}><RefreshCcw size={18}/> Request Re-analysis</button>
            </div>
          </div>

          <div className="card" style={{padding:'24px'}}>
            <h3 style={{fontSize:'1rem', fontWeight:600, margin:'0 0 16px 0'}}>Integrity Verification</h3>
            <div style={{fontSize:'0.85rem', fontWeight:500, color:'#475569', marginBottom:'8px'}}>SHA-256 Hash</div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'6px', background:'#f8fafc', marginBottom:'16px'}}>
              <span style={{fontFamily:'monospace', fontSize:'0.8rem', color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1}}>{evidence.full_sha}</span>
              <Copy size={16} color="#94a3b8" style={{cursor:'pointer'}} />
            </div>
            <div style={{display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px', background:'#f0fdf4', borderRadius:'8px', border:'1px solid #bbf7d0'}}>
              <CheckCircle size={20} color="#22c55e" style={{flexShrink:0}} />
              <div>
                <div style={{fontSize:'0.9rem', fontWeight:600, color:'#166534', marginBottom:'2px'}}>Integrity Verified</div>
                <div style={{fontSize:'0.75rem', color:'#15803d'}}>File hash matches the stored value.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default EvidenceDetails;

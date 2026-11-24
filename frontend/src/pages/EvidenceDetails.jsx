import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ChevronLeft, Download, ShieldCheck, FolderOpen, RefreshCcw,
  Copy, CheckCircle, Mic, Brain, AlertTriangle, Clock, User,
  FileAudio, FileText, FileVideo, Image as ImageIcon, File,
  Loader, ChevronDown, ChevronUp, MapPin, Calendar, Users,
  MessageSquare, Info, CheckSquare
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────── */
const fmt = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) : '—';

const typeIcon = (t) => {
  if (!t) return <File size={20} />;
  const u = t.toUpperCase();
  if (u === 'AUDIO') return <FileAudio size={20} />;
  if (u === 'VIDEO') return <FileVideo size={20} />;
  if (u === 'IMAGE') return <ImageIcon size={20} />;
  if (u === 'DOCUMENT') return <FileText size={20} />;
  return <File size={20} />;
};

const statusColor = (s) => {
  const m = { UPLOADED: '#64748b', PROCESSING: '#d97706', ANALYZED: '#16a34a', REVIEWED: '#1d4ed8' };
  return m[s] || '#64748b';
};

const actionColor = (action) => {
  if (action?.includes('INTEGRITY_MISMATCH')) return '#ef4444';
  if (action?.includes('INTEGRITY') || action?.includes('VERIFIED')) return '#16a34a';
  if (action?.includes('AUDIO')) return '#7c3aed';
  if (action?.includes('REVIEW')) return '#1d4ed8';
  if (action?.includes('UPLOAD')) return '#059669';
  return '#475569';
};

/* ─── Tab: Chain of Custody ───────────────────────────────── */
const CustodyTab = ({ custodyRecords, loading }) => {
  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading custody records…</div>;
  if (!custodyRecords.length) return <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No custody records yet.</div>;

  return (
    <div className="timeline">
      {custodyRecords.map((r, i) => (
        <div key={r.id} className="timeline-item" style={{ marginBottom: i === custodyRecords.length - 1 ? 0 : undefined }}>
          <div className="timeline-icon" style={{ background: `${actionColor(r.action)}18`, color: actionColor(r.action), border: `1.5px solid ${actionColor(r.action)}30` }}>
            <ShieldCheck size={15} />
          </div>
          <div className="timeline-content">
            <div className="timeline-title" style={{ color: actionColor(r.action) }}>{r.action?.replace(/_/g, ' ')}</div>
            <div className="timeline-desc">{fmtDate(r.timestamp)}<br />by {r.username} ({r.role?.replace(/_/g, ' ')})</div>
            {r.hash_value && (
              <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', wordBreak: 'break-all' }}>
                SHA-256: {r.hash_value.substring(0, 32)}…
              </div>
            )}
            {r.ip_address && (
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IP: {r.ip_address}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Tab: Audio Analysis ─────────────────────────────────── */
const AudioTab = ({ evidenceId, evidence, onStatusChange }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(true);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [expandedSegments, setExpandedSegments] = useState(false);

  const fetchResult = useCallback(async () => {
    setLoadingResult(true);
    try {
      const res = await api.get(`/evidence/${evidenceId}/audio-analysis/`);
      setAnalysisResult(res.data);
    } catch (e) {
      if (e.response?.status !== 404) {
        setError('Failed to load saved analysis.');
      }
      setAnalysisResult(null);
    } finally {
      setLoadingResult(false);
    }
  }, [evidenceId]);

  useEffect(() => { fetchResult(); }, [fetchResult]);

  const handleTranscribe = async () => {
    setError('');
    setTranscribing(true);
    try {
      const res = await api.post(`/evidence/${evidenceId}/transcribe-audio/`);
      setAnalysisResult(prev => ({ ...prev, transcription: res.data.transcription }));
    } catch (e) {
      setError(e.response?.data?.detail || 'Transcription failed. Is the audio file accessible?');
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setAnalyzing(true);
    try {
      const res = await api.post(`/evidence/${evidenceId}/analyze-audio/`);
      setAnalysisResult(res.data);
      onStatusChange('ANALYZED');
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Ensure Ollama is running with qwen3:4b.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingResult) return (
    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading analysis…
    </div>
  );

  const analysis = analysisResult?.analysis;
  const transcription = analysisResult?.transcription;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#7c3aed', color: '#7c3aed' }}
          onClick={handleTranscribe}
          disabled={transcribing || analyzing}
        >
          {transcribing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Mic size={16} />}
          {transcribing ? 'Transcribing…' : 'Transcribe Audio'}
        </button>

        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          onClick={handleAnalyze}
          disabled={transcribing || analyzing}
        >
          {analyzing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
          {analyzing ? 'AI Analyzing…' : 'Run Full AI Analysis'}
        </button>

        {analysisResult && (
          <button
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
            onClick={fetchResult}
          >
            <RefreshCcw size={15} /> Refresh
          </button>
        )}
      </div>

      {/* Warning about Ollama */}
      <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', fontSize: '0.82rem', color: '#92400e', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong>AI Analysis requires Ollama locally.</strong> Run <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: '3px' }}>ollama serve</code> and ensure <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: '3px' }}>qwen3:4b</code> is pulled. Transcription uses <strong>faster-whisper</strong> (CPU).
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* No result yet */}
      {!analysisResult && !error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
          <Brain size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>No analysis yet</div>
          <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>Click "Run Full AI Analysis" to transcribe and analyse this audio evidence.</div>
        </div>
      )}

      {/* Transcription result */}
      {transcription && (
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontWeight: 700, color: '#6d28d9', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Mic size={16} /> Transcription
            </div>
            <div style={{ fontSize: '0.78rem', color: '#8b5cf6', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px' }}>
              Language: <strong>{transcription.language}</strong> ({Math.round((transcription.language_probability || 0) * 100)}% confidence)
            </div>
          </div>

          {/* Full text */}
          <div style={{ background: 'white', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '14px', fontSize: '0.9rem', lineHeight: 1.7, color: '#1e1b4b', marginBottom: '12px', maxHeight: '160px', overflowY: 'auto' }}>
            {transcription.full_text || <em style={{ color: '#94a3b8' }}>No speech detected.</em>}
          </div>

          {/* Segments */}
          {transcription.segments?.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedSegments(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                {expandedSegments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expandedSegments ? 'Hide' : 'Show'} {transcription.segments.length} timed segments
              </button>

              {expandedSegments && (
                <div style={{ marginTop: '10px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {transcription.segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.82rem', padding: '6px 10px', background: 'white', borderRadius: '6px', border: '1px solid #ede9fe' }}>
                      <span style={{ color: '#8b5cf6', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {seg.start.toFixed(1)}s – {seg.end.toFixed(1)}s
                      </span>
                      <span style={{ color: '#1e1b4b' }}>{seg.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Analysis result */}
      {analysis && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontWeight: 700, color: '#1d4ed8', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <Brain size={16} /> AI Forensic Analysis
            {analysisResult.processed_hash && (
              <span style={{ fontSize: '0.72rem', color: '#3b82f6', background: '#dbeafe', padding: '2px 8px', borderRadius: '20px', marginLeft: 'auto', fontFamily: 'monospace' }}>
                SHA: {analysisResult.processed_hash.substring(0, 16)}…
              </span>
            )}
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3b82f6', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Info size={13} /> SUMMARY
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.6 }}>{analysis.summary}</div>
            </div>
          )}

          {/* Grid of findings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {analysis.people_mentioned?.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <Users size={13} /> PEOPLE MENTIONED
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#1e3a8a', lineHeight: 1.7 }}>
                  {analysis.people_mentioned.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {analysis.locations_mentioned?.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <MapPin size={13} /> LOCATIONS
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#1e3a8a', lineHeight: 1.7 }}>
                  {analysis.locations_mentioned.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            )}

            {analysis.dates_and_times?.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <Calendar size={13} /> DATES & TIMES
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#1e3a8a', lineHeight: 1.7 }}>
                  {analysis.dates_and_times.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {analysis.key_statements?.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <MessageSquare size={13} /> KEY STATEMENTS
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#1e3a8a', lineHeight: 1.7 }}>
                  {analysis.key_statements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {analysis.uncertainties?.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', marginBottom: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <AlertTriangle size={13} /> UNCERTAINTIES
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#92400e', lineHeight: 1.7 }}>
                  {analysis.uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </div>
            )}

            {/* Human review flag */}
            <div style={{ background: analysis.requires_human_review ? '#fef2f2' : '#f0fdf4', border: `1px solid ${analysis.requires_human_review ? '#fca5a5' : '#bbf7d0'}`, borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckSquare size={18} color={analysis.requires_human_review ? '#dc2626' : '#16a34a'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: analysis.requires_human_review ? '#991b1b' : '#166534' }}>
                  {analysis.requires_human_review ? 'Human Review Required' : 'No Review Required'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>AI confidence assessment</div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(analysisResult.created_at || analysisResult.updated_at) && (
            <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '16px' }}>
              {analysisResult.created_at && <span>Analyzed: {fmtDate(analysisResult.created_at)}</span>}
              {analysisResult.updated_at && <span>Updated: {fmtDate(analysisResult.updated_at)}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Tab: Metadata ─────────────────────────────────────────── */
const MetadataTab = ({ evidence }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
    {[
      ['Evidence ID', `#${evidence.id}`],
      ['Original Filename', evidence.original_filename],
      ['Evidence Type', evidence.evidence_type],
      ['MIME Type', evidence.mime_type || '—'],
      ['File Size', fmt(evidence.file_size)],
      ['Status', evidence.status],
      ['Uploaded By', `User #${evidence.uploaded_by}`],
      ['Uploaded At', fmtDate(evidence.uploaded_at)],
      ['Case ID', `#${evidence.case}`],
      ['Forensic Reviewer', evidence.forensic_reviewer ? `User #${evidence.forensic_reviewer}` : 'Not reviewed'],
    ].map(([label, value]) => (
      <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#0f172a', fontWeight: 500, wordBreak: 'break-all' }}>{value}</div>
      </div>
    ))}
    <div style={{ gridColumn: '1/-1', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>SHA-256 Hash</div>
      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1d4ed8', wordBreak: 'break-all' }}>{evidence.sha256_hash}</div>
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────── */
const EvidenceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState(null);
  const [custodyRecords, setCustodyRecords] = useState([]);
  const [custodyLoading, setCustodyLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('custody');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pageError, setPageError] = useState('');

  /* Fetch evidence detail */
  useEffect(() => {
    api.get(`/evidence/${id}/`)
      .then(res => {
        setEvidence(res.data);
        // Auto-open audio tab if audio evidence
        if (res.data.evidence_type === 'AUDIO') setActiveTab('analysis');
      })
      .catch(() => setPageError('Evidence not found or access denied.'));
  }, [id]);

  /* Fetch custody chain */
  useEffect(() => {
    api.get(`/custody/evidence/${id}/`)
      .then(res => setCustodyRecords(res.data))
      .catch(() => setCustodyRecords([]))
      .finally(() => setCustodyLoading(false));
  }, [id]);

  const copyHash = () => {
    if (evidence?.sha256_hash) {
      navigator.clipboard?.writeText(evidence.sha256_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.post(`/evidence/${id}/verify-integrity/`);
      setVerifyResult(res.data);
      // Refresh custody chain after verification
      const c = await api.get(`/custody/evidence/${id}/`);
      setCustodyRecords(c.data);
    } catch (e) {
      setVerifyResult({ integrity_verified: false, message: e.response?.data?.detail || 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  if (pageError) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
      <AlertTriangle size={36} style={{ marginBottom: '12px' }} />
      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{pageError}</div>
      <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => navigate('/evidence')}>← Back to Evidence</button>
    </div>
  );

  if (!evidence) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
      <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ marginTop: '12px' }}>Loading evidence…</div>
    </div>
  );

  const isAudio = evidence.evidence_type === 'AUDIO';

  /* Tab config */
  const tabs = [
    { key: 'custody', label: 'Chain of Custody', icon: <ShieldCheck size={15} /> },
    ...(isAudio ? [{ key: 'analysis', label: 'Audio Analysis', icon: <Brain size={15} />, badge: evidence.status === 'ANALYZED' ? '✓' : null }] : []),
    { key: 'metadata', label: 'Metadata', icon: <FileText size={15} /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Evidence Details</h1>
          <p className="page-subtitle">
            <span style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/evidence')}>Evidence</span>
            {' / '}
            <span style={{ color: '#1d4ed8' }}>{evidence.original_filename}</span>
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Evidence info card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

              {/* Type icon */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px', flexShrink: 0,
                background: isAudio ? '#faf5ff' : '#eff6ff',
                border: `1.5px solid ${isAudio ? '#e9d5ff' : '#bfdbfe'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isAudio ? '#7c3aed' : '#1d4ed8'
              }}>
                {typeIcon(evidence.evidence_type)}
              </div>

              {/* Info grid */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {evidence.original_filename}
                  </h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: `${statusColor(evidence.status)}15`,
                    color: statusColor(evidence.status),
                    border: `1px solid ${statusColor(evidence.status)}30`
                  }}>
                    {evidence.status}
                  </span>
                  {isAudio && (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                      🎙 Audio Evidence
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.83rem' }}>
                  {[
                    ['Type', evidence.evidence_type],
                    ['Size', fmt(evidence.file_size)],
                    ['Case', `#${evidence.case}`],
                    ['Uploaded By', `User #${evidence.uploaded_by}`],
                    ['Uploaded At', fmtDate(evidence.uploaded_at)],
                    ['MIME', evidence.mime_type || '—'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>{l}</div>
                      <div style={{ color: '#0f172a', fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs panel */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
              {tabs.map(tab => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '14px 22px', fontSize: '0.88rem', fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? '#1d4ed8' : '#64748b',
                    borderBottom: activeTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', userSelect: 'none',
                    transition: 'color 0.15s'
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.badge && <span style={{ background: '#16a34a', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</span>}
                </div>
              ))}
            </div>

            <div style={{ padding: '24px' }}>
              {activeTab === 'custody' && (
                <CustodyTab custodyRecords={custodyRecords} loading={custodyLoading} />
              )}
              {activeTab === 'analysis' && isAudio && (
                <AudioTab
                  evidenceId={id}
                  evidence={evidence}
                  onStatusChange={(newStatus) => setEvidence(prev => ({ ...prev, status: newStatus }))}
                />
              )}
              {activeTab === 'metadata' && (
                <MetadataTab evidence={evidence} />
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column (Actions) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Actions */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={evidence.file}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={16} /> Download Evidence
              </a>
              <button
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => navigate('/evidence')}
              >
                <FolderOpen size={16} /> Back to Evidence Vault
              </button>
              {isAudio && (
                <button
                  className="btn btn-outline"
                  style={{ width: '100%', borderColor: '#7c3aed', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setActiveTab('analysis')}
                >
                  <Brain size={16} /> Open Audio Analysis
                </button>
              )}
            </div>
          </div>

          {/* Integrity Verification */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>Integrity Verification</h3>

            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>SHA-256 Hash</div>
            <div
              onClick={copyHash}
              title="Click to copy"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
                border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc',
                marginBottom: '14px', cursor: 'pointer'
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {evidence.sha256_hash}
              </span>
              {copied
                ? <CheckCircle size={14} color="#16a34a" />
                : <Copy size={14} color="#94a3b8" />
              }
            </div>

            <button
              className="btn btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleVerifyIntegrity}
              disabled={verifying}
            >
              {verifying
                ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
                : <><ShieldCheck size={15} /> Verify Hash Now</>
              }
            </button>

            {verifyResult && (
              <div style={{
                marginTop: '12px', padding: '12px', borderRadius: '8px',
                background: verifyResult.integrity_verified ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${verifyResult.integrity_verified ? '#bbf7d0' : '#fca5a5'}`,
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                {verifyResult.integrity_verified
                  ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                  : <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                }
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: verifyResult.integrity_verified ? '#166534' : '#991b1b' }}>
                    {verifyResult.integrity_verified ? 'Integrity Verified ✓' : 'Integrity Mismatch!'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                    {verifyResult.message}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="card" style={{ padding: '20px', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 12px 0', color: '#475569' }}>Evidence Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              {['UPLOADED', 'PROCESSING', 'ANALYZED', 'REVIEWED'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: evidence.status === s ? statusColor(s) : '#e2e8f0'
                  }} />
                  <span style={{ color: evidence.status === s ? statusColor(s) : '#94a3b8', fontWeight: evidence.status === s ? 700 : 400 }}>
                    {s}
                  </span>
                  {evidence.status === s && <CheckCircle size={12} color={statusColor(s)} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EvidenceDetails;

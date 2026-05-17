'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';

const sectionColors = {
  qualifier: '#7C9885',
  markers: '#C17F5A',
  competencies: '#5A7BA6',
  metrics: '#8B6BAE',
  summary: '#B85C6E',
};

function MarkerBadge({ label }) {
  const colors = {
    'OBSERVED': { bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
    'NOT OBSERVED': { bg: '#FFEBEE', color: '#C62828', border: '#EF9A9A' },
    'INSUFFICIENT EVIDENCE': { bg: '#FFF8E1', color: '#F57F17', border: '#FFE082' },
  };
  const style = colors[label] || colors['INSUFFICIENT EVIDENCE'];
  return (
    <span style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function ScoreDots({ score }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i <= score ? sectionColors.competencies : '#DDD' }} />
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ display: 'inline-flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: sectionColors.markers, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <p style={{ color: '#8B7355', fontSize: 14, marginTop: 20, fontFamily: 'Georgia, serif' }}>Analyzing session against ICF standards...</p>
      <p style={{ color: '#B5A090', fontSize: 12, marginTop: 4 }}>This may take 30–60 seconds for a full session</p>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>
    </div>
  );
}

function cleanText(text) {
  return text.replace(/^#{1,4}\s*/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/^---+$/gm, '').trim();
}

function parseAnalysis(text) {
  const sections = { qualifier: '', markers: '', competencies: '', metrics: '', summary: '' };
  const s1 = text.indexOf('SECTION 1');
  const s2 = text.indexOf('SECTION 2');
  const s3 = text.indexOf('SECTION 3');
  const s4 = text.indexOf('SECTION 4');
  const s5 = text.indexOf('SECTION 5');
  if (s1 !== -1) sections.qualifier = text.slice(s1, s2 !== -1 ? s2 : undefined).replace(/SECTION 1[^\n]*/,'').trim();
  if (s2 !== -1) sections.markers = text.slice(s2, s3 !== -1 ? s3 : undefined).replace(/SECTION 2[^\n]*/,'').trim();
  if (s3 !== -1) sections.competencies = text.slice(s3, s4 !== -1 ? s4 : undefined).replace(/SECTION 3[^\n]*/,'').trim();
  if (s4 !== -1) sections.metrics = text.slice(s4, s5 !== -1 ? s5 : undefined).replace(/SECTION 4[^\n]*/,'').trim();
  if (s5 !== -1) sections.summary = text.slice(s5).replace(/SECTION 5[^\n]*/,'').trim();
  return sections;
}

function renderContent(content) {
  const lines = cleanText(content).split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line === '---') { i++; continue; }
    const markerMatch = line.match(/^(\d+\.\d+[^:]*?)[-–:]\s*(OBSERVED|NOT OBSERVED|INSUFFICIENT EVIDENCE)\s*$/i);
    if (markerMatch) {
      elements.push(
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0E8DE' }}>
          <span style={{ color: '#5C4A36', fontSize: 13, flex: 1 }}>{markerMatch[1].trim()}</span>
          <MarkerBadge label={markerMatch[2].toUpperCase()} />
        </div>
      );
      i++; continue;
    }
    const statusOnly = line.match(/^(OBSERVED|NOT OBSERVED|INSUFFICIENT EVIDENCE)$/i);
    if (statusOnly) {
      elements.push(<div key={i} style={{ marginBottom: 4 }}><MarkerBadge label={statusOnly[1].toUpperCase()} /></div>);
      i++; continue;
    }
    const scoreInline = line.match(/Score[:\s]+(\d)/i);
    if (line.match(/^\d+\.\s+[A-Z]/) && !line.startsWith('-')) {
      const score = scoreInline ? parseInt(scoreInline[1]) : null;
      elements.push(
        <div key={i} style={{ background: '#F5EDE0', border: '1px solid #E8D5BC', borderRadius: 10, padding: '10px 14px', margin: '10px 0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#4A3728', fontSize: 14, fontWeight: 700 }}>{line.replace(/Score[:\s]+\d/i, '').replace(/[-–:]\s*$/, '').trim()}</span>
          {score && <ScoreDots score={score} />}
        </div>
      );
      i++; continue;
    }
    if (line.match(/^Score[:\s]+\d/i)) {
      const score = parseInt(line.match(/(\d)/)[1]);
      elements.push(
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 8px' }}>
          <span style={{ color: '#8B7355', fontSize: 12, fontWeight: 600 }}>Score</span>
          <ScoreDots score={score} />
          <span style={{ color: '#8B7355', fontSize: 12 }}>({score}/5)</span>
        </div>
      );
      i++; continue;
    }
    if (line.match(/^[A-Z][A-Z\s]+:?$/) && line.length < 60) {
      elements.push(<h4 key={i} style={{ color: '#7C5A3A', fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, margin: '16px 0 6px', borderBottom: '1px solid #E8D5BC', paddingBottom: 4 }}>{line.replace(/:$/, '')}</h4>);
      i++; continue;
    }
    if (line.match(/^[A-Z][a-zA-Z\s]+:$/) && line.length < 60) {
      elements.push(<p key={i} style={{ color: '#7C5A3A', fontSize: 12, fontWeight: 700, margin: '10px 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{line.replace(/:$/, '')}</p>);
      i++; continue;
    }
    if (line.startsWith('-') || line.startsWith('•')) {
      elements.push(<p key={i} style={{ color: '#6B5744', fontSize: 13, lineHeight: 1.7, paddingLeft: 16, margin: '3px 0', borderLeft: '2px solid #E8D5BC' }}>{line.replace(/^[-•]\s*/, '')}</p>);
      i++; continue;
    }
    if (line.match(/^\d+\.\s/) && line.length < 100) {
      elements.push(<div key={i} style={{ background: '#FDF8F2', border: '1px solid #E8D5BC', borderRadius: 8, padding: '8px 12px', margin: '6px 0' }}><span style={{ color: '#5C4A36', fontSize: 13, fontWeight: 600 }}>{line}</span></div>);
      i++; continue;
    }
    elements.push(<p key={i} style={{ color: '#5C4A36', fontSize: 13, lineHeight: 1.75, margin: '4px 0' }}>{line}</p>);
    i++;
  }
  return elements;
}

function AnalysisReport({ text }) {
  const sections = parseAnalysis(text);
  const [activeTab, setActiveTab] = useState('markers');
  const tabs = [
    { id: 'qualifier', label: '✓ Qualifiers', color: sectionColors.qualifier },
    { id: 'markers', label: '📋 PCC Markers', color: sectionColors.markers },
    { id: 'competencies', label: '⭐ Competencies', color: sectionColors.competencies },
    { id: 'metrics', label: '📊 Metrics', color: sectionColors.metrics },
    { id: 'summary', label: '🎯 Summary', color: sectionColors.summary },
  ];
  return (
    <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, overflow: 'hidden', marginTop: 24 }}>
      <div style={{ background: '#F5EDE0', padding: '20px 24px', borderBottom: '1px solid #E8D5BC' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 22, margin: 0 }}>Session Analysis Report</h2>
        <p style={{ color: '#8B7355', fontSize: 13, margin: '4px 0 0' }}>ICF PCC Marker & Core Competency Assessment</p>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #E8D5BC', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '12px 18px', background: activeTab === tab.id ? '#FFFAF5' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent', color: activeTab === tab.id ? tab.color : '#8B7355', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 24, maxHeight: 600, overflowY: 'auto' }}>
        {renderContent(sections[activeTab] || 'No content available for this section.')}
      </div>
    </div>
  );
}

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setAnalysis('');
    setSavedMessage('');
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    const data = await response.json();
    setAnalysis(data.analysis);
    setLoading(false);

    // Auto-save to Supabase
    if (user) {
      const { error } = await supabase.from('sessions').insert({
        user_id: user.id,
        transcript,
        analysis: data.analysis,
      });
      if (!error) setSavedMessage('✓ Session saved to your history');
    }
  };

  if (!user) return null;

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, color: '#3D2B1F', margin: 0, letterSpacing: -1 }}>
              Coach<span style={{ color: sectionColors.markers }}>Lens</span>
            </h1>
            <p style={{ color: '#8B7355', fontSize: 16, marginTop: 4, margin: '4px 0 0' }}>ICF Coaching Session Analyzer · PCC Marker Assessment</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/sessions" style={{ color: '#8B6240', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>My Sessions</a>
          <a href="/dashboard" style={{ color: '#8B6240', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Dashboard</a>
            <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid #D9C9B3', borderRadius: 10, padding: '8px 16px', color: '#8B7355', fontSize: 13, cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>

        <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(100,70,40,0.08)' }}>
          <label style={{ display: 'block', color: '#5C4A36', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
            Paste your coaching session transcript
          </label>
          <textarea
            style={{ width: '100%', height: 220, border: '1px solid #D9C9B3', borderRadius: 12, padding: 16, fontSize: 13, color: '#5C4A36', background: '#FDF8F2', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            placeholder="Coach: What would you like to focus on today?&#10;Client: I've been struggling with..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
          <button
            onClick={analyzeTranscript}
            disabled={loading || !transcript.trim()}
            style={{ marginTop: 14, width: '100%', background: loading ? '#C4A882' : '#8B6240', color: '#FFF', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.3, transition: 'background 0.2s' }}>
            {loading ? '⏳ Analyzing session...' : '🔍 Analyze Session'}
          </button>
          {savedMessage && <p style={{ color: '#2E7D32', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{savedMessage}</p>}
        </div>

        {loading && (
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, marginTop: 24 }}>
            <LoadingSpinner />
          </div>
        )}

        {analysis && !loading && <AnalysisReport text={analysis} />}
      </div>
    </main>
  );
}
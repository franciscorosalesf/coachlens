'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

const sectionColors = {
  qualifier: '#7C9885',
  markers: '#C17F5A',
  competencies: '#5A7BA6',
  metrics: '#8B6BAE',
  summary: '#B85C6E',
};

const competencyNames = [
  'Ethical Practice',
  'Coaching Mindset',
  'Agreements',
  'Trust & Safety',
  'Presence',
  'Active Listening',
  'Evokes Awareness',
  'Client Growth',
];

function extractScores(analysis) {
  const scores = {};
  const lines = analysis.split('\n');
  let compIndex = 0;
  for (const line of lines) {
    const scoreMatch = line.match(/Score[:\s]+(\d)/i);
    if (scoreMatch && compIndex < 8) {
      scores[competencyNames[compIndex]] = parseInt(scoreMatch[1]);
      compIndex++;
    }
  }
  return scores;
}

function extractMarkerCounts(analysis) {
  const observed = (analysis.match(/\bOBSERVED\b/g) || []).length;
  const notObserved = (analysis.match(/NOT OBSERVED/g) || []).length;
  return { observed, notObserved };
}

function extractTalkRatio(analysis) {
  const match = analysis.match(/Coach[:\s]+(\d+)%/i);
  return match ? parseInt(match[1]) : null;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export default function DashboardPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
  
    useEffect(() => {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) window.location.href = '/login';
        else fetchSessions(data.user.id);
      });
    }, []);
  
    const fetchSessions = async (userId) => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      setSessions(data || []);
      setLoading(false);
    };
  
    if (loading) return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8B7355', fontFamily: 'Georgia, serif', fontSize: 18 }}>Loading your dashboard...</p>
      </main>
    );
  
    if (sessions.length < 2) return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#3D2B1F' }}>Growth Dashboard</h1>
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 40, marginTop: 24 }}>
            <p style={{ fontSize: 48, margin: 0 }}>📈</p>
            <p style={{ color: '#5C4A36', fontSize: 16, fontFamily: 'Georgia, serif', margin: '16px 0 8px' }}>Analyze at least 2 sessions to see your growth trends</p>
            <a href="/" style={{ display: 'inline-block', marginTop: 20, background: '#8B6240', color: '#FFF', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Analyze a Session</a>
          </div>
        </div>
      </main>
    );
  
    const competencyData = sessions.map((s, i) => {
      const scores = extractScores(s.analysis);
      return { name: formatDate(s.created_at), session: i + 1, ...scores };
    });
  
    const markerData = sessions.map((s, i) => {
      const counts = extractMarkerCounts(s.analysis);
      return { name: formatDate(s.created_at), ...counts };
    });
  
    const latestScores = extractScores(sessions[sessions.length - 1].analysis);
    const radarData = competencyNames.map(name => ({
      competency: name.split(' ')[0],
      score: latestScores[name] || 0,
      fullMark: 5,
    }));
  
    const avgScores = competencyNames.map(name => {
      const vals = sessions.map(s => extractScores(s.analysis)[name]).filter(Boolean);
      return { name, avg: vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0 };
    });
  
    const latestCounts = extractMarkerCounts(sessions[sessions.length - 1].analysis);
    const latestAvg = (Object.values(latestScores).reduce((a, b) => a + b, 0) / 8).toFixed(1);
  
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#3D2B1F', margin: 0 }}>Growth Dashboard</h1>
              <p style={{ color: '#8B7355', fontSize: 14, marginTop: 4 }}>Tracking your development across {sessions.length} sessions</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/sessions" style={{ color: '#8B6240', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 16px', border: '1px solid #D9C9B3', borderRadius: 10 }}>My Sessions</a>
              <a href="/" style={{ background: '#8B6240', color: '#FFF', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>+ New Analysis</a>
            </div>
          </div>
  
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Sessions Analyzed', value: sessions.length, icon: '📋' },
              { label: 'Avg Overall Score', value: latestAvg + '/5', icon: '⭐' },
              { label: 'Markers Observed', value: latestCounts.observed + '/37', icon: '✓' },
            ].map((card, i) => (
              <div key={i} style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 32, margin: 0 }}>{card.icon}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#3D2B1F', margin: '8px 0 4px', fontWeight: 700 }}>{card.value}</p>
                <p style={{ color: '#8B7355', fontSize: 13, margin: 0 }}>{card.label}</p>
              </div>
            ))}
          </div>
  
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 20, margin: '0 0 20px' }}>Competency Scores Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={competencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DE" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8B7355' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#8B7355' }} />
                <Tooltip contentStyle={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {competencyNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name} stroke={`hsl(${i * 45}, 50%, 50%)`} strokeWidth={2} dot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
  
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 20, margin: '0 0 20px' }}>PCC Marker Trends</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={markerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DE" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B7355' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8B7355' }} />
                  <Tooltip contentStyle={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="observed" name="Observed" fill="#7C9885" radius={[4,4,0,0]} />
                  <Bar dataKey="notObserved" name="Not Observed" fill="#B85C6E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
  
            <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 20, margin: '0 0 20px' }}>Latest Session Profile</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E8D5BC" />
                  <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: '#8B7355' }} />
                  <Radar name="Score" dataKey="score" stroke={sectionColors.competencies} fill={sectionColors.competencies} fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 20, margin: '0 0 20px' }}>Average Competency Scores</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={avgScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DE" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#8B7355' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8B7355' }} width={110} />
                <Tooltip contentStyle={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 8 }} />
                <Bar dataKey="avg" name="Avg Score" fill={sectionColors.competencies} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
  
        </div>
      </main>
    );
  }
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
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
      .order('created_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#3D2B1F', margin: 0 }}>
              My Sessions
            </h1>
            <p style={{ color: '#8B7355', fontSize: 14, marginTop: 4 }}>Your coaching session history</p>
          </div>
          <a href="/" style={{ background: '#8B6240', color: '#FFF', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            + New Analysis
          </a>
        </div>

        {loading && <p style={{ color: '#8B7355', textAlign: 'center' }}>Loading sessions...</p>}

        {!loading && sessions.length === 0 && (
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#8B7355', fontSize: 16, fontFamily: 'Georgia, serif' }}>No sessions yet</p>
            <p style={{ color: '#B5A090', fontSize: 14 }}>Analyze your first coaching session to see it here</p>
            <a href="/" style={{ display: 'inline-block', marginTop: 16, background: '#8B6240', color: '#FFF', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Analyze a Session
            </a>
          </div>
        )}

        {!selected && sessions.map((session) => (
          <div key={session.id}
            onClick={() => setSelected(session)}
            style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 16, padding: '20px 24px', marginBottom: 12, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(100,70,40,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#3D2B1F', fontWeight: 700, fontSize: 15, margin: 0, fontFamily: 'Georgia, serif' }}>
                  Session #{session.id}
                </p>
                <p style={{ color: '#8B7355', fontSize: 13, margin: '4px 0 0' }}>{formatDate(session.created_at)}</p>
              </div>
              <span style={{ color: '#C17F5A', fontSize: 13, fontWeight: 600 }}>View Report →</span>
            </div>
            <p style={{ color: '#8B7355', fontSize: 12, margin: '10px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.transcript.slice(0, 120)}...
            </p>
          </div>
        ))}

        {selected && (
          <div>
            <button onClick={() => setSelected(null)}
              style={{ background: 'transparent', border: '1px solid #D9C9B3', borderRadius: 10, padding: '8px 16px', color: '#8B7355', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
              ← Back to sessions
            </button>
            <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28 }}>
              <p style={{ color: '#8B7355', fontSize: 13, marginBottom: 16 }}>{formatDate(selected.created_at)}</p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#5C4A36', lineHeight: 1.75 }}>{selected.analysis}</pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
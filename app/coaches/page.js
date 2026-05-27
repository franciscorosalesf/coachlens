'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else fetchCoaches(data.user.id);
    });
  }, []);

  const fetchCoaches = async (userId) => {
    const { data } = await supabase
      .from('coaches')
      .select('*, sessions(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setCoaches(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('coaches').insert({
      user_id: user.id,
      name: name.trim(),
      email: email.trim() || null,
      notes: notes.trim() || null,
    });
    if (!error) {
      setName(''); setEmail(''); setNotes('');
      setShowForm(false);
      fetchCoaches(user.id);
    }
    setSaving(false);
  };

  const handleDelete = async (coachId) => {
    if (!confirm('Delete this coach? Their sessions will remain but will be unassigned.')) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('coaches').delete().eq('id', coachId);
    fetchCoaches(user.id);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#3D2B1F', margin: 0 }}>My Coaches</h1>
            <p style={{ color: '#8B7355', fontSize: 14, marginTop: 4 }}>Manage the coaches you work with</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/" style={{ background: 'transparent', border: '1px solid #D9C9B3', color: '#8B7355', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ← Home
            </a>
            <button onClick={() => setShowForm(!showForm)}
              style={{ background: '#8B6240', color: '#FFF', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Add Coach
            </button>
          </div>
        </div>

        {showForm && (
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 18, margin: '0 0 20px' }}>New Coach</h3>
            <input
              placeholder="Coach name *"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#5C4A36', background: '#FDF8F2', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
            />
            <input
              placeholder="Email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#5C4A36', background: '#FDF8F2', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{ width: '100%', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#5C4A36', background: '#FDF8F2', outline: 'none', marginBottom: 16, boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAdd} disabled={saving || !name.trim()}
                style={{ background: '#8B6240', color: '#FFF', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Coach'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'transparent', border: '1px solid #D9C9B3', borderRadius: 12, padding: '10px 24px', fontSize: 14, color: '#8B7355', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && <p style={{ color: '#8B7355', textAlign: 'center' }}>Loading coaches...</p>}

        {!loading && coaches.length === 0 && !showForm && (
          <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#8B7355', fontSize: 16, fontFamily: 'Georgia, serif' }}>No coaches yet</p>
            <p style={{ color: '#B5A090', fontSize: 14 }}>Add your first coach to start organizing sessions</p>
            <button onClick={() => setShowForm(true)}
              style={{ marginTop: 16, background: '#8B6240', color: '#FFF', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Add Coach
            </button>
          </div>
        )}

        {coaches.map((coach) => (
          <div key={coach.id}
            style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 16, padding: '20px 24px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#3D2B1F', fontWeight: 700, fontSize: 17, margin: 0, fontFamily: 'Georgia, serif' }}>{coach.name}</p>
                {coach.email && <p style={{ color: '#8B7355', fontSize: 13, margin: '4px 0 0' }}>{coach.email}</p>}
                {coach.notes && <p style={{ color: '#B5A090', fontSize: 13, margin: '6px 0 0', fontStyle: 'italic' }}>{coach.notes}</p>}
                <p style={{ color: '#C17F5A', fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>
                  {coach.sessions?.[0]?.count || 0} session{coach.sessions?.[0]?.count !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`/sessions?coach=${coach.id}`}
                  style={{ background: 'transparent', border: '1px solid #D9C9B3', borderRadius: 10, padding: '6px 14px', fontSize: 12, color: '#8B7355', textDecoration: 'none', fontWeight: 600 }}>
                  View Sessions
                </a>
                <button onClick={() => handleDelete(coach.id)}
                  style={{ background: 'transparent', border: '1px solid #F5C6C6', borderRadius: 10, padding: '6px 14px', fontSize: 12, color: '#C62828', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
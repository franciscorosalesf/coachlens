'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleEmailAuth = async () => {
    setLoading(true);
    setMessage('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Check your email to confirm your account!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF6EE 0%, #F5EDE0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#3D2B1F', margin: 0 }}>
            Coach<span style={{ color: '#C17F5A' }}>Lens</span>
          </h1>
          <p style={{ color: '#8B7355', fontSize: 14, marginTop: 8 }}>ICF Coaching Session Analyzer</p>
        </div>

        <div style={{ background: '#FFFAF5', border: '1px solid #E8D5BC', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(100,70,40,0.08)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#3D2B1F', fontSize: 20, margin: '0 0 24px', textAlign: 'center' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          <button
            onClick={handleGoogle}
            style={{ width: '100%', background: '#FFF', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#5C4A36', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#E8D5BC' }} />
            <span style={{ color: '#B5A090', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E8D5BC' }} />
          </div>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#5C4A36', background: '#FDF8F2', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', border: '1px solid #D9C9B3', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#5C4A36', background: '#FDF8F2', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
          />

          {message && (
            <p style={{ color: message.includes('error') || message.includes('Invalid') ? '#C62828' : '#2E7D32', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{message}</p>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
            style={{ width: '100%', background: '#8B6240', color: '#FFF', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', color: '#8B7355', fontSize: 13, margin: 0 }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#C17F5A', cursor: 'pointer', fontWeight: 600 }}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
import React, { useState } from 'react';
import { authService, type AuthUser } from '../services/auth';
import { ACCENT, APP_BG, glow } from './NISTMatrix/theme';

interface Props {
  onAuthenticated: (user: AuthUser) => void;
}

const LoginScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await authService.login(identifier.trim(), password);
      onAuthenticated(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: APP_BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: 'min(400px, 100%)', background: 'rgba(8,12,20,0.82)', border: `1px solid ${ACCENT}3a`,
        borderRadius: 14, overflow: 'hidden', boxShadow: glow(ACCENT, 44, '22'), backdropFilter: 'blur(8px)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #1a2a3a',
          background: '#080c14', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="22" height="26" viewBox="0 0 30 34" fill="none">
            <path d="M15 2L3 8v10c0 8 5.5 14 12 16 6.5-2 12-8 12-16V8L15 2z" fill="#b8860b" stroke="#d4a017" strokeWidth="1"/>
            <path d="M15 7l-2 5h-5l4 3-1.5 5L15 17l4.5 3-1.5-5 4-3h-5L15 7z" fill="#d4a017"/>
          </svg>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a5568' }}>Cyber Range</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>NIST CSF 2.0 Matrix</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a6070', marginBottom: 4, fontFamily: "'Share Tech Mono', monospace" }}>
            // Sign in to rtaf-api
          </div>

          <div>
            <label style={labelStyle}>Username or Email</label>
            <input
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="star2"
              autoComplete="username"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 10px', borderRadius: 3, background: '#3a0a0a',
              border: '1px solid #f8717144', color: '#fca5a5',
              fontSize: 10, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.03em',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !identifier || !password}
            style={{
              marginTop: 4, padding: '10px 16px',
              fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer', borderRadius: 2,
              background: loading ? '#1a2a3a' : '#0c1e3a',
              border: '1px solid #4fc3f7', color: '#4fc3f7',
              opacity: (!identifier || !password) ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            marginTop: 6, fontSize: 9, fontFamily: "'Share Tech Mono', monospace",
            color: '#3a4a5a', letterSpacing: '0.05em', lineHeight: 1.5,
          }}>
            Auth via rtaf-api · POST /api/auth/local<br />
            Token stored in localStorage (key: nist.jwt)
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: '#6a8090', marginBottom: 5, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
  background: '#080c14', border: '1px solid #1a3a4a', color: '#e2e8f0',
  borderRadius: 3, padding: '9px 11px', outline: 'none', boxSizing: 'border-box',
  letterSpacing: '0.04em',
};

export default LoginScreen;

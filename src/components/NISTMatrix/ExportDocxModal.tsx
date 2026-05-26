import React, { useState } from 'react';
import { ACCENT, PANEL_BG, glow } from './theme';

interface Props {
  taggedCount: number;
  onExport: (title: string, subject: string) => void;
  onClose: () => void;
}

const ExportDocxModal: React.FC<Props> = ({ taggedCount, onExport, onClose }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
        zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 'min(440px, 100%)', background: PANEL_BG, border: `1px solid ${ACCENT}55`,
        borderRadius: 14, overflow: 'hidden', boxShadow: glow(ACCENT, 40, '33'), backdropFilter: 'blur(8px)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${ACCENT}22` }}>
          <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4a6070', marginBottom: 4 }}>
            Export · DOCX
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: ACCENT, textShadow: `0 0 12px ${ACCENT}88`,
          }}>
            Challenge Tag Report
          </div>
          <div style={{ fontSize: 10, color: '#5a7280', fontFamily: "'Share Tech Mono', monospace", marginTop: 4 }}>
            {taggedCount} tagged challenge{taggedCount === 1 ? '' : 's'} will be included
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Report Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="NIST CSF 2.0 Challenge Tag Report"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Subject / Description</label>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q2 cyber range assessment scope"
              style={{ ...inputStyle, height: 70, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${ACCENT}22`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={() => onExport(title.trim(), subject.trim())} style={btnPrimary}>
            Export DOCX
          </button>
        </div>
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
  background: 'rgba(3,7,18,0.85)', border: `1px solid ${ACCENT}44`, color: '#cdeefb',
  borderRadius: 8, padding: '9px 11px', outline: 'none', boxSizing: 'border-box',
};

const btnGhost: React.CSSProperties = {
  padding: '7px 16px', fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', borderRadius: 6, background: 'transparent',
  border: '1px solid #1a3a4a', color: '#6a8090',
};

const btnPrimary: React.CSSProperties = {
  padding: '7px 18px', fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', borderRadius: 6,
  background: `${ACCENT}1a`, border: `1px solid ${ACCENT}`, color: ACCENT,
  boxShadow: glow(ACCENT, 14, '44'),
};

export default ExportDocxModal;

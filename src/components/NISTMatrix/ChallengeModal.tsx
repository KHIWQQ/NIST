import React, { useState } from 'react';
import type { Challenge, ChallengeDifficulty, ChallengeType } from './types';
import { CHALLENGE_TYPES, getFunctionBySubId, getSubcategoryName } from './data';

interface Props {
  selectedSubs: string[];
  existingChallenges: Challenge[];
  onSave: (challenge: Omit<Challenge, 'id'>) => void;
  onClose: () => void;
}

const DIFFICULTY_STYLE: Record<ChallengeDifficulty, React.CSSProperties> = {
  easy:   { color: '#34d399', borderColor: '#34d39944', background: '#064e3b44' },
  medium: { color: '#fbbf24', borderColor: '#fbbf2444', background: '#78350f44' },
  hard:   { color: '#f87171', borderColor: '#f8717144', background: '#7f1d1d44' },
};

const ChallengeModal: React.FC<Props> = ({ selectedSubs, existingChallenges, onSave, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ChallengeType>('Log Analysis');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('medium');
  const [score, setScore] = useState(100);
  const [flag, setFlag] = useState('');

  const handleSave = () => {
    onSave({ name: name || 'Untitled', description, type, difficulty, score, flag, nistTags: selectedSubs });
    setShowForm(false);
    setName(''); setDescription(''); setScore(100); setFlag('');
  };

  const title = selectedSubs.length === 1
    ? getSubcategoryName(selectedSubs[0]).toUpperCase()
    : `MULTI-TAG CHALLENGE (${selectedSubs.length})`;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#111827', border: '1px solid rgba(37,99,235,0.27)', borderRadius: 8, width: 480, maxHeight: '86vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1f2937', background: '#0d1117', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 4 }}>Blue Team Challenge</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f3f4f6' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #374151', cursor: 'pointer', color: '#6b7280', padding: '3px 8px', borderRadius: 4, fontSize: 13, lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px' }}>

          {/* NIST Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {selectedSubs.map((subId) => {
              const fn = getFunctionBySubId(subId);
              return (
                <span key={subId} style={{ fontSize: 9, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 3, border: `1px solid ${fn ? fn.color + '44' : '#374151'}`, color: fn?.color ?? '#9ca3af', background: fn?.dim ?? 'transparent' }}>
                  {subId}
                </span>
              );
            })}
          </div>

          {/* Existing Challenges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {existingChallenges.length === 0 ? (
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#374151', letterSpacing: '0.05em' }}>// No challenges yet</div>
            ) : (
              existingChallenges.map((ch) => (
                <div key={ch.id} style={{ padding: '9px 11px', border: '1px solid #1f2937', borderRadius: 4, background: '#1a2035' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#e5e7eb' }}>{ch.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['difficulty', 'type', 'score'] as const).map((k) => {
                        const val = k === 'score' ? `${ch.score}PTS` : k === 'difficulty' ? ch.difficulty.toUpperCase() : ch.type.toUpperCase();
                        const style = k === 'difficulty' ? DIFFICULTY_STYLE[ch.difficulty] : { color: '#6b7280', borderColor: '#374151' };
                        return <span key={k} style={{ fontSize: 9, padding: '1px 7px', borderRadius: 3, border: '1px solid', fontFamily: 'monospace', ...style }}>{val}</span>;
                      })}
                    </div>
                  </div>
                  {ch.description && <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6 }}>{ch.description}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {ch.nistTags.map((t) => (
                      <span key={t} style={{ fontSize: 8, fontFamily: 'monospace', padding: '1px 5px', borderRadius: 2, border: '1px solid #1f2937', color: '#4b5563' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{ width: '100%', padding: 8, border: '1px dashed #374151', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {showForm ? 'COLLAPSE' : '+ NEW CHALLENGE'}
          </button>

          {/* Form */}
          {showForm && (
            <div style={{ borderTop: '1px solid #1f2937', paddingTop: 13, marginTop: 10 }}>
              {[
                { label: 'Challenge Name', el: <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Detect Lateral Movement" style={inputStyle} /> },
                { label: 'Scenario / Description', el: <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scenario..." style={{ ...inputStyle, height: 60, resize: 'vertical' as const }} /> },
              ].map(({ label, el }) => (
                <div key={label} style={{ marginBottom: 11 }}>
                  <label style={labelStyle}>{label}</label>
                  {el}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as ChallengeType)} style={{ ...inputStyle, background: '#0d1117' }}>
                    {CHALLENGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)} style={{ ...inputStyle, background: '#0d1117' }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Score</label>
                  <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} min={10} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Flag</label>
                  <input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="CTF{...}" style={inputStyle} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showForm && (
          <div style={{ padding: '11px 16px', borderTop: '1px solid #1f2937', display: 'flex', gap: 7, justifyContent: 'flex-end', background: '#0d1117' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '6px 14px', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #374151', color: '#6b7280', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '6px 16px', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#2563eb', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Save Challenge</button>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 12, background: '#0d1117', border: '1px solid #374151',
  color: '#e5e7eb', borderRadius: 4, padding: '7px 9px', fontFamily: 'inherit', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#6b7280', marginBottom: 5, fontWeight: 600,
};

export default ChallengeModal;

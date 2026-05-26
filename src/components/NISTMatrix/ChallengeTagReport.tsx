import React, { useMemo } from 'react';
import { NIST_FUNCTIONS, TOTAL_SUBCATEGORIES } from './data';
import type { Challenge } from './types';
import { ACCENT, MATRIX_BG } from './theme';

// ── MITRE-REPORT-style tagging view (neon cyber theme) ────────
// Pick one challenge → click subcategory cells to tag/untag it.
// Coverage counter reflects the SELECTED challenge's tag count.

interface Props {
  challenges: Challenge[];
  selectedChallengeId: number | null;
  onSelectChallenge: (id: number | null) => void;
  onToggleTag: (subId: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

const ChallengeTagReport: React.FC<Props> = ({
  challenges, selectedChallengeId, onSelectChallenge, onToggleTag, onRefresh, refreshing,
}) => {
  const selected = useMemo(
    () => challenges.find((c) => c.id === selectedChallengeId) ?? null,
    [challenges, selectedChallengeId]
  );
  const taggedSet = useMemo(() => new Set(selected?.nistTags ?? []), [selected]);
  const coverage = taggedSet.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      <style>{`
        .nist-report-col { transition: transform .25s ease, box-shadow .25s ease; }
        .nist-report-col:hover { transform: translateY(-2px) scale(1.012); }
        .nist-report-cell { transition: all .18s ease; }
      `}</style>

      {/* ── Control bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px',
        borderBottom: `1px solid ${ACCENT}33`, flexShrink: 0, flexWrap: 'wrap',
        background: 'linear-gradient(180deg, rgba(34,211,238,0.06) 0%, rgba(10,16,32,0.6) 100%)',
      }}>
        {/* Coverage counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={ACCENT} strokeWidth="1.2" />
            <path d="M4 7l2 2 4-4" stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: '#9fd6e6', letterSpacing: '0.05em' }}>
            Coverage{' '}
            <strong style={{
              color: coverage > 0 ? ACCENT : '#4a5568', fontSize: 16,
              textShadow: coverage > 0 ? `0 0 10px ${ACCENT}aa` : 'none',
            }}>{coverage}</strong>
            <span style={{ color: '#2a3a4a' }}> / {TOTAL_SUBCATEGORIES}</span>
          </span>
        </div>

        <div style={{ width: 1, height: 18, background: `${ACCENT}33` }} />

        {/* Challenge selector */}
        <select
          value={selectedChallengeId ?? ''}
          onChange={(e) => onSelectChallenge(e.target.value ? Number(e.target.value) : null)}
          style={{
            flex: '1 1 320px', maxWidth: 520,
            background: 'rgba(3,7,18,0.85)', border: `1px solid ${ACCENT}55`, color: '#cdeefb',
            borderRadius: 8, padding: '8px 11px', fontSize: 12,
            fontFamily: "'Share Tech Mono', monospace", outline: 'none', cursor: 'pointer',
            boxShadow: `0 0 12px ${ACCENT}1f`,
          }}
        >
          <option value="">— Select Challenge to tag —</option>
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.sub_type ? `  ·  ${c.sub_type}` : ''}{c.nistTags.length ? `  (${c.nistTags.length})` : ''}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Reload challenges + tags from rtaf-api"
          style={{
            padding: '7px 16px', fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: refreshing ? 'wait' : 'pointer', borderRadius: 6,
            background: `${ACCENT}14`, border: `1px solid ${ACCENT}`, color: ACCENT,
            boxShadow: `0 0 14px ${ACCENT}33`,
          }}
        >
          {refreshing ? '↻ Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* ── Matrix (column per NIST function) ── */}
      <div style={{
        overflow: 'auto', padding: '20px', flex: 1, minHeight: 0,
        background: MATRIX_BG,
      }}>
        {!selected ? (
          <div style={{
            textAlign: 'center', paddingTop: 90, color: `${ACCENT}66`,
            fontFamily: "'Share Tech Mono', monospace", fontSize: 13, letterSpacing: '0.06em',
            textShadow: `0 0 12px ${ACCENT}33`,
          }}>
            // Select a challenge above to start tagging NIST subcategories
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, minmax(195px, 1fr))',
            gap: 18, minWidth: 1180, alignItems: 'start',
          }}>
            {NIST_FUNCTIONS.map((fn) => {
              const allSubs = fn.cats.flatMap((c) => c.subs);
              const fnTagged = allSubs.filter((s) => taggedSet.has(s.id)).length;

              return (
                <div
                  key={fn.id}
                  className="nist-report-col"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(3,7,18,0.8)',
                    border: `1px solid ${fn.color}55`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: `0 0 22px ${fn.color}22`,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {/* Column header */}
                  <div style={{
                    padding: '12px 12px 10px', textAlign: 'center',
                    borderBottom: `1px solid ${fn.color}33`,
                    background: `linear-gradient(180deg, ${fn.color}1f 0%, transparent 100%)`,
                  }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: fn.color, textShadow: `0 0 12px ${fn.color}cc`,
                    }}>
                      {fn.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#5a6b78', fontFamily: "'Share Tech Mono', monospace", marginTop: 3 }}>
                      {fnTagged} / {allSubs.length} tagged
                    </div>
                  </div>

                  {/* Cells */}
                  <div style={{ padding: '9px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {fn.cats.map((cat, ci) => (
                      <React.Fragment key={cat.id}>
                        {ci > 0 && <div style={{ height: 1, background: `${fn.color}1a`, margin: '3px 0' }} />}
                        <div style={{
                          fontSize: 8, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.12em',
                          color: `${fn.color}99`, padding: '2px 2px 0', textTransform: 'uppercase',
                        }}>
                          {cat.id} · {cat.name}
                        </div>
                        {cat.subs.map((sub) => {
                          const tagged = taggedSet.has(sub.id);
                          return (
                            <button
                              key={sub.id}
                              className="nist-report-cell"
                              onClick={() => onToggleTag(sub.id)}
                              title={`${sub.id} — ${sub.name}\nClick to ${tagged ? 'remove' : 'add'} tag`}
                              style={{
                                textAlign: 'left', width: '100%', cursor: 'pointer',
                                padding: '7px 9px', borderRadius: 9,
                                border: `1px solid ${tagged ? fn.color : fn.color + '44'}`,
                                background: tagged ? fn.color : 'rgba(0,0,0,0.45)',
                                boxShadow: tagged ? `0 0 15px ${fn.color}aa` : 'none',
                              }}
                              onMouseEnter={(e) => {
                                if (!tagged) e.currentTarget.style.boxShadow = `0 0 11px ${fn.color}66`;
                              }}
                              onMouseLeave={(e) => {
                                if (!tagged) e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <div style={{
                                fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
                                fontWeight: 700, letterSpacing: '0.04em',
                                color: tagged ? 'rgba(255,255,255,0.85)' : `${fn.color}cc`,
                              }}>
                                {sub.id}
                              </div>
                              <div style={{
                                fontSize: 10.5, lineHeight: 1.3, marginTop: 1, fontWeight: tagged ? 700 : 400,
                                color: tagged ? '#ffffff' : '#9fb4c2',
                                textShadow: tagged ? '0 1px 2px rgba(0,0,0,0.45)' : 'none',
                                overflow: 'hidden', display: '-webkit-box',
                                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              }}>
                                {sub.name}
                              </div>
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeTagReport;

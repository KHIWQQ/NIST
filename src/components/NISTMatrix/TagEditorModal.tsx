import React, { useMemo, useState } from 'react';
import type { Challenge } from './types';
import { NIST_FUNCTIONS } from './data';

interface Props {
  challenge: Challenge;
  onSave: (selectedSubIds: string[]) => void;
  onClose: () => void;
}

const TagEditorModal: React.FC<Props> = ({ challenge, onSave, onClose }) => {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(challenge.nistTags)
  );
  const [search, setSearch] = useState('');
  const [filterFn, setFilterFn] = useState<string | 'ALL'>('ALL');

  const toggle = (subId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  const visibleFns = useMemo(() => {
    return NIST_FUNCTIONS.filter((fn) => filterFn === 'ALL' || fn.id === filterFn);
  }, [filterFn]);

  const matchesSearch = (subId: string, subName: string) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return subId.toLowerCase().includes(q) || subName.toLowerCase().includes(q);
  };

  const changeCount = useMemo(() => {
    const before = new Set(challenge.nistTags);
    let added = 0;
    let removed = 0;
    selected.forEach((s) => { if (!before.has(s)) added++; });
    before.forEach((s) => { if (!selected.has(s)) removed++; });
    return { added, removed };
  }, [selected, challenge.nistTags]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0a1018', border: '1px solid #1a3a4a', borderRadius: 4,
        width: 'min(880px, 100%)', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #1a2a3a',
          background: '#080c14', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4a5568', marginBottom: 4 }}>
              Tag NIST Subcategories For
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#e2e8f0', lineHeight: 1.3 }}>
              {challenge.name}
            </div>
            <div style={{ fontSize: 10, color: '#4a6070', marginTop: 4, fontFamily: "'Share Tech Mono', monospace" }}>
              {(challenge.ctype ?? 'PRAC').toUpperCase()} · {(challenge.sub_type ?? 'NONE').toUpperCase()} · {challenge.score} PTS
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid #1a3a4a', cursor: 'pointer',
            color: '#6a8090', padding: '4px 10px', borderRadius: 3, fontSize: 14, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* ── Toolbar ── */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid #1a2a3a', background: '#0c1220',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: '0 0 220px' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#2a4a5a', fontSize: 12 }}>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sub-id or name..."
              style={{
                width: '100%', paddingLeft: 24, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                background: '#080c14', border: '1px solid #1a2a3a', color: '#8899aa',
                borderRadius: 3, fontSize: 11, fontFamily: "'Share Tech Mono', monospace",
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['ALL', ...NIST_FUNCTIONS.map((f) => f.id)] as const).map((fid) => {
              const fn = NIST_FUNCTIONS.find((f) => f.id === fid);
              const active = filterFn === fid;
              const color = fid === 'ALL' ? '#4fc3f7' : (fn?.color ?? '#4fc3f7');
              return (
                <button
                  key={fid}
                  onClick={() => setFilterFn(fid)}
                  style={{
                    padding: '4px 10px', fontSize: 9, fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: 2, transition: 'all 0.15s',
                    border: `1px solid ${active ? color : '#1a2a3a'}`,
                    background: active ? color + '22' : 'transparent',
                    color: active ? color : '#3a4a5a',
                  }}
                >
                  {fid === 'ALL' ? 'ALL' : (fn?.name ?? fid)}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 10, fontFamily: "'Share Tech Mono', monospace" }}>
            <span style={{ color: '#34d399' }}>+{changeCount.added}</span>
            <span style={{ color: '#f87171' }}>-{changeCount.removed}</span>
            <span style={{ color: '#4a5568' }}>·</span>
            <span style={{ color: '#fbbf24' }}>{selected.size} selected</span>
          </div>
        </div>

        {/* ── Tree ── */}
        <div style={{ overflow: 'auto', padding: '14px 18px', flex: 1, minHeight: 0 }}>
          {visibleFns.map((fn) => {
            const renderedCats = fn.cats
              .map((cat) => ({
                cat,
                subs: cat.subs.filter((s) => matchesSearch(s.id, s.name)),
              }))
              .filter((entry) => entry.subs.length > 0);

            if (renderedCats.length === 0) return null;

            return (
              <div key={fn.id} style={{ marginBottom: 18 }}>
                {/* Function header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  paddingBottom: 4, borderBottom: `1px solid ${fn.color}33`,
                }}>
                  <div style={{ width: 4, height: 14, background: fn.color, borderRadius: 1 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: fn.color }}>
                    {fn.id} · {fn.name}
                  </span>
                </div>

                {renderedCats.map(({ cat, subs }) => (
                  <div key={cat.id} style={{ marginBottom: 10, paddingLeft: 6 }}>
                    <div style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.12em', color: `${fn.color}aa`, textTransform: 'uppercase', marginBottom: 5 }}>
                      {cat.id} · {cat.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
                      {subs.map((sub) => {
                        const isSelected = selected.has(sub.id);
                        return (
                          <label
                            key={sub.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 9px', borderRadius: 3, cursor: 'pointer',
                              border: `1px solid ${isSelected ? fn.color + '88' : '#1a2a3a'}`,
                              background: isSelected ? fn.color + '14' : '#080e18',
                              transition: 'all 0.12s',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggle(sub.id)}
                              style={{ accentColor: fn.color, cursor: 'pointer', width: 13, height: 13 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 10, fontFamily: "'Share Tech Mono', monospace", color: isSelected ? fn.color : '#4a6070', letterSpacing: '0.03em' }}>
                                {sub.id}
                              </div>
                              <div style={{ fontSize: 10, color: isSelected ? '#e2e8f0' : '#8899aa', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sub.name}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #1a2a3a', background: '#080c14',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 2, background: 'transparent',
              border: '1px solid #1a3a4a', color: '#6a8090',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(Array.from(selected).sort())}
            style={{
              padding: '6px 18px', fontSize: 11, fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 2,
              background: '#fbbf2422', border: '1px solid #fbbf24', color: '#fbbf24',
            }}
          >
            Save Tags ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagEditorModal;

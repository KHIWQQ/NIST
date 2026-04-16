import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NIST_FUNCTIONS } from './data';
import { exportDocumentation } from './exportUtils';
import MappingMatrix, {
  buildInitialMappings,
  cellKey,
  getCoveredSubs,
  exportMappingJson,
  exportMappingCsv,
  importMappingJson,
} from './MappingMatrix';

type PageView = 'matrix' | 'mapping';

const NISTMatrix: React.FC = () => {
  // ── Shared mapping state (source of truth) ──
  const [mappings, setMappings] = useState<Set<string>>(buildInitialMappings);
  const [clock, setClock] = useState(new Date());
  const [page, setPage] = useState<PageView>('matrix');
  const [focusSubId, setFocusSubId] = useState<string | null>(null);

  // Derive covered subcategories from mappings
  const covered = useMemo(() => getCoveredSubs(mappings), [mappings]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Mapping toggle (used by MappingMatrix) ──
  const handleToggleMapping = useCallback((subId: string, toolId: string) => {
    const key = cellKey(subId, toolId);
    setMappings((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Shared actions (same on both pages) ──
  const handleImport = useCallback(async () => {
    const result = await importMappingJson();
    if (result.size > 0) setMappings(result);
  }, []);
  const handleExportJson = useCallback(() => exportMappingJson(mappings), [mappings]);
  const handleExportCsv = useCallback(() => exportMappingCsv(mappings), [mappings]);
  const handleExportDoc = useCallback(() => exportDocumentation(covered), [covered]);
  const handleClearAll = useCallback(() => setMappings(new Set()), []);

  const formatDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() >= 12 ? 'PM' : 'AM'} GMT+7`;
  };

  return (
    <div style={{ height: '100vh', background: '#060a10', padding: '16px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', marginBottom: 2, flexShrink: 0 }}>
        {/* Hamburger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer', marginRight: 16 }}>
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
        </div>
        {/* Shield icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 34, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
              <path d="M15 2L3 8v10c0 8 5.5 14 12 16 6.5-2 12-8 12-16V8L15 2z" fill="#b8860b" stroke="#d4a017" strokeWidth="1"/>
              <path d="M15 7l-2 5h-5l4 3-1.5 5L15 17l4.5 3-1.5-5 4-3h-5L15 7z" fill="#d4a017"/>
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a5568' }}>Cyber Range</div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>NIST CSF 2.0 MATRIX</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Lang toggle */}
        <div style={{ display: 'flex', gap: 0, marginRight: 20 }}>
          <button style={{ ...langBtnStyle, background: '#1a2332', color: '#4fc3f7', borderColor: '#1a3a4a' }}>US</button>
          <button style={{ ...langBtnStyle, color: '#4a5568', borderColor: '#1a2a3a' }}>TH</button>
        </div>
        {/* Clock */}
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: '#4fc3f7', letterSpacing: '0.05em' }}>
          {formatDate(clock)}
        </div>
      </div>

      {/* ── HUD Container ── */}
      <div style={{ position: 'relative', border: '1px solid #0e2a3a', borderRadius: 2, background: '#080c14', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Corner accents */}
        <div style={{ ...cornerStyle, top: -1, left: -1 }} />
        <div style={{ ...cornerStyle, top: -1, right: -1, transform: 'scaleX(-1)' }} />
        <div style={{ ...cornerStyle, bottom: -1, left: -1, transform: 'scaleY(-1)' }} />
        <div style={{ ...cornerStyle, bottom: -1, right: -1, transform: 'scale(-1)' }} />

        {/* ── Sub Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #0e2a3a', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a5568' }}>Blue Team Assessment Tool</div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              {page === 'matrix' ? 'NIST CSF OPERATIONAL MATRIX' : 'NIST CSF MAPPING MATRIX'}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {/* Page Tabs */}
          <div style={{ display: 'flex', gap: 0, marginRight: 16 }}>
            <button
              onClick={() => setPage('matrix')}
              style={{
                ...tabBtnStyle,
                ...(page === 'matrix' ? { background: '#0c1e3a', color: '#4fc3f7', borderColor: '#1a4a5a' } : {}),
              }}
            >
              Matrix View
            </button>
            <button
              onClick={() => setPage('mapping')}
              style={{
                ...tabBtnStyle,
                ...(page === 'mapping' ? { background: '#0c1e3a', color: '#4fc3f7', borderColor: '#1a4a5a' } : {}),
              }}
            >
              Mapping Matrix
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleImport} style={hudBtnStyle}>Import JSON</button>
            <button onClick={handleExportJson} style={hudBtnStyle}>Export JSON</button>
            <button onClick={handleExportCsv} style={hudBtnStyle}>Export CSV</button>
            <button onClick={handleExportDoc} style={{ ...hudBtnStyle, borderColor: '#4fc3f7', color: '#4fc3f7' }}>Export DOCX</button>
            <button onClick={handleClearAll} style={{ ...hudBtnStyle, borderColor: '#f87171', color: '#f87171' }}>Clear All</button>
          </div>
        </div>

        {page === 'matrix' ? (
          <>
            {/* ── Coverage Bar ── */}
            {covered.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 24px', borderBottom: '1px solid #0e2a3a', background: '#0a1020' }}>
                <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4fc3f7' }}>
                  <strong style={{ color: '#81d4fa' }}>{covered.size}</strong> covered
                </span>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: '#2a3a4a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[...covered].join('  ·  ')}
                </span>
                <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2a4a3a' }}>
                  auto-synced from mapping
                </span>
              </div>
            )}

            {/* ── Matrix ── */}
            <div style={{ overflow: 'auto', padding: '16px 20px', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(160px, 1fr))', gap: 12, minWidth: 980, alignItems: 'start' }}>
                {NIST_FUNCTIONS.map((fn) => (
                  <div key={fn.id} style={{ background: '#0a1018', border: '1px solid #0e2a3a', borderRadius: 3, overflow: 'hidden' }}>

                    {/* Function Header */}
                    <div style={{
                      padding: '12px 14px',
                      borderTop: `2px solid ${fn.color}`,
                      background: `linear-gradient(180deg, ${fn.color}08 0%, transparent 100%)`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: fn.color }}>{fn.name}</div>
                    </div>

                    {/* Categories & Subcategories */}
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {fn.cats.map((cat, ci) => (
                        <React.Fragment key={cat.id}>
                          {ci > 0 && <div style={{ height: 1, background: '#0e1a2a', margin: '4px 0' }} />}
                          <div style={{
                            fontSize: 8, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.12em',
                            color: `${fn.color}66`, padding: '4px 4px 2px', textTransform: 'uppercase',
                          }}>
                            {cat.id} · {cat.name}
                          </div>
                          {cat.subs.map((sub) => {
                            const isCovered = covered.has(sub.id);
                            return (
                              <div
                                key={sub.id}
                                onClick={() => { setFocusSubId(sub.id); setPage('mapping'); }}
                                style={{
                                  padding: '8px 10px',
                                  background: isCovered ? '#0c1e3a' : '#0c1220',
                                  border: `1px solid ${isCovered ? fn.color + '55' : '#111e2e'}`,
                                  borderRadius: 3,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isCovered) {
                                    e.currentTarget.style.background = '#0e1830';
                                    e.currentTarget.style.borderColor = '#1a2e44';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isCovered) {
                                    e.currentTarget.style.background = '#0c1220';
                                    e.currentTarget.style.borderColor = '#111e2e';
                                  }
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                                    color: isCovered ? '#81d4fa' : '#8899aa', lineHeight: 1.35,
                                  }}>
                                    {sub.name}
                                  </div>
                                </div>
                                {isCovered && (
                                  <div style={{ fontSize: 8, color: fn.color, flexShrink: 0, fontFamily: "'Share Tech Mono', monospace" }}>MAPPED</div>
                                )}
                                <div style={{ fontSize: 12, color: '#2a3a4a', flexShrink: 0 }}>›</div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <MappingMatrix mappings={mappings} onToggle={handleToggleMapping} focusSubId={focusSubId} onFocusHandled={() => setFocusSubId(null)} />
        )}

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px', borderTop: '1px solid #0e2a3a', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a2a3a' }}>
            ‹ NIST CSF 2.0 Challenge Matrix ›
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2a3a' }}>
            {page === 'matrix' ? 'Coverage auto-synced from Mapping Matrix' : 'Click a cell to toggle mapping'}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.1em', color: '#1a2a3a' }}>
            Design Version 2.0.0-beta
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────

const langBtnStyle: React.CSSProperties = {
  padding: '3px 10px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 2, background: 'transparent',
  border: '1px solid #1a2a3a', textTransform: 'uppercase',
};

const tabBtnStyle: React.CSSProperties = {
  padding: '6px 16px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
  background: 'transparent', border: '1px solid #1a2a3a', color: '#4a5568',
};

const hudBtnStyle: React.CSSProperties = {
  padding: '6px 16px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
  background: 'transparent', border: '1px solid #1a3a4a', color: '#4a7a8a',
};

const cornerStyle: React.CSSProperties = {
  position: 'absolute', width: 20, height: 20, pointerEvents: 'none',
  borderTop: '2px solid #4fc3f7', borderLeft: '2px solid #4fc3f7',
};

export default NISTMatrix;

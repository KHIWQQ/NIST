import React, { useMemo, useState } from 'react';
import type { Challenge, ChallengeSubType } from './types';
import { MATRIX_BG } from './theme';

interface Props {
  challenges: Challenge[];
  selectedIds: Set<number>;
  onToggle: (challenge: Challenge) => void;
  onEditTags: (challengeId: number) => void;
}

// Color per rtaf-api sub_type
const SUBTYPE_COLOR: Partial<Record<ChallengeSubType, string>> = {
  Web: '#4fc3f7',
  Forensic: '#a78bfa',
  Network: '#34d399',
  PWN: '#f87171',
  Crypto: '#fbbf24',
  Reverse_Engineering: '#fb923c',
  Mobile: '#38bdf8',
  Programming: '#c084fc',
  OS_Exploit: '#f472b6',
  VL: '#60a5fa',
  SOC: '#22d3ee',
  LOG: '#a3e635',
  TH: '#f59e0b',
  OT: '#10b981',
  RWS: '#ef4444',
  PR: '#8b5cf6',
  NONE: '#6b7280',
};
const subColor = (st?: ChallengeSubType | null) => (st && SUBTYPE_COLOR[st]) || '#6b7280';
const subLabel = (st?: ChallengeSubType | null) => st ?? 'OTHER';

const ChallengeLibrary: React.FC<Props> = ({ challenges, selectedIds, onToggle, onEditTags }) => {
  const [filterSubType, setFilterSubType] = useState<ChallengeSubType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return challenges.filter(ch => {
      if (filterSubType !== 'ALL' && ch.sub_type !== filterSubType) return false;
      if (search && !ch.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [challenges, filterSubType, search]);

  // group by sub_type, sorted by name within each group
  const grouped = useMemo(() => {
    const map: Map<string, Challenge[]> = new Map();
    for (const ch of filtered) {
      const key = ch.sub_type ?? 'OTHER';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ch);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([type, items]) => ({ type: type as ChallengeSubType | 'OTHER', items }));
  }, [filtered]);

  const availableSubTypes = useMemo(() => {
    const set = new Set<ChallengeSubType>();
    for (const ch of challenges) if (ch.sub_type) set.add(ch.sub_type);
    return Array.from(set).sort();
  }, [challenges]);

  const coveredNist = useMemo(() => {
    const set = new Set<string>();
    for (const ch of challenges) {
      if (selectedIds.has(ch.id)) ch.nistTags.forEach(t => set.add(t));
    }
    return set;
  }, [challenges, selectedIds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #0e2a3a', background: '#0a1020', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 220px' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#2a4a5a', fontSize: 12 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search challenge..."
            style={{
              width: '100%', paddingLeft: 24, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
              background: '#080c14', border: '1px solid #1a2a3a', color: '#8899aa',
              borderRadius: 3, fontSize: 11, fontFamily: "'Share Tech Mono', monospace",
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Sub-type filter */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['ALL', ...availableSubTypes] as const).map(t => {
            const active = filterSubType === t;
            const color = t === 'ALL' ? '#4fc3f7' : subColor(t as ChallengeSubType);
            return (
              <button
                key={t}
                onClick={() => setFilterSubType(t)}
                style={{
                  padding: '4px 10px', fontSize: 9, fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2, transition: 'all 0.15s',
                  border: `1px solid ${active ? color : '#1a2a3a'}`,
                  background: active ? color + '22' : 'transparent',
                  color: active ? color : '#3a4a5a',
                }}
              >
                {t === 'ALL' ? 'ALL' : t}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginLeft: 'auto', paddingLeft: 12, borderLeft: '1px solid #1a2a3a' }}>
          <StatBadge label="Selected" value={selectedIds.size} color="#fbbf24" />
          <StatBadge label="NIST Covered" value={coveredNist.size} color="#34d399" />
        </div>
      </div>

      {/* ── Challenge Grid ── */}
      <div style={{ overflow: 'auto', padding: '16px 20px', flex: 1, minHeight: 0, background: MATRIX_BG }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: '#2a3a4a', fontFamily: "'Share Tech Mono', monospace", fontSize: 12 }}>
            // No challenges match filter
          </div>
        ) : (
          grouped.map(({ type, items }) => {
            const color = type === 'OTHER' ? '#6b7280' : subColor(type);
            return (
              <div key={type} style={{ marginBottom: 24 }}>
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color }}>
                    {type}
                  </span>
                  <span style={{ fontSize: 9, color: '#2a3a4a', fontFamily: "'Share Tech Mono', monospace" }}>
                    {items.filter(c => selectedIds.has(c.id)).length}/{items.length} selected
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#0e1a2a' }} />
                </div>

                {/* Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                  {items.map(ch => (
                    <ChallengeCard
                      key={ch.id}
                      challenge={ch}
                      selected={selectedIds.has(ch.id)}
                      onToggle={() => onToggle(ch)}
                      onEditTags={() => onEditTags(ch.id)}
                      typeColor={subColor(ch.sub_type)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── ChallengeCard ─────────────────────────────────────────────

interface CardProps {
  challenge: Challenge;
  selected: boolean;
  onToggle: () => void;
  onEditTags: () => void;
  typeColor: string;
}

const ChallengeCard: React.FC<CardProps> = ({ challenge, selected, onToggle, onEditTags, typeColor }) => {
  const [hovered, setHovered] = useState(false);
  const tagCount = challenge.nistTags.length;

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 12px',
        background: selected ? 'rgba(3,7,18,0.85)' : hovered ? 'rgba(12,22,36,0.7)' : 'rgba(8,14,24,0.6)',
        border: `1px solid ${selected ? typeColor + '88' : hovered ? typeColor + '44' : '#0e1a2a'}`,
        borderLeft: `3px solid ${selected ? typeColor : hovered ? typeColor + '66' : '#0e1a2a'}`,
        borderRadius: 10,
        boxShadow: selected ? `0 0 16px ${typeColor}44` : hovered ? `0 0 10px ${typeColor}22` : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 8, height: 8, borderRadius: '50%',
          background: typeColor, boxShadow: `0 0 6px ${typeColor}88`,
        }} />
      )}

      {/* Name */}
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: selected ? '#e2e8f0' : '#8899aa', marginBottom: 4, paddingRight: 16, lineHeight: 1.3 }}>
        {challenge.name}
      </div>

      {/* Description */}
      <div style={{ fontSize: 10, color: '#3a5060', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {challenge.description}
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        {challenge.ctype && (
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, border: '1px solid #4a5568', color: '#8899aa', background: '#1a2a3a44', fontFamily: "'Share Tech Mono', monospace" }}>
            {challenge.ctype}
          </span>
        )}
        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, border: `1px solid ${typeColor}44`, color: typeColor, background: typeColor + '11', fontFamily: "'Share Tech Mono', monospace" }}>
          {subLabel(challenge.sub_type)}
        </span>
        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, border: `1px solid ${typeColor}44`, color: typeColor, background: typeColor + '11', fontFamily: "'Share Tech Mono', monospace" }}>
          {challenge.score} PTS
        </span>
      </div>

      {/* NIST Tags header + edit button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3a4a5a', fontFamily: "'Share Tech Mono', monospace" }}>
          NIST Tags ({tagCount})
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onEditTags(); }}
          title="Edit NIST tags"
          style={{
            padding: '2px 8px', fontSize: 8, fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 2,
            background: 'rgba(251,191,36,0.08)', border: '1px solid #fbbf2455', color: '#fbbf24',
          }}
        >
          ✏ Edit
        </button>
      </div>

      {/* NIST Tags */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {tagCount === 0 ? (
          <span style={{ fontSize: 9, fontStyle: 'italic', color: '#3a4a5a', fontFamily: "'Share Tech Mono', monospace" }}>
            // no tags
          </span>
        ) : challenge.nistTags.map(tag => (
          <span key={tag} style={{
            fontSize: 8, padding: '1px 5px', borderRadius: 2,
            border: `1px solid ${selected ? typeColor + '55' : '#1a2a3a'}`,
            color: selected ? typeColor : '#2a4a5a',
            fontFamily: "'Share Tech Mono', monospace",
            background: selected ? typeColor + '11' : 'transparent',
            letterSpacing: '0.03em',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── StatBadge ─────────────────────────────────────────────────

const StatBadge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Share Tech Mono', monospace", lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2a4a5a' }}>{label}</span>
  </div>
);

export default ChallengeLibrary;

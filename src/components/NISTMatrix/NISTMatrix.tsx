import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NIST_FUNCTIONS, TOTAL_SUBCATEGORIES } from './data';
import { exportChallengeTagDoc } from './exportUtils';
import ChallengeModal from './ChallengeModal';
import ExportDocxModal from './ExportDocxModal';
import ChallengeLibrary from './ChallengeLibrary';
import ChallengeTagReport from './ChallengeTagReport';
import TagEditorModal from './TagEditorModal';
import MappingMatrix from './MappingMatrix';
import {
  buildInitialMappings,
  cellKey,
  getCoveredSubs,
  exportMappingJson,
  exportMappingCsv,
  importMappingJson,
} from './mappingUtils';
import type { Challenge } from './types';
import { challengeService } from '../../services/nistChallengeService';
import type { AuthUser } from '../../services/auth';
import { ACCENT, APP_BG, PANEL_BG, glow, textGlow } from './theme';

type PageView = 'matrix' | 'mapping' | 'challenges' | 'report';

// ── Challenge store: subId → Challenge[] ──────────────────────
type ChallengeStore = Record<string, Challenge[]>;

// ── helper: count challenges linked to a subId ────────────────
const countChallenges = (store: ChallengeStore, subId: string) =>
  (store[subId] ?? []).length;

// ── helper: does this subId have any challenges? ──────────────
const hasChallenge = (store: ChallengeStore, subId: string) =>
  countChallenges(store, subId) > 0;

// ── helper: collect ALL challenges that share nistTags with subId ──
const getChallengesForSub = (store: ChallengeStore, subId: string): Challenge[] =>
  store[subId] ?? [];

interface NISTMatrixProps {
  currentUser?: AuthUser;
  onLogout?: () => void;
}

const NISTMatrix: React.FC<NISTMatrixProps> = ({ currentUser, onLogout }) => {
  // ── Mapping state (tool coverage) ────────────────────────────
  const [mappings, setMappings] = useState<Set<string>>(buildInitialMappings);
  const [clock, setClock] = useState(new Date());
  const [page, setPage] = useState<PageView>('matrix');
  const [focusSubId, setFocusSubId] = useState<string | null>(null);

  // ── Challenge state ───────────────────────────────────────────
  // challenges: fetched from rtaf-api on mount — tags are mutable via TagEditor
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [challengeStore, setChallengeStore] = useState<ChallengeStore>({});
  const [modalSubId, setModalSubId] = useState<string | null>(null);
  // sub_id → NIST documentId, needed to translate tags for link/unlink
  const [subIdToDocId, setSubIdToDocId] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  // ── Tag Report: the challenge currently being tagged ──────────
  const [reportChallengeId, setReportChallengeId] = useState<number | null>(null);

  // ── Export DOCX modal ─────────────────────────────────────────
  const [showExportDocx, setShowExportDocx] = useState(false);

  // ── Challenge Library: selected bank challenge IDs ────────────
  const [selectedBankIds, setSelectedBankIds] = useState<Set<number>>(new Set());

  // ── Tag Editor state ──────────────────────────────────────────
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);

  // ── Derived ───────────────────────────────────────────────────
  const covered = useMemo(() => getCoveredSubs(mappings), [mappings]);

  // total subcategories that have at least 1 challenge
  const challengeCoveredCount = useMemo(
    () => Object.values(challengeStore).filter((arr) => arr.length > 0).length,
    [challengeStore]
  );

  // ── Load challenges + NIST tags (mount + manual refresh) ──────
  const loadData = useCallback(() => {
    return challengeService.loadAll()
      .then(({ challenges: list, subIdToDocId: map }) => {
        setChallenges(list);
        setSubIdToDocId(map);
        setLoadError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch challenges from rtaf-api:', err);
        setLoadError(err?.message ?? 'Failed to load challenges');
      });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  // ── Clock ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Mapping toggle ────────────────────────────────────────────
  const handleToggleMapping = useCallback((subId: string, toolId: string) => {
    const key = cellKey(subId, toolId);
    setMappings((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Challenge modal open / close ──────────────────────────────
  const openChallengeModal = useCallback((subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalSubId(subId);
  }, []);

  const closeChallengeModal = useCallback(() => setModalSubId(null), []);

  // ── Toggle a challenge from the bank ─────────────────────────
  const handleBankToggle = useCallback((ch: Challenge) => {
    setSelectedBankIds(prev => {
      const next = new Set(prev);
      if (next.has(ch.id)) {
        next.delete(ch.id);
        setChallengeStore(store => {
          const updated = { ...store };
          for (const tag of ch.nistTags) {
            if (updated[tag]) updated[tag] = updated[tag].filter(c => c.id !== ch.id);
          }
          return updated;
        });
      } else {
        next.add(ch.id);
        setChallengeStore(store => {
          const updated = { ...store };
          for (const tag of ch.nistTags) {
            if (!updated[tag]) updated[tag] = [];
            if (!updated[tag].some(c => c.id === ch.id)) updated[tag] = [...updated[tag], ch];
          }
          return updated;
        });
      }
      return next;
    });
  }, []);

  // ── Update tags on an existing challenge ──────────────────────
  const handleUpdateChallengeTags = useCallback(
    async (challengeId: number, newTags: string[]) => {
      const target = challenges.find((c) => c.id === challengeId);
      if (!target) return;
      const oldTags = target.nistTags;
      const updatedChallenge: Challenge = { ...target, nistTags: newTags };

      // Optimistic local update
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? updatedChallenge : c))
      );

      // Keep the matrix store in sync when this challenge is selected
      if (selectedBankIds.has(challengeId)) {
        setChallengeStore((store) => {
          const next = { ...store };
          for (const tag of oldTags) {
            if (newTags.includes(tag)) continue;
            if (next[tag]) next[tag] = next[tag].filter((c) => c.id !== challengeId);
          }
          for (const tag of newTags) {
            const arr = next[tag] ? next[tag].filter((c) => c.id !== challengeId) : [];
            next[tag] = [...arr, updatedChallenge];
          }
          return next;
        });
      }

      // Persist to rtaf-api. link/unlink address NIST records by documentId,
      // so translate sub_ids → nistDocumentIds first.
      if (!target.documentId) {
        console.warn('Challenge has no documentId — tags not persisted');
        return;
      }
      const toDocIds = (tags: string[]) =>
        tags.map((t) => subIdToDocId[t]).filter((d): d is string => Boolean(d));
      try {
        const newDocIds = toDocIds(newTags);
        if (newDocIds.length > 0) {
          // link replaces the whole set → handles both add and remove
          await challengeService.linkTags(target.documentId, newDocIds);
        } else {
          // clearing all tags: link rejects empty arrays, so unlink the old set
          const oldDocIds = toDocIds(oldTags);
          if (oldDocIds.length > 0) {
            await challengeService.unlinkTags(target.documentId, oldDocIds);
          }
        }
        setLoadError(null);
      } catch (err) {
        console.error('Failed to persist NIST tags:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to save tags');
      }
    },
    [challenges, selectedBankIds, subIdToDocId]
  );

  // ── Tag Report: toggle one subcategory on the selected challenge ──
  const handleToggleReportTag = useCallback(
    (subId: string) => {
      if (reportChallengeId == null) return;
      const ch = challenges.find((c) => c.id === reportChallengeId);
      if (!ch) return;
      const newTags = ch.nistTags.includes(subId)
        ? ch.nistTags.filter((t) => t !== subId)
        : [...ch.nistTags, subId];
      handleUpdateChallengeTags(reportChallengeId, newTags);
    },
    [reportChallengeId, challenges, handleUpdateChallengeTags]
  );

  // ── Tag Editor open / close ───────────────────────────────────
  const openTagEditor = useCallback((challengeId: number) => {
    setEditingChallengeId(challengeId);
  }, []);

  const closeTagEditor = useCallback(() => setEditingChallengeId(null), []);

  const editingChallenge = useMemo(
    () => challenges.find((c) => c.id === editingChallengeId) ?? null,
    [challenges, editingChallengeId]
  );

  // ── Save new challenge ────────────────────────────────────────
  // Creating challenges goes through rtaf-api admin (challenge-manage),
  // not this UI. Keep stub so ChallengeModal still compiles.
  const handleSaveChallenge = useCallback(
    async () => {
      console.warn('Creating challenges from this UI is not supported. Use rtaf-api admin.');
    },
    []
  );

  // ── Export / Import ───────────────────────────────────────────
  const handleImport = useCallback(async () => {
    const result = await importMappingJson();
    if (result.size > 0) setMappings(result);
  }, []);
  const handleExportJson = useCallback(() => exportMappingJson(mappings), [mappings]);
  const handleExportCsv = useCallback(() => exportMappingCsv(mappings), [mappings]);
  const handleExportDoc = useCallback(() => setShowExportDocx(true), []);
  const handleClearAll = useCallback(() => setMappings(new Set()), []);

  // ── Clock format ──────────────────────────────────────────────
  const formatDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() >= 12 ? 'PM' : 'AM'} GMT+7`;
  };

  return (
    <div style={{ height: '100vh', background: APP_BG, padding: '16px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', marginBottom: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer', marginRight: 16 }}>
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
          <div style={{ width: 18, height: 2, background: '#4a5568' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
            <span style={{ fontSize: 10, fontFamily: "'Share Tech Mono', monospace", color: '#6a8090', letterSpacing: '0.05em' }}>
              {currentUser.username}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  padding: '3px 9px', fontSize: 9, fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2,
                  background: 'transparent', border: '1px solid #1a3a4a', color: '#4a7a8a',
                }}
              >
                Logout
              </button>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 0, marginRight: 20 }}>
          <button style={{ ...langBtnStyle, background: '#1a2332', color: '#4fc3f7', borderColor: '#1a3a4a' }}>US</button>
          <button style={{ ...langBtnStyle, color: '#4a5568', borderColor: '#1a2a3a' }}>TH</button>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: '#4fc3f7', letterSpacing: '0.05em' }}>
          {formatDate(clock)}
        </div>
      </div>

      {/* ── HUD Container ── */}
      <div style={{ position: 'relative', border: `1px solid ${ACCENT}3a`, borderRadius: 16, background: PANEL_BG, boxShadow: glow(ACCENT, 44, '20'), backdropFilter: 'blur(8px)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Corner accents */}
        <div style={{ ...cornerStyle, top: -1, left: -1 }} />
        <div style={{ ...cornerStyle, top: -1, right: -1, transform: 'scaleX(-1)' }} />
        <div style={{ ...cornerStyle, bottom: -1, left: -1, transform: 'scaleY(-1)' }} />
        <div style={{ ...cornerStyle, bottom: -1, right: -1, transform: 'scale(-1)' }} />

        {/* ── API Error Banner ── */}
        {loadError && (
          <div style={{
            padding: '8px 24px', background: '#3a0a0a', borderBottom: '1px solid #f8717144',
            color: '#fca5a5', fontSize: 11, fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <span style={{ color: '#f87171', fontWeight: 700 }}>⚠ API:</span>
            <span>{loadError}</span>
            <span style={{ color: '#7a3a3a' }}>· session may have expired — try logging out and back in</span>
          </div>
        )}

        {/* ── Sub Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #0e2a3a', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a5568' }}>Blue Team Assessment Tool</div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              {page === 'matrix' ? 'NIST CSF OPERATIONAL MATRIX' : page === 'mapping' ? 'NIST CSF MAPPING MATRIX' : page === 'report' ? 'NIST CSF TAG REPORT' : 'CHALLENGE LIBRARY'}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginRight: 16 }}>
            <button onClick={() => setPage('matrix')} style={{ ...tabBtnStyle, ...(page === 'matrix' ? tabActiveStyle : {}) }}>
              Matrix View
            </button>
            <button onClick={() => setPage('report')} style={{ ...tabBtnStyle, ...(page === 'report' ? tabActiveStyle : {}) }}>
              Tag Report
            </button>
            <button onClick={() => setPage('mapping')} style={{ ...tabBtnStyle, ...(page === 'mapping' ? tabActiveStyle : {}) }}>
              Mapping Matrix
            </button>
            <button onClick={() => setPage('challenges')} style={{ ...tabBtnStyle, ...(page === 'challenges' ? tabChallengeActiveStyle : {}), position: 'relative' }}>
              Challenge Library
              {selectedBankIds.size > 0 && (
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#fbbf24', boxShadow: '0 0 4px #fbbf24',
                }} />
              )}
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
            {/* ── Coverage + Legend Bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 24px', borderBottom: '1px solid #0e2a3a', background: '#0a1020', flexShrink: 0 }}>
              {/* Coverage counter (MITRE-style) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#4fc3f7" strokeWidth="1.2"/>
                  <path d="M4 7l2 2 4-4" stroke="#4fc3f7" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: '#8899aa', letterSpacing: '0.05em' }}>
                  Coverage{' '}
                  <strong style={{ color: challengeCoveredCount > 0 ? '#fbbf24' : '#4a5568', fontSize: 15 }}>
                    {challengeCoveredCount}
                  </strong>
                  <span style={{ color: '#2a3a4a' }}> / {TOTAL_SUBCATEGORIES}</span>
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 16, background: '#1a2a3a' }} />

              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <LegendItem color="#2a3a4a" label="NO CHALLENGE" />
                <LegendItem color="#d4a017" label="HAS CHALLENGE" />
                <LegendItem color="#4fc3f7" label="LINKED (MAPPED)" />
              </div>

              <div style={{ flex: 1 }} />

              {/* Tool coverage */}
              {covered.size > 0 && (
                <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2a4a3a' }}>
                  <strong style={{ color: '#34d399' }}>{covered.size}</strong> tool-mapped
                </span>
              )}
            </div>

            {/* ── Matrix Grid ── */}
            <div style={{ overflow: 'auto', padding: '16px 20px', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(160px, 1fr))', gap: 12, minWidth: 980, alignItems: 'start' }}>
                {NIST_FUNCTIONS.map((fn) => (
                  <div key={fn.id} style={{ background: 'rgba(3,7,18,0.8)', border: `1px solid ${fn.color}55`, borderRadius: 14, overflow: 'hidden', boxShadow: glow(fn.color, 22, '22'), backdropFilter: 'blur(6px)' }}>

                    {/* Function Header */}
                    <div style={{
                      padding: '12px 14px',
                      borderTop: `2px solid ${fn.color}`,
                      background: `linear-gradient(180deg, ${fn.color}1f 0%, transparent 100%)`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: fn.color, textShadow: textGlow(fn.color, 12, 'cc') }}>
                        {fn.name}
                      </div>
                      {/* mini coverage */}
                      <div style={{ fontSize: 9, color: '#2a3a4a', fontFamily: "'Share Tech Mono', monospace", marginTop: 2 }}>
                        {fn.cats.flatMap(c => c.subs).filter(s => hasChallenge(challengeStore, s.id)).length}
                        {' / '}
                        {fn.cats.reduce((a, c) => a + c.subs.length, 0)} covered
                      </div>
                    </div>

                    {/* Categories & Subcategories */}
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {fn.cats.map((cat, ci) => (
                        <React.Fragment key={cat.id}>
                          {ci > 0 && <div style={{ height: 1, background: '#0e1a2a', margin: '4px 0' }} />}
                          <div style={{ fontSize: 8, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.12em', color: `${fn.color}66`, padding: '4px 4px 2px', textTransform: 'uppercase' }}>
                            {cat.id} · {cat.name}
                          </div>
                          {cat.subs.map((sub) => {
                            const isMapped = covered.has(sub.id);
                            const hasChall = hasChallenge(challengeStore, sub.id);
                            const challCount = countChallenges(challengeStore, sub.id);

                            return (
                              <SubcategoryCell
                                key={sub.id}
                                subId={sub.id}
                                subName={sub.name}
                                isMapped={isMapped}
                                hasChallenge={hasChall}
                                challengeCount={challCount}
                                fnColor={fn.color}
                                onNavigate={() => { setFocusSubId(sub.id); setPage('mapping'); }}
                                onOpenChallenge={(e) => openChallengeModal(sub.id, e)}
                              />
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
        ) : page === 'mapping' ? (
          <MappingMatrix
            mappings={mappings}
            onToggle={handleToggleMapping}
            focusSubId={focusSubId}
            onFocusHandled={() => setFocusSubId(null)}
          />
        ) : page === 'report' ? (
          <ChallengeTagReport
            challenges={challenges}
            selectedChallengeId={reportChallengeId}
            onSelectChallenge={setReportChallengeId}
            onToggleTag={handleToggleReportTag}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        ) : (
          <ChallengeLibrary
            challenges={challenges}
            selectedIds={selectedBankIds}
            onToggle={handleBankToggle}
            onEditTags={openTagEditor}
          />
        )}

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px', borderTop: '1px solid #0e2a3a', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a2a3a' }}>
            ‹ NIST CSF 2.0 Challenge Matrix ›
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2a3a' }}>
            {page === 'matrix' ? 'Click cell → mapping  ·  🎯 Click badge → challenge' : page === 'mapping' ? 'Click a cell to toggle mapping' : page === 'report' ? 'Select a challenge  ·  Click a subcategory cell to tag / untag it' : 'Click a challenge to select  ·  Selected challenges plot on matrix'}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.1em', color: '#1a2a3a' }}>
            Design Version 2.0.0-beta
          </div>
        </div>
      </div>

      {/* ── Challenge Modal ── */}
      {modalSubId !== null && (
        <ChallengeModal
          selectedSubs={[modalSubId]}
          existingChallenges={getChallengesForSub(challengeStore, modalSubId)}
          onSave={handleSaveChallenge}
          onClose={closeChallengeModal}
        />
      )}

      {/* ── Export DOCX Modal ── */}
      {showExportDocx && (
        <ExportDocxModal
          taggedCount={challenges.filter((c) => c.nistTags.length > 0).length}
          onExport={(title, subject) => {
            exportChallengeTagDoc(challenges, { title, subject });
            setShowExportDocx(false);
          }}
          onClose={() => setShowExportDocx(false)}
        />
      )}

      {/* ── Tag Editor Modal ── */}
      {editingChallenge !== null && (
        <TagEditorModal
          challenge={editingChallenge}
          onSave={(tags) => {
            handleUpdateChallengeTags(editingChallenge.id, tags);
            closeTagEditor();
          }}
          onClose={closeTagEditor}
        />
      )}
    </div>
  );
};

// ── SubcategoryCell ────────────────────────────────────────────

interface SubcategoryCellProps {
  subId: string;
  subName: string;
  isMapped: boolean;
  hasChallenge: boolean;
  challengeCount: number;
  fnColor: string;
  onNavigate: () => void;
  onOpenChallenge: (e: React.MouseEvent) => void;
}

const SubcategoryCell: React.FC<SubcategoryCellProps> = ({
  subName, isMapped, hasChallenge, challengeCount, fnColor, onNavigate, onOpenChallenge,
}) => {
  const [hovered, setHovered] = useState(false);

  // Border & background based on state
  let bg = '#0c1220';
  let border = '#111e2e';
  let textColor = '#8899aa';

  if (isMapped && hasChallenge) {
    bg = '#0c1e3a';
    border = fnColor + '66';
    textColor = '#81d4fa';
  } else if (isMapped) {
    bg = '#0b1a30';
    border = '#1a3a5a';
    textColor = '#6a90aa';
  } else if (hasChallenge) {
    bg = '#1a1400';
    border = '#d4a01744';
    textColor = '#c8a840';
  }

  if (hovered) {
    bg = isMapped ? '#0e1e40' : hasChallenge ? '#221a00' : '#0e1830';
    border = isMapped ? fnColor + '80' : hasChallenge ? '#d4a01788' : '#1a2e44';
  }

  return (
    <div
      style={{
        padding: '7px 8px',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        boxShadow: isMapped && hasChallenge ? glow(fnColor, 12, '66')
          : hasChallenge ? glow('#d4a017', 10, '44')
          : isMapped ? glow(fnColor, 8, '33') : 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
    >
      {/* Left accent bar when mapped */}
      {isMapped && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, background: fnColor, borderRadius: '3px 0 0 3px',
        }} />
      )}

      {/* Label */}
      <div style={{ flex: 1, paddingLeft: isMapped ? 4 : 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: textColor, lineHeight: 1.35 }}>
          {subName}
        </div>
      </div>

      {/* Right-side icons */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
        {/* LINKED badge */}
        {isMapped && (
          <span
            title="Tool mapped — click to view"
            style={{
              fontSize: 10, color: '#4fc3f7', lineHeight: 1,
              padding: '1px 2px', borderRadius: 2,
              background: 'rgba(79,195,247,0.08)',
            }}
          >
            🔗
          </span>
        )}

        {/* CHALLENGE badge — click opens modal */}
        <span
          title={hasChallenge ? `${challengeCount} challenge${challengeCount > 1 ? 's' : ''} — click to manage` : 'No challenge — click to add'}
          onClick={onOpenChallenge}
          style={{
            fontSize: 9,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.05em',
            padding: '2px 5px',
            borderRadius: 2,
            border: `1px solid ${hasChallenge ? '#d4a01766' : '#1a2a3a'}`,
            background: hasChallenge ? '#2a1a0088' : 'transparent',
            color: hasChallenge ? '#d4a017' : '#2a3a4a',
            cursor: 'pointer',
            transition: 'all 0.15s',
            minWidth: 22,
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d4a017aa';
            e.currentTarget.style.color = '#f0c030';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = hasChallenge ? '#d4a01766' : '#1a2a3a';
            e.currentTarget.style.color = hasChallenge ? '#d4a017' : '#2a3a4a';
          }}
        >
          {hasChallenge ? `🎯${challengeCount}` : '🎯'}
        </span>

        {/* Navigate arrow */}
        <span style={{ fontSize: 12, color: '#2a3a4a' }}>›</span>
      </div>
    </div>
  );
};

// ── LegendItem ────────────────────────────────────────────────

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{
      width: 10, height: 10, borderRadius: 2,
      background: color === '#2a3a4a' ? 'transparent' : color + '33',
      border: `1px solid ${color}`,
    }} />
    <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3a4a5a' }}>{label}</span>
  </div>
);

// ── Styles ────────────────────────────────────────────────────

const langBtnStyle: React.CSSProperties = {
  padding: '3px 10px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 6, background: 'transparent',
  border: '1px solid #1a2a3a', textTransform: 'uppercase',
};

const tabBtnStyle: React.CSSProperties = {
  padding: '6px 16px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 8,
  background: 'transparent', border: `1px solid ${ACCENT}22`, color: '#5a7280',
};

const tabActiveStyle: React.CSSProperties = {
  background: `${ACCENT}1a`, color: ACCENT, borderColor: ACCENT, boxShadow: glow(ACCENT, 14, '44'),
};

const tabChallengeActiveStyle: React.CSSProperties = {
  background: '#1a140033', color: '#fbbf24', borderColor: '#fbbf24', boxShadow: glow('#fbbf24', 14, '44'),
};

const hudBtnStyle: React.CSSProperties = {
  padding: '6px 16px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 8,
  background: 'transparent', border: `1px solid ${ACCENT}33`, color: '#6aa3b3',
};

const cornerStyle: React.CSSProperties = {
  position: 'absolute', width: 20, height: 20, pointerEvents: 'none',
  borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}`,
};

export default NISTMatrix;
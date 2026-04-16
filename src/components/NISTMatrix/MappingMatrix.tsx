import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { NIST_FUNCTIONS } from './data';
import { TOOL_GROUPS, NIST_TOOL_MAPPINGS } from './challengeData';

// ── Helpers (exported for parent use) ──

export const cellKey = (subId: string, toolId: string) => `${subId}::${toolId}`;

export const buildInitialMappings = (): Set<string> => {
  const set = new Set<string>();
  for (const [subId, toolIds] of Object.entries(NIST_TOOL_MAPPINGS)) {
    for (const tid of toolIds) set.add(cellKey(subId, tid));
  }
  return set;
};

/** Derive covered subcategory IDs from mapping set */
export const getCoveredSubs = (mappings: Set<string>): Set<string> => {
  const covered = new Set<string>();
  for (const key of mappings) {
    covered.add(key.split('::')[0]);
  }
  return covered;
};

// ── Export helpers ──

const flatRows = () => {
  const result: { fnName: string; catId: string; catName: string; subId: string; subName: string }[] = [];
  for (const fn of NIST_FUNCTIONS)
    for (const cat of fn.cats)
      for (const sub of cat.subs)
        result.push({ fnName: fn.name, catId: cat.id, catName: cat.name, subId: sub.id, subName: sub.name });
  return result;
};

export const exportMappingJson = (mappings: Set<string>) => {
  const data: Record<string, string[]> = {};
  for (const key of mappings) {
    const [subId, toolId] = key.split('::');
    if (!data[subId]) data[subId] = [];
    data[subId].push(toolId);
  }
  for (const k of Object.keys(data)) data[k].sort();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, 'nist-mapping-export.json');
};

export const exportMappingCsv = (mappings: Set<string>) => {
  const allTools = TOOL_GROUPS.flatMap((g) => g.tools);
  const header = ['Cluster', 'Category', 'Subcategory ID', 'Subcategory Name', ...allTools.map((t) => t.id)];
  const csvRows = [header.join(',')];
  for (const row of flatRows()) {
    const cells = allTools.map((t) => (mappings.has(cellKey(row.subId, t.id)) ? '1' : ''));
    csvRows.push([row.fnName, `${row.catId} ${row.catName}`, row.subId, `"${row.subName}"`, ...cells].join(','));
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'nist-mapping-export.csv');
};

export const importMappingJson = (): Promise<Set<string>> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(new Set()); return; }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string) as Record<string, string[]>;
          const next = new Set<string>();
          for (const [subId, toolIds] of Object.entries(json)) {
            for (const tid of toolIds) next.add(cellKey(subId, tid));
          }
          resolve(next);
        } catch {
          alert('Invalid JSON file.');
          resolve(new Set());
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};

// ── Component ──

interface MappingMatrixProps {
  mappings: Set<string>;
  onToggle: (subId: string, toolId: string) => void;
  focusSubId?: string | null;
  onFocusHandled?: () => void;
}

const MappingMatrix: React.FC<MappingMatrixProps> = ({ mappings, onToggle, focusSubId, onFocusHandled }) => {
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [highlightSubId, setHighlightSubId] = useState<string | null>(null);

  // Scroll to focused row when it changes
  useEffect(() => {
    if (!focusSubId) return;
    // Small delay to let the DOM render
    const timer = setTimeout(() => {
      const row = rowRefs.current[focusSubId];
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightSubId(focusSubId);
        // Clear highlight after animation
        setTimeout(() => setHighlightSubId(null), 2000);
      }
      onFocusHandled?.();
    }, 100);
    return () => clearTimeout(timer);
  }, [focusSubId, onFocusHandled]);
  // Build flat row list
  const rows = useMemo(() => {
    const result: {
      fnId: string; fnName: string; fnColor: string;
      catId: string; catName: string;
      subId: string; subName: string;
      fnRowSpan: number; isFirstInFn: boolean;
    }[] = [];
    for (const fn of NIST_FUNCTIONS) {
      const fnSubCount = fn.cats.reduce((a, c) => a + c.subs.length, 0);
      let isFirstInFn = true;
      for (const cat of fn.cats) {
        for (const sub of cat.subs) {
          result.push({
            fnId: fn.id, fnName: fn.name, fnColor: fn.color,
            catId: cat.id, catName: cat.name,
            subId: sub.id, subName: sub.name,
            fnRowSpan: fnSubCount, isFirstInFn,
          });
          isFirstInFn = false;
        }
      }
    }
    return result;
  }, []);

  const handleClick = useCallback((subId: string, toolId: string) => {
    onToggle(subId, toolId);
  }, [onToggle]);

  const totalToolCols = TOOL_GROUPS.reduce((a, g) => a + g.tools.length, 0);

  return (
    <div style={{ overflow: 'auto', padding: '16px 20px', flex: 1, minHeight: 0 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: totalToolCols * 48 + 300 }}>

        {/* ═══ HEADER: 2 rows ═══ */}
        <thead>
          <tr>
            <th style={{ ...thBase, width: 60, position: 'sticky', left: 0, zIndex: 4, background: '#080c14', borderRight: '1px solid #1a2a3a' }} rowSpan={2}>
              Cluster
            </th>
            <th style={{ ...thBase, width: 220, position: 'sticky', left: 60, zIndex: 4, background: '#080c14', borderRight: '1px solid #1a2a3a' }} rowSpan={2}>
              Activity
            </th>
            {TOOL_GROUPS.map((g) => (
              <th
                key={g.group}
                colSpan={g.tools.length}
                style={{
                  ...thBase,
                  textAlign: 'center',
                  color: g.color,
                  borderBottom: `2px solid ${g.color}`,
                  borderRight: '1px solid #1a2a3a',
                  fontSize: 10,
                  padding: '10px 6px',
                  background: '#080c14',
                }}
              >
                {g.group}
              </th>
            ))}
          </tr>
          <tr>
            {TOOL_GROUPS.map((g) =>
              g.tools.map((tool, ti) => (
                <th
                  key={tool.id}
                  title={tool.fullName}
                  style={{
                    ...thBase,
                    textAlign: 'center',
                    width: 46,
                    padding: '8px 2px',
                    fontSize: 9,
                    fontFamily: "'Share Tech Mono', monospace",
                    color: '#8899aa',
                    background: '#080c14',
                    borderRight: ti === g.tools.length - 1 ? '1px solid #1a2a3a' : '1px solid #0e1a2a',
                    cursor: 'help',
                  }}
                >
                  {tool.id}
                </th>
              ))
            )}
          </tr>
        </thead>

        {/* ═══ BODY ═══ */}
        <tbody>
          {rows.map((row, ri) => {
            const isHighlighted = highlightSubId === row.subId;
            return (
            <tr
              key={row.subId}
              ref={(el) => { rowRefs.current[row.subId] = el; }}
              style={{
                background: isHighlighted ? '#1a2a4a' : (ri % 2 === 0 ? '#080c14' : '#0a0e18'),
                transition: 'background 0.5s ease',
              }}
            >
              {row.isFirstInFn && (
                <td
                  rowSpan={row.fnRowSpan}
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    background: '#080c14',
                    borderRight: '1px solid #1a2a3a',
                    borderBottom: '1px solid #1a2a3a',
                    borderLeft: `3px solid ${row.fnColor}`,
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    padding: '8px 4px',
                    width: 60,
                  }}
                >
                  <div style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: row.fnColor,
                    whiteSpace: 'nowrap',
                  }}>
                    {row.fnName} ({row.fnId})
                  </div>
                </td>
              )}

              <td style={{
                position: 'sticky',
                left: 60,
                zIndex: 2,
                background: ri % 2 === 0 ? '#080c14' : '#0a0e18',
                borderBottom: '1px solid #0e1a2a',
                borderRight: '1px solid #1a2a3a',
                padding: '5px 8px',
                fontSize: 10,
                color: '#8899aa',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 220,
              }}>
                <span style={{
                  color: '#4a6a7a',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 9,
                  marginRight: 6,
                }}>
                  {row.subId}
                </span>
                {row.subName}
              </td>

              {TOOL_GROUPS.map((g) =>
                g.tools.map((tool, ti) => {
                  const isMapped = mappings.has(cellKey(row.subId, tool.id));
                  return (
                    <td
                      key={tool.id}
                      onClick={() => handleClick(row.subId, tool.id)}
                      style={{
                        borderBottom: '1px solid #0e1a2a',
                        borderRight: ti === g.tools.length - 1 ? '1px solid #1a2a3a' : '1px solid #0e1a2a',
                        textAlign: 'center',
                        padding: '3px 2px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0e1830'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                    >
                      {isMapped && (
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: row.fnColor,
                          boxShadow: `0 0 6px ${row.fnColor}55`,
                          margin: '0 auto',
                        }} />
                      )}
                    </td>
                  );
                })
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thBase: React.CSSProperties = {
  borderBottom: '1px solid #1a2a3a',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#4fc3f7',
  fontSize: 10,
  padding: '8px 6px',
  textAlign: 'left',
  position: 'sticky',
  top: 0,
  zIndex: 3,
  background: '#080c14',
};

export default MappingMatrix;

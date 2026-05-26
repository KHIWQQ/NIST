import { saveAs } from 'file-saver';
import { NIST_FUNCTIONS } from './data';
import { TOOL_GROUPS } from './challengeData';

export const cellKey = (subId: string, toolId: string) => `${subId}::${toolId}`;

// Start with no mappings — the user fills these in (or imports JSON).
// The old hardcoded NIST_TOOL_MAPPINGS seed in challengeData.ts is no longer used.
export const buildInitialMappings = (): Set<string> => new Set<string>();

/** Derive covered subcategory IDs from mapping set */
export const getCoveredSubs = (mappings: Set<string>): Set<string> => {
  const covered = new Set<string>();
  for (const key of mappings) {
    covered.add(key.split('::')[0]);
  }
  return covered;
};

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

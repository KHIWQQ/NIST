import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer, TabStopPosition, TabStopType, Header } from 'docx';
import { saveAs } from 'file-saver';
import { NIST_FUNCTIONS } from './data';
import type { Challenge } from './types';

// ── JSON Layer Format ────────────────────────────────────────

interface LayerEntry {
  subcategory: string;
  name: string;
}

type NistLayer = Record<string, LayerEntry[]>;

/** Build the JSON layer object from selected subcategory IDs */
const buildLayer = (selectedIds: Set<string>): NistLayer => {
  const layer: NistLayer = {};
  for (const fn of NIST_FUNCTIONS) {
    const entries: LayerEntry[] = [];
    for (const cat of fn.cats) {
      for (const sub of cat.subs) {
        if (selectedIds.has(sub.id)) {
          entries.push({ subcategory: sub.id, name: sub.name });
        }
      }
    }
    if (entries.length > 0) {
      layer[fn.name] = entries;
    }
  }
  return layer;
};

// ── Export JSON Layer ────────────────────────────────────────

export const exportJsonLayer = (selected: Set<string>) => {
  if (selected.size === 0) { alert('No subcategories selected.'); return; }
  const layer = buildLayer(selected);
  const blob = new Blob([JSON.stringify(layer, null, 2)], { type: 'application/json' });
  saveAs(blob, `nist-layer-export.json`);
};

// ── Import JSON Layer ────────────────────────────────────────

/** Returns a Set of valid subcategory IDs parsed from the imported JSON */
export const importJsonLayer = (): Promise<Set<string>> => {
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
          const json = JSON.parse(reader.result as string) as NistLayer;
          const allValidIds = new Set(
            NIST_FUNCTIONS.flatMap((fn) => fn.cats.flatMap((c) => c.subs.map((s) => s.id)))
          );
          const ids = new Set<string>();
          for (const entries of Object.values(json)) {
            for (const entry of entries) {
              if (allValidIds.has(entry.subcategory)) {
                ids.add(entry.subcategory);
              }
            }
          }
          resolve(ids);
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

// ── Export Documentation (DOCX) ──────────────────────────────

const DOTS = (len: number) => '.'.repeat(Math.max(len, 10));

export const exportDocumentation = async (selected: Set<string>) => {
  if (selected.size === 0) { alert('No subcategories selected.'); return; }

  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: 'NIST CSF 2.0 Assessment Report', bold: true, size: 32, font: 'Calibri' })],
    }),
  );

  // Subject line
  sections.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: 'Subject: ', bold: true, size: 22, font: 'Calibri' })],
    }),
  );

  // Separator
  sections.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
      spacing: { after: 200 },
      children: [],
    }),
  );

  for (const fn of NIST_FUNCTIONS) {
    const selectedSubs = fn.cats.flatMap((c) =>
      c.subs.filter((s) => selected.has(s.id))
    );
    if (selectedSubs.length === 0) continue;

    // Function header
    sections.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: 'Function: ', size: 22, font: 'Calibri', color: '666666' }),
          new TextRun({ text: fn.name, bold: true, size: 22, font: 'Calibri' }),
        ],
      }),
    );

    // Each selected subcategory
    for (const sub of selectedSubs) {
      const label = `  Subcategory: ${sub.id} - ${sub.name} `;
      const dotsLen = Math.max(60 - label.length, 10);
      sections.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `  Subcategory: `, size: 20, font: 'Calibri', color: '888888' }),
            new TextRun({ text: `${sub.id} - ${sub.name}`, size: 20, font: 'Calibri' }),
            new TextRun({ text: ` ${DOTS(dotsLen)}`, size: 20, font: 'Calibri', color: 'CCCCCC' }),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'NIST CSF 2.0 — Cyber Range Report', size: 16, font: 'Calibri', color: '999999', italics: true })],
            }),
          ],
        }),
      },
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'NIST_CSF_Report.docx');
};

// ── Export Challenge → NIST Tag Report (DOCX) ────────────────
// Lists every challenge that has NIST tags, grouped by function.

export const exportChallengeTagDoc = async (
  challenges: Challenge[],
  meta: { title: string; subject: string },
) => {
  const tagged = challenges
    .filter((c) => c.nistTags.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (tagged.length === 0) { alert('No challenges have NIST tags yet.'); return; }

  // sub_id → { fnName, subName } lookup
  const subInfo = new Map<string, { fnName: string; subName: string }>();
  for (const fn of NIST_FUNCTIONS)
    for (const cat of fn.cats)
      for (const sub of cat.subs)
        subInfo.set(sub.id, { fnName: fn.name, subName: sub.name });

  const uniqueSubs = new Set<string>();
  tagged.forEach((c) => c.nistTags.forEach((t) => uniqueSubs.add(t)));

  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: meta.title || 'NIST CSF 2.0 Challenge Tag Report', bold: true, size: 32, font: 'Calibri' })],
    }),
  );

  // Subject
  sections.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Subject: ', bold: true, size: 22, font: 'Calibri' }),
        new TextRun({ text: meta.subject || '-', size: 22, font: 'Calibri' }),
      ],
    }),
  );

  // Summary
  sections.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({
        text: `${tagged.length} challenges tagged · ${uniqueSubs.size} NIST subcategories covered`,
        italics: true, size: 18, font: 'Calibri', color: '666666',
      })],
    }),
  );

  // Separator
  sections.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
      spacing: { after: 200 },
      children: [],
    }),
  );

  for (const ch of tagged) {
    const metaLine = [ch.ctype, ch.sub_type, `${ch.score} PTS`].filter(Boolean).join(' · ');

    // Challenge header
    sections.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: ch.name, bold: true, size: 24, font: 'Calibri' }),
          new TextRun({ text: `   ${metaLine}`, size: 16, font: 'Calibri', color: '888888' }),
        ],
      }),
    );

    // Tags grouped by NIST function
    for (const fn of NIST_FUNCTIONS) {
      const subs = ch.nistTags
        .filter((t) => subInfo.get(t)?.fnName === fn.name)
        .sort();
      if (subs.length === 0) continue;
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `    ${fn.name}: `, bold: true, size: 18, font: 'Calibri', color: '666666' }),
            new TextRun({ text: subs.map((s) => `${s} (${subInfo.get(s)?.subName})`).join(';  '), size: 18, font: 'Calibri' }),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'NIST CSF 2.0 — Cyber Range Report', size: 16, font: 'Calibri', color: '999999', italics: true })],
            }),
          ],
        }),
      },
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'NIST_CSF_Challenge_Tag_Report.docx');
};

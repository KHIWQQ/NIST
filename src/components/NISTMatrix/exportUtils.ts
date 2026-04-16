import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer, TabStopPosition, TabStopType, Header } from 'docx';
import { saveAs } from 'file-saver';
import { NIST_FUNCTIONS } from './data';

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

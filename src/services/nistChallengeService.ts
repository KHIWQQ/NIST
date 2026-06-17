import type { Challenge } from '../components/NISTMatrix/types';
import { authService } from './auth';

// Same-origin via Vite proxy (/api → rtaf-api). See vite.config.ts.
const BASE = '';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function ensureOk(res: Response, label: string): Promise<void> {
  if (res.ok) return;
  if (res.status === 401) {
    // Token expired or invalid → clear so user sees login screen on next mount
    authService.logout();
  }
  const body = await res.text().catch(() => '');
  throw new Error(`${label} failed: ${res.status} ${res.statusText}${body ? ' — ' + body.slice(0, 200) : ''}`);
}

// ── rtaf-api response shape (whitelisted by challenge-fetch.fetchAll) ──
interface RtafChallenge {
  id: number;
  documentId?: string;
  name: string;
  description?: string | null;
  score?: number | null;
  ctype?: string | null;
  sub_type?: string | null;
  answer_type?: string | null;
}

function mapChallenge(raw: RtafChallenge): Challenge {
  return {
    id: raw.id,
    documentId: raw.documentId,
    name: raw.name ?? '(unnamed)',
    description: raw.description ?? '',
    score: raw.score ?? 0,
    ctype: (raw.ctype as Challenge['ctype']) ?? null,
    sub_type: (raw.sub_type as Challenge['sub_type']) ?? null,
    answer_type: (raw.answer_type as Challenge['answer_type']) ?? null,
    nistTags: [],
  };
}

// ── /nist-data/matrix response shape (see api-stage/nist-data) ──
interface RtafMatrixSub {
  id: number;
  documentId: string;
  sub_id: string;       // human NIST id, e.g. "DE.CM-01" (matches data.ts)
  sub_name: string;
  challengeCount: number;
  challenges?: { documentId: string; name: string }[];
}
interface RtafMatrixCat { subcategories?: RtafMatrixSub[] }
interface RtafMatrixFn { categories?: RtafMatrixCat[] }

export interface NistMatrixMaps {
  // sub_id (e.g. "DE.CM-01") → NIST record documentId, used to translate
  // tags into the nistDocumentIds that link/unlink require.
  subIdToDocId: Record<string, string>;
  // challenge documentId → sub_id[], used to populate Challenge.nistTags.
  challengeTags: Record<string, string[]>;
}

export const challengeService = {
  async fetchAll(): Promise<Challenge[]> {
    const res = await fetch(`${BASE}/api/challenges/fetch-all`, {
      headers: { ...authHeaders() },
    });
    await ensureOk(res, 'fetchAll');
    const json = (await res.json()) as { data?: RtafChallenge[] };
    return (json.data ?? []).map(mapChallenge);
  },

  // ── Build the two lookup maps from /nist-data/matrix ──────────
  async fetchMatrix(): Promise<NistMatrixMaps> {
    const res = await fetch(`${BASE}/api/nist-data/matrix`, {
      headers: { ...authHeaders() },
    });
    await ensureOk(res, 'fetchMatrix');
    const json = (await res.json()) as { data?: RtafMatrixFn[] };

    const subIdToDocId: Record<string, string> = {};
    const challengeTags: Record<string, string[]> = {};
    for (const fn of json.data ?? []) {
      for (const cat of fn.categories ?? []) {
        for (const sub of cat.subcategories ?? []) {
          subIdToDocId[sub.sub_id] = sub.documentId;
          for (const ch of sub.challenges ?? []) {
            if (!ch.documentId) continue;
            (challengeTags[ch.documentId] ??= []).push(sub.sub_id);
          }
        }
      }
    }
    return { subIdToDocId, challengeTags };
  },

  // ── Load challenges + their NIST tags in one shot ─────────────
  // Matrix is best-effort: if the nist-data module isn't deployed yet,
  // challenges still load (untagged) rather than the whole page failing.
  async loadAll(): Promise<{ challenges: Challenge[]; subIdToDocId: Record<string, string> }> {
    const challenges = await this.fetchAll();
    let maps: NistMatrixMaps = { subIdToDocId: {}, challengeTags: {} };
    try {
      maps = await this.fetchMatrix();
    } catch (err) {
      console.warn('NIST matrix unavailable — tags stay empty until backend is merged:', err);
    }
    const merged = challenges.map((c) =>
      c.documentId && maps.challengeTags[c.documentId]
        ? { ...c, nistTags: maps.challengeTags[c.documentId] }
        : c
    );
    return { challenges: merged, subIdToDocId: maps.subIdToDocId };
  },

  // ── Set a challenge's NIST tags (requires nist-data module on rtaf-api) ──
  // Full replace: the PUT /link endpoint overwrites nist_datas with exactly
  // the given set. An empty array clears all tags. We deliberately avoid the
  // DELETE /unlink route — Strapi's body parser (koa-body) does not parse
  // request bodies for DELETE, so its `nistDocumentIds` arrives undefined and
  // the request 400s with "nistDocumentIds must be an array".
  async setTags(challengeDocumentId: string, nistDocumentIds: string[]): Promise<void> {
    const res = await fetch(
      `${BASE}/api/nist-data/challenge/${encodeURIComponent(challengeDocumentId)}/link`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ nistDocumentIds }),
      }
    );
    await ensureOk(res, 'setTags');
  },
};

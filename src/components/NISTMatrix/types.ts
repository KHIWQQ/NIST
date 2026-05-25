// ── NIST CSF 2.0 Types ────────────────────────────────────────

export interface NistSubcategory {
  id: string;
  name: string;
}

export interface NistCategory {
  id: string;
  name: string;
  subs: NistSubcategory[];
}

export interface NistFunction {
  id: string;
  name: string;
  color: string;
  dim: string;
  cats: NistCategory[];
}

// ── Challenge Types ───────────────────────────────────────────
// Shape mirrors rtaf-api GET /api/challenges/fetch-all whitelist:
// id, documentId, name, description, score, ctype, sub_type, answer_type

export type ChallengeCType = 'JEO' | 'KOTH' | 'ATDF' | 'PRAC';

export type ChallengeSubType =
  | 'VL' | 'SOC' | 'LOG' | 'TH' | 'OT' | 'RWS' | 'PR' | 'NONE'
  | 'Web' | 'Crypto' | 'PWN' | 'Mobile' | 'Reverse_Engineering'
  | 'Forensic' | 'Programming' | 'Network' | 'OS_Exploit';

export interface Challenge {
  id: number;
  documentId?: string;
  name: string;
  description: string;
  score: number;
  ctype?: ChallengeCType | null;
  sub_type?: ChallengeSubType | null;
  answer_type?: 'File' | 'Flag' | null;
  nistTags: string[]; // sub_ids — populated after nist-data merge; empty when none
}

// ── Store Types ───────────────────────────────────────────────

export type ChallengeStore = Record<string, Challenge[]>; // key = nist subcategory id

export interface MatrixStats {
  totalChallenges: number;
  coveredSubcategories: number;
  totalSubcategories: number;
}

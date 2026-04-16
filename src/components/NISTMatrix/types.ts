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

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ChallengeType =
  | 'Log Analysis'
  | 'Forensics'
  | 'Config Review'
  | 'PCAP Analysis'
  | 'Threat Hunting'
  | 'Incident Response'
  | 'Hardening';

export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  score: number;
  flag: string;
  nistTags: string[]; // e.g. ["DE.CM-01", "DE.AE-03"]
}

// ── Store Types ───────────────────────────────────────────────

export type ChallengeStore = Record<string, Challenge[]>; // key = nist subcategory id

export interface MatrixStats {
  totalChallenges: number;
  coveredSubcategories: number;
  totalSubcategories: number;
}

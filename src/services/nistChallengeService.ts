import type { Challenge } from '../components/NISTMatrix/types';

// ── Config ────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const USE_REAL_API = false; // Set to true when backend is ready

// ── Local Mock Adapter ────────────────────────────────────────────
class LocalChallengeAdapter {
  private storage: Challenge[] = [];
  private nextId = 1;

  async fetchAll(): Promise<Challenge[]> {
    return [...this.storage];
  }

  async fetchByTag(tag: string): Promise<Challenge[]> {
    return this.storage.filter(ch => ch.nistTags.includes(tag));
  }

  async create(payload: Omit<Challenge, 'id'>): Promise<Challenge> {
    const challenge: Challenge = {
      ...payload,
      id: String(this.nextId++),
    };
    this.storage.push(challenge);
    return challenge;
  }

  async update(id: string, payload: Partial<Challenge>): Promise<Challenge> {
    const idx = this.storage.findIndex(ch => ch.id === id);
    if (idx === -1) throw new Error(`Challenge ${id} not found`);
    this.storage[idx] = { ...this.storage[idx], ...payload };
    return this.storage[idx];
  }

  async delete(id: string): Promise<void> {
    const idx = this.storage.findIndex(ch => ch.id === id);
    if (idx === -1) throw new Error(`Challenge ${id} not found`);
    this.storage.splice(idx, 1);
  }
}

// ── API Adapter ───────────────────────────────────────────────────
class RemoteChallengeAdapter {
  async fetchAll(): Promise<Challenge[]> {
    const res = await fetch(`${BASE_URL}/nist/challenges`);
    if (!res.ok) throw new Error(`Failed to fetch challenges: ${res.status}`);
    return res.json();
  }

  async fetchByTag(tag: string): Promise<Challenge[]> {
    const res = await fetch(`${BASE_URL}/nist/challenges?nistTag=${encodeURIComponent(tag)}`);
    if (!res.ok) throw new Error(`Failed to fetch challenges by tag: ${res.status}`);
    return res.json();
  }

  async create(payload: Omit<Challenge, 'id'>): Promise<Challenge> {
    const res = await fetch(`${BASE_URL}/nist/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create challenge: ${res.status}`);
    return res.json();
  }

  async update(id: string, payload: Partial<Challenge>): Promise<Challenge> {
    const res = await fetch(`${BASE_URL}/nist/challenges/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update challenge: ${res.status}`);
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/nist/challenges/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete challenge: ${res.status}`);
  }
}

// ── Service Export ────────────────────────────────────────────────
const adapter = USE_REAL_API ? new RemoteChallengeAdapter() : new LocalChallengeAdapter();

export const challengeService = {
  async fetchAll(): Promise<Challenge[]> {
    return adapter.fetchAll();
  },

  async fetchByTag(tag: string): Promise<Challenge[]> {
    return adapter.fetchByTag(tag);
  },

  async create(payload: Omit<Challenge, 'id'>): Promise<Challenge> {
    return adapter.create(payload);
  },

  async update(id: string, payload: Partial<Challenge>): Promise<Challenge> {
    return adapter.update(id, payload);
  },

  async delete(id: string): Promise<void> {
    return adapter.delete(id);
  },
};
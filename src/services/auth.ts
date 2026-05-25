const TOKEN_KEY = 'nist.jwt';
const USER_KEY = 'nist.user';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  documentId?: string;
}

interface LoginResponse {
  jwt: string;
  user: AuthUser;
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async login(identifier: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message ?? `Login failed: ${res.status}`;
      throw new Error(msg);
    }
    const data = (await res.json()) as LoginResponse;
    localStorage.setItem(TOKEN_KEY, data.jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

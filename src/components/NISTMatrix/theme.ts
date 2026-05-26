// ── Shared MITRE-style neon-cyber theme tokens ────────────────

export const ACCENT = '#22d3ee'; // neon cyan accent

// App / page backgrounds (deep space gradient, mirrors rtaf-frontend MITRE)
export const APP_BG = 'linear-gradient(135deg, #020617 0%, #0a0f1f 55%, #000 100%)';
export const MATRIX_BG = 'linear-gradient(135deg, #020617 0%, #030a1a 55%, #000 100%)';

// Glassy panel surface
export const PANEL_BG = 'rgba(8,12,20,0.82)';

// Glow helpers — pass a hex color, get a box-shadow string
export const glow = (color: string = ACCENT, px = 22, alpha = '33') => `0 0 ${px}px ${color}${alpha}`;
export const textGlow = (color: string = ACCENT, px = 12, alpha = 'cc') => `0 0 ${px}px ${color}${alpha}`;

// ─────────────────────────────────────────────────────
// Design Tokens — single source of truth
// All colours reference CSS variables defined in index.css
// Use these JS constants anywhere inline styles are needed
// ─────────────────────────────────────────────────────

export const COLOR = {
  bg:       'var(--bg)',
  surface:  'var(--surface)',
  card:     'var(--card)',
  card2:    'var(--card2)',
  border:   'var(--border)',
  border2:  'var(--border2)',
  cyan:     'var(--cyan)',
  emerald:  'var(--emerald)',
  amber:    'var(--amber)',
  rose:     'var(--rose)',
  violet:   'var(--violet)',
  text:     'var(--text)',
  muted:    'var(--muted)',
  dim:      'var(--dim)',
}

export const FONT = {
  body:    "'Outfit', sans-serif",
  mono:    "'DM Mono', monospace",
  display: "'Playfair Display', serif",
}

export const RADIUS = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  18,
  xxl: 24,
}

export const UNIT_COLORS = {
  u1: '#00e5ff',
  u2: '#00e099',
  u3: '#8b5cf6',
  u4: '#ffb300',
  u5: '#ff4d6d',
}

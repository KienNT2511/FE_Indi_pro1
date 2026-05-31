// ─── Brand Colors (CSS var tokens) ───────────────────────────────────────────
// App name and description are defined in src/i18n/translations/{vi,en}.ts → common.appName / common.appDescription
// These map to the CSS custom properties defined in index.css.
export const COLORS = {
  primary:       'var(--color-primary)',
  primaryLight:  'var(--color-primary-light)',
  primaryDark:   'var(--color-primary-dark)',
  primaryBg:     'var(--color-primary-bg)',

  accent:        'var(--color-accent)',
  accentLight:   'var(--color-accent-light)',

  danger:        'var(--color-danger)',
  dangerBg:      'var(--color-danger-bg)',

  border:        'var(--color-border)',
  surface:       'var(--color-surface)',
  textPrimary:   'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted:     'var(--color-text-muted)',
} as const

// ─── Tailwind utility class shorthands ───────────────────────────────────────
export const CLS = {
  brandGradient:      'bg-gradient-to-br from-indigo-500 to-purple-600',
  brandGradientLight: 'bg-gradient-to-br from-indigo-400 to-purple-500',

  navActive:     'bg-indigo-50 text-indigo-600',
  navActiveIcon: 'text-indigo-500',
  navIdle:       'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  navIdleIcon:   'text-gray-400',

  btnPrimary:    'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white',

  danger:        'hover:bg-red-50 hover:text-red-500',
} as const

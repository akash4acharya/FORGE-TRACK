/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbase: '#0a0a0b',
        darkcard: '#151517',
        amethyst: {
          DEFAULT: '#a855f7',
          hover: '#c084fc',
          light: 'rgba(168, 85, 247, 0.15)',
        },
        void: 'var(--bg-void)',
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          raised: 'var(--bg-surface-raised)',
          inset: 'var(--bg-surface-inset)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        fg: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        accent: {
          glow: 'var(--accent-glow)',
          secondary: 'var(--accent-glow-secondary)',
        },
        success: { DEFAULT: 'var(--success-fg)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
        danger: { DEFAULT: 'var(--danger-fg)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
        warning: { DEFAULT: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-hero': ['4.5rem', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'label': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '500' }],
        'micro': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        'xl': '1.125rem',  // 18px
        '2xl': '1.5rem',  // 24px
      },
      backgroundImage: {
        'cosmic-glow': 'radial-gradient(ellipse 600px 300px at 50% -100px, rgba(99,102,241,0.18), rgba(99,102,241,0) 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 50%)',
        'dot-grid': 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
    },
  },
  plugins: [],
}

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Icon = {
  user: (p) => <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>,
  lock: (p) => <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>,
  eye: (p) => <svg {...base} {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  eyeOff: (p) => <svg {...base} {...p}><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.5 6.8C3.8 8.5 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.2-1" /></svg>,
  home: (p) => <svg {...base} {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>,
  globe: (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>,
  chart: (p) => <svg {...base} {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>,
  plus: (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  camera: (p) => <svg {...base} {...p}><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  check: (p) => <svg {...base} {...p}><path d="M5 12l5 5 9-10" /></svg>,
  back: (p) => <svg {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>,
  heart: (p) => <svg {...base} {...p}><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" /></svg>,
  bookmark: (p) => <svg {...base} {...p}><path d="M6 3h12v18l-6-4-6 4z" /></svg>,
}

// Pulmões estilizados (identidade visual do app)
export function LungsMark({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="#fff" aria-hidden="true">
      <rect x="29" y="14" width="6" height="18" rx="3" />
      <path d="M32 18c-2-7-7-10-12-11 .4 6 4.5 10 12 11z" />
      <path d="M32 18c2-7 7-10 12-11-.4 6-4.5 10-12 11z" />
      <path d="M27 31c-9 2-16 12-16 22 0 5 3 7 8 6 6-1 8-6 8-12z" />
      <path d="M37 31c9 2 16 12 16 22 0 5-3 7-8 6-6-1-8-6-8-12z" />
    </svg>
  )
}
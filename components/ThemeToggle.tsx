'use client';

import { MoonStar, SunMedium } from 'lucide-react';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="theme-toggle no-print inline-flex items-center gap-3 rounded-full border border-white/14 bg-white/10 px-3 py-2.5 text-sm font-semibold text-[var(--text)] shadow-[0_14px_30px_-18px_rgba(34,24,64,0.35)] backdrop-blur"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
          isDark
            ? 'border-indigo-300/20 bg-[linear-gradient(145deg,rgba(24,24,42,0.95),rgba(54,36,92,0.72))] text-amber-300'
            : 'border-amber-200/70 bg-[linear-gradient(145deg,rgba(255,251,235,0.96),rgba(254,240,138,0.6))] text-amber-600'
        }`}
      >
        {isDark ? <MoonStar size={18} /> : <SunMedium size={18} />}
      </span>

      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Tema</span>
        <span className="mt-1 text-sm font-semibold text-[var(--text)]">{isDark ? 'Modo escuro' : 'Modo claro'}</span>
      </span>
    </button>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cormorant_Garamond } from 'next/font/google';
import { LogoMark } from '@/components/LogoMark';

type SplashScreenProps = {
  done?: boolean;
};

const DURATION_MS = 7000;

const mennuBrandFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700']
});

export function SplashScreen({ done = false }: SplashScreenProps) {
  const [minimumTimeReached, setMinimumTimeReached] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumTimeReached(true);
    }, DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (done && minimumTimeReached) {
      const exitTimer = window.setTimeout(() => {
        setVisible(false);
      }, 260);

      return () => window.clearTimeout(exitTimer);
    }
  }, [done, minimumTimeReached]);

  const progress = useMemo(() => {
    if (!minimumTimeReached) return 86;
    return done ? 100 : 92;
  }, [done, minimumTimeReached]);

  if (!visible) return null;

  return (
    <div
      className={[
        'fixed inset-0 z-[999] overflow-hidden transition-all duration-500',
        done && minimumTimeReached ? 'pointer-events-none opacity-0 blur-[4px]' : 'opacity-100'
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,249,157,0.24),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_30%),linear-gradient(180deg,#f8faf7_0%,#f5f7ff_40%,#eef8ef_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,101,52,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,101,52,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-35" />

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto flex justify-center">
            <LogoMark
              size={280}
              className="drop-shadow-[0_18px_40px_rgba(22,101,52,0.22)] md:h-[320px] md:w-[320px]"
            />
          </div>

          <div className="mt-5 space-y-3">
            <h1
              className={`${mennuBrandFont.className} text-4xl font-semibold tracking-[-0.04em] md:text-6xl`}
              style={{
                color: '#6EDC3A',
                textShadow:
                  '-1px -1px 0 #0f3d0f, 1px -1px 0 #0f3d0f, -1px 1px 0 #0f3d0f, 1px 1px 0 #0f3d0f, 0 10px 24px rgba(16, 66, 16, 0.18)'
              }}
            >
              MENNU
            </h1>
            <p className="mx-auto max-w-lg text-lg italic leading-8 text-[var(--muted)] md:text-2xl">
              Menos tempo na cozinha ... Mais tempo pra você
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-md rounded-full border border-[color:rgba(22,101,52,0.10)] bg-white/65 p-2 shadow-[0_18px_50px_-30px_rgba(22,101,52,0.35)] backdrop-blur">
            <div className="h-3 overflow-hidden rounded-full bg-[rgba(22,101,52,0.08)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#84cc16_48%,#facc15_100%)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]/85">
            preparando sua experiência
          </p>
        </div>
      </div>
    </div>
  );
}

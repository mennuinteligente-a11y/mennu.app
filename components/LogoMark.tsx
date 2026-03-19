'use client';

import { Cormorant_Garamond } from "next/font/google"

const mennuFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600","700"]
})

type LogoMarkProps = {
  size?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  withLabel?: boolean;
  title?: string;
  subtitle?: string;
  stacked?: boolean;
  textAlign?: 'left' | 'center' | 'right';
};

export function LogoMark({
  size = 84,
  className = '',
  imageClassName = '',
  withLabel = false,
  title = 'MENNU',
  subtitle = 'Sistema de Cardápio Inteligente',
  stacked = false,
  textAlign = 'left'
}: LogoMarkProps) {
  const alignmentClass =
    textAlign === 'center'
      ? 'items-center text-center'
      : textAlign === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  if (withLabel) {
    return (
      <div
        className={[
          'flex',
          stacked ? 'flex-col gap-3' : 'flex-row items-center gap-4',
          stacked ? alignmentClass : '',
          className
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          src="/Logo.png"
          alt={title}
          width={size}
          height={size}
          className={['block shrink-0 object-contain', imageClassName].filter(Boolean).join(' ')}
          style={{ width: size, height: size }}
        />

        <div className={['flex min-w-0 flex-col', alignmentClass].join(' ')}>
          <span
            className={`${mennuFont.className} text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl`}
            style={{
              color: "#6EDC3A",
              textShadow: "-1px -1px 0 #0f3d0f, 1px -1px 0 #0f3d0f, -1px 1px 0 #0f3d0f, 1px 1px 0 #0f3d0f"
            }}
          >
            {title}
          </span>

          {subtitle ? (
            <span className="text-sm leading-5 text-[var(--muted)] sm:text-base">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <img
      src="/Logo.png"
      alt={title}
      width={size}
      height={size}
      className={['block object-contain', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    />
  );
}

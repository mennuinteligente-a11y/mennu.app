import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'MENNU Sistema de Cardápio Inteligente',
  description:
    'App de cardápio inteligente com planejamento semanal, custos por refeição, lista de compras por categoria e base pronta para biblioteca de receitas.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] font-[var(--font-inter)] text-[var(--text)] antialiased selection:bg-[var(--brand)]/25 selection:text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}

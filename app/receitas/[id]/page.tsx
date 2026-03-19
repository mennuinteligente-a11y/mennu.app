import Link from 'next/link';
import {
  ArrowLeft,
  Clock3,
  Flame,
  ShoppingBasket,
  TimerReset,
  UsersRound,
  Wallet,
  ChefHat,
  Utensils,
} from 'lucide-react';
import { LogoMark } from '@/components/LogoMark';
import { RecipePhoto } from '@/components/RecipePhoto';
import { formatCurrency } from '@/lib/visuals';
import { getMealLabel, getRecipeDetailData } from '@/lib/mealPlanner';
import { MealType } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variation?: string; people?: string }>;
}

/* ── Cores por tipo de refeição ─────────────────────────────────── */
function getMealAccent(mealType: MealType) {
  switch (mealType) {
    case 'cafe':
      return {
        badge: 'bg-amber-500/20 text-amber-600 border-amber-400/30 dark:text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'almoco':
      return {
        badge: 'bg-emerald-500/20 text-emerald-700 border-emerald-400/30 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'jantar':
      return {
        badge: 'bg-indigo-500/20 text-indigo-700 border-indigo-400/30 dark:text-indigo-400',
        dot: 'bg-indigo-500',
      };
    default:
      return {
        badge: 'bg-[var(--brand)]/15 text-[var(--brand)] border-[var(--brand)]/25',
        dot: 'bg-[var(--brand)]',
      };
  }
}

/* ── Ícone + cor por card de metadado ───────────────────────────── */
const META_CARDS = [
  {
    key: 'time',
    icon: Clock3,
    label: 'Tempo',
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  {
    key: 'serves',
    icon: UsersRound,
    label: 'Rendimento',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    key: 'heat',
    icon: Flame,
    label: 'Fogo',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    key: 'rest',
    icon: TimerReset,
    label: 'Descanso',
    iconColor: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    key: 'cost',
    icon: Wallet,
    label: 'R$ Prato',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  {
    key: 'market',
    icon: ShoppingBasket,
    label: 'R$ Mercado',
    iconColor: 'text-green-900',
    bgColor: 'bg-green-500/10',
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default async function RecipePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const variation = query.variation ? decodeURIComponent(query.variation) : undefined;
  const people = Number(query.people ?? '2') || 2;
  const detail = getRecipeDetailData(id, variation ?? '', people);

  /* ── Not found ─────────────────────────────────────────────────── */
  if (!detail) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="card-surface rounded-[32px] p-6 text-center">
          <LogoMark size={82} className="justify-center" />
          <h1 className="mt-5 text-3xl font-semibold">Receita não encontrada</h1>
          <p className="mt-3 text-[var(--muted)]">Essa receita não está disponível no momento.</p>
          <Link
            href="/"
            className="action-btn mt-6 inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-3"
          >
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>
      </main>
    );
  }

  const accent = getMealAccent(detail.mealType);

  const firstStep = detail.steps[0]?.trim().toLowerCase() ?? '';
  const fullMethodNormalized = detail.fullMethodText?.trim().toLowerCase() ?? '';
  const introNormalized = detail.introText?.trim().toLowerCase() ?? '';

  const shouldShowIntro =
    Boolean(detail.introText?.trim()) &&
    introNormalized !== fullMethodNormalized &&
    introNormalized !== firstStep;

  /* Valores dos metadados na ordem de META_CARDS */
  const metaValues: Record<string, React.ReactNode> = {
    time: (
      <span>
        {detail.timeMinutes}{' '}
        <span className="text-sm font-normal text-[var(--muted)]">min</span>
      </span>
    ),
    serves: (
      <span>
        {detail.serves}{' '}
        <span className="text-sm font-normal text-[var(--muted)]">porções</span>
      </span>
    ),
    heat: detail.heatLevel,
    rest: detail.restMinutes ? (
      <span>
        {detail.restMinutes}{' '}
        <span className="text-sm font-normal text-[var(--muted)]">min</span>
      </span>
    ) : (
      <span className="text-base">—</span>
    ),
    cost: (
      <span className="text-emerald-600 dark:text-emerald-400">
        {formatCurrency(detail.fractionedTotal)}
      </span>
    ),
    market: (
      <span className="text-green-900 dark:text-green-400">
        {formatCurrency(detail.initialMarketTotal)}
      </span>
    ),
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

      {/* ── Top Nav ───────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="action-btn inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--panel)]"
        >
          <ArrowLeft size={15} /> Voltar ao plano
        </Link>
        <LogoMark size={68} withLabel subtitle="Sistema de Cardápio Inteligente" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — foto full-bleed com título sobreposto
      ══════════════════════════════════════════════════════════════ */}
      <div className="recipe-hero card-surface overflow-hidden rounded-[36px]">

        {/* Foto full-bleed */}
        <div className="relative">
          <RecipePhoto
            recipeId={detail.recipeId}
            recipeName={detail.recipeName}
            mealType={detail.mealType}
            hint={detail.photo.hint}
            className="h-72 w-full sm:h-96 md:h-[420px]"
          />
          {/* Gradiente sobre a foto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badge de tipo de refeição — canto superior esquerdo */}
          <div className="absolute left-5 top-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${accent.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              {getMealLabel(detail.mealType)}
            </span>
          </div>

          {/* Título + variação sobre a foto — rodapé interno */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              {detail.recipeName}
            </h1>
            <p className="mt-1.5 text-sm text-white/70">
              Versão:{' '}
              <span className="font-semibold text-white/90">{detail.variationName}</span>
            </p>
          </div>
        </div>

        {/* Intro + metadados */}
        <div className="px-5 pb-6 pt-5 md:px-7">
          {shouldShowIntro && (
            <p className="mb-5 border-l-2 border-[var(--brand)]/40 pl-4 text-sm leading-7 text-[var(--muted)] italic">
              {detail.introText}
            </p>
          )}

          {/* Grid de metadados */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {META_CARDS.map(({ key, icon: Icon, label, iconColor, bgColor }) => (
              <div
                key={key}
                className="flex flex-col gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-3.5"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgColor}`}>
                  <Icon size={15} className={iconColor} />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  {label}
                </span>
                <span className="text-lg font-bold leading-tight text-[var(--text)]">
                  {metaValues[key]}
                </span>
              </div>
            ))}
          </div>

          {/* Banner de rendimento de compra */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--brand)]/5 px-4 py-3 text-sm text-[var(--muted)]">
            <ShoppingBasket size={15} className="shrink-0 text-[var(--brand)]" />
            Compra inicial estimada rende cerca de{' '}
            <span className="font-semibold text-[var(--text)]">
              {detail.totalYieldFromInitialPurchase} preparo(s)
            </span>{' '}
            iguais para{' '}
            <span className="font-semibold text-[var(--text)]">{detail.peopleCount}</span>{' '}
            pessoa(s).
          </div>
        </div>
      </div>

      {/* ── Utensílios ─────────────────────────────────────────────── */}
      {detail.utensils.length > 0 && (
        <div className="mt-5 card-surface rounded-[28px] px-5 py-4 md:px-7">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand)]/15">
              <Utensils size={14} className="text-[var(--brand)]" />
            </div>
            <h2 className="text-base font-semibold">Utensílios básicos</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.utensils.map((utensil) => (
              <span
                key={utensil}
                className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
              >
                {utensil}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CORPO — Ingredientes + Preparo
      ══════════════════════════════════════════════════════════════ */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">

        {/* ── Ingredientes ─────────────────────────────────────────── */}
        <div className="card-surface rounded-[32px] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
              <ShoppingBasket size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">Ingredientes</h2>
            <span className="ml-auto rounded-full bg-[var(--brand)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
              {detail.ingredients.length} itens
            </span>
          </div>

          <div className="space-y-0 divide-y divide-[var(--line)]">
            {detail.ingredients.map((item, idx) => (
              <div key={item.itemId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  {/* Número do ingrediente */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/12 text-xs font-bold text-[var(--brand)]">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--text)] leading-tight">
                      {item.nome}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      {item.quantidadeUsadaLabel}
                    </div>
                  </div>
                  {/* Custo em pill */}
                  <div className="shrink-0 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {formatCurrency(item.custoFracionado)}
                  </div>
                </div>

                {/* Compra sugerida */}
                <div className="mt-2 ml-9 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span className="text-[var(--brand)] font-bold">↳</span>
                  <span>
                    Compra:{' '}
                    <span className="font-medium text-[var(--text)]">{item.packageLabel}</span>
                    {' · '}
                    <span className="font-medium text-[var(--text)]">
                      {item.rendimentoPorCompra}×
                    </span>{' '}
                    preparo(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preparo + Macetes ─────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Modo de preparo */}
          <div className="card-surface rounded-[32px] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand)]/15">
                <ChefHat size={15} className="text-[var(--brand)]" />
              </div>
              <h2 className="text-xl font-bold">Modo de preparo</h2>
            </div>

            <ol className="relative space-y-0 pl-8">
              {/* Linha vertical conectora */}
              <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--brand)]/40 via-[var(--brand)]/20 to-transparent" />

              {detail.steps.map((step, index) => (
                <li key={`${index}-${step}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Número do passo */}
                  <div className="absolute -left-8 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand)]/30 bg-[var(--bg-soft)] text-xs font-bold text-[var(--brand)] ring-4 ring-[var(--bg)]">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 text-sm leading-6 text-[var(--text)]">
                    {step}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Macetes */}
          {detail.tips.length > 0 && (
            <div className="card-surface rounded-[32px] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20">
                  <span className="text-sm text-amber-600 dark:text-amber-400">✦</span>
                </div>
                <h2 className="text-xl font-bold">Macetes do chef</h2>
              </div>

              <div className="space-y-3">
                {detail.tips.map((tip, index) => (
                  <div
                    key={`${index}-${tip}`}
                    className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-50/60 dark:bg-amber-500/8 px-4 py-3"
                  >
                    <span className="mt-0.5 shrink-0 text-amber-500 font-bold text-sm">✦</span>
                    <p className="text-sm leading-6 text-[var(--text)]">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
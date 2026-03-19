'use client';

import {
  BadgeDollarSign,
  ChefHat,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Target,
  UsersRound
} from 'lucide-react';
import { PlannerConfig, Goal, Restriction, MealType } from '@/lib/types';
import { formatCurrency } from '@/lib/visuals';
import { getMealLabel } from '@/lib/mealPlanner';

interface Props {
  value: PlannerConfig;
  onChange: (value: PlannerConfig) => void;
  onGenerate: () => void;
  onDemo: () => void;
  loading: boolean;
}

const restrictions: Restriction[] = ['sem lactose', 'sem carne', 'sem ovo'];
const goals: Goal[] = ['economia', 'equilibrio', 'praticidade'];
const meals: Array<{ key: MealType; label: string; emoji: string; helper: string }> = [
  { key: 'cafe', label: 'Café', emoji: '☕', helper: 'Opções rápidas para começar o dia' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', helper: 'Pratos principais para a rotina semanal' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', helper: 'Refeições práticas para o fim do dia' }
];
const budgets = [50, 80, 120];

const goalMeta: Record<Goal, { label: string; description: string }> = {
  economia: { label: 'Economia', description: 'Prioriza combinações com melhor controle de gasto.' },
  equilibrio: { label: 'Equilíbrio', description: 'Distribui melhor custo, tempo e variedade ao longo da semana.' },
  praticidade: { label: 'Praticidade', description: 'Favorece refeições mais simples e rápidas de preparar.' }
};

export function ConfigPanel({ value, onChange, onGenerate, onDemo: _onDemo, loading }: Props) {
  const toggleMeal = (meal: MealType) => {
    const refeicoes = value.refeicoes.includes(meal)
      ? value.refeicoes.filter((item) => item !== meal)
      : [...value.refeicoes, meal];
    onChange({ ...value, refeicoes });
  };

  const toggleRestriction = (restriction: Restriction) => {
    const restricoes = value.restricoes.includes(restriction)
      ? value.restricoes.filter((item) => item !== restriction)
      : [...value.restricoes, restriction];
    onChange({ ...value, restricoes });
  };

  return (
    <section className="card-surface print-card relative overflow-hidden rounded-[36px] p-6 md:p-7" id="planejar">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_58%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_42%)]" />

      <div className="relative">
        <div className="mb-6 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <SlidersHorizontal size={14} /> Configuração semanal
          </div>
          <h2 className="font-[var(--font-jakarta)] text-3xl font-bold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
            Monte seu cardápio da semana
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] md:text-base">
            Escolha pessoas, refeições, orçamento, tempo máximo e restrições para gerar um plano semanal.
          </p>
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[30px] border border-[var(--line)] bg-[var(--surface-soft)] p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <UsersRound size={16} className="text-[var(--brand)]" /> Número de pessoas
              </div>
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-sm font-semibold text-[var(--text)] shadow-sm">
                {value.numPessoas}
              </span>
            </div>
            <p className="mb-4 text-sm text-[var(--muted)]">Defina para quantas pessoas o plano será montado.</p>
            <input
              type="range"
              min={1}
              max={6}
              value={value.numPessoas}
              onChange={(e) => onChange({ ...value, numPessoas: Number(e.target.value) })}
              className="w-full"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>1 pessoa</span>
              <span>Família pequena</span>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--line)] bg-[linear-gradient(145deg,rgba(139,92,246,0.12),rgba(34,197,94,0.08))] p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <Sparkles size={16} className="text-[var(--brand-3)]" /> Resumo da seleção
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-[22px] border border-white/25 bg-white/45 px-4 py-3 backdrop-blur dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Refeições</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {value.refeicoes.length
                    ? value.refeicoes.map((meal) => getMealLabel(meal)).join(' • ')
                    : 'Selecione ao menos uma'}
                </div>
              </div>
              <div className="rounded-[22px] border border-white/25 bg-white/45 px-4 py-3 backdrop-blur dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Orçamento</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">{formatCurrency(value.orcamentoSemanal)}</div>
              </div>
              <div className="rounded-[22px] border border-white/25 bg-white/45 px-4 py-3 backdrop-blur dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Tempo</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">Até {value.tempoMax} min</div>
              </div>
              <div className="rounded-[22px] border border-white/25 bg-white/45 px-4 py-3 backdrop-blur dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Objetivo</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">{goalMeta[value.objetivo].label}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <ChefHat size={16} className="text-[var(--brand-3)]" /> Refeições da semana
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {meals.map((meal) => {
                const active = value.refeicoes.includes(meal.key);
                return (
                  <button
                    type="button"
                    key={meal.key}
                    onClick={() => toggleMeal(meal.key)}
                    className="group relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-5 text-left shadow-[0_16px_34px_-24px_rgba(34,24,64,0.22)] transition"
                    style={
                      active
                        ? {
                            borderColor: 'color-mix(in srgb, var(--brand) 40%, var(--line))',
                            background:
                              'linear-gradient(145deg, color-mix(in srgb, var(--brand) 11%, var(--bg-soft)), color-mix(in srgb, var(--brand-2) 7%, var(--bg-soft)))'
                          }
                        : undefined
                    }
                  >
                    <div className="absolute right-3 top-3 rounded-full border border-white/30 bg-white/50 px-2 py-1 text-[11px] font-semibold text-[var(--muted)] backdrop-blur dark:bg-white/5">
                      {active ? 'Ativa' : 'Opcional'}
                    </div>
                    <div className="text-2xl">{meal.emoji}</div>
                    <div className="mt-4 text-lg font-semibold text-[var(--text)]">{meal.label}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{meal.helper}</div>
                    <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                      {active ? 'Selecionada' : 'Toque para incluir'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-soft)] p-5 backdrop-blur">
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Clock3 size={16} className="text-[var(--brand)]" /> Tempo máximo
              </label>
              <p className="mb-3 text-sm text-[var(--muted)]">Escolha um limite para o preparo diário.</p>
              <select
                className="w-full rounded-[20px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3.5 text-[var(--text)] shadow-sm outline-none"
                value={value.tempoMax}
                onChange={(e) => onChange({ ...value, tempoMax: Number(e.target.value) as 10 | 20 | 30 })}
              >
                <option value={10}>10 min</option>
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
              </select>
            </div>

            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-soft)] p-5 backdrop-blur">
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Target size={16} className="text-[var(--brand-2)]" /> Objetivo
              </label>
              <p className="mb-3 text-sm text-[var(--muted)]">Defina a prioridade do cardápio para a semana.</p>
              <select
                className="w-full rounded-[20px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3.5 text-[var(--text)] shadow-sm outline-none"
                value={value.objetivo}
                onChange={(e) => onChange({ ...value, objetivo: e.target.value as Goal })}
              >
                {goals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goalMeta[goal].label}
                  </option>
                ))}
              </select>
              <div className="mt-3 rounded-[18px] border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2 text-sm text-[var(--muted)]">
                {goalMeta[value.objetivo].description}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--line)] bg-[var(--surface-soft)] p-5 backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <BadgeDollarSign size={16} className="text-[var(--brand-3)]" /> Orçamento semanal
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">Escolha uma faixa pronta ou informe um valor manualmente.</p>
              </div>
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm">
                {formatCurrency(value.orcamentoSemanal)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {budgets.map((budget) => {
                const active = value.orcamentoSemanal == budget;
                return (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => onChange({ ...value, orcamentoSemanal: budget })}
                    className="rounded-[20px] border border-[var(--line)] px-4 py-3.5 text-sm font-semibold text-[var(--text)] transition"
                    style={
                      active
                        ? {
                            borderColor: 'color-mix(in srgb, var(--success) 46%, var(--line))',
                            background:
                              'linear-gradient(145deg, color-mix(in srgb, var(--success) 10%, var(--bg-soft)), color-mix(in srgb, var(--brand-2) 8%, var(--bg-soft)))'
                          }
                        : { background: 'var(--bg-soft)' }
                    }
                  >
                    💰 {budget}
                  </button>
                );
              })}
              <input
                type="number"
                min={20}
                step={10}
                value={value.orcamentoSemanal}
                onChange={(e) => onChange({ ...value, orcamentoSemanal: Number(e.target.value) || 0 })}
                className="rounded-[20px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3.5 text-sm text-[var(--text)] outline-none"
                placeholder="Valor customizado"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <ShieldAlert size={16} className="text-[var(--brand-3)]" /> Restrições
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {restrictions.map((restriction) => {
                const active = value.restricoes.includes(restriction);
                return (
                  <button
                    type="button"
                    key={restriction}
                    onClick={() => toggleRestriction(restriction)}
                    className="tag-chip rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-medium text-[var(--text)] backdrop-blur"
                    style={
                      active
                        ? {
                            borderColor: 'color-mix(in srgb, var(--brand-3) 46%, var(--line))',
                            background:
                              'linear-gradient(145deg, color-mix(in srgb, var(--brand-3) 9%, var(--bg-soft)), color-mix(in srgb, var(--brand) 6%, var(--bg-soft)))'
                          }
                        : undefined
                    }
                  >
                    {restriction}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--line)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand)_8%,var(--bg-soft)),color-mix(in_srgb,var(--brand-2)_6%,var(--bg-soft)))] p-5">
            <div className="mb-3 text-sm font-semibold text-[var(--text)]">Resumo</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[20px] border border-white/25 bg-white/45 px-4 py-3 text-sm text-[var(--text)] backdrop-blur dark:bg-white/5">
                🍴 {value.refeicoes.length ? value.refeicoes.map((meal) => getMealLabel(meal)).join(' • ') : 'Selecione ao menos uma refeição'}
              </div>
              <div className="rounded-[20px] border border-white/25 bg-white/45 px-4 py-3 text-sm text-[var(--text)] backdrop-blur dark:bg-white/5">
                ⏱️ Até {value.tempoMax} min
              </div>
              <div className="rounded-[20px] border border-white/25 bg-white/45 px-4 py-3 text-sm text-[var(--text)] backdrop-blur dark:bg-white/5">
                🎯 {goalMeta[value.objetivo].label}
              </div>
              <div className="rounded-[20px] border border-white/25 bg-white/45 px-4 py-3 text-sm text-[var(--text)] backdrop-blur dark:bg-white/5">
                💰 {formatCurrency(value.orcamentoSemanal)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading || value.refeicoes.length === 0}
            className="no-print inline-flex w-full items-center justify-center gap-3 rounded-[26px] bg-[linear-gradient(135deg,var(--brand),color-mix(in_srgb,var(--brand)_70%,var(--brand-3)))] px-5 py-4.5 text-base font-semibold text-white shadow-[0_26px_55px_-24px_rgba(139,92,246,0.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'Gerando cardápio...' : 'Gerar cardápio'}
          </button>
        </div>
      </div>
    </section>
  );
}

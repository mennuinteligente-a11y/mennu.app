'use client';

import {
  ChefHat,
  LoaderCircle,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
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

const meals: Array<{ key: MealType; label: string; emoji: string; helper: string }> = [
  { key: 'cafe', label: 'Café', emoji: '☕', helper: 'Opções rápidas para começar o dia' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', helper: 'Pratos principais para a rotina semanal' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', helper: 'Refeições práticas para o fim do dia' }
];

const budgets = (people: number) => {
  const base = 80 * people;

  return [
    Math.round(base),
    Math.round(base * 1.5),
    Math.round(base * 2)
  ];
};

export function ConfigPanel({ value, onChange, onGenerate, loading }: Props) {

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
    <section className="card-surface relative overflow-hidden rounded-[36px] p-6 md:p-7">

      <div className="mb-6 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <SlidersHorizontal size={14} /> Configuração semanal
        </div>

        <h2 className="font-[var(--font-jakarta)] text-3xl font-bold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
          Monte seu Mennu semanal
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] md:text-base">
          Escolha pessoas, refeições e orçamento para gerar seu cardápio.
        </p>
      </div>


      {/* PESSOAS */}

      <div className="rounded-[30px] border border-[var(--line)] bg-[var(--surface-soft)] p-5 mb-6">

        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <UsersRound size={16} className="text-[var(--brand)]" /> Número de pessoas
          </div>

          <span className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-sm font-semibold">
            {value.numPessoas}
          </span>
        </div>

        <p className="mb-4 text-sm text-[var(--muted)]">
          Defina para quantas pessoas o plano será montado.
        </p>

        <div className="mb-4 flex w-full justify-between">
          {[1,2,3,4,5,6].map(n => {

            const active = value.numPessoas === n;

            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...value, numPessoas: n })}
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm
                ${active
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-purple-600 border-purple-300"}
                `}
              >
                👤
              </button>
            );
          })}
        </div>

        <input
          type="range"
          min={1}
          max={6}
          value={value.numPessoas}
          onChange={(e) => onChange({ ...value, numPessoas: Number(e.target.value) })}
          className="w-full"
        />

      </div>


      {/* REFEIÇÕES */}

      <div className="mb-6">

        <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <ChefHat size={16} className="text-[var(--brand-3)]" />
          Refeições da semana
        </div>

        <div className="grid gap-3 sm:grid-cols-3">

          {meals.map((meal) => {

            const active = value.refeicoes.includes(meal.key);

            return (
              <button
                key={meal.key}
                type="button"
                onClick={() => toggleMeal(meal.key)}
                className="group relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-5 text-left transition"
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
                <div className="text-2xl">{meal.emoji}</div>
                <div className="mt-4 text-lg font-semibold">{meal.label}</div>
                <div className="mt-1 text-sm text-[var(--muted)]">{meal.helper}</div>
              </button>
            );
          })}

        </div>

      </div>


      {/* ORÇAMENTO */}

      <div className="mb-6">

        <div className="mb-3 text-sm font-semibold">
          Orçamento semanal
        </div>

        <div className="grid gap-3 sm:grid-cols-4">

          {budgets(value.numPessoas).map((budget) => {

            const active = value.orcamentoSemanal === budget;

            return (
              <button
                key={budget}
                type="button"
                onClick={() => onChange({ ...value, orcamentoSemanal: budget })}
                className="rounded-[20px] border border-[var(--line)] px-4 py-3 text-sm font-semibold"
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
            className="rounded-[20px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 text-sm outline-none"
            placeholder="Custom"
          />

        </div>

      </div>


      {/* GERAR */}

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || value.refeicoes.length === 0}
        className="inline-flex w-full items-center justify-center gap-3 rounded-[26px] bg-[linear-gradient(135deg,var(--brand),color-mix(in_srgb,var(--brand)_70%,var(--brand-3)))] px-5 py-4 text-base font-semibold text-white transition disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="animate-spin" size={20} /> : <Sparkles size={20} />}
        {loading ? 'Gerando Mennu...' : 'Gerar Mennu'}
      </button>

    </section>
  );
}
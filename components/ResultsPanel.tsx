'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Printer,
  RefreshCcw,
  Save,
  Wallet,
  ChevronRight,
  CalendarDays,
  ShoppingBasket,
  ChartNoAxesCombined,
  Salad
} from 'lucide-react';

import {
  exportShoppingListCsv,
  exportShoppingListText,
  getCostBreakdown,
  getMealLabel
} from '@/lib/mealPlanner';

import { CostBreakdownItem, MealType, PlanResult } from '@/lib/types';
import { formatCurrency } from '@/lib/visuals';

import RecipeVisualCard from '@/components/RecipeVisualCard';
import InfoModal from '@/components/InfoModal';

interface Props {
  plan: PlanResult | null;
  onSwapVariation: (dayNumber: number, meal: MealType) => void;
  onSave: () => void;
  onReset: () => void;
}

function copyText(value: string) {
  navigator.clipboard.writeText(value);
}

function downloadCsv(content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'lista-de-compras.csv';
  link.click();

  URL.revokeObjectURL(url);
}

const categoryEmoji: Record<string, string> = {
  Proteínas: '🥩',
  Grãos: '🌾',
  Legumes: '🥕',
  Temperos: '🧂',
  Laticínios: '🧀',
  Outros: '🛒'
};

type ModalState = {
  kind: 'fractioned' | 'market';
  title: string;
  recipeName: string;
  variationName: string;
  items: CostBreakdownItem[];
};

export function ResultsPanel({ plan, onSwapVariation, onSave, onReset }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(Boolean(plan?.warning));
  }, [plan?.warning]);

  const modalSummary = useMemo(() => {
    if (!modal) return null;

    const total =
      modal.kind === 'fractioned'
        ? modal.items.reduce((sum, item) => sum + item.custoFracionado, 0)
        : modal.items.reduce((sum, item) => sum + item.initialMarketCost, 0);

    const rendimento = modal.items.length
      ? Math.max(1, Math.min(...modal.items.map((item) => item.rendimentoPorCompra)))
      : 1;

    return { total, rendimento };
  }, [modal]);

  if (!plan) return null;

  const mealOptions: MealType[] = ['cafe', 'almoco', 'jantar'];
  const selectedMeals = mealOptions.filter((m) =>
    plan.summary.refeicoes.includes(m)
  );

  const csv = exportShoppingListCsv(plan);
  const text = exportShoppingListText(plan);

  return (
    <>
      <section className="space-y-6">

        {plan.days.map((day) => (
          <div key={day.day} className="card-surface p-6">

            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Dia {day.day}</h3>
              <span>{formatCurrency(day.totalCost)}</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">

              {selectedMeals.map((meal) => {
                const entry = day.meals[meal];
                if (!entry) return null;

                const breakdown = getCostBreakdown(
                  entry.recipeId,
                  entry.variationName,
                  plan.summary.numPessoas
                );

                const marketTotal = breakdown.reduce(
                  (sum, item) => sum + item.initialMarketCost,
                  0
                );

                return (
                  <div key={`${day.day}-${meal}`} className="card-surface p-4">

                    <RecipeVisualCard
                      title={entry.recipeName}
                      category={getMealLabel(meal)}
                      description={`Variação: ${entry.variationName}`}
                      actionLabel="Abrir receita"
                      onClick={() => {
                        window.location.href = `/receitas/${entry.recipeId}?variation=${encodeURIComponent(entry.variationName)}&people=${plan.summary.numPessoas}`;
                      }}
                    />

                    <div className="grid gap-3 mt-4 sm:grid-cols-2">

                      <button
                        onClick={() =>
                          setModal({
                            kind: 'fractioned',
                            title: 'Custo Fracionado',
                            recipeName: entry.recipeName,
                            variationName: entry.variationName,
                            items: breakdown
                          })
                        }
                      >
                        💰 Prato
                        <br />
                        {formatCurrency(entry.estimatedCost)}
                      </button>

                      <button
                        onClick={() =>
                          setModal({
                            kind: 'market',
                            title: 'Custo Mercado',
                            recipeName: entry.recipeName,
                            variationName: entry.variationName,
                            items: breakdown
                          })
                        }
                      >
                        🛒 Mercado
                        <br />
                        <span className="text-green-900 font-semibold">
                          {formatCurrency(marketTotal)}
                        </span>
                      </button>

                    </div>

                    <button
                      onClick={() => onSwapVariation(day.day, meal)}
                    >
                      Trocar variação <ChevronRight size={14} />
                    </button>

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {modal && (
        <div className="modal" onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()}>

            <h3>{modal.title}</h3>

            {modal.items.map((item) => (
              <div key={item.itemId}>

                <div>{item.nome}</div>

                <div>
                  {modal.kind === 'fractioned'
                    ? formatCurrency(item.custoFracionado)
                    : formatCurrency(item.initialMarketCost)}
                </div>

                <div>
                  {modal.kind === 'fractioned'
                    ? `De ${formatCurrency(item.initialMarketCost)}`
                    : `Por ${item.packageLabel}`}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {showWarning && (
        <InfoModal
          open={showWarning}
          onClose={() => setShowWarning(false)}
          title="Atenção"
          description={plan?.warning}
          primaryActionLabel="Entendi"
          onPrimaryAction={() => setShowWarning(false)}
        />
      )}
    </>
  );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  RefreshCcw,
  ShoppingBasket,
  Wallet
} from 'lucide-react';

import {
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

  const lines = value.split('\n').filter(Boolean);

  let formatted = "🧾 *MENNU — Lista de compras da semana*\n\n";

  lines.forEach(line => {

    if (!line.includes("R$")) {

      const category = line.replace("□", "").trim();

      const emojiMap: Record<string,string> = {
        "Proteínas":"🥩",
        "Grãos":"🌾",
        "Laticínios":"🥛",
        "Legumes":"🥕",
        "Temperos":"🧂",
        "Outros":"🛒"
      };

      const emoji = emojiMap[category] || "📦";

      formatted += `${emoji} *${category}*\n`;

    } else {

const parts = line.split("|");

if (!parts || parts.length < 2) return;

const name = (parts[0] ?? "")
  .replace("_", " ")
  .replace("0", "")
  .trim();

const price = (parts[1] ?? "").trim();

      formatted += `▫️ ${name} — ${price}\n`;

    }

  });

  formatted += `\n⚠️ Valor médio aproximado. Pode variar conforme a região.\n`;
  formatted += `Confira os preços antes de passar no caixa.\n`;

  navigator.clipboard.writeText(formatted).catch(() => {
  console.warn("Clipboard bloqueado pelo navegador");
});

  showCopyToast();
}

function showCopyToast() {

  const toast = document.createElement("div");

  toast.innerText = "Lista copiada para área de transferência";

  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#111";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "12px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.opacity = "0";
  toast.style.transition = "opacity .25s";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 1800);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 2100);
}

function downloadImageList(text: string) {

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const width = 950;
  const lineHeight = 42;

  const lines = text.split('\n').filter(Boolean);

  const totalValue = lines.reduce((sum, line) => {
    const match = line.match(/R\$\s([\d.,]+)/);
    if (match) {
      return sum + parseFloat(match[1].replace(',', '.'));
    }
    return sum;
  }, 0);

  const height = 260 + lines.length * lineHeight + 120;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e5e7eb";

  for (let y = 180; y < height; y += lineHeight) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(width - 60, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#16a34a";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText("MENNU", 60, 70);

  ctx.fillStyle = "#111";
  ctx.font = "22px sans-serif";
  ctx.fillText("Lista de compras da semana", 60, 110);

  ctx.font = "18px sans-serif";

  let y = 170;

  lines.forEach(line => {

    if (!line.includes("R$")) {

      ctx.fillStyle = "#111";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("📦 " + line.replace("□", "").trim(), 60, y);

    } else {

      const parts = line.split("|");

const namePart = (parts[0] ?? "")
  .replace("□", "")
  .trim();

const pricePart = (parts[1] ?? "")
  .trim();

      ctx.fillStyle = "#222";
      ctx.font = "18px sans-serif";
      ctx.fillText("□ " + namePart, 70, y);

      ctx.fillStyle = "#dc2626";
      ctx.textAlign = "right";
ctx.fillText(pricePart, width - 60, y);
ctx.textAlign = "left";

    }

    y += lineHeight;

  });

  y += 20;

  ctx.fillStyle = "#16a34a";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Total estimado: R$ " + totalValue.toFixed(2), 60, y);

  y += 50;

  ctx.fillStyle = "#6b7280";
  ctx.font = "14px sans-serif";

  ctx.fillText(
    "Valor médio aproximado para + ou - sujeito a localidade.",
    60,
    y
  );

  y += 20;

  ctx.fillText(
    "Consulte os preços antes de passar ao caixa.",
    60,
    y
  );

  const link = document.createElement("a");
  link.download = "lista-mercado-mennu.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

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
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    setShowWarning(Boolean(plan?.warning));
    setCurrentDayIndex(0);
  }, [plan]);

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
  const selectedMeals = mealOptions.filter((m) => plan.summary.refeicoes.includes(m));

 
  const text = exportShoppingListText(plan);

  const currentDay = plan.days[currentDayIndex] ?? plan.days[0];
  const weekTotal = plan.days.reduce((sum, day) => sum + day.totalCost, 0);

  return (
    <>
      <section className="space-y-5">
        <div className="card-surface rounded-[30px] border border-[var(--line)] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <CalendarDays size={14} /> Semana pronta
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] md:text-3xl">
                Navegue pelos dias sem virar refém do scroll.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base">
                Agora o resultado ficou mais próximo de um app de verdade: um dia por vez, troca
                rápida de variações e ações úteis logo no topo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Pessoas
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {plan.summary.numPessoas}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Refeições
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {selectedMeals.map((meal) => getMealLabel(meal)).join(' • ')}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Total estimado
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatCurrency(weekTotal)}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Objetivo
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {plan.summary.objetivo}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[30px] border border-[var(--line)] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {plan.days.map((day, index) => {
                const active = index === currentDayIndex;

                return (
                  <button
                    key={day.day}
                    type="button"
                    onClick={() => setCurrentDayIndex(index)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[var(--brand)] text-white shadow-[0_12px_24px_-12px_rgba(139,92,246,0.9)]'
                        : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--brand)]/35 hover:text-[var(--text)]'
                    }`}
                  >
                    Dia {day.day}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentDayIndex((index) => Math.max(0, index - 1))}
                disabled={currentDayIndex === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Dia anterior
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentDayIndex((index) => Math.min(plan.days.length - 1, index + 1))
                }
                disabled={currentDayIndex === plan.days.length - 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próximo dia
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[30px] border border-[var(--line)] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Dia {currentDay.day}
              </div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text)]">
                Cardápio do dia
              </h3>
            </div>

            <div className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm">
              Total do dia: {formatCurrency(currentDay.totalCost)}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {selectedMeals.map((meal) => {
              const entry = currentDay.meals[meal];
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
                <div
                  key={`${currentDay.day}-${meal}`}
                  className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]/84 p-4"
                >
                  <RecipeVisualCard
                    title={entry.recipeName}
                    category={getMealLabel(meal)}
                    description={`Variação: ${entry.variationName}`}
                    actionLabel="Abrir receita"
                    onClick={() => {
                      window.location.href = `/receitas/${entry.recipeId}?variation=${encodeURIComponent(
                        entry.variationName
                      )}&people=${plan.summary.numPessoas}`;
                    }}
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setModal({
                          kind: 'fractioned',
                          title: 'Custo Fracionado',
                          recipeName: entry.recipeName,
                          variationName: entry.variationName,
                          items: breakdown
                        })
                      }
                      className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-left text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                    >
                      💰 Prato
                      <br />
                      <span className="text-base">{formatCurrency(entry.estimatedCost)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setModal({
                          kind: 'market',
                          title: 'Custo Mercado',
                          recipeName: entry.recipeName,
                          variationName: entry.variationName,
                          items: breakdown
                        })
                      }
                      className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-left text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                    >
                      🛒 Mercado
                      <br />
                      <span className="text-base text-emerald-700">
                        {formatCurrency(marketTotal)}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSwapVariation(currentDay.day, meal)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                  >
                    <RefreshCcw size={16} />
                    Trocar variação
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="card-surface rounded-[30px] border border-[var(--line)] p-5 md:p-6">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <ShoppingBasket size={16} className="text-[var(--brand-2)]" />
              Ações rápidas da semana
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

  <button
    type="button"
    onClick={() => copyText(text)}
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
  >
    <Copy size={16} />
    Copiar lista
  </button>

  <button
    type="button"
    onClick={() => downloadImageList(text)}
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
  >
    <Download size={16} />
    Baixar lista
  </button>

</div>
</div>

          <div className="card-surface rounded-[30px] border border-[var(--line)] p-5 md:p-6">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <Wallet size={16} className="text-[var(--brand-3)]" />
              Controle da semana
            </div>

            <div className="space-y-3">
              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Orçamento alvo
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatCurrency(plan.summary.orcamentoSemanal)}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Total estimado
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatCurrency(weekTotal)}
                </div>
              </div>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--brand),color-mix(in_srgb,var(--brand)_70%,var(--brand-3)))] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_-18px_rgba(139,92,246,0.75)] transition hover:-translate-y-0.5"
              >
                <RefreshCcw size={16} />
                Gerar nova semana
              </button>
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setModal(null)}
        >
          <div
            className="card-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[var(--line)] p-5 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {modal.title}
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
                {modal.recipeName}
              </h3>
              <div className="text-sm text-[var(--muted)]">
                Variação: {modal.variationName}
              </div>
            </div>

            {modalSummary && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Total
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                    {formatCurrency(modalSummary.total)}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Rendimento mínimo
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--text)]">
                    {modalSummary.rendimento} compra(s)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {modal.items.map((item) => (
                <div
                  key={item.itemId}
                  className="rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-semibold text-[var(--text)]">{item.nome}</div>
                    <div className="text-sm font-semibold text-[var(--text)]">
                      {modal.kind === 'fractioned'
                        ? formatCurrency(item.custoFracionado)
                        : formatCurrency(item.initialMarketCost)}
                    </div>
                  </div>

                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {modal.kind === 'fractioned'
                      ? `De ${formatCurrency(item.initialMarketCost)}`
                      : `Por ${item.packageLabel}`}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setModal(null)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
            >
              Fechar
            </button>
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
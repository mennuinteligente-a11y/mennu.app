'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import recipes from '@/data/recipes.json';
import { RecipePhoto } from '@/components/RecipePhoto';
import { Cormorant_Garamond } from 'next/font/google';
import { Search, Sparkles } from 'lucide-react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DEMO_CONFIG, generatePlan, getDefaultConfig, getRecipeDetailData, replaceMealVariation } from '@/lib/mealPlanner';
import { MealType, PlanResult, PlannerConfig, RecipeDetailData } from '@/lib/types';
import { formatCurrency } from '@/lib/visuals';
import { SplashScreen } from '@/components/SplashScreen';
import { LogoMark } from '@/components/LogoMark';

const STORAGE_KEY = 'meal-planner-config-v1';
const HISTORY_KEY = 'meal-planner-history-v1';
const THEME_KEY = 'meal-planner-theme-v1';
const PLAN_KEY = 'meal-planner-current-plan-v1';

type ThemeMode = 'light' | 'dark';

type RecipeCatalogItem = {
  id: string;
  nome: string;
  refeicao?: 'cafe' | 'almoco' | 'jantar' | string;
  tempoMin?: number;
  faixaCusto?: string;
  tags?: string[];
  imageUrl?: string;
};

const RECIPE_CATEGORY_LABELS: Record<string, string> = {
  todas: 'Todas',
  cafe: 'Café',
  almoco: 'Almoço',
  jantar: 'Jantar'
};

const recipeCatalog = (recipes as RecipeCatalogItem[]).slice().sort((a, b) => {
  const mealOrder = { cafe: 0, almoco: 1, jantar: 2 } as const;
  const mealDiff = (mealOrder[a.refeicao as keyof typeof mealOrder] ?? 99) - (mealOrder[b.refeicao as keyof typeof mealOrder] ?? 99);
  if (mealDiff !== 0) return mealDiff;
  return a.nome.localeCompare(b.nome, 'pt-BR');
});

const mennuBrandFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700']
});

function saveHistory(plan: PlanResult) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as PlanResult[];
  const next = [plan, ...history].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export default function HomePage() {
  const [config, setConfig] = useState<PlannerConfig>(getDefaultConfig());
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [appReady, setAppReady] = useState(false);
  const resultsRef = useRef<HTMLElement | null>(null);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeCategory, setRecipeCategory] = useState<'todas' | 'cafe' | 'almoco' | 'jantar'>('todas');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipeCatalog[0]?.id ?? '');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<RecipeDetailData | null>(null);

  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const savedPlan = localStorage.getItem(PLAN_KEY);

    if (saved) setConfig(JSON.parse(saved));
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    const timer = setTimeout(() => setAppReady(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (plan) {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    }
  }, [plan]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (selectedRecipeId) {
      const peopleCountForPreview = config.numPessoas;
      // Encontra a receita completa para passar o nome da variação, se houver
      const fullRecipe = recipes.find(r => r.id === selectedRecipeId);
      const variationName = fullRecipe?.variacoes?.[0] ?? fullRecipe?.nome ?? '';
      const recipeDetails = getRecipeDetailData(selectedRecipeId, variationName, peopleCountForPreview);
      setSelectedRecipeDetail(recipeDetails);
    } else {
      setSelectedRecipeDetail(null);
    }
  }, [selectedRecipeId, config.numPessoas]);

  const generate = (demo = false) => {
    setLoading(true);
    setTimeout(() => {
      const nextPlan = generatePlan(demo ? DEMO_CONFIG : config, { demo, seed: Date.now() });
      setPlan(nextPlan);
      setLoading(false);
      if (demo) setConfig(DEMO_CONFIG);

      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 160);
    }, 750);
  };

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = recipeQuery.trim().toLowerCase();

    return recipeCatalog.filter((recipe) => {
      const matchesCategory = recipeCategory === 'todas' || recipe.refeicao === recipeCategory;
      const haystack = [recipe.nome, recipe.id, recipe.refeicao, ...(recipe.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [recipeCategory, recipeQuery]);

  const selectedRecipe = useMemo(() => {
    return filteredRecipes.find((recipe) => recipe.id === selectedRecipeId) ?? filteredRecipes[0] ?? null;
  }, [filteredRecipes, selectedRecipeId]);

  useEffect(() => {
    if (!filteredRecipes.length) return;
    const stillVisible = filteredRecipes.some((recipe) => recipe.id === selectedRecipeId);
    if (!stillVisible) setSelectedRecipeId(filteredRecipes[0].id);
  }, [filteredRecipes, selectedRecipeId]);

  const previewStats = useMemo(() => {
    const mealCount = config.refeicoes.length * 7;
    return [
      {
        label: 'Refeições na semana',
        value: mealCount,
        helper: config.refeicoes.length > 0 ? `${config.refeicoes.join(' • ')}` : 'Escolha as refeições'
      },
      {
        label: 'Pessoas',
        value: config.numPessoas,
        helper: config.numPessoas > 1 ? 'Planejamento em grupo' : 'Planejamento individual'
      },
      {
        label: 'Orçamento alvo',
        value: formatCurrency(config.orcamentoSemanal),
        helper: config.orcamentoSemanal > 0 ? 'Meta semanal ativa' : 'Defina um valor para orientar o plano'
      }
    ];
  }, [config]);

  return (
    <>
      <SplashScreen done={appReady} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="no-print mb-6">
          <div className="card-surface overflow-hidden rounded-[32px] border border-[var(--line)] px-5 py-5 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)] md:px-8 md:py-7">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(34,197,94,0.14)' }} />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(249,115,22,0.12)' }} />

            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="shrink-0">
                    <LogoMark
                      size={110}
                      className="drop-shadow-[0_16px_32px_rgba(22,101,52,0.25)]"
                    />
                  </div>

                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-5xl md:leading-[1.05]">
                      <span
                        className={`${mennuBrandFont.className} inline-block pr-2 align-baseline text-[1.08em] font-semibold tracking-[-0.03em]`}
                        style={{
                          color: '#6EDC3A',
                          textShadow:
                            '-1px -1px 0 #0f3d0f, 1px -1px 0 #0f3d0f, -1px 1px 0 #0f3d0f, 1px 1px 0 #0f3d0f, 0 8px 18px rgba(16, 66, 16, 0.16)'
                        }}
                      >
                        MENNU
                      </span>
                      <span
                        className="inline-block"
                        style={{
                          color: '#FED7AA',
                          WebkitTextStroke: '1px #ef4444',
                          textShadow: '0 2px 8px rgba(239, 68, 68, 0.10)'
                        }}
                      >
                        Sistema de Cardápio Inteligente
                      </span>
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base">
                      Planeje a semana, compare custos, gere a lista de compras e monte seu cardápio com mais clareza.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 lg:min-w-[220px] lg:items-end">
                  <ThemeToggle
                    theme={theme}
                    onToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
                  />
                  <nav className="flex flex-wrap gap-2 lg:justify-end">
                    {[
                      { href: '#planejar', label: 'Planejar' },
                      { href: '#resultado', label: 'Resultados' },
                      { href: '#catalogo-receitas', label: 'Consultar receitas' }
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)]/80 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--brand)]/30 hover:text-[var(--text)]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]/82 p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                    <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1">Offline</span>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1">Custos por prato</span>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1">Lista por categoria</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#planejar"
                      className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#a855f7_45%,#c084fc_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_-18px_rgba(168,85,247,0.75)] ring-1 ring-white/20 backdrop-blur transition hover:-translate-y-0.5 hover:brightness-105"
                    >
                      <Sparkles className="mr-2 text-white" size={18} />
                      Gerar cardápio
                    </a>
                    <a
                      href="#resultado"
                      className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                    >
                      <Search className="mr-2" size={18} />
                      Ver resultados
                    </a>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {previewStats.map((stat) => (
                    <div key={stat.label} className="rounded-[24px] border border-[var(--line)] bg-[var(--bg-soft)]/90 px-4 py-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{stat.label}</div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</div>
                      <div className="mt-2 text-sm text-[var(--muted)]">{stat.helper}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {plan ? (
          <section className="no-print sticky top-3 z-30 mb-6">
            <div className="card-surface rounded-[28px] border border-[var(--line)] px-4 py-3 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Navegação rápida</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">Chega de peregrinação pela página. Vá direto para o que interessa.</div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('semana-planejada')}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                  >
                    📅 Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('lista-compras')}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                  >
                    🛒 Lista de compras
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('resumo-financeiro')}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                  >
                    💸 Resumo financeiro
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="planejar" className="mb-6">
          <ConfigPanel value={config} onChange={setConfig} onGenerate={() => generate(false)} onDemo={() => generate(true)} loading={loading} />
        </section>

        <section id="catalogo-receitas" className="mb-6 scroll-mt-24">
          <div className="card-surface overflow-hidden rounded-[32px] border border-[var(--line)] p-4 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Consulta manual</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Banco de receitas clicável</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] md:text-base">
                  Chega de depender da loteria do gerador para conferir imagem. Aqui você navega pelas {recipeCatalog.length} receitas por categoria, nome e busca. Um mínimo de civilização digital.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex min-w-[260px] items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                  <Search size={18} className="text-[var(--muted)]" />
                  <input
                    value={recipeQuery}
                    onChange={(event) => setRecipeQuery(event.target.value)}
                    placeholder="Buscar por nome, id ou tag"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  />
                </label>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--muted)]">
                  {filteredRecipes.length} encontradas
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(['todas', 'cafe', 'almoco', 'jantar'] as const).map((category) => {
                const active = recipeCategory === category;
                const count = category === 'todas'
                  ? recipeCatalog.length
                  : recipeCatalog.filter((recipe) => recipe.refeicao === category).length;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setRecipeCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[var(--brand)] text-white shadow-[0_12px_24px_-12px_rgba(16,185,129,0.9)]'
                        : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--brand)]/35 hover:text-[var(--text)]'
                    }`}
                  >
                    {RECIPE_CATEGORY_LABELS[category]} <span className="opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]/85 p-3">
                <div className="mb-3 flex items-center justify-between px-2">
                  <div className="text-sm font-semibold">Lista completa</div>
                  <div className="text-xs text-[var(--muted)]">ordem por categoria e nome</div>
                </div>

                <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
                  {filteredRecipes.length ? filteredRecipes.map((recipe, index) => {
                    const active = selectedRecipe?.id === recipe.id;
                    const categoryLabel = RECIPE_CATEGORY_LABELS[recipe.refeicao || 'todas'] || 'Receita';

                    return (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => setSelectedRecipeId(recipe.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-[var(--brand)] bg-[var(--brand)]/10 shadow-[0_14px_32px_-20px_rgba(16,185,129,0.8)]'
                            : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--brand)]/35 hover:bg-[var(--bg-soft)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              {String(index + 1).padStart(3, '0')} · {categoryLabel}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[var(--text)]">{recipe.nome}</div>
                            <div className="mt-1 text-xs text-[var(--muted)]">ID: {recipe.id}</div>
                          </div>
                          <div className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                            {recipe.tempoMin ?? 0} min
                          </div>
                        </div>
                      </button>
                    );
                  }) : (
                    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                      Nenhuma receita bateu com o filtro. Parabéns, até a busca resolveu te contrariar.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]/78 p-4 md:p-5">
                {selectedRecipeDetail ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <div className="space-y-4">
                      <div className="rounded-[28px] overflow-hidden">
                        <RecipePhoto
                          recipeId={selectedRecipeDetail.recipeId}
                          recipeName={selectedRecipeDetail.recipeName}
                          mealType={selectedRecipeDetail.mealType}
                          className="min-h-[320px]"
                          imageUrl={(selectedRecipe as { imageUrl?: string })?.imageUrl}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Categoria</div>
                          <div className="mt-2 text-sm font-semibold">{RECIPE_CATEGORY_LABELS[selectedRecipeDetail.mealType || 'todas'] || 'Receita'}</div>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Tempo</div>
                          <div className="mt-2 text-sm font-semibold">{selectedRecipeDetail.timeMinutes ?? 0} min</div>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Faixa</div>
                          <div className="mt-2 text-sm font-semibold">{selectedRecipe?.faixaCusto ?? 'não definida'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg)] p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Pré-visualização individual</div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{selectedRecipeDetail.recipeName}</h3>
                      <div className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">ID: {selectedRecipeDetail.recipeId}</div>

                      <div className="mt-5 space-y-4">
                        <div>
                          <div className="text-sm font-semibold">Tags</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(selectedRecipe?.tags?.length ? selectedRecipe.tags : ['sem tags']).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* --- Seção do Caderno (Narrativa) --- */}
                        {selectedRecipeDetail.narrativeText ? (
                          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]/60 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                              Caderno de Receitas
                            </h3>
                            <p className="caderno-texto mt-3">
                              {selectedRecipeDetail.narrativeText}
                            </p>
                          </div>
                        ) : null}
                        {/* --- FIM Seção do Caderno --- */}

                        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-soft)]/60 p-4 text-sm text-[var(--muted)]">
                          Use esta área para validar rápido a imagem de cada prato antes de aprovar o próximo lote. Se alguma sair torta, grotesca ou com cara de propaganda de hospital, me manda o print e eu corrijo só ela.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                    Nenhuma receita disponível para pré-visualização.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="resultado" ref={resultsRef} className="scroll-mt-24">
          <ResultsPanel
            plan={plan}
            onSwapVariation={(dayNumber: number, meal: MealType) =>
              setPlan((current) => (current ? replaceMealVariation(current, dayNumber, meal) : current))
            }
            onSave={() => plan && saveHistory(plan)}
            onReset={() => {
              setPlan(null);
              localStorage.removeItem(PLAN_KEY);
            }}
          />
        </section>
      </main>
    </>
  );
}
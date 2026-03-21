'use client';

import { useEffect, useMemo, useState } from 'react';
import recipes from '@/data/recipes.json';
import { RecipePhoto } from '@/components/RecipePhoto';
import { Cormorant_Garamond } from 'next/font/google';
import { Search, Sparkles } from 'lucide-react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DEMO_CONFIG,
  generatePlan,
  getDefaultConfig,
  getRecipeDetailData,
  replaceMealVariation
} from '@/lib/mealPlanner';
import { MealType, PlanResult, PlannerConfig, RecipeDetailData } from '@/lib/types';
import { formatCurrency } from '@/lib/visuals';
import { SplashScreen } from '@/components/SplashScreen';
import { LogoMark } from '@/components/LogoMark';

const STORAGE_KEY = 'meal-planner-config-v1';
const HISTORY_KEY = 'meal-planner-history-v1';
const THEME_KEY = 'meal-planner-theme-v1';
const PLAN_KEY = 'meal-planner-current-plan-v1';

type ThemeMode = 'light' | 'dark';
type AppScreen = 'inicio' | 'planejar' | 'receitas' | 'resultados';

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
  const mealDiff =
    (mealOrder[a.refeicao as keyof typeof mealOrder] ?? 99) -
    (mealOrder[b.refeicao as keyof typeof mealOrder] ?? 99);

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
  const [screen, setScreen] = useState<AppScreen>('inicio');
  const [carouselIndex, setCarouselIndex] = useState(0);

const carouselRecipes = useMemo(() => {
  return recipeCatalog.slice(0, 12);
}, []);

  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeCategory, setRecipeCategory] = useState<'todas' | 'cafe' | 'almoco' | 'jantar'>(
    'todas'
  );
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipeCatalog[0]?.id ?? '');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<RecipeDetailData | null>(null);

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
      const fullRecipe = (recipes as Array<{ id: string; nome: string; variacoes?: string[] }>).find(
        (r) => r.id === selectedRecipeId
      );
      const variationName = fullRecipe?.variacoes?.[0] ?? fullRecipe?.nome ?? '';
      const recipeDetails = getRecipeDetailData(selectedRecipeId, variationName, peopleCountForPreview);
      setSelectedRecipeDetail(recipeDetails);
    } else {
      setSelectedRecipeDetail(null);
    }
  }, [selectedRecipeId, config.numPessoas]);
  useEffect(() => {
  const timer = setInterval(() => {
    setCarouselIndex((i) => (i + 3) % carouselRecipes.length);
  }, 5000);

  return () => clearInterval(timer);
}, [carouselRecipes.length]);

  const generate = (demo = false) => {
    setLoading(true);

    setTimeout(() => {
      const nextPlan = generatePlan(demo ? DEMO_CONFIG : config, {
        demo,
        seed: Date.now()
      });

      setPlan(nextPlan);
      setLoading(false);

      if (demo) {
        setConfig(DEMO_CONFIG);
      }

      setScreen('resultados');
    }, 750);
  };

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = recipeQuery.trim().toLowerCase();

    return recipeCatalog.filter((recipe) => {
      const matchesCategory =
        recipeCategory === 'todas' || recipe.refeicao === recipeCategory;

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

    if (!stillVisible) {
      setSelectedRecipeId(filteredRecipes[0].id);
    }
  }, [filteredRecipes, selectedRecipeId]);

  const previewStats = useMemo(() => {
    const mealCount = config.refeicoes.length * 7;

    return [
      {
        label: 'Refeições na semana',
        value: mealCount,
        helper:
          config.refeicoes.length > 0
            ? `${config.refeicoes.join(' • ')}`
            : 'Escolha as refeições'
      },
      {
        label: 'Pessoas',
        value: config.numPessoas,
        helper:
          config.numPessoas > 1
            ? 'Planejamento em grupo'
            : 'Planejamento individual'
      },
      {
        label: 'Orçamento alvo',
        value: formatCurrency(config.orcamentoSemanal),
        helper:
          config.orcamentoSemanal > 0
            ? 'Meta semanal ativa'
            : 'Defina um valor para orientar o plano'
      }
    ];
  }, [config]);

  const menuItems: Array<{ key: AppScreen; label: string }> = [
    { key: 'inicio', label: 'Menu inicial' },
    { key: 'planejar', label: 'Planejar' },
    { key: 'receitas', label: 'Banco de receitas' },
    { key: 'resultados', label: 'Resultados' }
  ];

  return (
    <>
      <SplashScreen done={appReady} />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="no-print mb-10">
  <div className="card-surface overflow-hidden rounded-[32px] border border-[var(--line)] px-6 py-10 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)]">

    <div className="flex flex-col items-center text-center gap-8">

      <LogoMark
        size={120}
        className="drop-shadow-[0_16px_32px_rgba(22,101,52,0.25)]"
      />

      <div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          <span
            className={`${mennuBrandFont.className} inline-block pr-2`}
            style={{
              color: '#6EDC3A',
              textShadow:
                '-1px -1px 0 #0f3d0f, 1px -1px 0 #0f3d0f, -1px 1px 0 #0f3d0f, 1px 1px 0 #0f3d0f'
            }}
          >
            MENNU
          </span>

          <span
            style={{
              color: '#FED7AA',
              WebkitTextStroke: '1px #ef4444'
            }}
          >
            Sistema de Cardápio Inteligente
          </span>
        </h1>

        <p className="mt-3 text-sm text-[var(--muted)] md:text-base max-w-xl mx-auto">
          Planeje sua semana sem rolar páginas infinitas.  
          Apenas tome decisões simples e o MENNU organiza tudo.
        </p>
      </div>

      

    </div>

  </div>
</header>

        {screen === 'inicio' && (
          <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">

  <div className="card-surface rounded-[32px] border border-[var(--line)] p-6 md:p-7">

    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      <Sparkles size={14} /> Jornada inteligente
    </div>

    <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
      Planeje sua Semana, menos tempo de mercado e cozinha, mais tempo pra você.
    </h2>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
      Escolha pessoas, orçamento, objetivo e refeições. Depois veja um resultado
      dinâmico navegando pelos dias da semana.
    </p>

    <div className="mt-8 flex flex-col gap-4 sm:flex-row">

      <button
        type="button"
        onClick={() => setScreen('planejar')}
        className="rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#a855f7_45%,#c084fc_100%)] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_42px_-18px_rgba(168,85,247,0.75)] hover:brightness-105 transition"
      >
        Gerar Plano
      </button>

      <button
        type="button"
        onClick={() => setScreen('receitas')}
        className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-8 py-4 text-base font-semibold text-[var(--text)] hover:border-[var(--brand)]/35 transition"
      >
        Livro de Receitas
      </button>

    </div>

  </div>

  <div className="grid gap-4 sm:grid-cols-3">

    {carouselRecipes
      .slice(carouselIndex, carouselIndex + 3)
      .map((recipe) => (

        <div
          key={recipe.id}
          className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--bg)] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)]"
        >

          <RecipePhoto
            recipeId={recipe.id}
            recipeName={recipe.nome}
            mealType={(recipe.refeicao as MealType) || 'almoco'}
            className="h-48"
            imageUrl={recipe.imageUrl}
          />

          <div className="p-4">
            <div className="text-sm font-semibold text-[var(--text)]">
              {recipe.nome}
            </div>

            <div className="mt-1 text-xs text-[var(--muted)]">
              {recipe.tempoMin ?? 20} min
            </div>
          </div>

        </div>

      ))}

  </div>

</section>
        )}

        {screen === 'planejar' && (
          <section className="mb-6">
            <ConfigPanel
              value={config}
              onChange={setConfig}
              onGenerate={() => generate(false)}
              onDemo={() => generate(true)}
              loading={loading}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setScreen('receitas')}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
              >
                Próximo: banco de receitas
              </button>

              <button
                type="button"
                onClick={() => setScreen('inicio')}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-5 py-4 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                Voltar ao menu inicial
              </button>
            </div>
          </section>
        )}

        {screen === 'receitas' && (
          <section className="mb-6">
            <div className="card-surface overflow-hidden rounded-[32px] border border-[var(--line)] p-4 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)] md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Consulta manual
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    Banco de receitas clicável
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] md:text-base">
                    Chega de depender da loteria do gerador para conferir imagem. Aqui você navega
                    pelas {recipeCatalog.length} receitas por categoria, nome e busca. Seu orgulho da
                    página, com razão.
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
                  const count =
                    category === 'todas'
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
                      {RECIPE_CATEGORY_LABELS[category]}{' '}
                      <span className="opacity-80">({count})</span>
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
                    {filteredRecipes.length ? (
                      filteredRecipes.map((recipe, index) => {
                        const active = selectedRecipe?.id === recipe.id;
                        const categoryLabel =
                          RECIPE_CATEGORY_LABELS[recipe.refeicao || 'todas'] || 'Receita';

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
                                <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                                  {recipe.nome}
                                </div>
                                <div className="mt-1 text-xs text-[var(--muted)]">
                                  ID: {recipe.id}
                                </div>
                              </div>
                              <div className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                {recipe.tempoMin ?? 0} min
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                        Nenhuma receita bateu com o filtro. Parabéns, até a busca resolveu te
                        contrariar.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]/78 p-4 md:p-5">
                  {selectedRecipeDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-[28px]">
                          <RecipePhoto
                            recipeId={selectedRecipeDetail.recipeId}
                            recipeName={selectedRecipeDetail.recipeName}
                            mealType={selectedRecipeDetail.mealType}
                            className="min-h-[320px]"
                            imageUrl={(selectedRecipe as { imageUrl?: string })?.imageUrl}
                            priority
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              Categoria
                            </div>
                            <div className="mt-2 text-sm font-semibold">
                              {RECIPE_CATEGORY_LABELS[selectedRecipeDetail.mealType || 'todas'] ||
                                'Receita'}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              Tempo
                            </div>
                            <div className="mt-2 text-sm font-semibold">
                              {selectedRecipeDetail.timeMinutes ?? 0} min
                            </div>
                          </div>
                          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                              Faixa
                            </div>
                            <div className="mt-2 text-sm font-semibold">
                              {selectedRecipe?.faixaCusto ?? 'não definida'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--bg)] p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          Pré-visualização individual
                        </div>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                          {selectedRecipeDetail.recipeName}
                        </h3>
                        <div className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                          ID: {selectedRecipeDetail.recipeId}
                        </div>

                        <div className="mt-5 space-y-4">
                          <div>
                            <div className="text-sm font-semibold">Tags</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(selectedRecipe?.tags?.length ? selectedRecipe.tags : ['sem tags']).map(
                                (tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                                  >
                                    {tag}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

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

                          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-soft)]/60 p-4 text-sm text-[var(--muted)]">
                            Use esta área para validar rápido a imagem de cada prato antes de aprovar
                            o próximo lote. Se alguma sair torta, grotesca ou com cara de propaganda
                            de hospital, me manda o print e eu corrijo só ela.
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setScreen('planejar')}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
              >
                Voltar para planejamento
              </button>

              <button
                type="button"
                onClick={() => setScreen('resultados')}
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand),color-mix(in_srgb,var(--brand)_70%,var(--brand-3)))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_-18px_rgba(139,92,246,0.75)] transition hover:-translate-y-0.5"
              >
                Ir para resultados
              </button>
            </div>
          </section>
        )}

        {screen === 'resultados' && (
          <section>
            {plan ? (
              <ResultsPanel
                plan={plan}
                onSwapVariation={(dayNumber: number, meal: MealType) =>
                  setPlan((current) =>
                    current ? replaceMealVariation(current, dayNumber, meal) : current
                  )
                }
                onSave={() => plan && saveHistory(plan)}
                onReset={() => {
                  setPlan(null);
                  localStorage.removeItem(PLAN_KEY);
                  setScreen('planejar');
                }}
              />
            ) : (
              <div className="card-surface rounded-[32px] border border-[var(--line)] p-6 md:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Resultados
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Ainda não existe uma semana pronta.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base">
                  Primeiro monte seu planejamento. Depois o MENNU te leva para uma semana navegável,
                  em vez de te jogar num muro de cards.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setScreen('planejar')}
                    className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand),color-mix(in_srgb,var(--brand)_70%,var(--brand-3)))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_-18px_rgba(139,92,246,0.75)] transition hover:-translate-y-0.5"
                  >
                    Ir para planejamento
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('receitas')}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-5 py-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/35"
                  >
                    Ver banco de receitas
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
import { describe, expect, it } from 'vitest';
import {
  DEMO_CONFIG,
  adjustPlanToBudget,
  calculateCost,
  filterRecipes,
  generatePlan,
  getCostBreakdown,
  getRecipeDetailData,
  replaceMealVariation,
  sumIngredients,
  validateVariety
} from '@/lib/mealPlanner';

describe('meal planner engine', () => {
  it('soma ingredientes corretamente', () => {
    const plan = generatePlan(DEMO_CONFIG, { demo: true });
    const eggs = sumIngredients(plan.days, plan.summary.numPessoas).find((item) => item.itemId === 'egg');
    expect(eggs).toBeTruthy();
    expect((eggs?.quantidade ?? 0) > 0).toBe(true);
  });

  it('calcula custo total', () => {
    const plan = generatePlan(DEMO_CONFIG, { demo: true });
    expect(calculateCost(plan.days)).toBeGreaterThan(0);
  });

  it('respeita variedade básica', () => {
    const plan = generatePlan({ ...DEMO_CONFIG, orcamentoSemanal: 250, objetivo: 'equilibrio' });
    expect(validateVariety(plan.days)).toBe(true);
  });

  it('evita almoço e jantar da mesma família em orçamentos confortáveis', () => {
    const plan = generatePlan({ ...DEMO_CONFIG, orcamentoSemanal: 250, objetivo: 'equilibrio' });
    const families = plan.days.map((day) => ({
      almoco: day.meals.almoco?.recipeFamily,
      jantar: day.meals.jantar?.recipeFamily
    }));
    expect(families.every((day) => day.almoco && day.jantar && day.almoco !== day.jantar)).toBe(true);
  });

  it('ajusta orçamento quando possível', () => {
    const originalConfig = { ...DEMO_CONFIG, orcamentoSemanal: 50, objetivo: 'equilibrio' as const };
    const plan = generatePlan(originalConfig, { demo: true });
    const adjusted = adjustPlanToBudget(plan.days, originalConfig);
    expect(calculateCost(adjusted.days)).toBeLessThanOrEqual(calculateCost(plan.days));
  });

  it('trocar variação recalcula custos', () => {
    const plan = generatePlan(DEMO_CONFIG, { demo: true });
    const updated = replaceMealVariation(plan, 1, 'almoco');
    expect(updated.days[0].meals.almoco?.variationName).not.toEqual(plan.days[0].meals.almoco?.variationName);
    expect(updated.totalCost).not.toEqual(plan.totalCost);
  });

  it('filtra receitas sem ovo', () => {
    const recipes = filterRecipes({ ...DEMO_CONFIG, restricoes: ['sem ovo'] }, 'cafe');
    expect(recipes.every((recipe) => recipe.ingredientes.every((ing) => ing.itemId !== 'egg'))).toBe(true);
  });

  it('gera custo fracionado e custo de mercado', () => {
    const breakdown = getCostBreakdown('c8', 'Cuscuz com ovo', 2);
    expect(breakdown.length).toBeGreaterThan(0);
    expect(breakdown[0].custoFracionado).toBeGreaterThan(0);
    expect(breakdown[0].initialMarketCost).toBeGreaterThan(0);
  });

  it('gera página detalhada da receita', () => {
    const detail = getRecipeDetailData('a1', 'Omelete simples', 2);
    expect(detail?.recipeName).toBeTruthy();
    expect(detail?.ingredients.length).toBeGreaterThan(0);
    expect(detail?.initialMarketTotal).toBeGreaterThan(0);
    expect(detail?.tips.length).toBeGreaterThan(0);
  });
});

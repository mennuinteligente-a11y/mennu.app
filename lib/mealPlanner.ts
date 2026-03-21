import prices from '@/data/prices.json';
import recipes from '@/data/recipes.json';
import {
  CostBreakdownItem,
  IngredientRef,
  MealType,
  PlanResult,
  PlannedDay,
  PlannedMeal,
  PlannerConfig,
  PriceItem,
  Recipe,
  RecipeDetailData,
  ShoppingListItem,
  GoalType,
  CostTier
} from './types';
import { formatCurrency } from './visuals';

const recipeDb = recipes as Recipe[];
const priceDb = prices as PriceItem[];

const RECIPE_PHOTO_OVERRIDES: Record<string, string> = Object.fromEntries(
  recipeDb
    .filter((recipe) => typeof (recipe as { imageUrl?: string }).imageUrl === 'string' && Boolean((recipe as { imageUrl?: string }).imageUrl))
    .map((recipe) => [recipe.id, String((recipe as { imageUrl?: string }).imageUrl)])
);

const MEAL_LABELS: Record<MealType, string> = {
  cafe: 'Café',
  almoco: 'Almoço',
  jantar: 'Jantar'
};

const MEAL_ORDER: MealType[] = ['cafe', 'almoco', 'jantar'];
const PROTEIN_IDS = ['egg', 'chicken', 'ground_beef', 'beef', 'tuna', 'sardine', 'ham', 'salmon', 'tilapia', 'shrimp'];
const DAIRY_IDS = ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'cream_cheese', 'parmesan'];
const ANIMAL_MAIN_INGREDIENTS = new Set(['egg', 'chicken', 'ground_beef', 'beef', 'tuna', 'sardine', 'ham', 'bacon', 'linguica', 'salmon', 'tilapia', 'shrimp']);

const VEGETABLE_IDS = new Set([
  'tomato',
  'lettuce',
  'carrot',
  'pumpkin',
  'cabbage',
  'zucchini',
  'okra',
  'peas',
  'corn',
  'spinach',
  'onion',
  'garlic',
  'sweet_potato',
  'potato',
  'mushroom_fresh'
]);

const BASE_TYPE_MAP: Record<string, string> = {
  rice: 'arroz',
  beans: 'feijao',
  pasta: 'massa',
  ravioli_filled: 'massa',
  lasagna_pasta: 'massa',
  tagliatelle: 'massa',
  penne: 'massa',
  spaghetti: 'massa',
  arborio_rice: 'arroz',
  bread: 'pao',
  tapioca_gum: 'tapioca',
  cassava_flour: 'graos',
  potato: 'batata',
  sweet_potato: 'batata',
  pumpkin: 'legumes',
  quinoa: 'graos',
  oats: 'graos',
  yogurt: 'laticinio'
};

const PACKAGE_INFO: Record<string, { quantity: number; unit: PriceItem['unidadePadrao']; label: string }> = {
  rice: { quantity: 1, unit: 'kg', label: '1 pacote de arroz (1 kg)' },
  beans: { quantity: 1, unit: 'kg', label: '1 pacote de feijão (1 kg)' },
  egg: { quantity: 6, unit: 'un', label: '1 cartela com 6 ovos' },
  chicken: { quantity: 1, unit: 'kg', label: '1 bandeja de frango (1 kg)' },
  ground_beef: { quantity: 0.5, unit: 'kg', label: '1 bandeja de carne moída (500 g)' },
  beef: { quantity: 0.6, unit: 'kg', label: '1 bandeja de carne bovina (600 g)' },
  pasta: { quantity: 0.5, unit: 'kg', label: '1 pacote de macarrão (500 g)' },
  bread: { quantity: 6, unit: 'un', label: '1 pacote com 6 pães' },
  milk: { quantity: 1, unit: 'L', label: '1 caixa de leite (1 L)' },
  cheese: { quantity: 0.15, unit: 'kg', label: '1 peça de queijo (150 g)' },
  butter: { quantity: 0.25, unit: 'kg', label: '1 pote de margarina/manteiga (250 g)' },
  tomato: { quantity: 0.5, unit: 'kg', label: '1 bandeja de tomate (500 g)' },
  onion: { quantity: 0.5, unit: 'kg', label: '1 pacote de cebola (500 g)' },
  garlic: { quantity: 0.1, unit: 'kg', label: '1 cabeça de alho (100 g)' },
  lettuce: { quantity: 1, unit: 'un', label: '1 pé de alface' },
  carrot: { quantity: 0.5, unit: 'kg', label: '1 pacote de cenoura (500 g)' },
  potato: { quantity: 1, unit: 'kg', label: '1 pacote de batata (1 kg)' },
  banana: { quantity: 1, unit: 'kg', label: '1 penca de banana (1 kg)' },
  oats: { quantity: 0.25, unit: 'kg', label: '1 pacote de aveia (250 g)' },
  coffee: { quantity: 0.25, unit: 'kg', label: '1 pacote de café (250 g)' },
  oil: { quantity: 0.9, unit: 'L', label: '1 garrafa de óleo (900 ml)' },
  salt: { quantity: 1, unit: 'kg', label: '1 pacote de sal (1 kg)' },
  pepper: { quantity: 0.05, unit: 'kg', label: '1 sachê de pimenta (50 g)' },
  yogurt: { quantity: 0.17, unit: 'kg', label: '1 potinho de iogurte (170 g)' },
  tuna: { quantity: 0.17, unit: 'kg', label: '1 lata de atum (170 g)' },
  sardine: { quantity: 0.125, unit: 'kg', label: '1 lata de sardinha (125 g)' },
  corn: { quantity: 0.17, unit: 'kg', label: '1 lata de milho (170 g)' },
  peas: { quantity: 0.17, unit: 'kg', label: '1 lata de ervilha (170 g)' },
  cassava_flour: { quantity: 0.5, unit: 'kg', label: '1 pacote de flocão/farinha (500 g)' },
  tapioca_gum: { quantity: 0.5, unit: 'kg', label: '1 pacote de goma de tapioca (500 g)' },
  spinach: { quantity: 0.2, unit: 'kg', label: '1 maço de espinafre (200 g)' },
  pumpkin: { quantity: 1, unit: 'kg', label: '1 pedaço de abóbora (1 kg)' },
  orange: { quantity: 1, unit: 'kg', label: '1 saco de laranja (1 kg)' },
  cabbage: { quantity: 1, unit: 'kg', label: '1 unidade de repolho pequeno (1 kg)' },
  zucchini: { quantity: 0.6, unit: 'kg', label: '2 abobrinhas médias (600 g)' },
  okra: { quantity: 0.4, unit: 'kg', label: '1 bandeja de quiabo (400 g)' },
  sweet_potato: { quantity: 1, unit: 'kg', label: '1 pacote de batata-doce (1 kg)' },
  cream: { quantity: 0.2, unit: 'kg', label: '1 caixa de creme de leite (200 g)' },
  ham: { quantity: 0.2, unit: 'kg', label: '1 pacote de presunto (200 g)' },
  jam: { quantity: 0.25, unit: 'kg', label: '1 pote de geleia (250 g)' },
  honey: { quantity: 0.3, unit: 'kg', label: '1 frasco de mel (300 g)' },
  papaya: { quantity: 1, unit: 'kg', label: '1 mamão médio (1 kg)' },
  strawberry: { quantity: 0.25, unit: 'kg', label: '1 bandeja de morango (250 g)' },
  granola: { quantity: 0.25, unit: 'kg', label: '1 pacote de granola (250 g)' },
  peanut_butter: { quantity: 0.5, unit: 'kg', label: '1 pote de pasta de amendoim (500 g)' },
  cream_cheese: { quantity: 0.2, unit: 'kg', label: '1 copo de requeijão (200 g)' },
  apple: { quantity: 1, unit: 'kg', label: '1 saco de maçã (1 kg)' },
  coconut: { quantity: 0.1, unit: 'kg', label: '1 pacote de coco ralado (100 g)' },
  cornmeal: { quantity: 0.5, unit: 'kg', label: '1 pacote de fubá (500 g)' },
  flour: { quantity: 1, unit: 'kg', label: '1 pacote de farinha de trigo (1 kg)' },
  cocoa: { quantity: 0.2, unit: 'kg', label: '1 pacote de chocolate em pó (200 g)' },
  acerola: { quantity: 1, unit: 'kg', label: '1 bandeja de acerola (1 kg)' },
  salmon: { quantity: 0.6, unit: 'kg', label: '1 posta de salmão (600 g)' },
  tilapia: { quantity: 0.6, unit: 'kg', label: '2 filés de tilápia (600 g)' },
  shrimp: { quantity: 0.4, unit: 'kg', label: '1 bandeja de camarão (400 g)' },
  mushroom_fresh: { quantity: 0.2, unit: 'kg', label: '1 bandeja de cogumelos frescos (200 g)' },
  parmesan: { quantity: 0.18, unit: 'kg', label: '1 peça de parmesão (180 g)' },
  tomato_dried: { quantity: 0.15, unit: 'kg', label: '1 pote de tomate seco (150 g)' },
  olive_oil: { quantity: 0.5, unit: 'L', label: '1 garrafa de azeite (500 ml)' },
  nuts: { quantity: 0.2, unit: 'kg', label: '1 pacote de castanhas (200 g)' },
  arborio_rice: { quantity: 0.5, unit: 'kg', label: '1 pacote de arroz arbório (500 g)' },
  white_wine: { quantity: 0.75, unit: 'L', label: '1 garrafa de vinho branco (750 ml)' },
  quinoa: { quantity: 0.25, unit: 'kg', label: '1 pacote de quinoa (250 g)' },
  ravioli_filled: { quantity: 0.4, unit: 'kg', label: '1 bandeja de ravioli recheado (400 g)' },
  lasagna_pasta: { quantity: 0.5, unit: 'kg', label: '1 pacote de massa para lasanha (500 g)' },
  tagliatelle: { quantity: 0.5, unit: 'kg', label: '1 pacote de talharim (500 g)' },
  penne: { quantity: 0.5, unit: 'kg', label: '1 pacote de penne (500 g)' },
  spaghetti: { quantity: 0.5, unit: 'kg', label: '1 pacote de espaguete (500 g)' },
  truffle_oil: { quantity: 0.06, unit: 'L', label: '1 frasco de azeite trufado (60 ml)' },
  lemon_sicilian: { quantity: 0.5, unit: 'kg', label: '1 saco de limão siciliano (500 g)' },
  sage: { quantity: 0.03, unit: 'kg', label: '1 maço de sálvia (30 g)' }
};

const PHOTO_HINTS: Record<string, string> = Object.fromEntries(
  recipeDb.map((recipe) => [recipe.id, `${recipe.nome.toLowerCase()} prato caseiro`])
);

export const DEMO_CONFIG: PlannerConfig = {
  numPessoas: 2,
  refeicoes: ['cafe', 'almoco', 'jantar'],
  tempoMax: 20,
  objetivo: 'economia',
  orcamentoSemanal: 120,
  restricoes: []
};

type BudgetBand = 'baixo' | 'medio' | 'alto';
type LunchStyle = 'brasileiro_feijao' | 'arroz_sem_feijao' | 'massa' | 'risoto' | 'peixe' | 'vegetariano' | 'prato_unico' | 'forno' | 'livre';
type FaixaCustoSemana = 'economica' | 'media' | 'premium';

type WeeklyTargets = {
  lunchStyles: Record<LunchStyle, number>;
  faixaCusto: Record<FaixaCustoSemana, number>;
  fishMealsMin: number;
  premiumMealsMin: number;
};

export function getMealLabel(meal: MealType) {
  return MEAL_LABELS[meal];
}

export function getRecipes() {
  return recipeDb;
}

export function getRecipeById(recipeId: string) {
  return recipeDb.find((recipe) => recipe.id === recipeId);
}

export function getRecipePhotoSrc(recipeId: string) {
  return RECIPE_PHOTO_OVERRIDES[recipeId] ?? `/recipes/${recipeId}.webp`;
}

function getRecipeFaixaCusto(recipe: Recipe): FaixaCustoSemana {
  const faixa = String((recipe as { faixaCusto?: string }).faixaCusto ?? '').toLowerCase();
  if (faixa === 'premium') return 'premium';
  if (faixa === 'media' || faixa === 'média') return 'media';
  if (faixa === 'economica' || faixa === 'econômica') return 'economica';
  if (recipe.costTier === 'alto') return 'premium';
  if (recipe.costTier === 'medio') return 'media';
  return 'economica';
}

function recipeHasRestrictionConflict(recipe: Recipe, config: PlannerConfig) {
  if (config.restricoes.includes('sem ovo') && recipe.ingredientes.some((ing) => ing.itemId === 'egg')) return true;
  if (config.restricoes.includes('sem lactose') && recipe.ingredientes.some((ing) => DAIRY_IDS.includes(ing.itemId))) return true;
  if (config.restricoes.includes('sem carne') && recipe.ingredientes.some((ing) => PROTEIN_IDS.includes(ing.itemId) && ing.itemId !== 'egg')) return true;
  return recipe.restricoes.some((restriction) => config.restricoes.includes(restriction));
}

export function filterRecipes(config: PlannerConfig, meal: MealType) {
  const basePool = recipeDb.filter((recipe) => {
    if (recipe.refeicao !== meal) return false;
    if (recipeHasRestrictionConflict(recipe, config)) return false;
    return true;
  });

  const strictPool = basePool.filter((recipe) => recipe.tempoMin <= config.tempoMax);
  if (strictPool.length >= 8) return strictPool;

  const relaxedLimit = meal === 'cafe' ? Math.min(25, config.tempoMax + 5) : Math.min(40, config.tempoMax + 12);
  const relaxedPool = basePool.filter((recipe) => recipe.tempoMin <= relaxedLimit);
  return relaxedPool.length ? relaxedPool : basePool;
}

function getVariationExtraIngredients(variationName: string): IngredientRef[] {
  const normalized = variationName.toLowerCase();
  const extras: IngredientRef[] = [];
  if (normalized.includes('queijo')) extras.push({ itemId: 'cheese', qtyPorPessoa: 0.02, unidade: 'kg' });
  if (normalized.includes('tomate')) extras.push({ itemId: 'tomato', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('frango')) extras.push({ itemId: 'chicken', qtyPorPessoa: 0.05, unidade: 'kg' });
  if (normalized.includes('atum')) extras.push({ itemId: 'tuna', qtyPorPessoa: 0.04, unidade: 'kg' });
  if (normalized.includes('cenoura')) extras.push({ itemId: 'carrot', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('milho')) extras.push({ itemId: 'corn', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('ervilha')) extras.push({ itemId: 'peas', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('espinafre')) extras.push({ itemId: 'spinach', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('banana')) extras.push({ itemId: 'banana', qtyPorPessoa: 0.05, unidade: 'kg' });
  if (normalized.includes('laranja')) extras.push({ itemId: 'orange', qtyPorPessoa: 0.06, unidade: 'kg' });
  if (normalized.includes('iogurte')) extras.push({ itemId: 'yogurt', qtyPorPessoa: 0.03, unidade: 'kg' });
  if (normalized.includes('requeijão')) extras.push({ itemId: 'cream_cheese', qtyPorPessoa: 0.02, unidade: 'kg' });
  if (normalized.includes('presunto')) extras.push({ itemId: 'ham', qtyPorPessoa: 0.025, unidade: 'kg' });
  if (normalized.includes('mel')) extras.push({ itemId: 'honey', qtyPorPessoa: 0.01, unidade: 'kg' });
  if (normalized.includes('morango')) extras.push({ itemId: 'strawberry', qtyPorPessoa: 0.04, unidade: 'kg' });
  if (normalized.includes('mamão')) extras.push({ itemId: 'papaya', qtyPorPessoa: 0.06, unidade: 'kg' });
  if (normalized.includes('maçã')) extras.push({ itemId: 'apple', qtyPorPessoa: 0.06, unidade: 'kg' });
  if (normalized.includes('coco')) extras.push({ itemId: 'coconut', qtyPorPessoa: 0.015, unidade: 'kg' });
  if (normalized.includes('granola')) extras.push({ itemId: 'granola', qtyPorPessoa: 0.02, unidade: 'kg' });
  return extras;
}

function mergeIngredientRefs(ingredients: IngredientRef[]) {
  const merged = new Map<string, IngredientRef>();

  for (const ing of ingredients) {
    const key = `${ing.itemId}__${ing.unidade}`;
    const existing = merged.get(key);
    if (existing) {
      existing.qtyPorPessoa += ing.qtyPorPessoa;
    } else {
      merged.set(key, { ...ing });
    }
  }

  return Array.from(merged.values());
}

export function getIngredientsForMeal(recipe: Recipe, variationName: string) {
  return mergeIngredientRefs([...recipe.ingredientes, ...getVariationExtraIngredients(variationName)]);
}

function getPackageInfo(price: PriceItem) {
  return PACKAGE_INFO[price.itemId] ?? {
    quantity: price.tamanhoUnidade,
    unit: price.unidadePadrao,
    label: `1 embalagem de ${price.nome}`
  };
}

export function formatQuantityLabel(quantity: number, unit: string) {
  if (unit === 'kg') return `${Math.round(quantity * 1000)} g`;
  if (unit === 'L') return `${Math.round(quantity * 1000)} ml`;
  if (unit === 'g' || unit === 'ml') return `${Math.round(quantity)} ${unit}`;
  return `${Number.isInteger(quantity) ? quantity : quantity.toFixed(1)} ${unit}`;
}


export function getCostBreakdown(recipeId: string, variationName: string, numPessoas: number): CostBreakdownItem[] {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return [];

  return getIngredientsForMeal(recipe, variationName)
    .map((ing) => {
      const price = priceDb.find((item) => item.itemId === ing.itemId);
      if (!price) return null;
      const quantityUsed = ing.qtyPorPessoa * numPessoas;
      const packageInfo = getPackageInfo(price);
      const packagesNeeded = Math.max(1, Math.ceil(quantityUsed / packageInfo.quantity));
      const packageCost = packageInfo.quantity * price.precoPorUnidade;
      const yieldByIngredient = Math.max(1, Math.floor(packageInfo.quantity / (ing.qtyPorPessoa * numPessoas || 1)));

      return {
        itemId: ing.itemId,
        nome: price.nome,
        categoria: price.categoria,
        quantidadeUsada: quantityUsed,
        quantidadeUsadaLabel: formatQuantityLabel(quantityUsed, ing.unidade),
        custoFracionado: quantityUsed * price.precoPorUnidade,
        packageLabel: packageInfo.label,
        packageQuantity: packageInfo.quantity,
        packageUnit: packageInfo.unit,
        packageCost,
        packagesNeeded,
        initialMarketCost: packageCost * packagesNeeded,
        rendimentoPorCompra: yieldByIngredient
      } as CostBreakdownItem;
    })
    .filter(Boolean) as CostBreakdownItem[];
}

function familyCostMultiplier(recipe: Recipe) {
  const family = recipe.family.toLowerCase();
  if (family.includes('risoto')) return 1.1;
  if (family.includes('massa_recheada') || family.includes('lasanha') || family.includes('forno')) return 1.08;
  if (recipe.mainIngredient === 'salmon' || recipe.mainIngredient === 'shrimp') return 1.16;
  if (recipe.mainIngredient === 'tilapia') return 1.1;
  if (recipe.mainIngredient === 'tuna' || recipe.mainIngredient === 'sardine') return 1.03;
  return 1;
}

function mealEstimatedCost(recipe: Recipe, numPessoas: number, variationName?: string) {
  const variation = variationName ?? recipe.variacoes[0] ?? recipe.nome;
  const raw = getCostBreakdown(recipe.id, variation, numPessoas).reduce((sum, ing) => sum + ing.custoFracionado, 0);
  const tierMultiplier = recipe.costTier === 'alto' ? 1.2 : recipe.costTier === 'medio' ? 1.06 : 1;
  const faixaMultiplier = getRecipeFaixaCusto(recipe) === 'premium' ? 1.08 : getRecipeFaixaCusto(recipe) === 'media' ? 1.03 : 1;
  return raw * tierMultiplier * faixaMultiplier * familyCostMultiplier(recipe);
}

function normalizeStepText(step: string) {
  const cleaned = String(step ?? '').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  if (!cleaned) return '';
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
}

function buildRecipeIntro(recipe: Recipe, variationName: string, peopleCount: number) {
  const mealLabel = recipe.refeicao === 'almoco' ? 'almoço' : recipe.refeicao === 'jantar' ? 'jantar' : 'café da manhã';
  const weightLabel = recipe.mealWeight === 'reforcado' ? 'mais substanciosa' : recipe.mealWeight === 'leve' ? 'mais leve' : 'equilibrada';
  return `${variationName} para ${peopleCount} pessoa(s), pensada para ${mealLabel} e com perfil ${weightLabel}.`;
}

function buildRecipeSteps(recipe: Recipe) {
  const directSteps = Array.isArray(recipe.passos) ? recipe.passos.map(normalizeStepText).filter(Boolean) : [];
  if (directSteps.length >= 3) return directSteps;
  if (directSteps.length > 0) return directSteps;

  return [
    'Separe os ingredientes antes de começar.',
    `Prepare em ${recipe.temperatura ?? 'fogo médio'} até chegar ao ponto desejado.`,
    recipe.descansoMin > 0 ? `Descanse por ${recipe.descansoMin} minuto(s) antes de servir.` : 'Sirva em seguida.'
  ];
}

function buildRecipeTips(recipe: Recipe, variationName: string, peopleCount: number) {
  if (Array.isArray(recipe.dicas) && recipe.dicas.length) return recipe.dicas;
  return [
    'Leia a receita inteira antes de começar.',
    `Ajuste as quantidades proporcionalmente para ${peopleCount} pessoa(s).`,
    `Finalize ${variationName.toLowerCase()} só no fim para preservar melhor textura e aroma.`
  ];
}

function buildFullMethodText(recipe: Recipe) {
  const directSteps = buildRecipeSteps(recipe);
  return directSteps.join(' ');
}
/* ── Narrativa contextual ─────────────────────────────────────── */

/* ── Narrativa detalhada do caderno ─────────────────────────── */

const INGREDIENT_LABELS: Record<string, string> = {
  egg: 'ovos', chicken: 'frango', ground_beef: 'carne moída',
  beef: 'carne bovina', tuna: 'atum', sardine: 'sardinha',
  ham: 'presunto', salmon: 'salmão', tilapia: 'tilápia',
  shrimp: 'camarão', milk: 'leite', cheese: 'queijo',
  butter: 'manteiga', yogurt: 'iogurte', cream: 'creme de leite',
  cream_cheese: 'requeijão', parmesan: 'parmesão',
  rice: 'arroz', beans: 'feijão', pasta: 'macarrão',
  bread: 'pão', oats: 'aveia', potato: 'batata',
  sweet_potato: 'batata-doce', pumpkin: 'abóbora',
  tomato: 'tomate', onion: 'cebola', garlic: 'alho',
  carrot: 'cenoura', lettuce: 'alface', spinach: 'espinafre',
  zucchini: 'abobrinha', cabbage: 'repolho', corn: 'milho',
  peas: 'ervilha', banana: 'banana', orange: 'laranja',
  cassava_flour: 'flocão', tapioca_gum: 'goma de tapioca',
  oil: 'óleo', salt: 'sal', coffee: 'café'
};

function labelIngredient(itemId: string): string {
  return INGREDIENT_LABELS[itemId] ?? itemId.replace(/_/g, ' ');
}

function buildDetailedNarrative(
  recipe: Recipe,
  variationName: string,
  peopleCount: number
): string {
  const steps = buildRecipeSteps(recipe);
  const tips = Array.isArray(recipe.dicas) && recipe.dicas.length ? recipe.dicas : [];
  const ingredientIds = recipe.ingredientes.map((i) => i.itemId);

  const mealCtx =
    recipe.refeicao === 'cafe'
      ? 'Para começar bem o dia'
      : recipe.refeicao === 'jantar'
      ? 'Para fechar a noite com leveza'
      : 'Para o almoço';

  const tempoCtx =
    recipe.tempoMin <= 10
      ? 'em menos de 10 minutos'
      : recipe.tempoMin <= 20
      ? `em cerca de ${recipe.tempoMin} minutos`
      : `em aproximadamente ${recipe.tempoMin} minutos`;

  const weightCtx =
    recipe.mealWeight === 'leve'
      ? 'uma opção mais leve, que não pesa no estômago'
      : recipe.mealWeight === 'reforcado'
      ? 'uma refeição mais completa e saciante'
      : 'uma refeição equilibrada';

  const opening =
    `${mealCtx}, ${variationName.toLowerCase()} é ${weightCtx} — ` +
    `pronta ${tempoCtx} e pensada para ${peopleCount} pessoa${peopleCount > 1 ? 's' : ''}.`;

  const hasProtein = ingredientIds.some((id) =>
    ['egg', 'chicken', 'ground_beef', 'beef', 'tuna', 'sardine', 'ham', 'salmon', 'tilapia', 'shrimp'].includes(id)
  );
  const hasVegetable = ingredientIds.some((id) => VEGETABLE_IDS.has(id));
  const hasGrain = ingredientIds.some((id) =>
    ['rice', 'pasta', 'bread', 'cassava_flour', 'tapioca_gum', 'oats', 'quinoa'].includes(id)
  );

  const mainLabel = labelIngredient(recipe.mainIngredient);
  let ingredientContext = `O ingrediente principal é ${mainLabel}`;

  if (hasProtein && hasVegetable && hasGrain) {
    ingredientContext += ', acompanhado de legumes e uma base de carboidrato que sustenta bem a refeição';
  } else if (hasProtein && hasVegetable) {
    ingredientContext += ', com presença de legumes que adicionam cor e nutrição ao prato';
  } else if (hasGrain && hasVegetable) {
    ingredientContext += ', com legumes que tornam a base mais nutritiva e variada';
  } else if (hasProtein) {
    ingredientContext += ', que concentra o sabor e o valor nutritivo do prato';
  }
  ingredientContext += '.';

  const tempCtx = recipe.temperatura
    ? `O preparo acontece em ${recipe.temperatura.toLowerCase()}`
    : 'O preparo é direto';

  const restCtx =
    recipe.descansoMin > 0
      ? ` Depois de pronto, vale deixar descansar ${recipe.descansoMin} minuto${recipe.descansoMin > 1 ? 's' : ''} antes de servir — esse intervalo faz diferença na textura final.`
      : '';

  const techniqueBlock =
    `${tempCtx}, o que garante ${recipe.mealWeight === 'leve' ? 'leveza e agilidade no preparo' : 'o cozimento adequado de cada elemento'}.${restCtx}`;

  const stepCount = steps.length;
  const stepSummary =
    stepCount <= 3
      ? `O preparo tem ${stepCount} etapas simples.`
      : stepCount <= 5
      ? `São ${stepCount} etapas no total — nenhuma delas exige técnica avançada.`
      : `São ${stepCount} etapas que se sucedem de forma clara, sem complicações.`;

  let tipBlock = '';
  if (tips.length) {
    const mainTip = tips[0];
tipBlock = `Um ponto que faz diferença: ${mainTip.charAt(0).toLowerCase()}${mainTip.slice(1).replace(/\.$/, '')}.`;
  }

  const variationNote =
    recipe.variacoes.length > 1
      ? `A versão apresentada aqui é "${variationName}". Se preferir algo diferente, há ${recipe.variacoes.length - 1} outra${recipe.variacoes.length > 2 ? 's variações' : ' variação'} disponível no plano.`
      : '';

  return [opening, ingredientContext, techniqueBlock, stepSummary, tipBlock, variationNote]
    .filter(Boolean)
    .join(' ');
}

export function getRecipeDetailData(recipeId: string, variationName: string, peopleCount: number): RecipeDetailData | null {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return null;
  const safeVariation = variationName && recipe.variacoes.includes(variationName) ? variationName : recipe.variacoes[0];
  const ingredients = getCostBreakdown(recipeId, safeVariation, peopleCount);
  const fractionedTotal = ingredients.reduce((sum, item) => sum + item.custoFracionado, 0);
  const initialMarketTotal = ingredients.reduce((sum, item) => sum + item.initialMarketCost, 0);
  const totalYieldFromInitialPurchase = ingredients.length
    ? Math.max(1, Math.min(...ingredients.map((item) => item.rendimentoPorCompra)))
    : 1;

  return {
    recipeId: recipe.id,
    recipeName: recipe.nome,
    mealType: recipe.refeicao,
    variationName: safeVariation,
    peopleCount,
    timeMinutes: recipe.tempoMin,
    serves: peopleCount,
    heatLevel: recipe.temperatura,
    restMinutes: recipe.descansoMin,
    mealWeight: recipe.mealWeight,
    tips: buildRecipeTips(recipe, safeVariation, peopleCount),
    steps: buildRecipeSteps(recipe),
    utensils: recipe.utensilios ?? [],
    ingredients,
    fractionedTotal,
    initialMarketTotal,
    totalYieldFromInitialPurchase,
    photo: {
      src: getRecipePhotoSrc(recipe.id),
      hint: PHOTO_HINTS[recipe.id] ?? recipe.nome.toLowerCase()
    },
    introText: buildRecipeIntro(recipe, safeVariation, peopleCount),
        fullMethodText: buildFullMethodText(recipe),
    narrativeText: buildDetailedNarrative(recipe, safeVariation, peopleCount)
  };
}

export function sumIngredients(days: PlannedDay[], numPessoas: number) {
  const usageMap = new Map<string, number>();

  // soma quantidade usada na semana
  days.forEach((day) => {
    Object.values(day.meals).forEach((meal) => {
      if (!meal) return;

      const recipe = recipeDb.find((r) => r.id === meal.recipeId);
      if (!recipe) return;

      getIngredientsForMeal(recipe, meal.variationName).forEach((ing) => {
        const used = ing.qtyPorPessoa * numPessoas;

        const current = usageMap.get(ing.itemId) ?? 0;

        usageMap.set(
          ing.itemId,
          Number(current) + used
        );
      });
    });
  });

  const result: ShoppingListItem[] = [];

  // converte para quantidade de compra
  usageMap.forEach((totalUsed, itemId) => {
    const price = priceDb.find((p) => p.itemId === itemId);
    if (!price) return;

    const packageInfo = getPackageInfo(price);

    const packagesNeeded = Math.ceil(totalUsed / packageInfo.quantity);

    const quantityToBuy = packagesNeeded * packageInfo.quantity;

    const packageCost = packageInfo.quantity * price.precoPorUnidade;

const cost = packagesNeeded * packageCost;

    result.push({
      itemId,
      nome: price.nome,
      categoria: price.categoria,
      unidade: packageInfo.unit,
      quantidade: quantityToBuy,
      custo: cost
    });
  });

  return result;
}

export function calculateCost(days: PlannedDay[]) {
  return days.reduce((sum, day) => sum + day.totalCost, 0);
}

export function validateVariety(days: PlannedDay[]) {
  const mealHistory: Record<MealType, string[]> = { cafe: [], almoco: [], jantar: [] };

  for (const day of days) {
    const familiesToday = new Set<string>();
    const proteinsToday = new Set<string>();

    for (const meal of Object.keys(day.meals) as MealType[]) {
      const planned = day.meals[meal];
      if (!planned) continue;

      const history = mealHistory[meal];
      const last = history[history.length - 1];
      if (last === planned.recipeId) return false;
      history.push(planned.recipeId);
      if (history.filter((id) => id === planned.recipeId).length > 1) return false;
      if (familiesToday.has(planned.recipeFamily)) return false;
      if (proteinsToday.has(planned.mainIngredient)) return false;
      familiesToday.add(planned.recipeFamily);
      proteinsToday.add(planned.mainIngredient);
    }
  }

  return true;
}

function budgetPerMealPerson(config: PlannerConfig) {
  const selectedMeals = Math.max(1, config.refeicoes.length);
  return config.orcamentoSemanal / (selectedMeals * 7 * config.numPessoas);
}

function getBudgetLevel(config: PlannerConfig): BudgetBand {
  const ratio = budgetPerMealPerson(config);
  if (ratio < 3.8) return 'baixo';
  if (ratio < 8.5) return 'medio';
  return 'alto';
}

function getObjectiveSpendRatio(goal: GoalType) {
  return {
    economia: 0.66,
    equilibrio: 0.86,
    praticidade: 0.8
  }[goal];
}

function objectiveScore(recipe: Recipe, goal: GoalType) {
  if (recipe.tags.includes(goal)) return 18;
  if (goal === 'equilibrio') return recipe.mealWeight === 'leve' ? 10 : 8;
  if (goal === 'economia') return recipe.costTier === 'baixo' ? 12 : recipe.costTier === 'medio' ? 3 : -12;
  return recipe.tempoMin <= 15 ? 12 : 3;
}

function budgetTierScore(recipeTier: CostTier, budgetLevel: BudgetBand) {
  const matrix: Record<BudgetBand, Record<CostTier, number>> = {
    baixo: { baixo: 14, medio: 2, alto: -12 },
    medio: { baixo: 5, medio: 12, alto: 2 },
    alto: { baixo: -4, medio: 7, alto: 24 }
  };
  return matrix[budgetLevel][recipeTier];
}

function pseudoRandom(recipeId: string, salt: number, seed = 0) {
  let hash = (salt + seed) % 997;
  for (let i = 0; i < recipeId.length; i += 1) hash = (hash * 31 + recipeId.charCodeAt(i)) % 997;
  return hash / 997;
}

function getProteinRepeatLimit(mainIngredient: string, meal: MealType) {
  if (meal === 'cafe') return mainIngredient === 'egg' ? 2 : 1;
  if (mainIngredient === 'egg') return 2;
  if (mainIngredient === 'tuna' || mainIngredient === 'sardine') return 1;
  if (mainIngredient === 'salmon' || mainIngredient === 'tilapia' || mainIngredient === 'shrimp') return 1;
  return 2;
}

function getProteinGroup(mainIngredient: string) {
  if (mainIngredient === 'egg') return 'egg';
  if (mainIngredient === 'chicken') return 'chicken';
  if (mainIngredient === 'beef' || mainIngredient === 'ground_beef') return 'beef';
  if (['tuna', 'sardine', 'salmon', 'tilapia', 'shrimp'].includes(mainIngredient)) return 'fish';
  if (mainIngredient === 'ham') return 'processed';
  return 'other';
}

function countProteinGroups(weeklyMainCount: Record<string, number>) {
  return {
    egg: weeklyMainCount['egg'] ?? 0,
    chicken: weeklyMainCount['chicken'] ?? 0,
    beef: (weeklyMainCount['beef'] ?? 0) + (weeklyMainCount['ground_beef'] ?? 0),
    fish: (weeklyMainCount['tuna'] ?? 0) + (weeklyMainCount['sardine'] ?? 0) + (weeklyMainCount['salmon'] ?? 0) + (weeklyMainCount['tilapia'] ?? 0) + (weeklyMainCount['shrimp'] ?? 0),
    processed: weeklyMainCount['ham'] ?? 0
  };
}

function getIngredientIds(recipe: Recipe) {
  return recipe.ingredientes.map((item) => item.itemId);
}

function hasRiceAndBeans(recipe: Recipe) {
  const ids = getIngredientIds(recipe);
  return ids.includes('rice') && ids.includes('beans');
}

function hasRiceWithoutBeans(recipe: Recipe) {
  const ids = getIngredientIds(recipe);
  return ids.includes('rice') && !ids.includes('beans');
}

function isVegetarianLunchRecipe(recipe: Recipe) {
  return !ANIMAL_MAIN_INGREDIENTS.has(recipe.mainIngredient) && recipe.mainIngredient !== 'cheese';
}

function getBaseType(recipe: Recipe) {
  for (const ing of recipe.ingredientes) {
    const mapped = BASE_TYPE_MAP[ing.itemId];
    if (mapped) return mapped;
  }
  if (recipe.family.toLowerCase().includes('massa')) return 'massa';
  if (recipe.family.toLowerCase().includes('risoto')) return 'arroz';
  return 'livre';
}

function getLunchStyle(recipe: Recipe): LunchStyle {
  if (recipe.refeicao !== 'almoco') return 'livre';
  const family = recipe.family.toLowerCase();

  if (family.includes('risoto')) return 'risoto';
  if (family.includes('massa') || ['pasta', 'ravioli_filled', 'penne', 'spaghetti', 'tagliatelle'].includes(recipe.mainIngredient)) return 'massa';
  if (['salmon', 'tilapia', 'shrimp', 'tuna', 'sardine'].includes(recipe.mainIngredient)) return 'peixe';
  if (hasRiceAndBeans(recipe)) return 'brasileiro_feijao';
  if (['prato_unico', 'graos', 'leguminosas', 'polenta', 'pure', 'assado', 'gratinado', 'forno', 'massa_forno', 'massa_recheada'].includes(recipe.family)) {
    return isVegetarianLunchRecipe(recipe) ? 'vegetariano' : 'prato_unico';
  }
  if (isVegetarianLunchRecipe(recipe)) return 'vegetariano';
  if (hasRiceWithoutBeans(recipe)) return 'arroz_sem_feijao';
  if (family.includes('forno')) return 'forno';
  return recipe.mealWeight === 'leve' ? 'livre' : 'prato_unico';
}

function getWeeklyTargets(config: PlannerConfig): WeeklyTargets {
  const budget = getBudgetLevel(config);
  if (budget === 'alto') {
    return {
      lunchStyles: {
        brasileiro_feijao: 1,
        arroz_sem_feijao: 1,
        massa: 1,
        risoto: 1,
        peixe: 1,
        vegetariano: 1,
        prato_unico: 1,
        forno: 0,
        livre: 0
      },
      faixaCusto: { economica: 1, media: 3, premium: 3 },
      fishMealsMin: 2,
      premiumMealsMin: 3
    };
  }

  if (budget === 'medio') {
    return {
      lunchStyles: {
        brasileiro_feijao: 1,
        arroz_sem_feijao: 2,
        massa: 1,
        risoto: 0,
        peixe: 1,
        vegetariano: 1,
        prato_unico: 1,
        forno: 0,
        livre: 0
      },
      faixaCusto: { economica: 2, media: 4, premium: 1 },
      fishMealsMin: 1,
      premiumMealsMin: 1
    };
  }

  return {
    lunchStyles: {
      brasileiro_feijao: 1,
      arroz_sem_feijao: 2,
      massa: 1,
      risoto: 0,
      peixe: 1,
      vegetariano: 1,
      prato_unico: 1,
      forno: 0,
      livre: 0
    },
    faixaCusto: { economica: 5, media: 2, premium: 0 },
    fishMealsMin: 0,
    premiumMealsMin: 0
  };
}

function buildLunchStylePlan(config: PlannerConfig, seed = 0) {
  const availableLunches = filterRecipes(config, 'almoco');
  const availableCounts = availableLunches.reduce<Partial<Record<LunchStyle, number>>>((acc, recipe) => {
    const style = getLunchStyle(recipe);
    acc[style] = (acc[style] ?? 0) + 1;
    return acc;
  }, {});

  const targets = getWeeklyTargets(config).lunchStyles;
  const styles = Object.entries(targets)
    .flatMap(([style, count]) => Array.from({ length: count }, () => style as LunchStyle))
    .filter((style) => (availableCounts[style] ?? 0) > 0);

  while (styles.length < 7) {
    const fallbackOrder: LunchStyle[] = ['arroz_sem_feijao', 'prato_unico', 'massa', 'vegetariano', 'peixe', 'risoto', 'brasileiro_feijao', 'forno', 'livre'];
    const next = fallbackOrder.find((style) => (availableCounts[style] ?? 0) > 0 && styles.filter((item) => item === style).length < Math.max(1, targets[style] ?? 0) + 1) ?? 'livre';
    styles.push(next);
  }

  const rotated = [...styles];
  const offset = Math.floor(pseudoRandom('lunch-style-v5', 91, seed) * rotated.length);
  return rotated.slice(offset).concat(rotated.slice(0, offset)).slice(0, 7);
}

function proteinBalanceScore(recipe: Recipe, weeklyMainCount: Record<string, number>, meal: MealType) {
  const group = getProteinGroup(recipe.mainIngredient);
  const counts = countProteinGroups(weeklyMainCount);
  const usedDistinct = Object.values(counts).filter((value) => value > 0).length;

  if (group === 'other') {
    if (meal === 'jantar' && recipe.mealWeight === 'leve') return 12;
    if (meal === 'almoco' && recipe.mealWeight === 'reforcado') return 5;
    return 2;
  }

  const current = counts[group as keyof typeof counts] ?? 0;
  let score = 0;
  if (current === 0) score += 18;
  else if (current === 1) score += 6;
  else score -= current * 14;
  if (usedDistinct < 4 && current === 0) score += 8;
  if (meal === 'jantar' && group === 'processed') score -= 10;
  return score;
}

function baseTypeBalanceScore(recipe: Recipe, weeklyBaseCount: Record<string, number>) {
  const baseType = getBaseType(recipe);
  const used = weeklyBaseCount[baseType] ?? 0;
  if (baseType === 'livre') return 0;
  if (used === 0) return 10;
  if (used === 1) return 3;
  return -used * 8;
}

function vegetableScore(recipe: Recipe) {
  const ids = getIngredientIds(recipe);
  const vegetableCount = ids.filter((id) => VEGETABLE_IDS.has(id)).length;
  if (vegetableCount >= 3) return 10;
  if (vegetableCount === 2) return 6;
  if (vegetableCount === 1) return 2;
  return -4;
}

function lunchStyleNeedScore(recipe: Recipe, meal: MealType, weeklyLunchStyleCount: Partial<Record<LunchStyle, number>>, targets: WeeklyTargets) {
  if (meal !== 'almoco') return 0;
  const style = getLunchStyle(recipe);
  const used = weeklyLunchStyleCount[style] ?? 0;
  const target = targets.lunchStyles[style] ?? 0;
  if (target === 0) return style === 'brasileiro_feijao' ? -18 : 0;
  if (used < target) return 18 + (target - used) * 6;
  if (used === target) return 2;
  return -18 * (used - target + 1);
}

function faixaCustoNeedScore(recipe: Recipe, weeklyFaixaCount: Record<FaixaCustoSemana, number>, targets: WeeklyTargets) {
  const faixa = getRecipeFaixaCusto(recipe);
  const used = weeklyFaixaCount[faixa] ?? 0;
  const target = targets.faixaCusto[faixa] ?? 0;
  if (used < target) return 12 + (target - used) * 4;
  if (faixa === 'economica' && used > target) return -10 * (used - target);
  if (faixa === 'premium' && target === 0) return -22;
  return used > target ? -6 * (used - target) : 1;
}

function dinnerContrastScore(recipe: Recipe, dayMeals: PlannedDay['meals'], meal: MealType) {
  if (meal !== 'jantar') return 0;
  const lunch = dayMeals['almoco'];
  let score = 0;

  if (recipe.mealWeight === 'leve') score += 18;
  if (recipe.mealWeight === 'medio') score += 7;
  if (recipe.mealWeight === 'reforcado') score -= 18;

  if (lunch) {
    if (recipe.mainIngredient === lunch.mainIngredient) score -= 140;
    if (recipe.family === lunch.recipeFamily) score -= 140;
    if (getBaseType(recipe) === getBaseType(getRecipeById(lunch.recipeId) ?? recipe)) score -= 14;
  }

  if (recipe.family.includes('sopa') || recipe.family.includes('sandu') || recipe.family.includes('crepioca') || recipe.family.includes('omelete') || recipe.family.includes('salada') || recipe.family.includes('bowl')) {
    score += 10;
  }

  return score;
}

function getSpendIntent(config: PlannerConfig, targetBudget: number) {
  if (!config.orcamentoSemanal) return 0.52;
  const usage = targetBudget / config.orcamentoSemanal;
  if (config.objetivo === 'economia') return Math.min(0.5, Math.max(0.18, usage));
  if (config.objetivo === 'praticidade') return Math.min(0.82, Math.max(0.38, usage));
  return Math.min(1.02, Math.max(0.5, usage));
}

function mealSpendScore(recipe: Recipe, config: PlannerConfig, spendIntent: number) {
  const cost = mealEstimatedCost(recipe, config.numPessoas);
  const centered = cost - 4.8;
  const faixaBonus = recipe.costTier === 'alto' ? 7 : recipe.costTier === 'medio' ? 2 : -1;
  return centered * (spendIntent * 3.0 - 1.02) + faixaBonus * Math.max(0.35, spendIntent);
}

function buildPlannedMeal(recipe: Recipe, meal: MealType, numPessoas: number): PlannedMeal {
  return {
    recipeId: recipe.id,
    recipeName: recipe.nome,
    recipeFamily: recipe.family,
    mainIngredient: recipe.mainIngredient,
    refeicao: meal,
    variationIndex: 0,
    variationName: recipe.variacoes[0] ?? recipe.nome,
    allVariations: recipe.variacoes?.length ? recipe.variacoes : [recipe.nome],
    estimatedCost: mealEstimatedCost(recipe, numPessoas)
  };
}

function scoreRecipe(
  recipe: Recipe,
  config: PlannerConfig,
  meal: MealType,
  dayMeals: PlannedDay['meals'],
  previousByMeal: Partial<Record<MealType, Recipe | undefined>>,
  previousDay?: PlannedDay,
  dayIndex = 0,
  spendIntent = 0.5,
  seed = 0,
  weeklyState?: {
    recipeCount: Record<string, number>;
    familyCount: Record<string, number>;
    mainCount: Record<string, number>;
    baseCount: Record<string, number>;
    faixaCount: Record<FaixaCustoSemana, number>;
    lunchStyleCount: Partial<Record<LunchStyle, number>>;
    fishMeals: number;
    premiumMeals: number;
  },
  targets?: WeeklyTargets,
  desiredLunchStyle?: LunchStyle
) {
  const budgetLevel = getBudgetLevel(config);
  const sameDayMeals = Object.values(dayMeals).filter(Boolean) as PlannedMeal[];
  const sameFamilyToday = sameDayMeals.some((item) => item.recipeFamily === recipe.family);
  const sameIngredientToday = sameDayMeals.some((item) => item.mainIngredient === recipe.mainIngredient);
  const previousMealRecipe = previousByMeal[meal];
  const previousDayRecipes = previousDay ? (Object.values(previousDay.meals).filter(Boolean) as PlannedMeal[]) : [];

  const state = weeklyState ?? {
    recipeCount: {},
    familyCount: {},
    mainCount: {},
    baseCount: {},
    faixaCount: { economica: 0, media: 0, premium: 0 },
    lunchStyleCount: {},
    fishMeals: 0,
    premiumMeals: 0
  };

  const weekTargets = targets ?? getWeeklyTargets(config);

  let score = 0;
  score += objectiveScore(recipe, config.objetivo);
  score += budgetTierScore(recipe.costTier, budgetLevel);
  score += mealSpendScore(recipe, config, spendIntent);
  score += Math.max(0, 12 - recipe.tempoMin / 2);
  score += proteinBalanceScore(recipe, state.mainCount, meal);
  score += baseTypeBalanceScore(recipe, state.baseCount);
  score += vegetableScore(recipe);
  score += dinnerContrastScore(recipe, dayMeals, meal);
  score += lunchStyleNeedScore(recipe, meal, state.lunchStyleCount, weekTargets);
  score += faixaCustoNeedScore(recipe, state.faixaCount, weekTargets);

  if (meal === 'almoco' && desiredLunchStyle) {
    score += getLunchStyle(recipe) === desiredLunchStyle ? 30 : -18;
  }

  if (meal === 'almoco' && recipe.mealWeight === 'reforcado') score += 6;
  if (meal === 'jantar' && recipe.mealWeight === 'leve') score += 8;
  if (budgetLevel === 'alto' && getRecipeFaixaCusto(recipe) === 'premium') score += 12;
  if (budgetLevel === 'baixo' && getRecipeFaixaCusto(recipe) === 'premium') score -= 18;
  if (weekTargets.fishMealsMin > state.fishMeals && ['salmon', 'tilapia', 'shrimp', 'tuna', 'sardine'].includes(recipe.mainIngredient)) score += 12;
  if (weekTargets.premiumMealsMin > state.premiumMeals && getRecipeFaixaCusto(recipe) === 'premium') score += 10;

  score -= (state.recipeCount[recipe.id] ?? 0) * 80;
  score -= (state.familyCount[recipe.family] ?? 0) * 30;
  score -= (state.mainCount[recipe.mainIngredient] ?? 0) * 34;
  score -= sameFamilyToday ? 180 : 0;
  score -= sameIngredientToday ? 150 : 0;
  score -= previousMealRecipe?.id === recipe.id ? 220 : 0;
  score -= previousMealRecipe?.family === recipe.family ? 55 : 0;
  score -= previousDayRecipes.some((item) => item.recipeId === recipe.id) ? 60 : 0;
  score -= previousDayRecipes.some((item) => item.recipeFamily === recipe.family) ? 70 : 0;
  score -= previousDayRecipes.some((item) => item.mainIngredient === recipe.mainIngredient) ? 82 : 0;
  score -= previousDayRecipes.some((item) => getProteinGroup(item.mainIngredient) === getProteinGroup(recipe.mainIngredient) && getProteinGroup(recipe.mainIngredient) !== 'other') ? 26 : 0;

  score += pseudoRandom(recipe.id, (dayIndex + 1) * 41 + meal.charCodeAt(0), seed) * 8;
  return score;
}

function chooseRecipe(
  candidates: Recipe[],
  config: PlannerConfig,
  meal: MealType,
  dayMeals: PlannedDay['meals'],
  previousByMeal: Partial<Record<MealType, Recipe | undefined>>,
  previousDay: PlannedDay | undefined,
  dayIndex: number,
  spendIntent: number,
  seed: number,
  weeklyState: {
    recipeCount: Record<string, number>;
    familyCount: Record<string, number>;
    mainCount: Record<string, number>;
    baseCount: Record<string, number>;
    faixaCount: Record<FaixaCustoSemana, number>;
    lunchStyleCount: Partial<Record<LunchStyle, number>>;
    fishMeals: number;
    premiumMeals: number;
  },
  targets: WeeklyTargets,
  desiredLunchStyle: LunchStyle | undefined
) {
  if (!candidates.length) return undefined;

  const previousDayMeals = previousDay ? (Object.values(previousDay.meals).filter(Boolean) as PlannedMeal[]) : [];

  const strictPool = candidates.filter((recipe) => {
    if ((weeklyState.recipeCount[recipe.id] ?? 0) >= 1) return false;
    if ((weeklyState.familyCount[recipe.family] ?? 0) >= 2) return false;
    if ((weeklyState.mainCount[recipe.mainIngredient] ?? 0) >= getProteinRepeatLimit(recipe.mainIngredient, meal)) return false;
    const sameDayMeals = Object.values(dayMeals).filter(Boolean) as PlannedMeal[];
    if (sameDayMeals.some((item) => item.recipeId === recipe.id)) return false;
    if (sameDayMeals.some((item) => item.recipeFamily === recipe.family)) return false;
    if (sameDayMeals.some((item) => item.mainIngredient === recipe.mainIngredient)) return false;
    if (previousByMeal[meal]?.id === recipe.id) return false;
    if (previousDayMeals.some((item) => item.recipeFamily === recipe.family)) return false;
    if (previousDayMeals.some((item) => item.mainIngredient === recipe.mainIngredient)) return false;
    return true;
  });

  const pool = strictPool.length ? strictPool : candidates.filter((recipe) => previousByMeal[meal]?.id !== recipe.id);

  const scored = pool
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, config, meal, dayMeals, previousByMeal, previousDay, dayIndex, spendIntent, seed, weeklyState, targets, desiredLunchStyle)
    }))
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0]?.score ?? 0;
  const finalists = scored.filter((entry) => entry.score >= bestScore - 4).map((entry) => entry.recipe);
  if (!finalists.length) return scored[0]?.recipe;
  const pickIndex = Math.floor(pseudoRandom(`${meal}-${dayIndex}-${finalists.length}`, dayIndex + 17, seed) * finalists.length);
  return finalists[pickIndex] ?? scored[0]?.recipe;
}

function buildDays(config: PlannerConfig, forceDemoDayOne = false, spendIntent = 0.5, seed = 0) {
  const weeklyState = {
    recipeCount: {} as Record<string, number>,
    familyCount: {} as Record<string, number>,
    mainCount: {} as Record<string, number>,
    baseCount: {} as Record<string, number>,
    faixaCount: { economica: 0, media: 0, premium: 0 } as Record<FaixaCustoSemana, number>,
    lunchStyleCount: {} as Partial<Record<LunchStyle, number>>,
    fishMeals: 0,
    premiumMeals: 0
  };

  const previousByMeal: Partial<Record<MealType, Recipe | undefined>> = {};
  const days: PlannedDay[] = [];
  const sortedMeals = [...config.refeicoes].sort((a, b) => MEAL_ORDER.indexOf(a) - MEAL_ORDER.indexOf(b));
  const lunchStylePlan = sortedMeals.includes('almoco') ? buildLunchStylePlan(config, seed) : [];
  const targets = getWeeklyTargets(config);

  for (let index = 0; index < 7; index += 1) {
    const dayMeals: PlannedDay['meals'] = {};
    const previousDay = days[index - 1];

    for (const meal of sortedMeals) {
      let pool = filterRecipes(config, meal);
      const desiredLunchStyle = meal === 'almoco' ? lunchStylePlan[index] : undefined;

      if (meal === 'almoco' && desiredLunchStyle) {
        const exactStylePool = pool.filter((recipe) => getLunchStyle(recipe) === desiredLunchStyle);
        if (exactStylePool.length >= 2) pool = exactStylePool;
      }

      if (forceDemoDayOne && index === 0) {
        if (meal === 'almoco') pool = pool.filter((recipe) => recipe.id === 'a1');
        if (meal === 'jantar') pool = pool.filter((recipe) => recipe.id === 'j1');
        if (meal === 'cafe') pool = pool.filter((recipe) => recipe.id === 'c8');
      }

      const selected = chooseRecipe(
        pool,
        config,
        meal,
        dayMeals,
        previousByMeal,
        previousDay,
        index,
        spendIntent,
        seed,
        weeklyState,
        targets,
        desiredLunchStyle
      );

      if (!selected) continue;

      weeklyState.recipeCount[selected.id] = (weeklyState.recipeCount[selected.id] ?? 0) + 1;
      weeklyState.familyCount[selected.family] = (weeklyState.familyCount[selected.family] ?? 0) + 1;
      weeklyState.mainCount[selected.mainIngredient] = (weeklyState.mainCount[selected.mainIngredient] ?? 0) + 1;
      weeklyState.baseCount[getBaseType(selected)] = (weeklyState.baseCount[getBaseType(selected)] ?? 0) + 1;
      weeklyState.faixaCount[getRecipeFaixaCusto(selected)] = (weeklyState.faixaCount[getRecipeFaixaCusto(selected)] ?? 0) + 1;
      if (meal === 'almoco') {
        const selectedLunchStyle = getLunchStyle(selected);
        weeklyState.lunchStyleCount[selectedLunchStyle] = (weeklyState.lunchStyleCount[selectedLunchStyle] ?? 0) + 1;
      }
      if (['salmon', 'tilapia', 'shrimp', 'tuna', 'sardine'].includes(selected.mainIngredient)) weeklyState.fishMeals += 1;
      if (getRecipeFaixaCusto(selected) === 'premium') weeklyState.premiumMeals += 1;

      previousByMeal[meal] = selected;
      dayMeals[meal] = buildPlannedMeal(selected, meal, config.numPessoas);
    }

    const totalCost = Object.values(dayMeals).reduce((sum, meal) => sum + (meal?.estimatedCost ?? 0), 0);
    days.push({ day: index + 1, meals: dayMeals, totalCost });
  }

  return days;
}

function groupShoppingList(itemsToBuy: ShoppingListItem[]) {
  return itemsToBuy.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    acc[item.categoria] ??= [];
    acc[item.categoria].push(item);
    return acc;
  }, {});
}

function estimateBudgetWindow(config: PlannerConfig) {
  const minDays = buildDays({ ...config, objetivo: 'economia' }, false, 0.2, 11);
  const exploratoryRuns = [
    buildDays({ ...config, objetivo: 'equilibrio' }, false, 0.96, 29),
    buildDays({ ...config, objetivo: 'equilibrio' }, false, 1.1, 53),
    buildDays({ ...config, objetivo: 'praticidade' }, false, 1.18, 71),
    buildDays({ ...config, objetivo: 'equilibrio' }, false, 1.28, 101)
  ];
  const allRecipes = recipeDb.filter((recipe) => config.refeicoes.includes(recipe.refeicao) && !recipeHasRestrictionConflict(recipe, config));
  const premiumPool = allRecipes.filter((recipe) => recipe.costTier === 'alto' || getRecipeFaixaCusto(recipe) === 'premium');
  const premiumDensity = allRecipes.length ? premiumPool.length / allRecipes.length : 0;
  const premiumFamilies = new Set(premiumPool.map((recipe) => `${recipe.refeicao}:${recipe.family}`)).size;
  const premiumCoverageBoost = Math.min(1.36, 1 + premiumDensity * 0.95 + premiumFamilies * 0.008);
  const minSuggestedSpend = calculateCost(minDays);
  const exploratoryMax = Math.max(...exploratoryRuns.map((days) => calculateCost(days)));
  const maxSuggestedSpend = exploratoryMax * premiumCoverageBoost;
  const cappedBudget = Math.min(config.orcamentoSemanal, maxSuggestedSpend);
  const targetSpend = Math.max(
    minSuggestedSpend,
    Math.min(cappedBudget * getObjectiveSpendRatio(config.objetivo), maxSuggestedSpend)
  );

  return { minSuggestedSpend, maxSuggestedSpend, cappedBudget, targetSpend, premiumDensity, premiumFamilies };
}

function pickSwapCandidate(
  current: PlannedMeal,
  config: PlannerConfig,
  meal: MealType,
  dayMeals: PlannedDay['meals'],
  mode: 'upgrade' | 'downgrade'
) {
  const currentRecipe = getRecipeById(current.recipeId);
  if (!currentRecipe) return undefined;
  const currentCost = current.estimatedCost;

  const candidates = filterRecipes(config, meal)
    .filter((recipe) => recipe.id !== current.recipeId)
    .filter((recipe) => {
      const sameDayMeals = Object.values(dayMeals).filter(Boolean) as PlannedMeal[];
      if (sameDayMeals.some((item) => item.recipeId !== current.recipeId && item.recipeFamily === recipe.family)) return false;
      if (sameDayMeals.some((item) => item.recipeId !== current.recipeId && item.mainIngredient === recipe.mainIngredient)) return false;
      return true;
    })
    .map((recipe) => ({ recipe, cost: mealEstimatedCost(recipe, config.numPessoas) }))
    .filter((entry) => mode === 'upgrade' ? entry.cost > currentCost + 0.25 : entry.cost < currentCost - 0.25)
    .sort((a, b) => mode === 'upgrade' ? a.cost - b.cost : b.cost - a.cost);

  return candidates[0]?.recipe;
}

export function adjustPlanToBudget(days: PlannedDay[], config: PlannerConfig) {
  const budgetInsights = estimateBudgetWindow(config);
  let currentDays = days.map((day) => ({ ...day, meals: { ...day.meals } }));
  let currentCost = calculateCost(currentDays);
  let attempts = 0;

  while (currentCost > budgetInsights.cappedBudget * 1.03 && attempts < 18) {
    currentDays = currentDays.map((day) => {
      const meals = { ...day.meals };
      for (const meal of config.refeicoes) {
        const current = meals[meal];
        if (!current) continue;
        const cheaper = pickSwapCandidate(current, config, meal, meals, 'downgrade');
        if (cheaper) meals[meal] = buildPlannedMeal(cheaper, meal, config.numPessoas);
      }
      return {
        ...day,
        meals,
        totalCost: Object.values(meals).reduce((sum, meal) => sum + (meal?.estimatedCost ?? 0), 0)
      };
    });
    currentCost = calculateCost(currentDays);
    attempts += 1;
  }

  attempts = 0;
  while (currentCost < budgetInsights.targetSpend * 0.9 && attempts < 18) {
    let upgraded = false;
    currentDays = currentDays.map((day) => {
      const meals = { ...day.meals };
      for (const meal of config.refeicoes) {
        const current = meals[meal];
        if (!current) continue;
        const richer = pickSwapCandidate(current, config, meal, meals, 'upgrade');
        if (richer) {
          const nextMeal = buildPlannedMeal(richer, meal, config.numPessoas);
          const hypothetical = currentCost - current.estimatedCost + nextMeal.estimatedCost;
          if (hypothetical <= budgetInsights.cappedBudget * 1.02) {
            meals[meal] = nextMeal;
            currentCost = hypothetical;
            upgraded = true;
          }
        }
      }
      return {
        ...day,
        meals,
        totalCost: Object.values(meals).reduce((sum, meal) => sum + (meal?.estimatedCost ?? 0), 0)
      };
    });
    currentCost = calculateCost(currentDays);
    if (!upgraded) break;
    attempts += 1;
  }

  const warnings: string[] = [];
  if (budgetPerMealPerson(config) < 3.5) warnings.push('Orçamentos muito apertados ainda reduzem a variedade semanal.');
  if (config.orcamentoSemanal > budgetInsights.maxSuggestedSpend * 1.18) warnings.push(`O teto útil atual do MENNU para esse perfil está por volta de ${formatCurrency(budgetInsights.maxSuggestedSpend)} por semana.`);
  if (currentCost > budgetInsights.cappedBudget * 1.08) warnings.push('Seu orçamento está apertado para este conjunto de refeições.');

  return {
    days: currentDays,
    warning: warnings.join(' '),
    budgetInsights
  };
}

export function generatePlan(config: PlannerConfig, options?: { demo?: boolean; seed?: number }): PlanResult {
  const budgetInsights = estimateBudgetWindow(config);
  const spendIntent = getSpendIntent(config, budgetInsights.targetSpend);
  const seed = options?.seed ?? 0;
  const baseDays = buildDays(config, options?.demo ?? false, spendIntent, seed);
  const adjusted = adjustPlanToBudget(baseDays, config);
  const shopping = sumIngredients(adjusted.days, config.numPessoas);
  const totalCost = calculateCost(adjusted.days);
  const selectedMealCount = adjusted.days.reduce((sum, day) => sum + Object.keys(day.meals).length, 0);

  return {
    summary: config,
    days: adjusted.days,
    shoppingList: groupShoppingList(shopping),
    totalCost,
    averageCostPerMeal: selectedMealCount ? totalCost / selectedMealCount : 0,
    warning: adjusted.warning || undefined,
    budgetInsights: adjusted.budgetInsights
  };
}

function recalculatePlan(plan: PlanResult): PlanResult {
  const days = plan.days.map((day) => ({
    ...day,
    totalCost: Object.values(day.meals).reduce((sum, meal) => {
      if (!meal) return sum;
      const recipe = recipeDb.find((item) => item.id === meal.recipeId);
      if (!recipe) return sum;
      meal.estimatedCost = mealEstimatedCost(recipe, plan.summary.numPessoas, meal.variationName);
      return sum + meal.estimatedCost;
    }, 0)
  }));
  const shopping = sumIngredients(days, plan.summary.numPessoas);
  const totalCost = calculateCost(days);
  const selectedMealCount = days.reduce((sum, day) => sum + Object.keys(day.meals).length, 0);
  return {
    ...plan,
    days,
    shoppingList: groupShoppingList(shopping),
    totalCost,
    averageCostPerMeal: selectedMealCount ? totalCost / selectedMealCount : 0
  };
}

export function replaceMealVariation(plan: PlanResult, dayNumber: number, meal: MealType) {
  const nextPlan = {
    ...plan,
    days: plan.days.map((day) => {
      if (day.day !== dayNumber) return day;
      const target = day.meals[meal];
      if (!target) return day;
      const nextIndex = (target.variationIndex + 1) % target.allVariations.length;
      return {
        ...day,
        meals: {
          ...day.meals,
          [meal]: {
            ...target,
            variationIndex: nextIndex,
            variationName: target.allVariations[nextIndex]
          }
        }
      };
    })
  };
  return recalculatePlan(nextPlan);
}

function formatShoppingQuantity(quantity: number, unit: string) {

  const clean = Math.round(quantity * 100) / 100;

  if (unit === "g") {

    if (clean >= 1000) {
      const kg = Math.round((clean / 1000) * 100) / 100;
      return `${kg} kg`;
    }

    return `${Math.round(clean)} g`;
  }

  if (unit === "ml") {

    if (clean >= 1000) {
      const L = Math.round((clean / 1000) * 100) / 100;
      return `${L} L`;
    }

    return `${Math.round(clean)} ml`;
  }

  if (unit === "un") {
    return `${Math.round(clean)} un`;
  }

  return `${clean} ${unit}`;
}

export function exportShoppingListCsv(plan: PlanResult) {
  const rows = ['Categoria,Item,Quantidade,Unidade,Custo'];
  Object.entries(plan.shoppingList).forEach(([category, list]) => {
    list.forEach((item) => {
      rows.push([
  category,
  item.nome,
  formatShoppingQuantity(item.quantidade, item.unidade),
  item.custo.toFixed(2)
].join(';'));
    });
  });
  return rows.join('\n');
}

export function exportShoppingListText(plan: PlanResult) {
  return Object.entries(plan.shoppingList)
    .map(([category, list]) => `${category}\n${list.map((item) => `- ${item.nome}: ${formatShoppingQuantity(item.quantidade, item.unidade)} | R$ ${item.custo.toFixed(2)}`).join('\n')}`)
    .join('\n\n') + `\n\n💰 Total estimado da compra: ${formatCurrency(plan.totalCost)}`;
}

export function getDefaultConfig(): PlannerConfig {
  return {
    numPessoas: 2,
    refeicoes: ['almoco', 'jantar'],
    tempoMax: 20,
    objetivo: 'equilibrio',
    orcamentoSemanal: 80,
    restricoes: []
  };
}

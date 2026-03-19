export type MealType = 'cafe' | 'almoco' | 'jantar';
export type GoalType = 'economia' | 'equilibrio' | 'praticidade';
export type Goal = GoalType;
export type RestrictionType = 'sem lactose' | 'sem carne' | 'sem ovo';
export type Restriction = RestrictionType;
export type CostTier = 'baixo' | 'medio' | 'alto';
export type MealWeight = 'leve' | 'medio' | 'reforcado';

export interface PlannerConfig {
  numPessoas: number;
  refeicoes: MealType[];
  tempoMax: 10 | 20 | 30;
  objetivo: GoalType;
  orcamentoSemanal: number;
  restricoes: RestrictionType[];
}

export interface IngredientRef {
  itemId: string;
  qtyPorPessoa: number;
  unidade: 'kg' | 'g' | 'un' | 'L' | 'ml';
}

export interface Recipe {
  id: string;
  nome: string;
  refeicao: MealType;
  tags: GoalType[];
  tempoMin: number;
  ingredientes: IngredientRef[];
  passos: string[];
  variacoes: string[];
  restricoes: RestrictionType[];
  family: string;
  mainIngredient: string;
  costTier: CostTier;
  mealWeight: MealWeight;
  rendimentoPorcoes: number;
  temperatura: string;
  descansoMin: number;
  dicas: string[];
  utensilios?: string[];
  modoPreparoDetalhado?: string;
  observacaoReceita?: string;
}

export interface PriceItem {
  itemId: string;
  nome: string;
  categoria: string;
  precoPorUnidade: number;
  unidadePadrao: 'kg' | 'g' | 'un' | 'L' | 'ml';
  tamanhoUnidade: number;
}

export interface PlannedMeal {
  recipeId: string;
  recipeName: string;
  recipeFamily: string;
  mainIngredient: string;
  refeicao: MealType;
  variationIndex: number;
  variationName: string;
  allVariations: string[];
  estimatedCost: number;
}

export interface PlannedDay {
  day: number;
  meals: Partial<Record<MealType, PlannedMeal>>;
  totalCost: number;
}

export interface ShoppingListItem {
  itemId: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade: number;
  custo: number;
}

export interface CostBreakdownItem {
  itemId: string;
  nome: string;
  categoria: string;
  quantidadeUsada: number;
  quantidadeUsadaLabel: string;
  custoFracionado: number;
  packageLabel: string;
  packageQuantity: number;
  packageUnit: string;
  packageCost: number;
  packagesNeeded: number;
  initialMarketCost: number;
  rendimentoPorCompra: number;
}

export interface RecipePhotoInfo {
  src: string;
  hint: string;
}

export interface RecipeDetailData {
  recipeId: string;
  recipeName: string;
  mealType: MealType;
  variationName: string;
  peopleCount: number;
  timeMinutes: number;
  serves: number;
  heatLevel: string;
  restMinutes: number;
  mealWeight: MealWeight;
  tips: string[];
  steps: string[];
  utensils: string[];
  ingredients: CostBreakdownItem[];
  fractionedTotal: number;
  initialMarketTotal: number;
  totalYieldFromInitialPurchase: number;
  photo: RecipePhotoInfo;
  introText: string;
  fullMethodText: string;
  narrativeText?: string; // <--- Esta linha é a que garante que o narrativeText exista
}

export interface BudgetInsights {
  minSuggestedSpend: number;
  targetSpend: number;
  maxSuggestedSpend: number;
  cappedBudget: number;
}

export interface PlanResult {
  summary: PlannerConfig;
  days: PlannedDay[];
  shoppingList: Record<string, ShoppingListItem[]>;
  totalCost: number;
  averageCostPerMeal: number;
  warning?: string;
  budgetInsights?: BudgetInsights;
}
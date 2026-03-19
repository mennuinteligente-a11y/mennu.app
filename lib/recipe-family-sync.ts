export const OFFICIAL_FAMILIES = [
  'frutas',
  'bowl',
  'mingau',
  'vitamina',
  'pao',
  'pao_com_ovo',
  'omelete',
  'ovos',
  'sanduiche',
  'tapioca',
  'crepioca',
  'cuscuz',
  'massa',
  'massa_recheada',
  'massa_forno',
  'risoto',
  'arroz',
  'frango',
  'carne',
  'carne_moida',
  'peixe',
  'atum',
  'sardinha',
  'sopa',
  'salada',
  'salada_proteica',
  'salada_reforcada',
  'legumes',
  'prato_unico',
  'prato_leve',
] as const;

export type OfficialFamily = (typeof OFFICIAL_FAMILIES)[number];

const OFFICIAL_FAMILY_SET = new Set<string>(OFFICIAL_FAMILIES);

const FAMILY_ALIASES: Record<string, OfficialFamily> = {
  frutas: 'frutas',
  fruta: 'frutas',
  frutas_frescas: 'frutas',

  bowl: 'bowl',
  bowls: 'bowl',

  mingau: 'mingau',
  mingaus: 'mingau',

  vitamina: 'vitamina',
  vitaminas: 'vitamina',

  pao: 'pao',
  paes: 'pao',
  pao_frances: 'pao',
  pao_de_forma: 'pao',

  pao_com_ovo: 'pao_com_ovo',
  pao_com_ovos: 'pao_com_ovo',

  omelete: 'omelete',
  omeletes: 'omelete',

  ovo: 'ovos',
  ovos: 'ovos',
  ovos_mexidos: 'ovos',
  ovos_cozidos: 'ovos',
  ovo_cozido: 'ovos',

  sanduiche: 'sanduiche',
  sanduiches: 'sanduiche',
  sanduiche_natural: 'sanduiche',
  sanduiche_quente: 'sanduiche',

  tapioca: 'tapioca',
  tapiocas: 'tapioca',

  crepioca: 'crepioca',
  crepiocas: 'crepioca',

  cuscuz: 'cuscuz',
  cuscuz_milho: 'cuscuz',

  massa: 'massa',
  massas: 'massa',
  macarrao: 'massa',
  espaguete: 'massa',
  spaghetti: 'massa',
  penne: 'massa',
  fusilli: 'massa',
  panqueca: 'massa',
  panquecas: 'massa',
  massa_frango: 'massa',

  massa_recheada: 'massa_recheada',
  ravioli: 'massa_recheada',
  capeletti: 'massa_recheada',
  capelete: 'massa_recheada',
  tortellini: 'massa_recheada',

  massa_forno: 'massa_forno',
  lasanha: 'massa_forno',
  nhoque_ao_forno: 'massa_forno',

  risoto: 'risoto',

  arroz: 'arroz',
  arrozes: 'arroz',

  frango: 'frango',
  frangos: 'frango',

  carne: 'carne',
  carnes: 'carne',
  carne_bovina: 'carne',

  carne_moida: 'carne_moida',
  carne_moida_bovina: 'carne_moida',

  peixe: 'peixe',
  peixes: 'peixe',
  tilapia: 'peixe',
  salmao: 'peixe',

  atum: 'atum',
  sardinha: 'sardinha',

  sopa: 'sopa',
  sopas: 'sopa',
  caldo: 'sopa',
  caldos: 'sopa',

  salada: 'salada',
  saladas: 'salada',

  salada_proteica: 'salada_proteica',
  salada_com_proteina: 'salada_proteica',

  salada_reforcada: 'salada_reforcada',
  salada_proteica_reforcada: 'salada_reforcada',

  legumes: 'legumes',
  legume: 'legumes',
  legumes_refogados: 'legumes',

  prato_unico: 'prato_unico',
  refeicao_completa: 'prato_unico',
  prato_principal: 'prato_unico',

  prato_leve: 'prato_leve',
  prato_leve_fit: 'prato_leve',
};

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugifyFamily(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function isOfficialFamily(value?: string | null): value is OfficialFamily {
  if (!value) return false;
  return OFFICIAL_FAMILY_SET.has(value);
}

export function normalizeFamily(value?: string | null): OfficialFamily | undefined {
  if (!value) return undefined;

  const normalized = slugifyFamily(value);
  if (!normalized) return undefined;

  if (FAMILY_ALIASES[normalized]) {
    return FAMILY_ALIASES[normalized];
  }

  if (isOfficialFamily(normalized)) {
    return normalized;
  }

  return undefined;
}

export function resolveFamilyFromText(
  recipeFamily?: string | null,
  recipeName?: string | null
): OfficialFamily | undefined {
  const direct = normalizeFamily(recipeFamily);
  if (direct) return direct;

  const name = slugifyFamily(recipeName ?? '');
  if (!name) return undefined;

  if (FAMILY_ALIASES[name]) {
    return FAMILY_ALIASES[name];
  }

  if (isOfficialFamily(name)) {
    return name;
  }

  if (name.includes('sanduich')) return 'sanduiche';
  if (name.includes('omelet')) return 'omelete';
  if (name.includes('ovo')) return 'ovos';
  if (name.includes('tapioc')) return 'tapioca';
  if (name.includes('crepioc')) return 'crepioca';
  if (name.includes('cuscuz')) return 'cuscuz';
  if (name.includes('mingau')) return 'mingau';
  if (name.includes('vitamina')) return 'vitamina';
  if (name.includes('bowl')) return 'bowl';
  if (name.includes('fruta')) return 'frutas';

  if (
    name.includes('ravioli') ||
    name.includes('capeletti') ||
    name.includes('capelete') ||
    name.includes('tortellini')
  ) {
    return 'massa_recheada';
  }

  if (
    name.includes('lasanha') ||
    name.includes('forno') ||
    name.includes('gratinad')
  ) {
    return 'massa_forno';
  }

  if (
    name.includes('macarrao') ||
    name.includes('massa') ||
    name.includes('espaguete') ||
    name.includes('spaghetti') ||
    name.includes('penne') ||
    name.includes('fusilli') ||
    name.includes('panqueca')
  ) {
    return 'massa';
  }

  if (name.includes('risoto')) return 'risoto';
  if (name.includes('arroz')) return 'arroz';
  if (name.includes('frango')) return 'frango';

  if (name.includes('carne_moida') || name.includes('moida')) {
    return 'carne_moida';
  }

  if (name.includes('carne')) return 'carne';

  if (name.includes('atum')) return 'atum';
  if (name.includes('sardinha')) return 'sardinha';

  if (
    name.includes('peixe') ||
    name.includes('tilapia') ||
    name.includes('salmao')
  ) {
    return 'peixe';
  }

  if (name.includes('sopa') || name.includes('caldo')) return 'sopa';

  if (name.includes('salada')) {
    if (name.includes('prote')) return 'salada_proteica';
    if (name.includes('reforc')) return 'salada_reforcada';
    return 'salada';
  }

  if (name.includes('legume')) return 'legumes';
  if (name.includes('leve')) return 'prato_leve';

  return undefined;
}

export function getFamilyImagePath(family?: string | null): string {
  const normalized = normalizeFamily(family);
  return `/recipes/families/${normalized ?? 'prato_unico'}.webp`;
}

export function syncRecipeFamily<T extends { familia?: string | null; nome?: string | null }>(
  recipe: T
): T & { familia: OfficialFamily } {
  const resolvedFamily =
    resolveFamilyFromText(recipe.familia, recipe.nome) ?? 'prato_unico';

  return {
    ...recipe,
    familia: resolvedFamily,
  };
}

export function syncRecipeFamilies<T extends { familia?: string | null; nome?: string | null }>(
  recipes: T[]
): Array<T & { familia: OfficialFamily }> {
  return recipes.map(syncRecipeFamily);
}
import fs from 'node:fs'
import path from 'node:path'

const OFFICIAL_RECIPE_FAMILIES = [
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
]

const OFFICIAL_FAMILY_SET = new Set(OFFICIAL_RECIPE_FAMILIES)

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function slugifyFamily(value) {
  return normalizeText(value)
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/__+/g, '_')
}

const FAMILY_ALIASES = {
  frutas: 'frutas',
  fruta: 'frutas',

  bowl: 'bowl',
  bowls: 'bowl',

  mingau: 'mingau',
  vitamina: 'vitamina',
  bebidas: 'vitamina',
  bebida: 'vitamina',

  pao: 'pao',
  paes: 'pao',
  torrada: 'pao',
  torradas: 'pao',
  combo: 'pao',

  pao_com_ovo: 'pao_com_ovo',
  raiz_com_ovo: 'ovos',

  omelete: 'omelete',
  omelete_reforcado: 'omelete',
  omelete_reforcada: 'omelete',

  ovos: 'ovos',
  ovo: 'ovos',

  sanduiche: 'sanduiche',
  sanduiches: 'sanduiche',
  sandwich: 'sanduiche',

  tapioca: 'tapioca',
  crepioca: 'crepioca',
  cuscuz: 'cuscuz',

  massa: 'massa',
  massas: 'massa',
  massa_tomate: 'massa',
  massa_alho: 'massa',
  massa_queijo: 'massa',
  massa_frango: 'massa',
  panqueca: 'massa',
  panqueca: 'massa',
  panquecas: 'massa',

  massa_recheada: 'massa_recheada',
  massa_forno: 'massa_forno',

  risoto: 'risoto',

  arroz: 'arroz',
  arroz_legumes: 'arroz',
  tradicional: 'arroz',

  frango: 'frango',
  frango_abobora: 'frango',
  frango_legumes: 'frango',
  frango_cremoso: 'frango',

  carne: 'carne',
  carne_moida: 'carne_moida',

  peixe: 'peixe',
  frutos_do_mar: 'peixe',
  arroz_peixe: 'peixe',

  atum: 'atum',
  sardinha: 'sardinha',

  sopa: 'sopa',
  creme: 'sopa',

  salada: 'salada',
  salada_proteica: 'salada_proteica',
  salada_reforcada: 'salada_reforcada',

  legumes: 'legumes',

  prato_unico: 'prato_unico',
  arroz_proteico: 'prato_unico',
  graos: 'prato_unico',
  leguminosas: 'prato_unico',
  assado: 'prato_unico',
  gratinado: 'prato_unico',
  forno: 'prato_unico',
  torta: 'prato_unico',
  pure: 'prato_unico',
  polenta: 'prato_unico',

  prato_leve: 'prato_leve',
}

function normalizeRecipeFamily(input) {
  const raw = slugifyFamily(input)
  if (!raw) return 'prato_unico'
  if (OFFICIAL_FAMILY_SET.has(raw)) return raw
  return FAMILY_ALIASES[raw] ?? 'prato_unico'
}

function buildFamilyImagePath(family, variation) {
  const normalized = normalizeRecipeFamily(family)
  if (variation && variation >= 1 && variation <= 4) {
    return `/recipes/families/${normalized}_${variation}.webp`
  }
  return `/recipes/families/${normalized}.webp`
}

function run() {
  const projectRoot = process.cwd()
  const inputPath = path.join(projectRoot, 'data', 'recipes.json')
  const outputPath = path.join(projectRoot, 'data', 'recipes.families.synced.json')

  if (!fs.existsSync(inputPath)) {
    console.error(`Arquivo não encontrado: ${inputPath}`)
    process.exit(1)
  }

  const recipes = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  if (!Array.isArray(recipes)) {
    console.error('Esperado um array JSON em data/recipes.json')
    process.exit(1)
  }

  let changed = 0

  const synced = recipes.map((recipe) => {
    const oldFamily = recipe.family
    const family = normalizeRecipeFamily(oldFamily)
    const imageUrl = buildFamilyImagePath(family)

    if (oldFamily !== family || recipe.imageUrl !== imageUrl || recipe.imagem !== imageUrl) {
      changed += 1
    }

    return {
      ...recipe,
      family,
      imageUrl,
      imagem: imageUrl,
    }
  })

  fs.writeFileSync(outputPath, JSON.stringify(synced, null, 2), 'utf8')

  console.log(`Receitas processadas: ${synced.length}`)
  console.log(`Receitas alteradas: ${changed}`)
  console.log(`Arquivo gerado: ${outputPath}`)
}

run()
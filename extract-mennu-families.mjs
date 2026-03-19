#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function printHelp() {
  console.log(`
Extrator de famílias do MENNU

Uso:
  node extract-mennu-families.mjs [arquivo_entrada] [arquivo_saida]

Exemplos:
  node extract-mennu-families.mjs
  node extract-mennu-families.mjs ./data/recipes.json
  node extract-mennu-families.mjs ./data/recipes.json ./data/recipe-families.json

Comportamento padrão:
  entrada: ./data/recipes.json
  saída principal: ./data/recipe-families.json
  saída detalhada: ./data/recipe-families-report.json
`);
}

function normalizeFamily(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\s+/g, "_").toLowerCase();
  return cleaned || null;
}

function collectRecipes(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.receitas)) return payload.receitas;
  if (payload && Array.isArray(payload.recipes)) return payload.recipes;
  throw new Error(
    "Formato inválido: o JSON precisa ser um array ou conter 'receitas'/'recipes'."
  );
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const inputPath = path.resolve(args[0] || "./data/recipes.json");
  const outputPath = path.resolve(args[1] || "./data/recipe-families.json");
  const reportPath = path.resolve(
    path.join(path.dirname(outputPath), "recipe-families-report.json")
  );

  const raw = await fs.readFile(inputPath, "utf8");
  const payload = JSON.parse(raw);
  const recipes = collectRecipes(payload);

  const familyMap = new Map();
  const missingFamily = [];

  for (const recipe of recipes) {
    const family = normalizeFamily(recipe?.family ?? recipe?.familia);

    if (!family) {
      missingFamily.push({
        nome: recipe?.nome ?? recipe?.name ?? "(sem nome)",
        categoria: recipe?.categoria ?? recipe?.category ?? null,
      });
      continue;
    }

    if (!familyMap.has(family)) {
      familyMap.set(family, {
        family,
        totalReceitas: 0,
        exemplos: [],
        categorias: new Set(),
      });
    }

    const entry = familyMap.get(family);
    entry.totalReceitas += 1;

    const recipeName = recipe?.nome ?? recipe?.name;
    if (recipeName && entry.exemplos.length < 5) {
      entry.exemplos.push(recipeName);
    }

    const categoria = recipe?.categoria ?? recipe?.category;
    if (categoria) {
      entry.categorias.add(String(categoria));
    }
  }

  const familiesDetailed = [...familyMap.values()]
    .map((entry) => ({
      family: entry.family,
      totalReceitas: entry.totalReceitas,
      categorias: [...entry.categorias].sort(),
      exemplos: entry.exemplos,
      suggestedFile: `${entry.family}.webp`,
      suggestedPublicPath: `/recipes/families/${entry.family}.webp`,
    }))
    .sort((a, b) => a.family.localeCompare(b.family, "pt-BR"));

  const familiesSimple = familiesDetailed.map((item) => item.family);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(familiesSimple, null, 2) + "\n", "utf8");
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        totalReceitasLidas: recipes.length,
        totalFamiliasUnicas: familiesSimple.length,
        familiasSemImagem: familiesDetailed,
        receitasSemFamily: missingFamily,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log("Famílias extraídas com sucesso.");
  console.log(`Entrada: ${inputPath}`);
  console.log(`Saída principal: ${outputPath}`);
  console.log(`Relatório detalhado: ${reportPath}`);
  console.log(`Receitas lidas: ${recipes.length}`);
  console.log(`Famílias únicas: ${familiesSimple.length}`);

  if (missingFamily.length > 0) {
    console.log(`Receitas sem family/familia: ${missingFamily.length}`);
  }
}

main().catch((error) => {
  console.error("Erro ao extrair famílias do MENNU:");
  console.error(error?.message || error);
  process.exit(1);
});

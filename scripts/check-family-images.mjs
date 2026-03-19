import fs from 'node:fs'
import path from 'node:path'

const families = [
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

const baseDir = path.join(process.cwd(), 'public', 'recipes', 'families')

console.log(`Verificando pasta: ${baseDir}\n`)

let missing = []

for (const family of families) {
  const filePath = path.join(baseDir, `${family}.webp`)
  if (!fs.existsSync(filePath)) {
    missing.push(`${family}.webp`)
  }
}

if (missing.length === 0) {
  console.log('Todas as imagens base existem.')
} else {
  console.log('Imagens faltando:\n')
  for (const file of missing) {
    console.log(`- ${file}`)
  }
}
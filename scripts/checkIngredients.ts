import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const INGREDIENTS_DIR = path.resolve(PROJECT_ROOT, 'public/ingredients')
const INGREDIENTES_MD_PATH = path.resolve(PROJECT_ROOT, 'ingredientes.md')
const MANIFEST_PATH = path.resolve(
  PROJECT_ROOT,
  'src/data/ingredientManifest.ts',
)

interface RequiredIngredient {
  slug: string
  recipeCount: number
}

function readAvailableSlugs(): string[] {
  const files = readdirSync(INGREDIENTS_DIR)
  return files
    .filter((file) => file.toLowerCase().endsWith('.webp'))
    .map((file) => file.slice(0, -'.webp'.length))
    .sort()
}

/** Parsea las filas de la tabla `| ... | ... | \`slug\` | n | ... |` que
 * escribe scripts/listIngredients.ts. */
function readRequiredIngredients(): RequiredIngredient[] {
  let markdown: string
  try {
    markdown = readFileSync(INGREDIENTES_MD_PATH, 'utf-8')
  } catch {
    throw new Error(
      `No se ha encontrado ${INGREDIENTES_MD_PATH}.\n` +
        'Ejecuta primero "npm run list:ingredients" para generarlo.',
    )
  }

  const rowPattern =
    /^\|.*\|.*\| `([a-z0-9-]+)` \| (\d+) \| `public\/ingredients\/[a-z0-9-]+\.webp` \|$/gm

  const rows: RequiredIngredient[] = []
  for (const match of markdown.matchAll(rowPattern)) {
    rows.push({ slug: match[1], recipeCount: Number(match[2]) })
  }
  return rows
}

function writeManifest(slugs: string[]): void {
  const lines = [
    '/**',
    ' * Slugs con imagen propia disponible en public/ingredients/{slug}.webp.',
    ' *',
    ' * Generado por `npm run check:ingredients` a partir de los archivos',
    ' * realmente presentes en public/ingredients/ — no lo edites a mano, se',
    ' * sobrescribe en cada ejecución. Mientras no se suban fotos propias, esta',
    ' * lista está vacía y `getIngredientImage` cae a los siguientes pasos de',
    ' * resolución (imagen de TheMealDB o placeholder).',
    ' */',
    `export const INGREDIENT_IMAGE_SLUGS: readonly string[] = [${slugs
      .map((slug) => `\n  '${slug}',`)
      .join('')}${slugs.length > 0 ? '\n' : ''}]`,
    '',
  ]
  writeFileSync(MANIFEST_PATH, lines.join('\n'), 'utf-8')
}

function checkIngredients(): void {
  const available = readAvailableSlugs()
  const availableSet = new Set(available)
  writeManifest(available)

  const required = readRequiredIngredients()
  const missing = required.filter((row) => !availableSet.has(row.slug))

  console.log(
    `Imágenes propias encontradas en public/ingredients/: ${available.length}`,
  )
  console.log(
    `Manifiesto regenerado en src/data/ingredientManifest.ts (${available.length} slugs).`,
  )
  console.log(
    `\nIngredientes requeridos (según ingredientes.md): ${required.length}`,
  )
  console.log(`  Con foto propia: ${required.length - missing.length}`)
  console.log(`  Sin foto propia: ${missing.length}`)

  if (missing.length > 0) {
    console.log('\nFaltan (ordenados por nº de recetas, de más a menos):')
    for (const row of missing) {
      console.log(`  - ${row.slug}.webp  (${row.recipeCount} recetas)`)
    }
  }
}

checkIngredients()

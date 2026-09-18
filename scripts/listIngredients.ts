import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  '../serviceAccountKey.json',
)
const OUTPUT_PATH = path.resolve(__dirname, '../ingredientes.md')

function loadServiceAccount(): object {
  try {
    const raw = readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
    return JSON.parse(raw) as object
  } catch {
    throw new Error(
      `No se ha encontrado el archivo de credenciales en:\n  ${SERVICE_ACCOUNT_PATH}\n\n` +
        'Genera una clave de cuenta de servicio en Firebase Console > Configuración del ' +
        'proyecto > Cuentas de servicio > Generar nueva clave privada, y guarda el JSON ' +
        'descargado como "serviceAccountKey.json" en la raíz del proyecto.',
    )
  }
}

// --- Normalización de nombres de ingrediente -------------------------------
//
// NOTA: esta lógica se duplica (a propósito, como scripts/seedRecipes.ts) en
// src/utils/ingredientSlug.ts para que el resolutor de imágenes en tiempo de
// ejecución calcule el mismo slug sin que un script de Node dependa del
// proyecto de TypeScript de src/ (tsconfig.node.json no lo incluye). Si se
// cambia una, hay que cambiar la otra.

const ACCENTED_CHARS: Record<string, string> = {
  á: 'a',
  à: 'a',
  ä: 'a',
  â: 'a',
  é: 'e',
  è: 'e',
  ë: 'e',
  ê: 'e',
  í: 'i',
  ì: 'i',
  ï: 'i',
  î: 'i',
  ó: 'o',
  ò: 'o',
  ö: 'o',
  ô: 'o',
  ú: 'u',
  ù: 'u',
  ü: 'u',
  û: 'u',
}

function stripAccents(text: string): string {
  return text.replace(/[áàäâéèëêíìïîóòöôúùüû]/g, (char) => ACCENTED_CHARS[char] ?? char)
}

const UNIT_WORDS = [
  'kilogramos', 'kilogramo', 'kilos', 'kilo', 'kg',
  'gramos', 'gramo', 'grs', 'gr', 'g',
  'litros', 'litro', 'l',
  'mililitros', 'mililitro', 'ml',
  'cucharadas', 'cucharada', 'cucharaditas', 'cucharadita',
  'tazas', 'taza', 'vasos', 'vaso',
  'pizcas', 'pizca', 'puñados', 'puñado',
  'dientes', 'diente', 'unidades', 'unidad',
  'rebanadas', 'rebanada', 'rodajas', 'rodaja',
  'latas', 'lata', 'sobres', 'sobre',
  'hojas', 'hoja', 'ramitas', 'ramita',
  'piezas', 'pieza', 'chorritos', 'chorrito',
  'al gusto', 'cc', 'oz', 'lb', 'lbs',
]

const UNIT_PATTERN = new RegExp(`\\b(${UNIT_WORDS.join('|')})\\b`, 'g')

/** Singularización simple para plurales regulares del español. No es
 * lingüísticamente exhaustiva (casos como "panes" -> "pane" en vez de "pan"
 * quedan mal), pero cubre la inmensa mayoría de ingredientes de cocina. */
function singularize(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('ces')) return `${word.slice(0, -3)}z`
  if (word.endsWith('ones') && word.length > 5) return word.slice(0, -2)
  if (word.endsWith('s') && 'aeiou'.includes(word[word.length - 2])) {
    return word.slice(0, -1)
  }
  return word
}

/**
 * Normaliza un nombre de ingrediente tal y como llega de Firestore:
 * minúsculas, sin tildes, sin contenido entre paréntesis ni tras comas,
 * sin cantidades/unidades sueltas, y con plurales simples pasados a
 * singular. Ej: "Aceite de Oliva Virgen Extra (opcional)" -> "aceite de
 * oliva virgen extra".
 */
export function normalizeIngredientName(rawName: string): string {
  let text = stripAccents(rawName.toLowerCase().trim())
  text = text.replace(/\([^)]*\)/g, ' ')
  text = text.split(',')[0]
  text = text.replace(/^[\d½¼¾⅓⅔.,/\s-]+/, '')
  text = text.replace(UNIT_PATTERN, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  // Quita la preposición que queda colgando al principio tras retirar una
  // unidad de cantidad, p. ej. "dientes de ajo" -> " de ajo" -> "ajo".
  while (/^(de|del|de la|de los|de las)\s+/.test(text)) {
    text = text.replace(/^(de|del|de la|de los|de las)\s+/, '')
  }
  text = text
    .split(' ')
    .map((word) => singularize(word))
    .join(' ')
  return text
}

export function slugify(normalized: string): string {
  return normalized
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// --- Lectura de ingredientes desde Firestore --------------------------------

interface RawIngredientMention {
  originalName: string
}

/** `standardRecipes` guarda el documento crudo de TheMealDB, ya con los
 * nombres de ingrediente traducidos al español en el JSON semilla (ver
 * scripts/data/recetas-internacionales.json), como strIngredient1..20. */
function ingredientsFromStandardRecipe(
  meal: Record<string, unknown>,
): RawIngredientMention[] {
  const mentions: RawIngredientMention[] = []
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]
    if (typeof name === 'string' && name.trim()) {
      mentions.push({ originalName: name.trim() })
    }
  }
  return mentions
}

interface StoredIngredient {
  name?: unknown
}

/** `recipes` (recetas de usuario, propias o guardadas de TheMealDB) guarda
 * `ingredients: Ingredient[]` y, si ya se tradujo, `translation.ingredients`
 * con la versión en español: se usa esta última cuando existe, igual que
 * hace la vista de detalle (ver src/pages/RecipeDetailPage.tsx). */
function ingredientsFromUserRecipe(
  data: Record<string, unknown>,
): RawIngredientMention[] {
  const translation = data.translation as { ingredients?: unknown } | undefined
  const list = (
    Array.isArray(translation?.ingredients)
      ? translation.ingredients
      : Array.isArray(data.ingredients)
        ? data.ingredients
        : []
  ) as StoredIngredient[]

  return list
    .filter((ing) => typeof ing.name === 'string' && ing.name.trim())
    .map((ing) => ({ originalName: (ing.name as string).trim() }))
}

interface IngredientStats {
  slug: string
  normalizedName: string
  recipeCount: number
  originalNameCounts: Map<string, number>
}

async function listIngredients() {
  initializeApp({ credential: cert(loadServiceAccount()) })
  const db = getFirestore()

  const stats = new Map<string, IngredientStats>()

  function recordRecipe(mentions: RawIngredientMention[]) {
    // Cuenta "nº de recetas" (no ocurrencias): un ingrediente repetido dos
    // veces en la misma receta solo suma 1.
    const seenInThisRecipe = new Set<string>()
    for (const { originalName } of mentions) {
      const normalizedName = normalizeIngredientName(originalName)
      if (!normalizedName) continue
      const slug = slugify(normalizedName)
      if (!slug) continue

      let entry = stats.get(slug)
      if (!entry) {
        entry = {
          slug,
          normalizedName,
          recipeCount: 0,
          originalNameCounts: new Map(),
        }
        stats.set(slug, entry)
      }
      entry.originalNameCounts.set(
        originalName,
        (entry.originalNameCounts.get(originalName) ?? 0) + 1,
      )
      if (!seenInThisRecipe.has(slug)) {
        seenInThisRecipe.add(slug)
        entry.recipeCount += 1
      }
    }
  }

  const standardSnap = await db.collection('standardRecipes').get()
  console.log(`Leídas ${standardSnap.size} recetas de standardRecipes.`)
  for (const doc of standardSnap.docs) {
    recordRecipe(ingredientsFromStandardRecipe(doc.data()))
  }

  const userSnap = await db.collection('recipes').get()
  console.log(`Leídas ${userSnap.size} recetas de usuarios.`)
  for (const doc of userSnap.docs) {
    recordRecipe(ingredientsFromUserRecipe(doc.data()))
  }

  const rows = [...stats.values()].sort((a, b) => b.recipeCount - a.recipeCount)

  const lines: string[] = []
  lines.push('# Ingredientes')
  lines.push('')
  lines.push(
    `Generado por \`npm run list:ingredients\` a partir de ${standardSnap.size} recetas ` +
      `del catálogo y ${userSnap.size} recetas de usuarios. ${rows.length} ingredientes únicos.`,
  )
  lines.push('')
  lines.push(
    '| Nombre original | Nombre normalizado | Slug | Nº recetas | Archivo esperado |',
  )
  lines.push('| --- | --- | --- | --- | --- |')

  for (const row of rows) {
    const mostCommonOriginal = [...row.originalNameCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0][0]
    lines.push(
      `| ${mostCommonOriginal} | ${row.normalizedName} | \`${row.slug}\` | ${row.recipeCount} | \`public/ingredients/${row.slug}.webp\` |`,
    )
  }

  writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`, 'utf-8')
  console.log(`\nEscritas ${rows.length} filas en ${OUTPUT_PATH}`)
}

listIngredients().catch((error) => {
  console.error('\nError al listar ingredientes:', error.message ?? error)
  process.exitCode = 1
})

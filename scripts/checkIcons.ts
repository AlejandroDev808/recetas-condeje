import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  '../serviceAccountKey.json',
)

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

// --- Normalización y match de icono -----------------------------------
//
// Duplicado a propósito (igual que normalizeIngredientName/slugify en
// listIngredients.ts) de src/utils/ingredientSlug.ts y
// src/data/ingredientIcons.ts: un script de Node fuera del proyecto de
// TypeScript de src/ (tsconfig.node.json no lo incluye, y no comparte el
// alias "@/*" de tsconfig.app.json) no puede importarlos directamente sin
// arrastrar errores de resolución de módulos. Si se cambia el
// EXACT_ICONS/CATEGORY_RULES de src/data/ingredientIcons.ts, hay que
// reflejarlo aquí para que este chequeo siga siendo fiel a lo que ve la app.

const ACCENTED_CHARS: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
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

function singularize(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('ces')) return `${word.slice(0, -3)}z`
  if (word.endsWith('ones') && word.length > 5) return word.slice(0, -2)
  if (word.endsWith('s') && 'aeiou'.includes(word[word.length - 2])) {
    return word.slice(0, -1)
  }
  return word
}

function normalizeIngredientName(rawName: string): string {
  let text = stripAccents(rawName.toLowerCase().trim())
  text = text.replace(/\([^)]*\)/g, ' ')
  text = text.split(',')[0]
  text = text.replace(/^[\d½¼¾⅓⅔.,/\s-]+/, '')
  text = text.replace(UNIT_PATTERN, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  while (/^(de|del|de la|de los|de las)\s+/.test(text)) {
    text = text.replace(/^(de|del|de la|de los|de las)\s+/, '')
  }
  return text
    .split(' ')
    .map((word) => singularize(word))
    .join(' ')
}

function slugify(normalized: string): string {
  return normalized
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Solo hace falta saber si el ingrediente tiene icono específico o cae en
// el neutro: basta con el conjunto de slugs de EXACT_ICONS y las palabras
// clave de CATEGORY_RULES (ver src/data/ingredientIcons.ts), sin necesidad
// de replicar qué emoji/categoría concretos les corresponde.
const EXACT_ICON_SLUGS = new Set([
  'huevo', 'mantequilla', 'queso-crema', 'queso', 'leche', 'nata', 'yogur',
  'pollo', 'pechuga-de-pollo', 'caldo-de-pollo', 'caldo', 'ternera', 'cerdo',
  'bacon', 'jamon',
  'pescado', 'atun', 'salmon', 'gamba', 'marisco',
  'harina', 'pan-rallado', 'pan', 'arroz', 'pasta', 'fideos', 'avena',
  'aceite-de-oliva', 'aceite-para-freir', 'aceituna', 'vinagre', 'sal',
  'pimienta', 'azucar', 'miel',
  'palta', 'cebolleta', 'cebollino',
  'tomate', 'cebolla', 'ajo', 'patata', 'zanahoria', 'pimiento', 'lechuga',
  'espinaca', 'champinon', 'maiz', 'aguacate', 'calabacin', 'pepino',
  'brocoli', 'guisante',
  'lima', 'limon', 'naranja', 'manzana', 'platano', 'fresa', 'uva',
  'chocolate', 'vainilla', 'canela', 'perejil', 'albahaca', 'oregano',
  'cilantro', 'laurel',
  'vino', 'cerveza', 'agua', 'mostaza', 'mayonesa', 'salsa-de-soja',
  'tomate-frito', 'garbanzo', 'lenteja', 'alubia', 'almendra', 'nuez',
])

const CATEGORY_KEYWORDS = [
  'pollo', 'pavo', 'carne', 'cerdo', 'ternera', 'cordero', 'chorizo',
  'salchicha', 'panceta', 'solomillo', 'filete', 'costilla', 'morcilla',
  'conejo', 'jamon', 'bacon', 'pato', 'asado', 'manteca',
  'pescado', 'atun', 'salmon', 'bacalao', 'merluza', 'trucha', 'sardina',
  'anchoa', 'boqueron', 'lubina', 'dorada',
  'marisco', 'gamba', 'langostino', 'mejillon', 'calamar', 'pulpo',
  'vieira', 'cangrejo', 'almeja', 'camaron',
  'queso', 'leche', 'nata', 'yogur', 'mantequilla', 'crema', 'requeson',
  'mascarpone', 'ricotta', 'lacteo', 'huevo', 'mozzarella',
  'tomate', 'tomatillo', 'cebolla', 'ceboll', 'ajo', 'patata', 'zanahoria',
  'pimiento', 'lechuga', 'espinaca', 'champinon', 'seta', 'calabacin',
  'pepino', 'pepinillo', 'brocoli', 'coliflor', 'apio', 'puerro',
  'remolacha', 'rabano', 'alcachofa', 'berenjena', 'calabaza', 'maiz',
  'guisante', 'verdura', 'hortaliza', 'aceituna', 'col', 'hinojo',
  'chalota', 'yuca', 'camote', 'garlic',
  'limon', 'lima', 'naranja', 'manzana', 'platano', 'fresa', 'uva', 'pera',
  'melocoton', 'sandia', 'melon', 'kiwi', 'mango', 'piña', 'cereza',
  'ciruela', 'arandano', 'frambuesa', 'mora', 'fruta', 'coco', 'papaya',
  'pasa', 'granada',
  'perejil', 'albahaca', 'oregano', 'cilantro', 'laurel', 'tomillo',
  'romero', 'menta', 'hierbabuena', 'eneldo', 'hierba', 'canela',
  'sal', 'pimienta', 'comino', 'pimenton', 'curry', 'nuez moscada',
  'cardamomo', 'clavo', 'azafran', 'jengibre', 'curcuma', 'vainilla',
  'especia',
  'chile', 'chili', 'aji', 'guindilla', 'jalapeno', 'habanero', 'guajillo',
  'pasilla', 'mulato', 'chipotle', 'gochugaru',
  'harina', 'pan', 'arroz', 'pasta', 'fideo', 'avena', 'trigo', 'cebada',
  'centeno', 'quinoa', 'cuscus', 'cereal', 'sesamo', 'maicena', 'semola',
  'bulgur', 'espagueti', 'lasaña', 'masa', 'levadura', 'bicarbonato',
  'garbanzo', 'lenteja', 'alubia', 'judia', 'frijol', 'soja', 'haba',
  'legumbre', 'almendra', 'nuez', 'avellana', 'pistacho', 'anacardo',
  'cacahuete', 'tofu', 'garrofon',
  'agua', 'vino', 'cerveza', 'zumo', 'refresco', 'licor', 'ron', 'whisky',
  'vinagre', 'aceite', 'liquido', 'caldo', 'mirin', 'sake', 'cafe',
  'salsa', 'mostaza', 'mayonesa', 'ketchup', 'alioli', 'vinagreta',
  'conserva', 'bechamel', 'tahini', 'encurtido', 'chimichurri', 'tzatziki',
  'coulis', 'gochujang',
  'azucar', 'miel', 'chocolate', 'caramelo', 'mermelada', 'dulce',
  'gelatina', 'cacao', 'bizcocho',
]

/** true si src/data/ingredientIcons.ts le asignaría el icono neutro 🍽️. */
function hasNoSpecificIcon(rawName: string): boolean {
  const normalized = normalizeIngredientName(rawName)
  const slug = slugify(normalized)
  if (EXACT_ICON_SLUGS.has(slug)) return false
  return !CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

// --- Lectura de ingredientes desde Firestore ---------------------------

/** `standardRecipes` guarda el documento crudo de TheMealDB (ya traducido
 * al español en el JSON semilla) como strIngredient1..20. */
function ingredientsFromStandardRecipe(meal: Record<string, unknown>): string[] {
  const names: string[] = []
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]
    if (typeof name === 'string' && name.trim()) names.push(name.trim())
  }
  return names
}

/** `recipes` guarda `ingredients: Ingredient[]` y, si ya se tradujo,
 * `translation.ingredients` en español — se usa esta última cuando existe,
 * igual que la vista de detalle (ver src/pages/RecipeDetailPage.tsx). */
function ingredientsFromUserRecipe(data: Record<string, unknown>): string[] {
  const translation = data.translation as { ingredients?: unknown } | undefined
  const list = (
    Array.isArray(translation?.ingredients)
      ? translation.ingredients
      : Array.isArray(data.ingredients)
        ? data.ingredients
        : []
  ) as { name?: unknown }[]

  return list
    .filter((ing) => typeof ing.name === 'string' && ing.name.trim())
    .map((ing) => (ing.name as string).trim())
}

async function checkIcons() {
  initializeApp({ credential: cert(loadServiceAccount()) })
  const db = getFirestore()

  const counts = new Map<string, number>()

  function recordRecipe(names: string[]) {
    const seenInThisRecipe = new Set<string>()
    for (const name of names) {
      if (!hasNoSpecificIcon(name)) continue
      if (seenInThisRecipe.has(name)) continue
      seenInThisRecipe.add(name)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }

  const standardSnap = await db.collection('standardRecipes').get()
  for (const doc of standardSnap.docs) {
    recordRecipe(ingredientsFromStandardRecipe(doc.data()))
  }

  const userSnap = await db.collection('recipes').get()
  for (const doc of userSnap.docs) {
    recordRecipe(ingredientsFromUserRecipe(doc.data()))
  }

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])

  console.log(
    `Ingredientes sin icono específico (caerían en el neutro 🍽️): ${rows.length}\n`,
  )
  for (const [name, count] of rows) {
    console.log(`  ${count}\t${name}`)
  }
}

checkIcons().catch((error) => {
  console.error('\nError al comprobar iconos:', error.message ?? error)
  process.exitCode = 1
})

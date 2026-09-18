import { translateText } from '@/services/translate'
import type { Ingredient } from '@/types'

export interface TranslatableRecipeContent {
  title: string
  ingredients: Ingredient[]
  steps: string[]
}

const STORAGE_PREFIX = 'mealdb-translation:'

// Caché en memoria para toda la sesión: si el usuario entra y sale varias
// veces de la misma vista previa no hace falta ni tocar localStorage.
const memoryCache = new Map<string, TranslatableRecipeContent>()

function readLocalStorageCache(key: string): TranslatableRecipeContent | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? (JSON.parse(raw) as TranslatableRecipeContent) : null
  } catch {
    // Modo privado, localStorage lleno, SSR... la caché es solo una
    // optimización, no algo de lo que dependa la vista.
    return null
  }
}

function writeLocalStorageCache(
  key: string,
  value: TranslatableRecipeContent,
): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Igual que arriba: si falla, simplemente se traducirá de nuevo la
    // próxima vez.
  }
}

// Lanzar una traducción por título/paso/ingrediente a la vez (título +
// ~10 ingredientes + ~5 pasos) satura el endpoint gratuito de golpe: Google
// responde sin cabeceras CORS (se ve como error de CORS en consola, pero es
// en realidad un bloqueo por ráfaga) y hay que caer a MyMemory para todo.
// Limitando cuántas peticiones van a la vez se evita esa ráfaga.
const TRANSLATE_CONCURRENCY = 3

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await fn(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  )
  return results
}

async function translateContent(
  content: TranslatableRecipeContent,
): Promise<TranslatableRecipeContent> {
  // Ingredientes repetidos (p. ej. "salt" en dos pasos distintos) se
  // traducen una sola vez para gastar menos llamadas al servicio.
  const uniqueNames = [...new Set(content.ingredients.map((i) => i.name))]
  const texts = [content.title, ...content.steps, ...uniqueNames]

  const translated = await mapWithConcurrency(texts, TRANSLATE_CONCURRENCY, (text) =>
    translateText(text, 'en', 'es'),
  )

  const title = translated[0]
  const translatedSteps = translated.slice(1, 1 + content.steps.length)
  const translatedNames = translated.slice(1 + content.steps.length)

  const nameByOriginal = new Map(
    uniqueNames.map((name, i) => [name, translatedNames[i]]),
  )
  const ingredients = content.ingredients.map((ingredient) => ({
    ...ingredient,
    name: nameByOriginal.get(ingredient.name) ?? ingredient.name,
    // getIngredientImage (src/utils/ingredientImage.ts) usa el nombre en
    // inglés para su resolución por TheMealDB: sin este campo, un
    // ingrediente ya traducido ("Diente de ajo") nunca haría match ahí.
    originalName: ingredient.name,
  }))

  return { title, ingredients, steps: translatedSteps }
}

/**
 * Traduce (o recupera de caché) el título, ingredientes y pasos de una
 * receta de TheMealDB. Solo tiene sentido para `source: 'mealdb'`: las
 * recetas propias ya están en español y no deben pasar por aquí.
 *
 * `cacheKey` debe identificar la receta de forma estable entre visitas:
 * el id de TheMealDB para vistas previas sin guardar, el id del documento
 * de Firestore para recetas ya guardadas (aunque en ese caso el llamador
 * debería mirar primero `recipe.translation`, que persiste entre sesiones
 * y evita incluso esta caché en memoria/localStorage).
 */
export async function getMealDbTranslation(
  cacheKey: string,
  content: TranslatableRecipeContent,
): Promise<TranslatableRecipeContent> {
  const cached = memoryCache.get(cacheKey) ?? readLocalStorageCache(cacheKey)
  if (cached) {
    memoryCache.set(cacheKey, cached)
    return cached
  }

  const translated = await translateContent(content)
  memoryCache.set(cacheKey, translated)
  writeLocalStorageCache(cacheKey, translated)
  return translated
}

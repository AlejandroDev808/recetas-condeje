import type {
  MealDbCategoriesResponse,
  MealDbCategory,
  MealDbFilterResponse,
  MealDbMealRaw,
  MealDbMealSummary,
  MealDbSearchResponse,
} from '@/types'
import type { RecipeDraft } from '@/types'

// "1" es la test key pública y gratuita de TheMealDB, sin necesidad de
// registro para los endpoints de búsqueda/filtro/lookup que usamos aquí.
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`TheMealDB respondió ${res.status} para ${path}`)
  }
  return res.json() as Promise<T>
}

export async function searchMealsByName(
  query: string,
): Promise<MealDbMealRaw[]> {
  const data = await fetchJson<MealDbSearchResponse>(
    `/search.php?s=${encodeURIComponent(query)}`,
  )
  return data.meals ?? []
}

export async function searchMealsByIngredient(
  ingredient: string,
): Promise<MealDbMealSummary[]> {
  const data = await fetchJson<MealDbFilterResponse>(
    `/filter.php?i=${encodeURIComponent(ingredient)}`,
  )
  return data.meals ?? []
}

export async function searchMealsByCategory(
  category: string,
): Promise<MealDbMealSummary[]> {
  const data = await fetchJson<MealDbFilterResponse>(
    `/filter.php?c=${encodeURIComponent(category)}`,
  )
  return data.meals ?? []
}

/**
 * filter.php solo trae idMeal/strMeal/strMealThumb, así que para mostrar
 * o guardar una receta completa hay que pedir el detalle por id.
 */
export async function getMealById(id: string): Promise<MealDbMealRaw | null> {
  const data = await fetchJson<MealDbSearchResponse>(
    `/lookup.php?i=${encodeURIComponent(id)}`,
  )
  return data.meals?.[0] ?? null
}

export async function getCategories(): Promise<MealDbCategory[]> {
  const data = await fetchJson<MealDbCategoriesResponse>('/categories.php')
  return data.categories
}

/**
 * TheMealDB devuelve los ingredientes como 20 pares de campos sueltos
 * (strIngredient1/strMeasure1 ... strIngredient20/strMeasure20) en vez de
 * un array, así que hay que recomponerlos manualmente.
 */
function parseIngredients(meal: MealDbMealRaw): RecipeDraft['ingredients'] {
  const ingredients: RecipeDraft['ingredients'] = []

  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]?.trim()
    const measure = meal[`strMeasure${i}`]?.trim()
    if (!name) continue

    ingredients.push({
      name,
      quantity: measure || '',
      unit: '',
    })
  }

  return ingredients
}

/**
 * Convierte una receta de TheMealDB al modelo unificado `RecipeDraft`.
 * TheMealDB no tiene el concepto de "momento del día", así que se deja
 * en 'comida' por defecto y el usuario lo puede corregir al guardar.
 */
export function mapMealDbToRecipeDraft(meal: MealDbMealRaw): RecipeDraft {
  const steps = (meal.strInstructions ?? '')
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean)

  const tags = [
    meal.strCategory,
    meal.strArea ? `cocina ${meal.strArea}` : null,
    ...(meal.strTags?.split(',').map((tag) => tag.trim()) ?? []),
  ].filter((tag): tag is string => Boolean(tag))

  return {
    title: meal.strMeal,
    imageUrl: meal.strMealThumb ?? undefined,
    ingredients: parseIngredients(meal),
    steps,
    mealTimes: ['comida'],
    tags,
    source: 'mealdb',
    sourceId: meal.idMeal,
  }
}

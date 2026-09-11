import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { areaLabelEs } from '@/lib/areaLabels'
import { parseIngredients } from '@/services/mealdb'
import { db } from '@/services/firebase'
import type { MealDbMealRaw, RecipeDraft } from '@/types'

const standardRecipesCollection = collection(db, 'standardRecipes')

/** Catálogo curado de recetas (ver scripts/seedRecipes.ts), común a todos los usuarios. */
export async function getAllStandardRecipes(): Promise<MealDbMealRaw[]> {
  const snap = await getDocs(query(standardRecipesCollection, orderBy('strMeal')))
  return snap.docs.map((d) => d.data() as MealDbMealRaw)
}

export async function getStandardRecipeById(
  id: string,
): Promise<MealDbMealRaw | null> {
  const snap = await getDoc(doc(db, 'standardRecipes', id))
  return snap.exists() ? (snap.data() as MealDbMealRaw) : null
}

/**
 * A diferencia de `mapMealDbToRecipeDraft` (recetas de TheMealDB, en inglés,
 * que se traducen al abrir el detalle), estas recetas ya están escritas en
 * español: se guardan con `source: 'own'` para que nunca pasen por el
 * servicio de traducción ni sobrescriban su texto.
 */
export function mapStandardRecipeToDraft(meal: MealDbMealRaw): RecipeDraft {
  const steps = (meal.strInstructions ?? '')
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean)

  const tags = [
    meal.strCategory,
    meal.strArea ? `cocina ${areaLabelEs(meal.strArea)}` : null,
    ...(meal.strTags?.split(',').map((tag) => tag.trim()) ?? []),
  ].filter((tag): tag is string => Boolean(tag))

  return {
    title: meal.strMeal,
    imageUrl: meal.strMealThumb || undefined,
    ingredients: parseIngredients(meal),
    steps,
    mealTimes: meal.strCategory === 'Dessert' ? ['postre'] : ['comida'],
    tags,
    source: 'own',
  }
}

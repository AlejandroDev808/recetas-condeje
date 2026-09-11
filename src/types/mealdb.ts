/**
 * Formas crudas de la respuesta de TheMealDB (www.themealdb.com/api.php).
 * La API devuelve strIngredient1..20 / strMeasure1..20 como campos sueltos
 * en vez de un array, de ahí el índice de firma genérico.
 */
export interface MealDbMealRaw {
  idMeal: string
  strMeal: string
  strCategory: string | null
  strArea: string | null
  strInstructions: string | null
  strMealThumb: string | null
  strTags: string | null
  strYoutube: string | null
  [key: string]: string | null
}

export interface MealDbMealSummary {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

export interface MealDbCategory {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

export interface MealDbSearchResponse {
  meals: MealDbMealRaw[] | null
}

export interface MealDbFilterResponse {
  meals: MealDbMealSummary[] | null
}

export interface MealDbCategoriesResponse {
  categories: MealDbCategory[]
}

export type MealDbSearchMode = 'name' | 'ingredient' | 'category' | 'area'

export type MealDbResult = MealDbMealRaw | MealDbMealSummary

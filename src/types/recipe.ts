export type MealTime = 'desayuno' | 'comida' | 'cena' | 'merienda' | 'postre'

export const MEAL_TIMES: MealTime[] = [
  'desayuno',
  'comida',
  'cena',
  'merienda',
  'postre',
]

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  cena: 'Cena',
  merienda: 'Merienda',
  postre: 'Postre',
}

export interface Ingredient {
  name: string
  quantity: string
  unit: string
}

/**
 * Modelo unificado: tanto las recetas propias como las importadas de
 * TheMealDB se guardan en Firestore con esta misma forma, para que el
 * resto de la app (filtros, tarjetas, vista 3D) no tenga que distinguir
 * el origen.
 */
export interface Recipe {
  id: string
  ownerId: string
  title: string
  description?: string
  imageUrl?: string
  ingredients: Ingredient[]
  steps: string[]
  /** Una receta puede valer para más de un momento del día (p. ej. desayuno y merienda). */
  mealTimes: MealTime[]
  tags: string[]
  source: 'own' | 'mealdb'
  sourceId?: string
  createdAt: number
  updatedAt: number
}

export type RecipeDraft = Omit<
  Recipe,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt'
>

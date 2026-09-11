import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMealById, mapMealDbToRecipeDraft } from '@/services/mealdb'
import { saveMealDbRecipe } from '@/services/recipes'
import type { MealDbMealRaw, MealDbResult } from '@/types'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Guarda un resultado de TheMealDB en el cuaderno del usuario. Comparte la
 * lógica de "si el resultado viene de filter.php (parcial) hay que pedir el
 * detalle completo antes de guardar" entre la tarjeta de resultados y la
 * vista previa de detalle.
 */
export function useSaveMealDbRecipe() {
  const { user } = useAuth()
  const [state, setState] = useState<SaveState>('idle')
  const [savedId, setSavedId] = useState<string | null>(null)

  async function save(meal: MealDbResult | MealDbMealRaw) {
    if (!user || state === 'saving') return
    setState('saving')
    try {
      const full =
        'strInstructions' in meal ? meal : await getMealById(meal.idMeal)
      if (!full) throw new Error('Receta no encontrada')

      const draft = mapMealDbToRecipeDraft(full)
      const id = await saveMealDbRecipe(user.uid, draft)
      setSavedId(id)
      setState('saved')
      return id
    } catch {
      setState('error')
      return null
    }
  }

  return { user, state, savedId, save }
}

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createRecipe } from '@/services/recipes'
import { mapStandardRecipeToDraft } from '@/services/standardRecipes'
import type { MealDbMealRaw } from '@/types'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/** Guarda una receta del catálogo (`standardRecipes`) en el cuaderno del usuario. */
export function useSaveStandardRecipe() {
  const { user } = useAuth()
  const [state, setState] = useState<SaveState>('idle')
  const [savedId, setSavedId] = useState<string | null>(null)

  async function save(meal: MealDbMealRaw) {
    if (!user || state === 'saving') return
    setState('saving')
    try {
      const draft = mapStandardRecipeToDraft(meal)
      const id = await createRecipe(user.uid, draft)
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

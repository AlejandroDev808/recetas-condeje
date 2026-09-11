import { useEffect, useState } from 'react'
import { getAllStandardRecipes } from '@/services/standardRecipes'
import type { MealDbMealRaw } from '@/types'

/**
 * El catálogo son ~200 recetas fijas (ver scripts/seedRecipes.ts): se traen
 * todas de una vez y se filtran en cliente, en vez de montar índices o
 * consultas por campo en Firestore para un dataset de este tamaño.
 */
export function useStandardRecipes() {
  const [recipes, setRecipes] = useState<MealDbMealRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    getAllStandardRecipes()
      .then((data) => {
        if (!cancelled) setRecipes(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { recipes, loading, error }
}

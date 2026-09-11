import { useCallback, useState } from 'react'
import {
  searchMealsByArea,
  searchMealsByCategory,
  searchMealsByIngredient,
  searchMealsByName,
} from '@/services/mealdb'
import { translateToEnglish } from '@/services/translate'
import type {
  MealDbMealRaw,
  MealDbMealSummary,
  MealDbSearchMode,
} from '@/types'

export type MealDbResult = MealDbMealRaw | MealDbMealSummary

export function useMealDbSearch(
  initialMode: MealDbSearchMode = 'name',
  initialQuery = '',
) {
  const [mode, setMode] = useState<MealDbSearchMode>(initialMode)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<MealDbResult[]>([])
  // Si hay query inicial (restaurada desde la URL) arranca ya en "cargando":
  // el buscador la relanza en un efecto nada más montar, y así no hay un
  // primer render en falso "sin cargar, sin resultados" antes de que arranque.
  const [loading, setLoading] = useState(initialQuery.trim().length > 0)
  const [error, setError] = useState<string | null>(null)
  // Query realmente usada contra TheMealDB tras traducir. null si coincide
  // con lo escrito (o en modo categoría, que ya usa el valor en inglés).
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null)

  const search = useCallback(
    async (searchMode: MealDbSearchMode, rawQuery: string) => {
      const trimmed = rawQuery.trim()
      if (!trimmed) {
        setResults([])
        setError(null)
        setTranslatedQuery(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        // Los selectores de categoría y país ya entregan el nombre en inglés
        // tal como lo espera la API, así que no hace falta traducirlos.
        const effectiveQuery =
          searchMode === 'category' || searchMode === 'area'
            ? trimmed
            : await translateToEnglish(trimmed)

        setTranslatedQuery(
          effectiveQuery.toLowerCase() !== trimmed.toLowerCase()
            ? effectiveQuery
            : null,
        )

        const data =
          searchMode === 'name'
            ? await searchMealsByName(effectiveQuery)
            : searchMode === 'ingredient'
              ? await searchMealsByIngredient(effectiveQuery)
              : searchMode === 'category'
                ? await searchMealsByCategory(effectiveQuery)
                : await searchMealsByArea(effectiveQuery)
        setResults(data)
      } catch {
        setError('No se ha podido conectar con TheMealDB. Inténtalo de nuevo.')
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    mode,
    setMode,
    query,
    setQuery,
    results,
    loading,
    error,
    translatedQuery,
    search,
  }
}

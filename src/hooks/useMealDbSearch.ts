import { useCallback, useState } from 'react'
import {
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

export function useMealDbSearch() {
  const [mode, setMode] = useState<MealDbSearchMode>('name')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MealDbResult[]>([])
  const [loading, setLoading] = useState(false)
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
        // El selector de categoría ya entrega el nombre en inglés tal como
        // lo espera la API, así que no hace falta traducirlo.
        const effectiveQuery =
          searchMode === 'category'
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
              : await searchMealsByCategory(effectiveQuery)
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

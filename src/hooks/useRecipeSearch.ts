import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMealDbSearch } from '@/hooks/useMealDbSearch'
import { getAllStandardRecipes } from '@/services/standardRecipes'
import type { MealDbMealRaw, MealDbResult, MealDbSearchMode } from '@/types'

export type RecipeSearchResult =
  | { origin: 'catalog'; meal: MealDbMealRaw }
  | { origin: 'mealdb'; meal: MealDbResult }

function matchesCatalogText(
  meal: MealDbMealRaw,
  lower: string,
  byIngredient: boolean,
): boolean {
  if (!byIngredient) return meal.strMeal.toLowerCase().includes(lower)

  for (let i = 1; i <= 20; i += 1) {
    if (meal[`strIngredient${i}`]?.toLowerCase().includes(lower)) return true
  }
  return false
}

/**
 * Combina el catálogo propio (`standardRecipes`, ya en español y en
 * memoria: se filtra al instante en cliente) con la búsqueda en vivo de
 * TheMealDB, para que nombre/ingrediente/categoría/país busquen en ambas
 * fuentes a la vez. La traducción a inglés (para nombre/ingrediente) solo
 * se le aplica a la llamada a TheMealDB: el catálogo ya está en español.
 */
export function useRecipeSearch(
  initialMode: MealDbSearchMode = 'name',
  initialQuery = '',
) {
  const mealDb = useMealDbSearch(initialMode, initialQuery)
  const [catalog, setCatalog] = useState<MealDbMealRaw[]>([])
  const [catalogMatches, setCatalogMatches] = useState<MealDbMealRaw[]>([])

  useEffect(() => {
    getAllStandardRecipes()
      .then(setCatalog)
      .catch(() => setCatalog([]))
  }, [])

  const search = useCallback(
    async (searchMode: MealDbSearchMode, rawQuery: string) => {
      const trimmed = rawQuery.trim()
      const lower = trimmed.toLowerCase()

      setCatalogMatches(
        !trimmed
          ? []
          : searchMode === 'name'
            ? catalog.filter((m) => matchesCatalogText(m, lower, false))
            : searchMode === 'ingredient'
              ? catalog.filter((m) => matchesCatalogText(m, lower, true))
              : searchMode === 'category'
                ? catalog.filter((m) => m.strCategory === trimmed)
                : catalog.filter((m) => m.strArea === trimmed),
      )

      await mealDb.search(searchMode, rawQuery)
    },
    [catalog, mealDb],
  )

  const results = useMemo<RecipeSearchResult[]>(
    () => [
      ...catalogMatches.map((meal) => ({ meal, origin: 'catalog' as const })),
      ...mealDb.results.map((meal) => ({ meal, origin: 'mealdb' as const })),
    ],
    [catalogMatches, mealDb.results],
  )

  return {
    mode: mealDb.mode,
    setMode: mealDb.setMode,
    query: mealDb.query,
    setQuery: mealDb.setQuery,
    results,
    loading: mealDb.loading,
    error: mealDb.error,
    translatedQuery: mealDb.translatedQuery,
    search,
    catalog,
  }
}

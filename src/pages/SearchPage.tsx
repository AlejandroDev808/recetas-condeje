import { motion } from 'framer-motion'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CatalogRecipeCard } from '@/components/recipe/CatalogRecipeCard'
import { MealResultCard } from '@/components/recipe/MealResultCard'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { useRecipeSearch } from '@/hooks/useRecipeSearch'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { pageTransition, staggerContainer } from '@/lib/animations'
import { mergeAreas } from '@/lib/areaLabels'
import { categoryLabelEs } from '@/lib/categoryLabels'
import { getCategories } from '@/services/mealdb'
import type { MealDbCategory, MealDbSearchMode } from '@/types'

const MODE_LABELS: Record<MealDbSearchMode, string> = {
  name: 'Nombre',
  ingredient: 'Ingrediente',
  category: 'Categoría',
  area: 'País',
}

function isSearchMode(value: string | null): value is MealDbSearchMode {
  return (
    value === 'name' ||
    value === 'ingredient' ||
    value === 'category' ||
    value === 'area'
  )
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Se congelan en el primer render: reflejan la búsqueda de la URL (si el
  // usuario llega con "atrás" desde el detalle de una receta) y no deben
  // volver a leerse en renders posteriores, cuando la URL ya la actualizamos
  // nosotros mismos al buscar.
  const [initialMode] = useState<MealDbSearchMode>(() => {
    const raw = searchParams.get('mode')
    return isSearchMode(raw) ? raw : 'name'
  })
  const [initialQuery] = useState(() => searchParams.get('q') ?? '')

  const {
    mode,
    setMode,
    query,
    setQuery,
    results,
    loading,
    error,
    translatedQuery,
    search,
    catalog,
  } = useRecipeSearch(initialMode, initialQuery)
  const [categories, setCategories] = useState<MealDbCategory[]>([])
  const isFirstModeChange = useRef(true)

  useScrollRestoration(!loading)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  // El catálogo propio aporta cocinas que TheMealDB no cubre (marroquí,
  // coreana, cubana...); se combinan para que el desplegable de país
  // busque en ambas fuentes a la vez.
  const areas = useMemo(
    () => mergeAreas([...new Set(catalog.map((r) => r.strArea).filter(Boolean))] as string[]),
    [catalog],
  )

  // Restaura la búsqueda reflejada en la URL nada más montar (solo una vez):
  // así volver con "atrás" desde el detalle de una receta recupera el mismo
  // término y los mismos resultados en vez de un buscador vacío.
  useEffect(() => {
    if (initialQuery) void search(initialMode, initialQuery)
  }, [initialMode, initialQuery, search])

  // Al cambiar de modo se limpia la query. Aparte, y solo si seguimos en
  // modo categoría/país con la query aún vacía, se rellena con la primera
  // opción en cuanto llegan de la API — en efectos separados para que
  // cargar categorías no borre lo que el usuario esté escribiendo en modo
  // Nombre/Ingrediente. Se ignora el primer disparo (al montar) para no
  // borrar la query restaurada desde la URL.
  useEffect(() => {
    if (isFirstModeChange.current) {
      isFirstModeChange.current = false
      return
    }
    setQuery('')
  }, [mode, setQuery])

  useEffect(() => {
    if (mode === 'category' && !query && categories.length > 0) {
      setQuery(categories[0].strCategory)
    }
    if (mode === 'area' && !query && areas.length > 0) {
      setQuery(areas[0])
    }
  }, [mode, categories, areas, query, setQuery])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(mode, query)
    // replace: la propia página de búsqueda no debería acumular una entrada
    // de historial por cada término buscado, solo reflejar el último para
    // que "atrás" desde el detalle de una receta vuelva aquí con esta query.
    setSearchParams(query.trim() ? { mode, q: query.trim() } : {}, {
      replace: true,
    })
  }

  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-5xl px-4 py-10"
    >
      <h1 className="font-display text-4xl text-espresso-700">
        Buscar recetas
      </h1>
      <p className="mt-2 text-espresso-500/80">
        Explora tu catálogo propio y TheMealDB por nombre, ingrediente,
        categoría o país (puedes escribir en español, lo traducimos antes de
        buscar) y guarda lo que te guste en tu cuaderno.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex gap-1 self-start rounded-full bg-cream-200 p-1">
          {(Object.keys(MODE_LABELS) as MealDbSearchMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-terracotta-500 text-cream-50'
                  : 'text-espresso-600 hover:text-espresso-700'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {mode === 'category' ? (
          <select
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-espresso-700 focus:border-terracotta-400 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.idCategory} value={c.strCategory}>
                {categoryLabelEs(c.strCategory)}
              </option>
            ))}
          </select>
        ) : mode === 'area' ? (
          <CountrySelect value={query} onChange={setQuery} options={areas} />
        ) : (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'name' ? 'p. ej. tarta de manzana' : 'p. ej. pollo'
            }
            className="flex-1 rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-espresso-700 placeholder:text-espresso-500/40 focus:border-terracotta-400 focus:outline-none"
          />
        )}

        <button
          type="submit"
          className="rounded-full bg-espresso-700 px-6 py-2 font-medium text-cream-50 transition-colors hover:bg-espresso-900"
        >
          Buscar
        </button>
      </form>

      {error && <p className="mt-6 text-terracotta-600">{error}</p>}
      {loading && <p className="mt-6 text-espresso-500/70">Buscando…</p>}

      {!loading && !error && translatedQuery && (
        <p className="mt-6 text-sm text-espresso-500/60">
          Buscado como <span className="font-medium">"{translatedQuery}"</span>{' '}
          en TheMealDB.
        </p>
      )}

      {!loading && results.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map((result) =>
            result.origin === 'catalog' ? (
              <CatalogRecipeCard
                key={`catalog-${result.meal.idMeal}`}
                meal={result.meal}
              />
            ) : (
              <MealResultCard
                key={`mealdb-${result.meal.idMeal}`}
                meal={result.meal}
              />
            ),
          )}
        </motion.div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="mt-16 text-center text-espresso-500/60">
          Busca algo para empezar a descubrir recetas.
        </p>
      )}
    </motion.section>
  )
}

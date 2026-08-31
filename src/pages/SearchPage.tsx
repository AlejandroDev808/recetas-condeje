import { motion } from 'framer-motion'
import { type FormEvent, useEffect, useState } from 'react'
import { MealResultCard } from '@/components/recipe/MealResultCard'
import { useMealDbSearch } from '@/hooks/useMealDbSearch'
import { pageTransition, staggerContainer } from '@/lib/animations'
import { categoryLabelEs } from '@/lib/categoryLabels'
import { getCategories } from '@/services/mealdb'
import type { MealDbCategory, MealDbSearchMode } from '@/types'

const MODE_LABELS: Record<MealDbSearchMode, string> = {
  name: 'Nombre',
  ingredient: 'Ingrediente',
  category: 'Categoría',
}

export function SearchPage() {
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
  } = useMealDbSearch()
  const [categories, setCategories] = useState<MealDbCategory[]>([])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  // Al cambiar de modo se limpia la query. Aparte, y solo si seguimos en
  // modo categoría con la query aún vacía, se rellena con la primera
  // categoría en cuanto llegan de la API — en efectos separados para que
  // cargar categorías no borre lo que el usuario esté escribiendo en modo
  // Nombre/Ingrediente.
  useEffect(() => {
    setQuery('')
  }, [mode, setQuery])

  useEffect(() => {
    if (mode === 'category' && !query && categories.length > 0) {
      setQuery(categories[0].strCategory)
    }
  }, [mode, categories, query, setQuery])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(mode, query)
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
        Explora TheMealDB por nombre, ingrediente o categoría (puedes
        escribir en español, lo traducimos antes de buscar) y guarda lo que
        te guste en tu cuaderno.
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
          {results.map((meal) => (
            <MealResultCard key={meal.idMeal} meal={meal} />
          ))}
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

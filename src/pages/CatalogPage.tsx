import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { CatalogRecipeCard } from '@/components/recipe/CatalogRecipeCard'
import { useStandardRecipes } from '@/hooks/useStandardRecipes'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { pageTransition, staggerContainer } from '@/lib/animations'
import { areaLabelEs } from '@/lib/areaLabels'
import { categoryLabelEs } from '@/lib/categoryLabels'

const ALL = 'all'

export function CatalogPage() {
  const { recipes, loading, error } = useStandardRecipes()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [area, setArea] = useState(ALL)

  useScrollRestoration(!loading)

  const categories = useMemo(
    () =>
      [...new Set(recipes.map((r) => r.strCategory).filter(Boolean))].sort(
        (a, b) => categoryLabelEs(a as string).localeCompare(categoryLabelEs(b as string)),
      ) as string[],
    [recipes],
  )

  const areas = useMemo(
    () =>
      [...new Set(recipes.map((r) => r.strArea).filter(Boolean))].sort((a, b) =>
        areaLabelEs(a as string).localeCompare(areaLabelEs(b as string)),
      ) as string[],
    [recipes],
  )

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()

    return recipes.filter((recipe) => {
      if (category !== ALL && recipe.strCategory !== category) return false
      if (area !== ALL && recipe.strArea !== area) return false
      if (!trimmed) return true

      if (recipe.strMeal.toLowerCase().includes(trimmed)) return true

      for (let i = 1; i <= 20; i += 1) {
        const ingredient = recipe[`strIngredient${i}`]
        if (ingredient?.toLowerCase().includes(trimmed)) return true
      }
      return false
    })
  }, [recipes, query, category, area])

  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-5xl px-4 py-10"
    >
      <h1 className="font-display text-4xl text-espresso-700">
        Catálogo de recetas
      </h1>
      <p className="mt-2 text-espresso-500/80">
        Explora nuestra selección de recetas de cocinas de todo el mundo y
        guarda las que te gusten en tu cuaderno.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o ingrediente…"
          className="flex-1 rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-espresso-700 placeholder:text-espresso-500/40 focus:border-terracotta-400 focus:outline-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-espresso-700 focus:border-terracotta-400 focus:outline-none"
        >
          <option value={ALL}>Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabelEs(c)}
            </option>
          ))}
        </select>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-espresso-700 focus:border-terracotta-400 focus:outline-none"
        >
          <option value={ALL}>Todas las cocinas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {areaLabelEs(a)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-6 text-espresso-500/70">Cargando catálogo…</p>}

      {error && (
        <p className="mt-6 text-terracotta-600">
          No se ha podido cargar el catálogo. Inténtalo de nuevo.
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="mt-6 text-sm text-espresso-500/60">
            {filtered.length} receta{filtered.length === 1 ? '' : 's'}
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((meal) => (
              <CatalogRecipeCard key={meal.idMeal} meal={meal} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="mt-16 text-center text-espresso-500/60">
              No hay recetas que coincidan con tu búsqueda.
            </p>
          )}
        </>
      )}
    </motion.section>
  )
}

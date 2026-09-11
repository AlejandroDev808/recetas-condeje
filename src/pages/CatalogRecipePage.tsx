import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView'
import { useSaveStandardRecipe } from '@/hooks/useSaveStandardRecipe'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { getStandardRecipeById, mapStandardRecipeToDraft } from '@/services/standardRecipes'
import type { MealDbMealRaw } from '@/types'

/** Vista de detalle de una receta del catálogo, ya en español (sin traducción). */
export function CatalogRecipePage() {
  const { id } = useParams<{ id: string }>()
  const [meal, setMeal] = useState<MealDbMealRaw | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { user, state, savedId, save } = useSaveStandardRecipe()
  const location = useLocation()

  useScrollRestoration(!loading)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    getStandardRecipeById(id)
      .then((result) => {
        if (!result) {
          setNotFound(true)
          return
        }
        setMeal(result)
      })
      .finally(() => setLoading(false))
  }, [id])

  const draft = useMemo(() => (meal ? mapStandardRecipeToDraft(meal) : null), [meal])

  if (loading) {
    return (
      <p className="py-24 text-center text-espresso-500/60">
        Cargando receta…
      </p>
    )
  }

  if (notFound || !draft) {
    return (
      <p className="py-24 text-center text-espresso-500/60">
        No se ha encontrado esta receta en el catálogo.
      </p>
    )
  }

  return (
    <RecipeDetailView
      title={draft.title}
      imageUrl={draft.imageUrl}
      mealTimes={draft.mealTimes}
      tags={draft.tags}
      ingredients={draft.ingredients}
      steps={draft.steps}
      actions={
        state === 'saved' && savedId ? (
          <Link
            to={`/recetas/${savedId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700"
          >
            Guardada en tu cuaderno · ver receta →
          </Link>
        ) : !user ? (
          <Link
            to="/entrar"
            state={{ from: location }}
            className="inline-block rounded-full bg-cream-200 px-5 py-2 text-sm font-medium text-espresso-600 transition-colors hover:bg-cream-300"
          >
            Inicia sesión para guardar
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => meal && void save(meal)}
            disabled={state === 'saving'}
            className="rounded-full bg-terracotta-500 px-5 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-espresso-500/15 disabled:text-espresso-500/50"
          >
            {state === 'saving'
              ? 'Guardando…'
              : state === 'error'
                ? 'Error al guardar, reintentar'
                : 'Guardar en mi cuaderno'}
          </button>
        )
      }
    />
  )
}

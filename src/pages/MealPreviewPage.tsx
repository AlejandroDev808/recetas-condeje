import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView'
import { useSaveMealDbRecipe } from '@/hooks/useSaveMealDbRecipe'
import { getMealById, mapMealDbToRecipeDraft } from '@/services/mealdb'
import type { MealDbMealRaw } from '@/types'

/**
 * Vista previa en vivo de una receta de TheMealDB antes de guardarla: se
 * pide el detalle completo por id (lookup.php) y se pinta con el mismo
 * componente que una receta ya guardada, para que ingredientes y pasos se
 * vean sin necesidad de "Guardar en mi cuaderno" primero.
 */
export function MealPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [meal, setMeal] = useState<MealDbMealRaw | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { user, state, savedId, save } = useSaveMealDbRecipe()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    getMealById(id)
      .then((result) => {
        if (!result) {
          setNotFound(true)
          return
        }
        setMeal(result)
      })
      .finally(() => setLoading(false))
  }, [id])

  const draft = useMemo(
    () => (meal ? mapMealDbToRecipeDraft(meal) : null),
    [meal],
  )

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
        No se ha encontrado esta receta en TheMealDB.
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
        ) : (
          <button
            type="button"
            onClick={() => meal && void save(meal)}
            disabled={!user || state === 'saving'}
            className="rounded-full bg-terracotta-500 px-5 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-espresso-500/15 disabled:text-espresso-500/50"
          >
            {!user
              ? 'Inicia sesión para guardar'
              : state === 'saving'
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

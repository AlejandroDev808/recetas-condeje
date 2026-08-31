import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView'
import { useAuth } from '@/context/AuthContext'
import { getMealDbTranslation } from '@/lib/recipeTranslation'
import { deleteRecipe, getRecipe, updateRecipe } from '@/services/recipes'
import type { Recipe } from '@/types'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    setLoading(true)
    getRecipe(id)
      .then((result) => {
        if (cancelled) return
        setRecipe(result)
        setLoading(false)
        if (!result || result.source !== 'mealdb' || result.translation) {
          return
        }

        // Se traduce solo la primera vez: el resultado se guarda en el
        // propio documento para que las próximas visitas ya vengan en
        // español sin volver a llamar al servicio de traducción.
        getMealDbTranslation(result.id, {
          title: result.title,
          ingredients: result.ingredients,
          steps: result.steps,
        })
          .then((translation) => {
            if (cancelled) return
            setRecipe((prev) =>
              prev && prev.id === result.id ? { ...prev, translation } : prev,
            )
            void updateRecipe(result.id, { translation })
          })
          .catch(() => {
            // Si la traducción falla, la receta se queda en inglés: no es
            // motivo para romper la vista de detalle.
          })
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!recipe) return
    const confirmed = window.confirm(
      `¿Borrar "${recipe.translation?.title ?? recipe.title}" de tu cuaderno? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return
    await deleteRecipe(recipe.id)
    navigate('/mi-cuaderno')
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-espresso-500/60">
        Cargando receta…
      </p>
    )
  }

  if (!recipe) {
    return (
      <p className="py-24 text-center text-espresso-500/60">
        No se ha encontrado la receta.
      </p>
    )
  }

  const isOwner = user?.uid === recipe.ownerId
  // Las recetas propias nunca tienen `translation` (ya se escriben en
  // español); en las de TheMealDB se usa en cuanto está disponible.
  const content = recipe.translation ?? recipe

  return (
    <RecipeDetailView
      title={content.title}
      imageUrl={recipe.imageUrl}
      mealTimes={recipe.mealTimes}
      tags={recipe.tags}
      ingredients={content.ingredients}
      steps={content.steps}
      actions={
        isOwner ? (
          <div className="flex gap-3">
            <Link
              to={`/mi-cuaderno/${recipe.id}/editar`}
              className="rounded-full bg-espresso-700 px-5 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-espresso-900"
            >
              Editar receta
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-terracotta-500/40 px-5 py-2 text-sm font-medium text-terracotta-600 transition-colors hover:bg-terracotta-500/10"
            >
              Borrar receta
            </button>
          </div>
        ) : undefined
      }
    />
  )
}

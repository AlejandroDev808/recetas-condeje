import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView'
import { useAuth } from '@/context/AuthContext'
import { deleteRecipe, getRecipe } from '@/services/recipes'
import type { Recipe } from '@/types'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRecipe(id)
      .then(setRecipe)
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!recipe) return
    const confirmed = window.confirm(
      `¿Borrar "${recipe.title}" de tu cuaderno? Esta acción no se puede deshacer.`,
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

  return (
    <RecipeDetailView
      title={recipe.title}
      imageUrl={recipe.imageUrl}
      mealTimes={recipe.mealTimes}
      tags={recipe.tags}
      ingredients={recipe.ingredients}
      steps={recipe.steps}
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

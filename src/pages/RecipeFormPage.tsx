import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SignInPrompt } from '@/components/auth/SignInPrompt'
import { RecipeForm } from '@/components/recipe/RecipeForm'
import { useAuth } from '@/context/AuthContext'
import { pageTransition } from '@/lib/animations'
import { createRecipe, getRecipe, updateRecipe } from '@/services/recipes'
import type { Recipe, RecipeDraft } from '@/types'

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(isEditing)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRecipe(id)
      .then((result) => {
        if (!result) {
          setNotFound(true)
          return
        }
        setRecipe(result)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(draft: RecipeDraft) {
    if (!user) return
    setSubmitting(true)
    try {
      if (isEditing && id) {
        await updateRecipe(id, draft)
        navigate(`/recetas/${id}`)
      } else {
        const newId = await createRecipe(user.uid, draft)
        navigate(`/recetas/${newId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!authLoading && !user) {
    return (
      <SignInPrompt message="Inicia sesión para crear o editar recetas." />
    )
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-espresso-500/60">Cargando…</p>
    )
  }

  if (isEditing && (notFound || recipe?.ownerId !== user?.uid)) {
    return (
      <p className="py-24 text-center text-espresso-500/60">
        No tienes permiso para editar esta receta.
      </p>
    )
  }

  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-3xl px-4 py-10"
    >
      <h1 className="font-display text-4xl text-espresso-700">
        {isEditing ? 'Editar receta' : 'Nueva receta'}
      </h1>
      <p className="mt-2 text-espresso-500/80">
        {isEditing
          ? 'Cambia lo que haga falta y guarda.'
          : 'Escribe tu propia receta desde cero.'}
      </p>

      <div className="mt-8">
        <RecipeForm
          initialValues={recipe ?? undefined}
          submitLabel={isEditing ? 'Guardar cambios' : 'Crear receta'}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </motion.section>
  )
}

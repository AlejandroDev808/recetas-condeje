import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SignInPrompt } from '@/components/auth/SignInPrompt'
import { RecipeGrid } from '@/components/recipe/RecipeGrid'
import { useAuth } from '@/context/AuthContext'
import { pageTransition } from '@/lib/animations'
import { subscribeToUserRecipes } from '@/services/recipes'
import {
  MEAL_TIMES,
  MEAL_TIME_LABELS,
  type MealTime,
  type Recipe,
} from '@/types'

type FilterValue = MealTime | 'todas'

export function NotebookPage() {
  const { user, loading: authLoading } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filter, setFilter] = useState<FilterValue>('todas')

  useEffect(() => {
    if (!user) {
      setRecipes([])
      return
    }
    return subscribeToUserRecipes(user.uid, setRecipes)
  }, [user])

  const filtered = useMemo(
    () =>
      filter === 'todas'
        ? recipes
        : recipes.filter((r) => r.mealTimes.includes(filter)),
    [recipes, filter],
  )

  if (!authLoading && !user) {
    return (
      <SignInPrompt message="Inicia sesión para ver y guardar tus recetas." />
    )
  }

  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-5xl px-4 py-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-espresso-700">
            Mi cuaderno
          </h1>
          <p className="mt-2 text-espresso-500/80">
            Tus recetas propias y las que has guardado de TheMealDB.
          </p>
        </div>
        <Link
          to="/mi-cuaderno/nueva"
          className="rounded-full bg-terracotta-500 px-5 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600"
        >
          + Nueva receta
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['todas', ...MEAL_TIMES] as FilterValue[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-terracotta-500 text-cream-50'
                : 'bg-cream-200 text-espresso-600 hover:bg-cream-300'
            }`}
          >
            {value === 'todas' ? 'Todas' : MEAL_TIME_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <RecipeGrid
          recipes={filtered}
          emptyMessage="No hay recetas en este momento del día todavía."
        />
      </div>
    </motion.section>
  )
}

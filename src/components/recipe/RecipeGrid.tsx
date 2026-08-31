import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/animations'
import type { Recipe } from '@/types'
import { RecipeCard } from './RecipeCard'

interface RecipeGridProps {
  recipes: Recipe[]
  emptyMessage?: string
}

export function RecipeGrid({
  recipes,
  emptyMessage = 'Todavía no hay recetas aquí.',
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <p className="py-16 text-center font-body text-espresso-500/70">
        {emptyMessage}
      </p>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </motion.div>
  )
}

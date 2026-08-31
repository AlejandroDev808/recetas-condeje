import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { staggerItem } from '@/lib/animations'
import { MEAL_TIME_LABELS, type Recipe } from '@/types'
import { TiltCard } from './TiltCard'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <motion.div variants={staggerItem}>
      <TiltCard className="group [transform-style:preserve-3d]">
        <Link
          to={`/recetas/${recipe.id}`}
          className="block overflow-hidden rounded-2xl bg-cream-50 shadow-warm-md ring-1 ring-espresso-500/5 transition-shadow duration-300 hover:shadow-warm-lg"
        >
          <div className="relative aspect-4/3 overflow-hidden bg-sage-100">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl text-sage-600">
                {recipe.title.charAt(0)}
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {recipe.mealTimes.map((mealTime) => (
                <span
                  key={mealTime}
                  className="rounded-full bg-espresso-900/70 px-3 py-1 text-xs font-medium text-cream-50 backdrop-blur-sm"
                >
                  {MEAL_TIME_LABELS[mealTime]}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 p-4">
            <h3 className="font-display line-clamp-2 text-xl text-espresso-700">
              {recipe.title}
            </h3>
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs text-sage-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  )
}

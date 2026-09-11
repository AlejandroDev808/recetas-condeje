import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { staggerItem } from '@/lib/animations'
import { useSaveMealDbRecipe } from '@/hooks/useSaveMealDbRecipe'
import type { MealDbResult } from '@/types'
import { TiltCard } from './TiltCard'

interface MealResultCardProps {
  meal: MealDbResult
}

export function MealResultCard({ meal }: MealResultCardProps) {
  const { user, state, savedId, save } = useSaveMealDbRecipe()
  const location = useLocation()

  return (
    <motion.div variants={staggerItem}>
      <TiltCard className="[transform-style:preserve-3d]">
        <div className="overflow-hidden rounded-2xl bg-cream-50 shadow-warm-md ring-1 ring-espresso-500/5">
          <Link to={`/buscar/${meal.idMeal}`} className="block">
            <div className="aspect-4/3 overflow-hidden bg-sage-100">
              {meal.strMealThumb && (
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              )}
            </div>
          </Link>

          <div className="space-y-3 p-4">
            <Link to={`/buscar/${meal.idMeal}`}>
              <h3 className="font-display line-clamp-2 text-xl text-espresso-700 hover:text-terracotta-600">
                {meal.strMeal}
              </h3>
            </Link>

            {state === 'saved' && savedId ? (
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
                className="block w-full rounded-full bg-cream-200 px-4 py-2 text-center text-sm font-medium text-espresso-600 transition-colors hover:bg-cream-300"
              >
                Inicia sesión para guardar
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void save(meal)}
                disabled={state === 'saving'}
                className="w-full rounded-full bg-terracotta-500 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-espresso-500/15 disabled:text-espresso-500/50"
              >
                {state === 'saving'
                  ? 'Guardando…'
                  : state === 'error'
                    ? 'Error al guardar, reintentar'
                    : 'Guardar en mi cuaderno'}
              </button>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}

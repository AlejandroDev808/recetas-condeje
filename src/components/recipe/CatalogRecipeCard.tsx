import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { staggerItem } from '@/lib/animations'
import { areaLabelEs } from '@/lib/areaLabels'
import { categoryLabelEs } from '@/lib/categoryLabels'
import { useSaveStandardRecipe } from '@/hooks/useSaveStandardRecipe'
import type { MealDbMealRaw } from '@/types'
import { FlagIcon } from '@/components/ui/FlagIcon'
import { TiltCard } from './TiltCard'

interface CatalogRecipeCardProps {
  meal: MealDbMealRaw
}

export function CatalogRecipeCard({ meal }: CatalogRecipeCardProps) {
  const { user, state, savedId, save } = useSaveStandardRecipe()
  const location = useLocation()

  return (
    <motion.div variants={staggerItem}>
      <TiltCard className="[transform-style:preserve-3d]">
        <div className="overflow-hidden rounded-2xl bg-cream-50 shadow-warm-md ring-1 ring-espresso-500/5">
          <Link to={`/catalogo/${meal.idMeal}`} className="relative block">
            {meal.strMealThumb ? (
              <div className="aspect-4/3 overflow-hidden bg-sage-100">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 items-center justify-center gap-1.5 bg-sage-100 px-4">
                {meal.strArea && (
                  <>
                    <FlagIcon area={meal.strArea} className="h-5 w-6.5" />
                    <span className="text-center text-sm font-medium text-sage-700/70">
                      {areaLabelEs(meal.strArea)}
                    </span>
                  </>
                )}
              </div>
            )}

            {meal.strMealThumb && meal.strArea && (
              <FlagIcon
                area={meal.strArea}
                className="absolute top-2 right-2 h-5 w-6.5 shadow-warm-md"
              />
            )}
          </Link>

          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {meal.strCategory && (
                <span className="rounded-full bg-terracotta-500/10 px-2.5 py-0.5 text-xs font-medium text-terracotta-700">
                  {categoryLabelEs(meal.strCategory)}
                </span>
              )}
            </div>

            <Link to={`/catalogo/${meal.idMeal}`}>
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

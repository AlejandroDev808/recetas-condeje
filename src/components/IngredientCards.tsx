import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { Ingredient } from '@/types'
import { getIngredientImage } from '@/utils/ingredientImage'

interface IngredientCardsProps {
  ingredients: Ingredient[]
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

// Con prefers-reduced-motion no hay desplazamiento ni stagger perceptible:
// solo un fundido, todas las tarjetas a la vez.
const cardReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
}

/**
 * Cuadrícula 2D pura de tarjetas de ingrediente (sustituye al antiguo
 * carrusel 3D de src/components/three/): sin WebGL, sin flotación ni
 * rotación continuas, solo entrada en stagger y una pequeña elevación al
 * pasar el ratón.
 */
export function IngredientCards({ ingredients }: IngredientCardsProps) {
  const reduceMotion = useReducedMotion()

  if (ingredients.length === 0) return null

  return (
    <motion.ul
      variants={reduceMotion ? undefined : container}
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'show'}
      className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
    >
      {ingredients.map((ingredient, index) => {
        const measure = [ingredient.quantity, ingredient.unit]
          .filter(Boolean)
          .join(' ')

        return (
          <motion.li
            key={`${ingredient.name}-${index}`}
            variants={reduceMotion ? cardReduced : card}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex h-full flex-col items-center rounded-2xl border border-espresso-500/10 bg-cream-50 px-3 py-4 text-center shadow-warm-sm hover:shadow-warm-md"
          >
            <img
              src={getIngredientImage(ingredient.name, ingredient.originalName)}
              alt=""
              loading="lazy"
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <p className="mt-2 line-clamp-2 font-display text-sm leading-snug text-espresso-700">
              {ingredient.name}
            </p>
            <p className="mt-0.5 min-h-[1rem] text-xs text-sage-600">
              {measure || ' '}
            </p>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}

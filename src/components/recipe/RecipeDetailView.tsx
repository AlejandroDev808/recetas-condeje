import { motion } from 'framer-motion'
import { Suspense, lazy, type ReactNode } from 'react'
import { pageTransition } from '@/lib/animations'
import { MEAL_TIME_LABELS, type Ingredient, type MealTime } from '@/types'

// three.js + fiber/drei pesan bastante: se cargan solo cuando se abre una
// receta (guardada o en vista previa), no en el bundle inicial.
const IngredientOrbit = lazy(() =>
  import('@/components/three/IngredientOrbit').then((m) => ({
    default: m.IngredientOrbit,
  })),
)

interface RecipeDetailViewProps {
  title: string
  imageUrl?: string
  mealTimes: MealTime[]
  tags: string[]
  ingredients: Ingredient[]
  steps: string[]
  /** Botonera al pie: "Borrar receta" en las propias, "Guardar" en la vista previa de TheMealDB. */
  actions?: ReactNode
}

/**
 * Presentación pura del detalle de una receta (cabecera, imagen,
 * ingredientes en 3D, pasos). La usan tanto la receta ya guardada en
 * Firestore como la vista previa en vivo de un resultado de TheMealDB
 * todavía sin guardar — ambas comparten el mismo modelo de datos.
 */
export function RecipeDetailView({
  title,
  imageUrl,
  mealTimes,
  tags,
  ingredients,
  steps,
  actions,
}: RecipeDetailViewProps) {
  return (
    <motion.article
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-4xl px-4 py-10"
    >
      <header>
        <div className="flex flex-wrap gap-1.5">
          {mealTimes.map((mealTime) => (
            <span
              key={mealTime}
              className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700"
            >
              {MEAL_TIME_LABELS[mealTime]}
            </span>
          ))}
        </div>
        <h1 className="mt-3 font-display text-4xl text-espresso-700 sm:text-5xl">
          {title}
        </h1>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs text-espresso-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="mt-6 aspect-video w-full rounded-3xl object-cover shadow-warm-lg"
        />
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl text-espresso-700">
          Ingredientes
        </h2>
        {ingredients.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-espresso-500/70">
              Mueve el ratón sobre las tarjetas o haz scroll: flotan y giran
              suavemente.
            </p>
            <Suspense
              fallback={
                <div className="flex h-[420px] items-center justify-center text-espresso-500/50 sm:h-[520px]">
                  Cargando ingredientes…
                </div>
              }
            >
              <IngredientOrbit ingredients={ingredients} />
            </Suspense>
          </>
        ) : (
          <p className="mt-2 text-espresso-500/60">
            Esta receta todavía no tiene ingredientes.
          </p>
        )}
      </section>

      <section className="mt-4">
        <h2 className="font-display text-2xl text-espresso-700">
          Preparación
        </h2>
        {steps.length > 0 ? (
          <ol className="mt-4 space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-500 font-display text-sm text-cream-50">
                  {i + 1}
                </span>
                <p className="pt-1 text-espresso-700">{step}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-espresso-500/60">
            Esta receta todavía no tiene pasos de preparación.
          </p>
        )}
      </section>

      {actions && (
        <div className="mt-10 border-t border-espresso-500/10 pt-6">
          {actions}
        </div>
      )}
    </motion.article>
  )
}

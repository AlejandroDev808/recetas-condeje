import { type FormEvent, useState } from 'react'
import {
  MEAL_TIMES,
  MEAL_TIME_LABELS,
  type Ingredient,
  type MealTime,
  type RecipeDraft,
} from '@/types'

interface RecipeFormProps {
  initialValues?: RecipeDraft
  submitLabel: string
  submitting?: boolean
  onSubmit: (draft: RecipeDraft) => void | Promise<void>
}

const EMPTY_INGREDIENT: Ingredient = { name: '', quantity: '', unit: '' }

const inputClass =
  'w-full rounded-xl border border-espresso-500/15 bg-cream-50 px-4 py-2.5 text-espresso-700 placeholder:text-espresso-500/40 focus:border-terracotta-400 focus:outline-none'

export function RecipeForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialValues?.ingredients.length
      ? initialValues.ingredients
      : [{ ...EMPTY_INGREDIENT }],
  )
  const [steps, setSteps] = useState<string[]>(
    initialValues?.steps.length ? initialValues.steps : [''],
  )
  const [mealTimes, setMealTimes] = useState<MealTime[]>(
    initialValues?.mealTimes ?? [],
  )
  const [error, setError] = useState<string | null>(null)

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)),
    )
  }

  function toggleMealTime(mealTime: MealTime) {
    setMealTimes((prev) =>
      prev.includes(mealTime)
        ? prev.filter((m) => m !== mealTime)
        : [...prev, mealTime],
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const cleanIngredients = ingredients
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
        unit: ing.unit.trim(),
      }))
      .filter((ing) => ing.name)
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean)

    if (!title.trim()) {
      setError('Ponle un título a la receta.')
      return
    }
    if (cleanIngredients.length === 0) {
      setError('Añade al menos un ingrediente con nombre.')
      return
    }
    if (cleanSteps.length === 0) {
      setError('Añade al menos un paso de preparación.')
      return
    }
    if (mealTimes.length === 0) {
      setError('Elige al menos un momento del día.')
      return
    }

    void onSubmit({
      title: title.trim(),
      imageUrl: imageUrl.trim() || undefined,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      mealTimes,
      tags: initialValues?.tags ?? [],
      source: initialValues?.source ?? 'own',
      sourceId: initialValues?.sourceId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso-700">
            Título
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="p. ej. Lentejas de mi abuela"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso-700">
            Imagen (URL, opcional)
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso-700">
            Momento del día
          </label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TIMES.map((mealTime) => (
              <button
                key={mealTime}
                type="button"
                onClick={() => toggleMealTime(mealTime)}
                aria-pressed={mealTimes.includes(mealTime)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  mealTimes.includes(mealTime)
                    ? 'bg-terracotta-500 text-cream-50'
                    : 'bg-cream-200 text-espresso-600 hover:bg-cream-300'
                }`}
              >
                {MEAL_TIME_LABELS[mealTime]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-espresso-500/60">
            Puedes elegir más de uno (p. ej. Desayuno y Merienda).
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-espresso-700">
          Ingredientes
        </label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ing.name}
                onChange={(e) =>
                  updateIngredient(i, { name: e.target.value })
                }
                placeholder="Ingrediente"
                className={`${inputClass} flex-[2]`}
              />
              <input
                value={ing.quantity}
                onChange={(e) =>
                  updateIngredient(i, { quantity: e.target.value })
                }
                placeholder="Cantidad"
                className={`${inputClass} flex-1`}
              />
              <input
                value={ing.unit}
                onChange={(e) =>
                  updateIngredient(i, { unit: e.target.value })
                }
                placeholder="Unidad"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) => prev.filter((_, j) => j !== i))
                }
                aria-label="Quitar ingrediente"
                className="shrink-0 rounded-xl border border-espresso-500/15 px-3 text-espresso-500 transition-colors hover:border-terracotta-400 hover:text-terracotta-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }])
          }
          className="mt-3 text-sm font-medium text-terracotta-600 hover:text-terracotta-700"
        >
          + Añadir ingrediente
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-espresso-700">
          Pasos de preparación
        </label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-10 w-8 shrink-0 items-center justify-center font-display text-sm text-espresso-500/60">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) =>
                  setSteps((prev) =>
                    prev.map((s, j) => (j === i ? e.target.value : s)),
                  )
                }
                placeholder="Describe este paso"
                rows={2}
                className={`${inputClass} resize-y`}
              />
              <button
                type="button"
                onClick={() =>
                  setSteps((prev) => prev.filter((_, j) => j !== i))
                }
                aria-label="Quitar paso"
                className="h-10 shrink-0 rounded-xl border border-espresso-500/15 px-3 text-espresso-500 transition-colors hover:border-terracotta-400 hover:text-terracotta-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, ''])}
          className="mt-3 text-sm font-medium text-terracotta-600 hover:text-terracotta-700"
        >
          + Añadir paso
        </button>
      </div>

      {error && <p className="text-sm text-terracotta-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-terracotta-500 px-6 py-3 font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}

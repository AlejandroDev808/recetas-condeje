import { getIngredientIcon, type IngredientIconCategory } from '@/data/ingredientIcons'
import { INGREDIENT_ALIASES } from '@/data/ingredientAliases'
import { INGREDIENT_IMAGE_SLUGS } from '@/data/ingredientManifest'
import { normalizeIngredientName, slugify } from './ingredientSlug'

const MANIFEST = new Set(INGREDIENT_IMAGE_SLUGS)

/**
 * Fondo del círculo del emoji según categoría, con la paleta
 * terracota/crema/salvia de la app (ver src/index.css): carne y salsas en
 * terracota, verduras y hierbas en salvia, lácteos y cereales en crema, el
 * resto (pescado, fruta, especia, legumbre, líquido, dulce, otros) en un
 * tono neutro.
 */
const CATEGORY_BACKGROUND: Partial<Record<IngredientIconCategory, string>> = {
  carne: '#d97a52', // terracotta-400
  salsa: '#d97a52',
  verdura: '#b9c6a4', // sage-300
  hierba: '#b9c6a4',
  lacteo: '#ecd4b8', // cream-300
  cereal: '#ecd4b8',
}
const NEUTRAL_BACKGROUND = '#fbf3e7' // cream-50/100, tono neutro para "el resto"

export function categoryBackground(category: IngredientIconCategory): string {
  return CATEGORY_BACKGROUND[category] ?? NEUTRAL_BACKGROUND
}

function slugFor(name: string): string {
  const normalized = normalizeIngredientName(name)
  return INGREDIENT_ALIASES[normalized] ?? slugify(normalized)
}

export type IngredientVisual =
  | { kind: 'image'; src: string }
  | { kind: 'emoji'; icon: string; category: IngredientIconCategory }

/**
 * Resuelve qué mostrar para un ingrediente, en orden de preferencia:
 *   1. Foto propia en public/ingredients/{slug}.webp, si su slug está en
 *      el manifiesto (src/data/ingredientManifest.ts) — evita depender de
 *      una petición de red que puede fallar (404) mientras se completa la
 *      colección de fotos.
 *   2. Icono de TheMealDB a partir del nombre original en inglés, si se
 *      conoce (`originalName`, ver types/recipe.ts).
 *   3. Emoji acorde al ingrediente (src/data/ingredientIcons.ts), sobre un
 *      fondo de color según categoría.
 *   4. Si nada de lo anterior aplica, el propio getIngredientIcon ya
 *      devuelve un emoji neutro de comida (🍽️).
 *
 * `name` es el nombre mostrado en la tarjeta (español, propio o
 * traducido); `originalName` es el nombre en inglés tal cual lo da
 * TheMealDB, cuando existe.
 */
export function getIngredientImage(
  name: string,
  originalName?: string,
): IngredientVisual {
  const slug = slugFor(name)
  if (slug && MANIFEST.has(slug)) {
    return { kind: 'image', src: `/ingredients/${slug}.webp` }
  }

  if (originalName) {
    const originalSlug = slugFor(originalName)
    if (originalSlug && MANIFEST.has(originalSlug)) {
      return { kind: 'image', src: `/ingredients/${originalSlug}.webp` }
    }
    return {
      kind: 'image',
      src: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(originalName)}-Small.png`,
    }
  }

  const { icon, category } = getIngredientIcon(name)
  return { kind: 'emoji', icon, category }
}

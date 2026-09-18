import { INGREDIENT_ALIASES } from '@/data/ingredientAliases'
import { INGREDIENT_IMAGE_SLUGS } from '@/data/ingredientManifest'
import { normalizeIngredientName, slugify } from './ingredientSlug'

const MANIFEST = new Set(INGREDIENT_IMAGE_SLUGS)

/**
 * Paleta terracota/crema/salvia (ver src/index.css) usada para los
 * placeholders. Se elige un color de forma determinista según el nombre
 * del ingrediente, así el mismo ingrediente siempre recibe el mismo color
 * entre renders.
 */
const PLACEHOLDER_PALETTE: { bg: string; fg: string }[] = [
  { bg: '#d97a52', fg: '#fffdf8' }, // terracotta-400
  { bg: '#7c8b6f', fg: '#fffdf8' }, // sage-500
  { bg: '#ecd4b8', fg: '#2e1f18' }, // cream-300
  { bg: '#a13e22', fg: '#fffdf8' }, // terracotta-600
  { bg: '#b9c6a4', fg: '#2e1f18' }, // sage-300
]

function hashString(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function slugFor(name: string): string {
  const normalized = normalizeIngredientName(name)
  return INGREDIENT_ALIASES[normalized] ?? slugify(normalized)
}

/**
 * Placeholder propio en SVG (sin peticiones de red): un círculo de color de
 * la paleta de la app con la inicial del ingrediente, para cuando no hay ni
 * foto propia ni icono de TheMealDB.
 */
function placeholderImage(name: string): string {
  const initial = (name.trim().charAt(0) || '?').toLocaleUpperCase('es-ES')
  const { bg, fg } = PLACEHOLDER_PALETTE[hashString(name) % PLACEHOLDER_PALETTE.length]

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="32" fill="${bg}"/>` +
    `<text x="32" y="32" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="${fg}">${initial}</text>` +
    `</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Resuelve la imagen a mostrar para un ingrediente, en orden de
 * preferencia:
 *   1. Foto propia en public/ingredients/{slug}.webp, si su slug está en
 *      el manifiesto (src/data/ingredientManifest.ts) — evita depender de
 *      una petición de red que puede fallar (404) mientras se completa la
 *      colección de fotos.
 *   2. Icono de TheMealDB a partir del nombre original en inglés, si se
 *      conoce (`originalName`, ver types/recipe.ts).
 *   3. Placeholder propio: inicial del ingrediente sobre un color de la
 *      paleta terracota/crema/salvia.
 *
 * `name` es el nombre mostrado en la tarjeta (español, propio o
 * traducido); `originalName` es el nombre en inglés tal cual lo da
 * TheMealDB, cuando existe.
 */
export function getIngredientImage(name: string, originalName?: string): string {
  const slug = slugFor(name)
  if (slug && MANIFEST.has(slug)) {
    return `/ingredients/${slug}.webp`
  }

  if (originalName) {
    const originalSlug = slugFor(originalName)
    if (originalSlug && MANIFEST.has(originalSlug)) {
      return `/ingredients/${originalSlug}.webp`
    }
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(originalName)}-Small.png`
  }

  return placeholderImage(name)
}

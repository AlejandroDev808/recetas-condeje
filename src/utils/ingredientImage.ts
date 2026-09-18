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
 * Placeholder propio en SVG (sin peticiones de red): un cuenco humeante
 * genérico sobre un color de la paleta de la app, para cuando no hay ni
 * foto propia ni icono de TheMealDB. A propósito NO es un círculo con la
 * inicial: con tantos ingredientes distintos, un círculo-inicial se lee
 * como un avatar de usuario, no como comida.
 */
function placeholderImage(name: string): string {
  const { bg, fg } = PLACEHOLDER_PALETTE[hashString(name) % PLACEHOLDER_PALETTE.length]

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="16" fill="${bg}"/>` +
    // Cuenco: medio círculo + borde superior.
    `<path d="M16 33a16 16 0 0 0 32 0z" fill="none" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="14" y1="33" x2="50" y2="33" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>` +
    // Vapor: dos trazos ondulados encima del cuenco.
    `<path d="M25 21c-2.5-3 2.5-3 0-6" fill="none" stroke="${fg}" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>` +
    `<path d="M35 21c-2.5-3 2.5-3 0-6" fill="none" stroke="${fg}" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>` +
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

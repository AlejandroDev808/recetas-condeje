import * as THREE from 'three'
import type { IngredientIconCategory, IngredientIconRef } from './ingredientIcons'

// Commit fijado (en vez de @master) para que un cambio futuro en el repo de
// game-icons.net no pueda romper silenciosamente los iconos ya mapeados.
const ICONS_BASE =
  'https://cdn.jsdelivr.net/gh/game-icons/icons@82d948812bfe3f269ef8f731dcdb07b08160edc4'

const TEXTURE_SIZE = 256

interface CategoryPalette {
  background: string
  icon: string
}

// Paleta tomada de los colores de marca (terracota/salvia/mostaza/espresso/
// crema) ya usados en el resto de la UI, para que los "slots de item" no
// desentonen con el look general de la app.
const CATEGORY_PALETTE: Record<IngredientIconCategory, CategoryPalette> = {
  protein: { background: '#a13e22', icon: '#fffdf8' },
  vegetable: { background: '#5f6d54', icon: '#fffdf8' },
  fruit: { background: '#cf9328', icon: '#2e1f18' },
  dairy: { background: '#ecd4b8', icon: '#4a3529' },
  spice: { background: '#7c301b', icon: '#fffdf8' },
  herb: { background: '#b9c6a4', icon: '#2e1f18' },
  grain: { background: '#e0a940', icon: '#2e1f18' },
  liquid: { background: '#2e1f18', icon: '#f5e6d3' },
  other: { background: '#d97a52', icon: '#fffdf8' },
}

function iconUrl(ref: IngredientIconRef): string {
  return `${ICONS_BASE}/${ref.author}/${ref.slug}.svg`
}

/**
 * Los SVG en bruto de game-icons.net son "fondo cuadrado negro a sangre +
 * silueta blanca" (pensados para recolorear al consumirlos). Se quita el
 * fondo y se tiñe la silueta con el color de la categoría antes de
 * rasterizarla, y se fuerza width/height explícitos para que el <img> la
 * decodifique siempre a 512×512 (si no, el tamaño intrínseco por defecto
 * del navegador para un SVG sin width/height puede variar).
 */
function prepareSvgMarkup(rawSvg: string, iconColor: string): string {
  return rawSvg
    .replace('<svg ', '<svg width="512" height="512" ')
    .replace('<path d="M0 0h512v512H0z"/>', '')
    .replace('fill="#fff"', `fill="${iconColor}"`)
}

function loadSvgImage(svgMarkup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`No se pudo decodificar el SVG del icono`))
    }
    img.src = url
  })
}

/** Dibuja el "item de inventario": círculo de color de categoría, contorno
 * oscuro sutil y el icono centrado encima. */
function drawIconCanvas(
  icon: HTMLImageElement,
  palette: CategoryPalette,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener contexto 2D de canvas')

  const cx = TEXTURE_SIZE / 2
  const cy = TEXTURE_SIZE / 2
  const radius = TEXTURE_SIZE * 0.42

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = palette.background
  ctx.fill()
  ctx.lineWidth = TEXTURE_SIZE * 0.035
  ctx.strokeStyle = 'rgba(28, 19, 14, 0.45)'
  ctx.stroke()

  const iconSize = radius * 1.2
  ctx.drawImage(icon, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize)

  return canvas
}

async function fetchIconTexture(
  ref: IngredientIconRef,
): Promise<THREE.CanvasTexture> {
  const res = await fetch(iconUrl(ref))
  if (!res.ok) {
    throw new Error(`No se pudo descargar el icono ${ref.author}/${ref.slug}`)
  }
  const rawSvg = await res.text()
  const palette = CATEGORY_PALETTE[ref.category]
  const svgMarkup = prepareSvgMarkup(rawSvg, palette.icon)
  const image = await loadSvgImage(svgMarkup)
  const canvas = drawIconCanvas(image, palette)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

type CacheEntry =
  | { status: 'pending'; promise: Promise<THREE.CanvasTexture> }
  | { status: 'resolved'; texture: THREE.CanvasTexture }
  | { status: 'rejected'; error: unknown }

const textureCache = new Map<string, CacheEntry>()

function cacheKey(ref: IngredientIconRef): string {
  return `${ref.author}/${ref.slug}::${ref.category}`
}

function ensureEntry(ref: IngredientIconRef): CacheEntry {
  const key = cacheKey(ref)
  const existing = textureCache.get(key)
  if (existing) return existing

  const promise = fetchIconTexture(ref).then(
    (texture) => {
      textureCache.set(key, { status: 'resolved', texture })
      return texture
    },
    (error: unknown) => {
      textureCache.set(key, { status: 'rejected', error })
      throw error
    },
  )
  const entry: CacheEntry = { status: 'pending', promise }
  textureCache.set(key, entry)
  return entry
}

/** Arranca (sin esperar) la descarga de un lote de iconos, para que cuando
 * cada <IconSprite> los lea por Suspense ya estén en vuelo en paralelo en
 * vez de encadenarse uno detrás de otro. */
export function preloadIconTextures(refs: IngredientIconRef[]): void {
  for (const ref of refs) ensureEntry(ref)
}

/**
 * Lectura "suspendible" al estilo de drei's useTexture: si la textura no
 * está lista todavía, lanza la promesa para que la capture el <Suspense>
 * más cercano; React vuelve a montar el componente cuando resuelve.
 */
export function readIconTexture(ref: IngredientIconRef): THREE.CanvasTexture {
  const entry = ensureEntry(ref)
  if (entry.status === 'resolved') return entry.texture
  if (entry.status === 'rejected') throw entry.error
  throw entry.promise
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Medio-ancho / medio-alto aproximados del "item" completo (sprite de
// icono + sombra + tarjeta de texto) en unidades de mundo. Se usan como
// radios de una elipse para detectar cuándo dos tarjetas quedan
// demasiado cerca, ya sean vecinas en el mismo anillo o en anillos
// distintos de la espiral.
const CARD_HALF_WIDTH = 1.3
const CARD_HALF_HEIGHT = 1.15
// Separación mínima en "distancia normalizada" (1 = elipses tocándose por
// el borde); >1 deja un pequeño margen de aire entre tarjetas.
const MIN_SEPARATION = 1.15
const RELAXATION_ITERATIONS = 60

/**
 * Distribución tipo "filotaxis" (patrón de semillas de girasol): reparte N
 * puntos en una espiral sin apenas solapes y con densidad creciente hacia
 * fuera, mucho más orgánica que una grid. Se usa para colocar las tarjetas
 * de ingredientes en el espacio 3D.
 *
 * La fórmula de filotaxis por sí sola distribuye puntos (no rectángulos)
 * de forma uniforme por densidad, pero no sabe nada del tamaño real de
 * cada tarjeta: con recetas de muchos ingredientes, los anillos internos
 * quedan demasiado juntos y las tarjetas se solapan. Por eso, tras generar
 * la espiral, se aplica una relajación de colisiones simple que separa
 * cualquier par de tarjetas más cerca de lo que ocuparían sus "cajas".
 */
export function spiralPositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = []

  for (let i = 0; i < count; i += 1) {
    const radius = 1.35 * Math.sqrt(i + 1)
    const angle = i * GOLDEN_ANGLE
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle) * 0.72
    const z = (i % 2 === 0 ? 1 : -1) * 0.3 * Math.sqrt(i)
    positions.push([x, y, z])
  }

  relaxCollisions(positions)

  return positions
}

/**
 * Empuja pares de tarjetas que queden más cerca que `MIN_SEPARATION`
 * (aproximando cada una como una elipse) hasta separarlas, iterando varias
 * veces para que los ajustes se propaguen entre vecinos. Solo toca x/y (el
 * plano de la pantalla): la z se deja tal cual, ya que solo aporta
 * profundidad/paralaje, no evita el solape visual.
 */
function relaxCollisions(positions: [number, number, number][]): void {
  for (let iter = 0; iter < RELAXATION_ITERATIONS; iter += 1) {
    let moved = false

    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i]
        const b = positions[j]
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const nx = dx / CARD_HALF_WIDTH
        const ny = dy / CARD_HALF_HEIGHT
        const dist = Math.hypot(nx, ny)

        if (dist >= MIN_SEPARATION) continue

        // Posiciones casi idénticas: no hay dirección clara en la que
        // separarlas, así que se usa una determinista (evita NaN por
        // dividir entre una distancia ~0 sin depender de Math.random).
        const dirX = dist > 1e-4 ? nx / dist : 1
        const dirY = dist > 1e-4 ? ny / dist : 0
        const overlap = MIN_SEPARATION - dist

        const moveX = dirX * overlap * 0.5 * CARD_HALF_WIDTH
        const moveY = dirY * overlap * 0.5 * CARD_HALF_HEIGHT

        a[0] -= moveX
        a[1] -= moveY
        b[0] += moveX
        b[1] += moveY
        moved = true
      }
    }

    if (!moved) break
  }
}

/** Radio (en el plano x/y) que ocupa la espiral ya resuelta; se usa para
 * alejar la cámara lo justo y que quepan recetas con muchos ingredientes
 * sin apretarlas ni dejar de más espacio vacío en recetas pequeñas. */
export function boundingRadius(positions: [number, number, number][]): number {
  let max = 0
  for (const [x, y] of positions) {
    const r = Math.hypot(x, y)
    if (r > max) max = r
  }
  return max
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Medio-ancho / medio-alto aproximados del "item" completo (sprite de
// icono + sombra + tarjeta de texto) en unidades de mundo. Se usan como
// radios de una elipse para detectar cuándo dos tarjetas quedan
// demasiado cerca, ya sean vecinas en el mismo anillo o en anillos
// distintos de la espiral, y también para calcular a qué distancia debe
// alejarse la cámara para que ninguna tarjeta quede cortada por el borde
// del lienzo (ver fitCameraDistance).
export const CARD_HALF_WIDTH = 1.3
export const CARD_HALF_HEIGHT = 1.15
// Aire extra (unidades de mundo) más allá del propio borde de la tarjeta,
// para que no quede pegada al límite exacto del frustum de la cámara.
const CAMERA_FIT_MARGIN = 0.15
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

/**
 * Distancia mínima de cámara (eje z) para la que ninguna tarjeta —
 * contando su propio ancho/alto, no solo su punto central— queda fuera del
 * frustum de una cámara en perspectiva con el `fov` (vertical, en grados) y
 * `aspect` (ancho/alto del lienzo) dados.
 *
 * El ancho del contenedor cambia mucho entre un móvil estrecho (~380-420px)
 * y una pantalla de escritorio: con el mismo fov vertical, un aspect más
 * estrecho reduce el campo de visión horizontal en unidades de mundo, así
 * que la espiral (más ancha que alta) que cabía de sobra en desktop puede
 * salirse por los lados en móvil. Por eso este cálculo, a diferencia del
 * antiguo boundingRadius (isótropo, ajeno al aspect), se recalcula con el
 * aspect real del lienzo — ver CameraFit en IngredientScene.
 */
export function fitCameraDistance(
  positions: [number, number, number][],
  aspect: number,
  fovDegrees: number,
): number {
  const halfFovRad = (fovDegrees / 2) * (Math.PI / 180)
  const tanHalfFov = Math.tan(halfFovRad)

  let required = 0
  for (const [x, y, z] of positions) {
    const halfWidth = Math.abs(x) + CARD_HALF_WIDTH + CAMERA_FIT_MARGIN
    const halfHeight = Math.abs(y) + CARD_HALF_HEIGHT + CAMERA_FIT_MARGIN
    // Distancia (a lo largo del eje de la cámara) a la que esta tarjeta
    // concreta tocaría justo el borde horizontal o vertical del frustum,
    // más su propia z: la cámara mira hacia -z, así que una tarjeta con z
    // positivo (más cerca de la cámara) necesita más distancia extra para
    // compensar que ya "adelanta" terreno.
    const depthForWidth = halfWidth / (tanHalfFov * aspect)
    const depthForHeight = halfHeight / tanHalfFov
    const neededZ = Math.max(depthForWidth, depthForHeight) + z
    if (neededZ > required) required = neededZ
  }
  return required
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Distribución tipo "filotaxis" (patrón de semillas de girasol): reparte N
 * puntos en una espiral sin apenas solapes y con densidad creciente hacia
 * fuera, mucho más orgánica que una grid. Se usa para colocar las tarjetas
 * de ingredientes en el espacio 3D.
 */
export function spiralPositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = []

  for (let i = 0; i < count; i += 1) {
    const radius = 0.95 * Math.sqrt(i + 1)
    const angle = i * GOLDEN_ANGLE
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle) * 0.6
    const z = (i % 2 === 0 ? 1 : -1) * 0.3 * Math.sqrt(i)
    positions.push([x, y, z])
  }

  return positions
}

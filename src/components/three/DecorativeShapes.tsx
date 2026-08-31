import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

type ShapeKind = 'icosahedron' | 'torus' | 'sphere'

interface ShapeSpec {
  position: [number, number, number]
  color: string
  geometry: ShapeKind
}

// Colores tomados directamente de la paleta de Tailwind (terracota, salvia,
// mostaza) para que las formas decorativas no desentonen con el resto de la UI.
const SHAPES: ShapeSpec[] = [
  { position: [-3.4, 1.6, -2], color: '#c1502e', geometry: 'icosahedron' },
  { position: [3.6, -1.3, -1.6], color: '#7c8b6f', geometry: 'torus' },
  { position: [-2.8, -2.2, -2.4], color: '#cf9328', geometry: 'sphere' },
  { position: [3, 2.4, -2.2], color: '#5f6d54', geometry: 'icosahedron' },
]

function Shape({ position, color, geometry }: ShapeSpec) {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.15
    ref.current.rotation.y += delta * 0.22
  })

  return (
    <Float speed={1} floatIntensity={1.1} rotationIntensity={0}>
      <mesh ref={ref} position={position} scale={0.32}>
        {geometry === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
        {geometry === 'torus' && <torusGeometry args={[0.7, 0.28, 8, 20]} />}
        {geometry === 'sphere' && <sphereGeometry args={[1, 16, 16]} />}
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </Float>
  )
}

/** Un puñado de sólidos flotando de fondo: le da profundidad real de
 * geometría 3D a la escena, no solo tarjetas HTML proyectadas. */
export function DecorativeShapes() {
  return (
    <>
      {SHAPES.map((shape) => (
        <Shape key={shape.position.join(',')} {...shape} />
      ))}
    </>
  )
}

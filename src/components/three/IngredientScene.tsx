import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScrollPositionRef } from '@/hooks/useScrollPosition'
import { preloadIconTextures } from '@/lib/gameIconTexture'
import { resolveIngredientIcon } from '@/lib/ingredientIcons'
import { fitCameraDistance } from '@/lib/spiralLayout'
import type { Ingredient } from '@/types'
import { FloatingIngredient } from './FloatingIngredient'

interface IngredientSceneProps {
  ingredients: Ingredient[]
  /** Calculadas en IngredientOrbit (no aquí) para poder alejar la cámara
   * según lo que ocupen antes de montar el <Canvas>. */
  positions: [number, number, number][]
}

/**
 * Aleja (o acerca) la cámara para que ninguna tarjeta quede cortada por el
 * borde del lienzo, recalculando con el aspect ratio *real* del `<Canvas>`
 * — a diferencia del fov/posición inicial fijados en IngredientOrbit antes
 * de montar, aquí ya se conoce el tamaño real en píxeles del contenedor
 * (distinto en un móvil estrecho que en desktop), así que se corrige en
 * cuanto el lienzo mide o cambia de tamaño (p. ej. al rotar el dispositivo).
 */
function CameraFit({ positions }: { positions: [number, number, number][] }) {
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || height === 0) return
    const distance = fitCameraDistance(positions, width / height, camera.fov)
    // Mutación intencional: react-three-fiber expone la cámara viva de
    // three.js vía useThree precisamente para tocarla así, no como estado.
    // oxlint-disable-next-line react/immutability
    camera.position.z = distance
    camera.updateProjectionMatrix()
  }, [camera, width, height, positions])

  return null
}

export function IngredientScene({ ingredients, positions }: IngredientSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const scrollY = useScrollPositionRef()

  // Precarga solo los iconos de esta receta (no el set completo de
  // game-icons.net), y los deduplica: varios ingredientes pueden resolver
  // al mismo icono (p. ej. dos hierbas distintas sin match específico).
  useEffect(() => {
    const refs = new Map(
      ingredients.map((ingredient) => {
        // Igual que en FloatingIngredient: el icono se resuelve por el
        // nombre en inglés original, no por el traducido.
        const ref = resolveIngredientIcon(
          ingredient.originalName ?? ingredient.name,
        )
        return [`${ref.author}/${ref.slug}`, ref] as const
      }),
    )
    preloadIconTextures([...refs.values()])
  }, [ingredients])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const target = THREE.MathUtils.clamp(scrollY.current * 0.0006, -0.35, 0.35)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, 0.06)
  })

  return (
    <group ref={groupRef}>
      <CameraFit positions={positions} />
      {ingredients.map((ingredient, i) => (
        <FloatingIngredient
          key={`${ingredient.name}-${i}`}
          ingredient={ingredient}
          position={positions[i]}
          index={i}
        />
      ))}
    </group>
  )
}

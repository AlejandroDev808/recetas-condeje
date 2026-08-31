import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScrollPositionRef } from '@/hooks/useScrollPosition'
import { preloadIconTextures } from '@/lib/gameIconTexture'
import { resolveIngredientIcon } from '@/lib/ingredientIcons'
import type { Ingredient } from '@/types'
import { FloatingIngredient } from './FloatingIngredient'

interface IngredientSceneProps {
  ingredients: Ingredient[]
  /** Calculadas en IngredientOrbit (no aquí) para poder alejar la cámara
   * según lo que ocupen antes de montar el <Canvas>. */
  positions: [number, number, number][]
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
        const ref = resolveIngredientIcon(ingredient.name)
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

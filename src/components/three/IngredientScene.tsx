import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScrollPositionRef } from '@/hooks/useScrollPosition'
import { spiralPositions } from '@/lib/spiralLayout'
import type { Ingredient } from '@/types'
import { DecorativeShapes } from './DecorativeShapes'
import { FloatingIngredient } from './FloatingIngredient'

interface IngredientSceneProps {
  ingredients: Ingredient[]
}

export function IngredientScene({ ingredients }: IngredientSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const scrollY = useScrollPositionRef()
  const positions = useMemo(
    () => spiralPositions(ingredients.length),
    [ingredients.length],
  )

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const target = THREE.MathUtils.clamp(scrollY.current * 0.0006, -0.35, 0.35)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, 0.06)
  })

  return (
    <group ref={groupRef}>
      <DecorativeShapes />
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

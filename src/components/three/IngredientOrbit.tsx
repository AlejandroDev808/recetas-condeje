import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { Ingredient } from '@/types'
import { IngredientScene } from './IngredientScene'

interface IngredientOrbitProps {
  ingredients: Ingredient[]
}

/**
 * Punto de entrada al lienzo 3D de la vista de detalle. Un <Canvas> por
 * cada montaje: React Three Fiber gestiona su propio render loop y libera
 * el contexto WebGL al desmontar, así que no hace falta singletons.
 */
export function IngredientOrbit({ ingredients }: IngredientOrbitProps) {
  if (ingredients.length === 0) return null

  return (
    <div className="h-[420px] w-full touch-pan-y sm:h-[520px]">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 6]} intensity={0.6} />
        <Suspense fallback={null}>
          <IngredientScene ingredients={ingredients} />
        </Suspense>
      </Canvas>
    </div>
  )
}

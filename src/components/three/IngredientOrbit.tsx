import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { boundingRadius, spiralPositions } from '@/lib/spiralLayout'
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
  // Se calculan aquí (no dentro de IngredientScene) para poder alejar la
  // cámara según lo que ocupe la espiral antes de montar el <Canvas>.
  const positions = useMemo(
    () => spiralPositions(ingredients.length),
    [ingredients.length],
  )
  const cameraZ = useMemo(() => {
    const radius = boundingRadius(positions)
    // 9 es la distancia original (recetas pequeñas); crece con el radio
    // real de la espiral para que las recetas con muchos ingredientes no
    // queden apretadas contra los bordes del lienzo, con un tope para no
    // alejar tanto que los sprites se vean minúsculos.
    return Math.min(17, Math.max(9, radius * 2.5))
  }, [positions])

  if (ingredients.length === 0) return null

  return (
    <div className="h-[420px] w-full touch-pan-y sm:h-[520px]">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 6]} intensity={0.6} />
        <Suspense fallback={null}>
          <IngredientScene ingredients={ingredients} positions={positions} />
        </Suspense>
      </Canvas>
    </div>
  )
}

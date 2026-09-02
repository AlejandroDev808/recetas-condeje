import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { spiralPositions } from '@/lib/spiralLayout'
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
  const positions = useMemo(
    () => spiralPositions(ingredients.length),
    [ingredients.length],
  )

  if (ingredients.length === 0) return null

  return (
    // overflow-hidden es imprescindible: drei's <Html transform> proyecta
    // las tarjetas de ingredientes como elementos DOM reales posicionados
    // por matriz 3D, y en viewports estrechos/altos (móvil) esa proyección
    // puede colocarlas miles de píxeles fuera del lienzo — sin recorte,
    // eso se traduce en scroll horizontal de toda la página.
    <div className="h-[420px] w-full touch-pan-y overflow-hidden sm:h-[520px]">
      <Canvas
        // Posición inicial de arranque: IngredientScene la corrige de
        // inmediato (antes de pintar) con el aspect ratio real del lienzo,
        // ver CameraFit — imprescindible en móvil, donde el contenedor es
        // mucho más estrecho que en desktop y una distancia fija dejaría
        // tarjetas cortadas por los bordes.
        camera={{ position: [0, 0, 9], fov: 42 }}
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

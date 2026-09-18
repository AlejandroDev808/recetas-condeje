import { Float, Html } from '@react-three/drei'
import { Suspense, useState } from 'react'
import type { Ingredient } from '@/types'
import { getIngredientImage } from '@/utils/ingredientImage'
import { IconSprite } from './IconSprite'

interface FloatingIngredientProps {
  ingredient: Ingredient
  position: [number, number, number]
  index: number
}

export function FloatingIngredient({
  ingredient,
  position,
  index,
}: FloatingIngredientProps) {
  const [hovered, setHovered] = useState(false)
  const measure = [ingredient.quantity, ingredient.unit]
    .filter(Boolean)
    .join(' ')

  return (
    <Float
      speed={1.1 + (index % 5) * 0.15}
      floatIntensity={0.55 + (index % 3) * 0.2}
      floatingRange={[-0.18, 0.18]}
      rotationIntensity={hovered ? 0.9 : 0.35}
    >
      <group position={position}>
        <group position={[0, 1.05, 0]}>
          <Suspense fallback={null}>
            {/* El icono siempre se elige por el nombre en inglés original
                (aunque la tarjeta de abajo muestre el nombre traducido):
                las reglas de ingredientIcons.ts buscan palabras clave en
                inglés. */}
            <IconSprite
              ingredientName={ingredient.originalName ?? ingredient.name}
            />
          </Suspense>
        </group>

        {/* transform: proyecta el HTML como un plano con transform 3D real
            (no un billboard plano), así el giro de <Float> se ve en la
            tarjeta en vez de quedar "pegado" siempre de cara a cámara. */}
        <Html transform distanceFactor={4.2} occlude={false}>
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-espresso-500/10 bg-cream-50/95 px-3 py-2.5 text-center shadow-warm-md backdrop-blur-sm transition-transform duration-200 select-none hover:scale-105"
          >
            {/* Tamaño fijo (w-12 h-12) para que la tarjeta no salte de
                layout mientras la imagen carga; loading="lazy" porque puede
                haber muchas tarjetas fuera de la vista inicial en recetas
                con muchos ingredientes. */}
            <img
              src={getIngredientImage(ingredient.name, ingredient.originalName)}
              alt=""
              loading="lazy"
              width={48}
              height={48}
              className="mx-auto mb-1.5 h-12 w-12 rounded-full object-cover"
            />
            <p className="font-display text-sm leading-snug text-espresso-700">
              {ingredient.name}
            </p>
            {measure && (
              <p className="mt-0.5 text-xs text-sage-600">{measure}</p>
            )}
          </div>
        </Html>
      </group>
    </Float>
  )
}

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readIconTexture } from '@/lib/gameIconTexture'
import { resolveIngredientIcon } from '@/lib/ingredientIcons'

interface IconSpriteProps {
  ingredientName: string
}

function createRadialTexture(rgb: string, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener contexto 2D de canvas')

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, `rgba(${rgb}, 0.9)`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Texturas de degradado compartidas por todos los sprites (no dependen del
// ingrediente): una sola instancia para toda la escena.
const SHADOW_TEXTURE = createRadialTexture('20, 14, 10')
const GLOW_TEXTURE = createRadialTexture('245, 201, 107')

/**
 * Representa un ingrediente como un "item de inventario": icono de
 * game-icons.net recoloreado sobre un plano con textura (billboard, un
 * <sprite> de Three.js siempre mira a cámara sin cálculo manual), con
 * sombra proyectada debajo y un glow que aparece al hacer hover.
 *
 * Suspende (lanza la promesa de `readIconTexture`) hasta que la textura del
 * icono esté lista; el componente padre debe envolverlo en <Suspense>.
 */
export function IconSprite({ ingredientName }: IconSpriteProps) {
  const iconRef = useMemo(
    () => resolveIngredientIcon(ingredientName),
    [ingredientName],
  )
  const texture = readIconTexture(iconRef)

  const [hovered, setHovered] = useState(false)
  const glowRef = useRef<THREE.Sprite>(null)

  useFrame((_, delta) => {
    const glow = glowRef.current
    if (!glow) return
    const material = glow.material as THREE.SpriteMaterial
    const targetOpacity = hovered ? 0.8 : 0
    const targetScale = hovered ? 1.55 : 1.05
    material.opacity = THREE.MathUtils.damp(
      material.opacity,
      targetOpacity,
      6,
      delta,
    )
    const nextScale = THREE.MathUtils.damp(glow.scale.x, targetScale, 6, delta)
    glow.scale.setScalar(nextScale)
  })

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      {/* Sombra proyectada: elipse suave achatada justo debajo del item. */}
      <sprite position={[0, -0.5, -0.05]} scale={[0.85, 0.32, 1]}>
        <spriteMaterial
          map={SHADOW_TEXTURE}
          transparent
          opacity={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* Glow de hover: oculto por defecto (opacity 0), crece y aparece. */}
      <sprite ref={glowRef} scale={1.05}>
        <spriteMaterial
          map={GLOW_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* El icono en si: circulo de color por categoria + contorno + icono. */}
      <sprite scale={0.78}>
        <spriteMaterial
          map={texture}
          transparent
          alphaTest={0.4}
          toneMapped={false}
        />
      </sprite>
    </group>
  )
}

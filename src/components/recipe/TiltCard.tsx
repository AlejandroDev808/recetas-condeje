import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
}

const SPRING = { stiffness: 300, damping: 30, mass: 0.6 }

/**
 * Envoltorio genérico que inclina su contenido siguiendo el ratón
 * (parallax/tilt sutil). Solo reacciona a puntero tipo "mouse": en touch
 * el gesto de tilt no aporta nada y solo generaría jank.
 */
export function TiltCard({ children, className }: TiltCardProps) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), SPRING)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), SPRING)
  const lift = useSpring(useTransform(py, [-0.5, 0.5], [3, -3]), SPRING)

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function handlePointerLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, y: lift, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

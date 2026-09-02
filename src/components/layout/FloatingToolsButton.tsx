import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useKitchenTimer } from '@/context/KitchenTimerContext'
import { useMusicPlayer } from '@/context/MusicPlayerContext'
import { formatClock } from '@/lib/time'
import { KitchenTimerControls } from './KitchenTimerControls'
import { MusicControls, MusicNoteIcon } from './MusicControls'

/**
 * Botón flotante único que fusiona música y temporizador de cocina (antes
 * eran dos preocupaciones separadas). Mantiene el mismo sitio/comportamiento
 * de safe-area que tenía el botón de música en solitario; al pulsarlo
 * despliega un panel con ambos controles. El estado de música y de
 * temporizador vive en sus propios contextos globales (montados en
 * App.tsx), así que ambos siguen funcionando de forma independiente aunque
 * este panel esté cerrado o el usuario navegue a otra receta.
 */
export function FloatingToolsButton() {
  const { playing } = useMusicPlayer()
  const { status, remainingSeconds } = useKitchenTimer()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // "Activo" a efectos visuales incluye 'finished': recién sonada la
  // alarma, el botón sigue mostrando 00:00 hasta que el usuario reinicie.
  const timerActive =
    status === 'running' || status === 'paused' || status === 'finished'

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="fixed right-5 bottom-[calc(var(--safe-area-bottom)_+_1.25rem)] z-40"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute right-0 bottom-[calc(100%_+_0.75rem)] w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-espresso-500/10 bg-cream-50/95 p-4 shadow-warm-lg backdrop-blur-sm"
          >
            <div className="space-y-5">
              <MusicControls />
              <div className="h-px bg-espresso-500/10" />
              <KitchenTimerControls />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={
          open ? 'Cerrar música y temporizador' : 'Abrir música y temporizador'
        }
        title={
          open ? 'Cerrar música y temporizador' : 'Abrir música y temporizador'
        }
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={status === 'finished' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={
          status === 'finished'
            ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.25 }
        }
        className={`relative flex h-14 w-14 items-center justify-center rounded-full ring-1 shadow-warm-lg backdrop-blur-sm transition-colors duration-300 ${
          timerActive
            ? 'bg-mustard-500 text-espresso-900 ring-mustard-500/40'
            : playing
              ? 'bg-terracotta-500 text-cream-50 ring-terracotta-600/40'
              : 'bg-cream-50/95 text-terracotta-600 ring-espresso-500/10 hover:bg-cream-200'
        }`}
      >
        {timerActive ? (
          <span className="font-display text-sm font-semibold tabular-nums">
            {formatClock(remainingSeconds)}
          </span>
        ) : (
          <MusicNoteIcon playing={playing} className="h-6 w-6" />
        )}

        <span
          className={`absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-cream-50 transition-colors duration-300 ${
            playing ? 'bg-sage-500' : 'bg-espresso-500/30'
          }`}
        />
      </motion.button>
    </div>
  )
}

import { motion } from 'framer-motion'
import { useMusicPlayer } from '@/context/MusicPlayerContext'

/** Nota musical animada (se anima con un ligero balanceo mientras suena).
 * Se exporta para reutilizarla también en el icono del botón flotante. */
export function MusicNoteIcon({
  playing,
  className,
}: {
  playing: boolean
  className?: string
}) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      animate={
        playing
          ? { rotate: [0, -6, 6, -3, 0], scale: [1, 1.08, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={
        playing
          ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.25 }
      }
    >
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9z" />
    </motion.svg>
  )
}

/** Sección de música del panel de herramientas flotantes: misma lógica de
 * MusicPlayerContext, solo integrada visualmente aquí en vez de en su
 * propio botón flotante independiente. */
export function MusicControls() {
  const { playing, toggle } = useMusicPlayer()

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-display text-sm text-espresso-700">
          Música ambiente
        </p>
        <p className="text-xs text-espresso-500/60">
          {playing ? 'Sonando' : 'En pausa'}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-pressed={playing}
        aria-label={
          playing ? 'Pausar música ambiente' : 'Reproducir música ambiente'
        }
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
          playing
            ? 'bg-terracotta-500 text-cream-50 ring-terracotta-600/40'
            : 'bg-cream-100 text-terracotta-600 ring-espresso-500/10 hover:bg-cream-200'
        }`}
      >
        <MusicNoteIcon playing={playing} className="h-5 w-5" />
      </motion.button>
    </div>
  )
}

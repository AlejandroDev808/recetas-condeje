import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const AUDIO_SRC = '/audio/jazz-ambiente.mp3'
const DEFAULT_VOLUME = 0.18

/**
 * Botón flotante de música de fondo. Vive en el layout raíz (App.tsx), no
 * dentro de una página: así el <audio> nunca se desmonta al navegar entre
 * rutas de la SPA y la reproducción sigue sonando de fondo.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = DEFAULT_VOLUME
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    // El play() falla si el navegador aún no lo considera un gesto de
    // usuario válido (raro en un click directo, pero se cubre igual para
    // no dejar una promesa rechazada sin manejar en consola).
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={
          playing ? 'Pausar música ambiente' : 'Reproducir música ambiente'
        }
        title={playing ? 'Pausar música ambiente' : 'Reproducir música ambiente'}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full ring-1 shadow-warm-lg backdrop-blur-sm transition-colors duration-300 ${
          playing
            ? 'bg-terracotta-500 text-cream-50 ring-terracotta-600/40'
            : 'bg-cream-50/95 text-terracotta-600 ring-espresso-500/10 hover:bg-cream-200'
        }`}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
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

        <span
          className={`absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-cream-50 transition-colors duration-300 ${
            playing ? 'bg-sage-500' : 'bg-espresso-500/30'
          }`}
        />
      </motion.button>
    </>
  )
}

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const AUDIO_SRC = '/audio/jazz-ambiente.mp3'
const DEFAULT_VOLUME = 0.18

interface MusicPlayerContextValue {
  playing: boolean
  toggle: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

/**
 * El <audio> vive aquí, montado una única vez en el layout raíz (App.tsx) y
 * no dentro del botón/panel que lo controla: así la música sigue sonando de
 * fondo sin importar si el panel de herramientas flotantes está abierto o
 * cerrado, o a qué ruta de la SPA se navegue.
 */
export function MusicPlayerProvider({ children }: { children: ReactNode }) {
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
    <MusicPlayerContext.Provider value={{ playing, toggle }}>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) {
    throw new Error('useMusicPlayer debe usarse dentro de <MusicPlayerProvider>')
  }
  return ctx
}

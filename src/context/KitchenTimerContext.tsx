import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

export type KitchenTimerStatus = 'idle' | 'running' | 'paused' | 'finished'

interface KitchenTimerContextValue {
  status: KitchenTimerStatus
  /** Duración configurada (usada como base al pulsar "Iniciar" o "Reiniciar"). */
  durationSeconds: number
  /** Tiempo que queda mientras corre/está en pausa; igual a durationSeconds en idle. */
  remainingSeconds: number
  /** Solo tiene efecto en estado idle: cambiar la duración a mitad de cuenta no tendría sentido. */
  setDuration: (totalSeconds: number) => void
  start: () => void
  pause: () => void
  reset: () => void
}

const KitchenTimerContext = createContext<KitchenTimerContextValue | null>(null)

const DEFAULT_DURATION_SECONDS = 5 * 60
const MAX_DURATION_SECONDS = 99 * 60 + 59
const TICK_MS = 250

/** Tres pitidos cortos de aviso, generados con Web Audio API para no
 * depender de un asset de audio nuevo. */
function playAlarmSound(context: AudioContext) {
  const now = context.currentTime
  for (const offset of [0, 0.3, 0.6]) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0, now + offset)
    gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.02)
    gain.gain.linearRampToValueAtTime(0, now + offset + 0.28)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now + offset)
    oscillator.stop(now + offset + 0.3)
  }
}

/**
 * Estado del temporizador de cocina, elevado a contexto global (montado en
 * el layout raíz vía App.tsx) para que siga contando aunque el panel que lo
 * muestra esté cerrado o el usuario navegue a otra receta — si viviera en
 * el estado local de un componente de página, se perdería al desmontarla.
 */
export function KitchenTimerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<KitchenTimerStatus>('idle')
  const [durationSeconds, setDurationSeconds] = useState(DEFAULT_DURATION_SECONDS)
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATION_SECONDS)

  const endAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
    }
  }, [])

  function ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined' || !window.AudioContext) return null
    if (!audioContextRef.current) audioContextRef.current = new AudioContext()
    return audioContextRef.current
  }

  function finish() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    endAtRef.current = null
    setRemainingSeconds(0)
    setStatus('finished')

    const context = ensureAudioContext()
    if (context) void context.resume().then(() => playAlarmSound(context))

    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style: ImpactStyle.Heavy })
    }
  }

  function tick() {
    const endAt = endAtRef.current
    if (endAt === null) return
    const msLeft = endAt - Date.now()
    if (msLeft <= 0) {
      finish()
      return
    }
    setRemainingSeconds(Math.ceil(msLeft / 1000))
  }

  function start() {
    // Crear/retomar el AudioContext dentro del propio gesto de "Iniciar":
    // los navegadores exigen un gesto de usuario para activarlo, y así
    // queda listo para sonar más tarde (al llegar a 00:00) sin necesitar
    // un gesto nuevo en ese momento.
    ensureAudioContext()
      ?.resume()
      .catch(() => {})

    const base = status === 'paused' ? remainingSeconds : durationSeconds
    if (base <= 0) return

    endAtRef.current = Date.now() + base * 1000
    setRemainingSeconds(base)
    setStatus('running')

    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, TICK_MS)
  }

  function pause() {
    if (status !== 'running') return
    const endAt = endAtRef.current
    const msLeft = endAt !== null ? endAt - Date.now() : 0

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    endAtRef.current = null
    setRemainingSeconds(Math.max(0, Math.round(msLeft / 1000)))
    setStatus('paused')
  }

  function reset() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    endAtRef.current = null
    setRemainingSeconds(durationSeconds)
    setStatus('idle')
  }

  function setDuration(totalSeconds: number) {
    if (status !== 'idle') return
    const clamped = Math.max(0, Math.min(totalSeconds, MAX_DURATION_SECONDS))
    setDurationSeconds(clamped)
    setRemainingSeconds(clamped)
  }

  return (
    <KitchenTimerContext.Provider
      value={{
        status,
        durationSeconds,
        remainingSeconds,
        setDuration,
        start,
        pause,
        reset,
      }}
    >
      {children}
    </KitchenTimerContext.Provider>
  )
}

export function useKitchenTimer() {
  const ctx = useContext(KitchenTimerContext)
  if (!ctx) {
    throw new Error('useKitchenTimer debe usarse dentro de <KitchenTimerProvider>')
  }
  return ctx
}

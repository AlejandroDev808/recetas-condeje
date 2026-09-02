import { useKitchenTimer } from '@/context/KitchenTimerContext'
import { formatClock } from '@/lib/time'

const MINUTE_STEP = 1
const SECOND_STEP = 5
const MAX_MINUTES = 99

function StepperButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso-500/15 font-display text-lg text-espresso-700 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  )
}

function DurationStepper({
  value,
  unit,
  onDecrement,
  onIncrement,
  disabled,
}: {
  value: number
  unit: string
  onDecrement: () => void
  onIncrement: () => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <StepperButton label="+" onClick={onIncrement} disabled={disabled} />
      <span className="font-display text-lg tabular-nums text-espresso-700">
        {String(value).padStart(2, '0')}
      </span>
      <StepperButton label="−" onClick={onDecrement} disabled={disabled} />
      <span className="text-[0.65rem] tracking-wide text-espresso-500/60 uppercase">
        {unit}
      </span>
    </div>
  )
}

/** Sección de temporizador del panel de herramientas flotantes. El estado
 * en sí vive en KitchenTimerContext (global): este componente es solo la
 * presentación, así que se puede desmontar (cerrar el panel, cambiar de
 * receta) sin que la cuenta atrás se detenga. */
export function KitchenTimerControls() {
  const {
    status,
    durationSeconds,
    remainingSeconds,
    setDuration,
    start,
    pause,
    reset,
  } = useKitchenTimer()

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  const editable = status === 'idle'
  const displaySeconds = editable ? durationSeconds : remainingSeconds

  function adjustMinutes(delta: number) {
    const next = Math.min(MAX_MINUTES, Math.max(0, minutes + delta))
    setDuration(next * 60 + seconds)
  }

  function adjustSeconds(delta: number) {
    const next = Math.min(55, Math.max(0, seconds + delta))
    setDuration(minutes * 60 + next)
  }

  return (
    <div>
      <p className="font-display text-sm text-espresso-700">
        Temporizador de cocina
      </p>

      <p
        className={`mt-2 text-center font-display text-4xl tabular-nums transition-colors ${
          status === 'finished' ? 'text-terracotta-600' : 'text-espresso-700'
        }`}
      >
        {formatClock(displaySeconds)}
      </p>

      {editable && (
        <div className="mt-3 flex items-center justify-center gap-6">
          <DurationStepper
            value={minutes}
            unit="min"
            disabled={!editable}
            onDecrement={() => adjustMinutes(-MINUTE_STEP)}
            onIncrement={() => adjustMinutes(MINUTE_STEP)}
          />
          <DurationStepper
            value={seconds}
            unit="seg"
            disabled={!editable}
            onDecrement={() => adjustSeconds(-SECOND_STEP)}
            onIncrement={() => adjustSeconds(SECOND_STEP)}
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        {status === 'idle' && (
          <button
            type="button"
            onClick={start}
            disabled={durationSeconds === 0}
            className="rounded-full bg-terracotta-500 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Iniciar
          </button>
        )}

        {(status === 'running' || status === 'paused') && (
          <button
            type="button"
            onClick={status === 'running' ? pause : start}
            className="rounded-full bg-terracotta-500 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-terracotta-600"
          >
            {status === 'running' ? 'Pausar' : 'Reanudar'}
          </button>
        )}

        {status !== 'idle' && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-espresso-500/15 px-4 py-2 text-sm font-medium text-espresso-700 transition-colors hover:bg-cream-200"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  )
}

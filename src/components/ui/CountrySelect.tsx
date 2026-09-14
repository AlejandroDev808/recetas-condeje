import { useEffect, useRef, useState } from 'react'
import { FlagIcon } from '@/components/ui/FlagIcon'
import { areaLabelEs } from '@/lib/areaLabels'

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
}

/**
 * Desplegable de país propio: un `<select><option>` nativo no puede
 * contener una imagen, así que no hay forma de mostrar la bandera junto a
 * cada opción con un `<select>` normal. Este componente reproduce el mismo
 * comportamiento (botón + lista, cierre al hacer click fuera) pero con
 * control total sobre el contenido de cada fila.
 */
export function CountrySelect({ value, onChange, options }: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-full border border-espresso-500/15 bg-cream-50 px-5 py-2 text-left text-espresso-700 focus:border-terracotta-400 focus:outline-none"
      >
        {value && <FlagIcon area={value} />}
        <span className="flex-1 truncate">
          {value ? areaLabelEs(value) : 'Selecciona un país'}
        </span>
        <span aria-hidden className="text-espresso-500/50">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-espresso-500/15 bg-cream-50 py-1 shadow-warm-md"
        >
          {options.map((area) => (
            <li key={area}>
              <button
                type="button"
                role="option"
                aria-selected={area === value}
                onClick={() => {
                  onChange(area)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-cream-200 ${
                  area === value
                    ? 'bg-terracotta-500/10 text-terracotta-700'
                    : 'text-espresso-700'
                }`}
              >
                <FlagIcon area={area} />
                <span className="truncate">{areaLabelEs(area)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

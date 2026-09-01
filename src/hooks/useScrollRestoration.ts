import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const STORAGE_PREFIX = 'scrollPos:'

function readScroll(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? null : Number(raw)
  } catch {
    return null
  }
}

function writeScroll(key: string, y: number) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(y))
  } catch {
    // Almacenamiento no disponible (modo privado, cuota agotada...): se
    // ignora, en el peor caso no se restaura el scroll.
  }
}

/**
 * El BrowserRouter "clásico" (sin data router) no restaura el scroll al
 * navegar con atrás/adelante, y el `scrollRestoration` nativo del navegador
 * no encaja con las transiciones de página (restaura antes de que el
 * contenido async haya terminado de cargar). Este hook lo hace a mano:
 * guarda el scroll de cada entrada del historial (por su `location.key`) y,
 * al volver a ella con atrás/adelante, lo restaura en cuanto `ready` sea
 * true; en una navegación nueva (push/replace) sube al principio.
 */
export function useScrollRestoration(ready = true) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const restoredKeyRef = useRef<string | null>(null)

  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (!ready || restoredKeyRef.current === location.key) return
    restoredKeyRef.current = location.key

    if (navigationType === 'POP') {
      window.scrollTo(0, readScroll(location.key) ?? 0)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.key, navigationType, ready])

  useEffect(() => {
    function handleScroll() {
      writeScroll(location.key, window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.key])
}

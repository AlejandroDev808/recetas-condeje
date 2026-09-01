import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Índice de la entrada actual dentro del historial que gestiona react-router
 * (lo guarda `history` — la librería en la que se apoya BrowserRouter — en
 * `history.state.idx`). 0 es la primera entrada creada por la app: no hay
 * nada más atrás dentro de la SPA. */
function getHistoryIndex(): number {
  const state = window.history.state as { idx?: number } | null
  return state?.idx ?? 0
}

/**
 * En Android, el botón/gesto "atrás" del sistema dispara el evento
 * `backButton` de Capacitor en vez de un popstate normal. Sin este listener
 * el comportamiento por defecto cierra la app directamente en cuanto no hay
 * nada que "retroceder" en el propio WebView. Aquí se decide en su lugar en
 * base al historial de la propia SPA: si hay una entrada anterior dentro de
 * la app, navega hacia atrás (un POP normal, igual que el gesto de atrás del
 * navegador — no rompe la restauración de scroll/búsqueda ya implementada);
 * si ya está en la pantalla raíz, cierra la app.
 */
export function useAndroidBackButton() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (getHistoryIndex() > 0) {
        navigate(-1)
      } else {
        void CapacitorApp.exitApp()
      }
    })

    return () => {
      void listenerPromise.then((listener) => listener.remove())
    }
  }, [navigate])
}

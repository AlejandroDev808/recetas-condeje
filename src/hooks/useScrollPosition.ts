import { useEffect, useRef } from 'react'

/**
 * Expone el scroll de la página como un ref mutable (no re-renderiza React
 * en cada evento de scroll). Pensado para leerse dentro de un useFrame de
 * React Three Fiber, que ya corre en su propio loop de animación.
 */
export function useScrollPositionRef() {
  const scrollY = useRef(0)

  useEffect(() => {
    function onScroll() {
      scrollY.current = window.scrollY
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrollY
}

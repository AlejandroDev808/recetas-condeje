export function Footer() {
  return (
    <footer className="border-t border-espresso-500/10 px-4 pt-6 pb-[calc(var(--safe-area-bottom)_+_1.5rem)] text-center text-xs text-espresso-500/60">
      <a
        href="https://game-icons.net"
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-espresso-500/30 underline-offset-2 transition-colors hover:text-espresso-600"
      >
        Iconos de ingredientes por game-icons.net (CC BY 3.0)
      </a>
      <span className="mx-2">·</span>
      <a
        href="/privacidad.html"
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-espresso-500/30 underline-offset-2 transition-colors hover:text-espresso-600"
      >
        Política de privacidad
      </a>
      <span className="mx-2">·</span>
      <a
        href="/eliminar-cuenta.html"
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-espresso-500/30 underline-offset-2 transition-colors hover:text-espresso-600"
      >
        Eliminar cuenta
      </a>
    </footer>
  )
}

import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const LINKS = [
  { to: '/buscar', label: 'Buscar' },
  { to: '/mi-cuaderno', label: 'Mi cuaderno' },
]

export function NavBar() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-espresso-500/10 bg-cream-100/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <NavLink
          to="/"
          className="shrink-0 font-display text-lg text-terracotta-600 sm:text-xl"
        >
          MiCuaderno
        </NavLink>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 ${
                  isActive
                    ? 'text-terracotta-600'
                    : 'text-espresso-600 hover:text-espresso-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-terracotta-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-1 shrink-0 rounded-full border border-espresso-500/15 px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-espresso-600 transition-colors hover:bg-cream-200 sm:ml-2 sm:px-4"
            >
              Salir
            </button>
          ) : (
            <NavLink
              to="/entrar"
              className="ml-1 shrink-0 rounded-full bg-espresso-700 px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-cream-50 transition-colors hover:bg-espresso-900 sm:ml-2 sm:px-4"
            >
              Entrar
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

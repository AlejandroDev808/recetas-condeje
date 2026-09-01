import { Link, useLocation } from 'react-router-dom'

interface SignInPromptProps {
  message: string
}

/** Aviso mostrado en secciones que requieren sesión iniciada; conserva la
 * página actual para volver aquí justo después de iniciar sesión. */
export function SignInPrompt({ message }: SignInPromptProps) {
  const location = useLocation()

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-espresso-600">{message}</p>
      <Link
        to="/entrar"
        state={{ from: location }}
        className="mt-4 inline-block rounded-full bg-terracotta-500 px-5 py-2 font-medium text-cream-50"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  )
}

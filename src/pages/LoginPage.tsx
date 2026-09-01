import { motion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import {
  type Location,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { GoogleIcon } from '@/components/auth/GoogleIcon'
import { describeAuthError, useAuth } from '@/context/AuthContext'
import { pageTransition } from '@/lib/animations'

interface LoginLocationState {
  from?: Location
}

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LoginLocationState | null)?.from
  const returnTo = from ? `${from.pathname}${from.search}` : '/mi-cuaderno'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate(returnTo, { replace: true })
    } catch {
      setError('No se ha podido iniciar sesión. Revisa tus datos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle(returnTo)
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10"
    >
      <h1 className="font-display text-3xl text-espresso-700">
        {mode === 'signin' ? 'Bienvenido de nuevo' : 'Crea tu cuaderno'}
      </h1>
      <p className="mt-1 text-espresso-500/70">
        {mode === 'signin'
          ? 'Entra para ver tus recetas guardadas.'
          : 'Guarda y organiza tus propias recetas.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="w-full rounded-xl border border-espresso-500/15 bg-cream-50 px-4 py-2.5 text-espresso-700 placeholder:text-espresso-500/40 focus:border-terracotta-400 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-xl border border-espresso-500/15 bg-cream-50 px-4 py-2.5 text-espresso-700 placeholder:text-espresso-500/40 focus:border-terracotta-400 focus:outline-none"
        />

        {error && <p className="text-sm text-terracotta-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-terracotta-500 px-4 py-2.5 font-medium text-cream-50 transition-colors hover:bg-terracotta-600 disabled:opacity-60"
        >
          {loading
            ? 'Un momento…'
            : mode === 'signin'
              ? 'Entrar'
              : 'Crear cuenta'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={googleLoading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-espresso-500/15 bg-cream-50 px-4 py-2.5 font-medium text-espresso-700 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon className="h-5 w-5" />
        {googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-6 text-sm text-espresso-500/70 underline underline-offset-2"
      >
        {mode === 'signin'
          ? '¿No tienes cuenta? Regístrate'
          : '¿Ya tienes cuenta? Entra'}
      </button>
    </motion.section>
  )
}

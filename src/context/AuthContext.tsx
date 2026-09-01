import {
  type User,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '@/services/firebase'

const RETURN_TO_KEY = 'auth:returnTo'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese correo usando otro método de acceso.',
  'auth/credential-already-in-use':
    'Esa cuenta de Google ya está asociada a otro usuario.',
  'auth/network-request-failed':
    'Fallo de red al iniciar sesión. Revisa tu conexión e inténtalo de nuevo.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/timeout':
    'La autenticación ha tardado demasiado. Inténtalo de nuevo.',
  'auth/web-storage-unsupported':
    'Tu navegador bloquea el almacenamiento necesario para iniciar sesión.',
}

function getAuthErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return undefined
}

function describeAuthError(error: unknown): string {
  const code = getAuthErrorCode(error)
  return (
    (code && AUTH_ERROR_MESSAGES[code]) ??
    'No se ha podido completar el inicio de sesión con Google.'
  )
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  resolvingRedirect: boolean
  authError: string | null
  clearAuthError: () => void
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: (returnTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvingRedirect, setResolvingRedirect] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  // Al volver de signInWithRedirect la app se recarga entera, así que este
  // resultado se resuelve una vez al montar, y con estado de carga propio
  // porque no coincide con el de onAuthStateChanged (que ya puede haber
  // resuelto "sin usuario" antes de que el redirect termine de procesarse).
  useEffect(() => {
    let cancelled = false

    getRedirectResult(auth)
      .then((result) => {
        if (cancelled || !result) return
        const returnTo = sessionStorage.getItem(RETURN_TO_KEY)
        if (returnTo) navigate(returnTo, { replace: true })
      })
      .catch((error) => {
        if (!cancelled) setAuthError(describeAuthError(error))
      })
      .finally(() => {
        sessionStorage.removeItem(RETURN_TO_KEY)
        if (!cancelled) setResolvingRedirect(false)
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  const value: AuthContextValue = {
    user,
    loading,
    resolvingRedirect,
    authError,
    clearAuthError: () => setAuthError(null),
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signInWithGoogle: async (returnTo) => {
      setAuthError(null)
      // Se guarda antes de redirigir: al volver de Google la app se recarga
      // entera y pierde cualquier estado en memoria.
      sessionStorage.setItem(
        RETURN_TO_KEY,
        returnTo ?? `${window.location.pathname}${window.location.search}`,
      )
      await signInWithRedirect(auth, googleProvider)
    },
    signOut: async () => {
      await firebaseSignOut(auth)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

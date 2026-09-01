import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
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

export function describeAuthError(error: unknown): string {
  const code = getAuthErrorCode(error)
  return (
    (code && AUTH_ERROR_MESSAGES[code]) ??
    'No se ha podido completar el inicio de sesión con Google.'
  )
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: (returnTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signInWithGoogle: async (returnTo) => {
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (error) {
        // El usuario cierra la ventana de Google sin completar el acceso:
        // no es un error real, así que no se propaga ni se muestra nada.
        if (getAuthErrorCode(error) === 'auth/popup-closed-by-user') return
        throw error
      }
      navigate(
        returnTo ?? `${window.location.pathname}${window.location.search}`,
        { replace: true },
      )
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
